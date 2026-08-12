import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/errors';
import { CreateChallanInput, UpdateChallanInput } from '../validators/challan.validator';
import { ChallanStatus, MovementType } from '../types/enums';
import { Prisma } from '@prisma/client';

export interface ChallanQueryFilter {
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Generate a transaction-safe sequential Challan Number (e.g. CH-2026-00001)
 */
async function generateChallanNumber(tx: Prisma.TransactionClient): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Find or create sequence counter for current year
  let sequence = await tx.challanSequence.findUnique({
    where: { year: currentYear },
  });

  if (!sequence) {
    sequence = await tx.challanSequence.create({
      data: {
        id: `CHALLAN_SEQ_${currentYear}`,
        year: currentYear,
        lastValue: 0,
      },
    });
  }

  const nextVal = sequence.lastValue + 1;

  await tx.challanSequence.update({
    where: { year: currentYear },
    data: { lastValue: nextVal },
  });

  const paddedNum = String(nextVal).padStart(5, '0');
  return `CH-${currentYear}-${paddedNum}`;
}

export async function createChallan(input: CreateChallanInput, userId: string) {
  // Validate customer
  const customer = await prisma.customer.findUnique({
    where: { id: input.customerId },
  });
  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  if (input.items.length === 0) {
    throw new ApiError(400, 'Challan must contain at least one product item');
  }

  return prisma.$transaction(async (tx) => {
    const challanNumber = await generateChallanNumber(tx);

    let totalQuantity = 0;
    let totalAmount = 0;

    const itemSnapshots = [];

    for (const item of input.items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(404, `Product with ID '${item.productId}' not found`);
      }

      const unitPrice = item.unitPrice !== undefined ? item.unitPrice : product.unitPrice;
      const itemTotal = unitPrice * item.quantity;

      totalQuantity += item.quantity;
      totalAmount += itemTotal;

      itemSnapshots.push({
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: unitPrice,
        quantity: item.quantity,
        totalPrice: itemTotal,
      });
    }

    const challan = await tx.challan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        totalQuantity,
        totalAmount,
        status: ChallanStatus.DRAFT,
        createdById: userId,
        items: {
          create: itemSnapshots,
        },
      },
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            businessName: true,
            mobile: true,
            email: true,
            gstNumber: true,
            address: true,
          },
        },
        createdBy: { select: { id: true, name: true, role: true } },
        items: true,
      },
    });

    return challan;
  });
}

export async function getChallans(query: ChallanQueryFilter) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ChallanWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.customerId) {
    where.customerId = query.customerId;
  }

  if (query.startDate || query.endDate) {
    where.createdAt = {};
    if (query.startDate) {
      where.createdAt.gte = new Date(query.startDate);
    }
    if (query.endDate) {
      where.createdAt.lte = new Date(query.endDate);
    }
  }

  if (query.search) {
    const searchTrimmed = query.search.trim();
    where.OR = [
      { challanNumber: { contains: searchTrimmed } },
      { customer: { customerName: { contains: searchTrimmed } } },
      { customer: { businessName: { contains: searchTrimmed } } },
    ];
  }

  const [challans, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            customerName: true,
            businessName: true,
            mobile: true,
            gstNumber: true,
          },
        },
        createdBy: { select: { id: true, name: true } },
        _count: { select: { items: true } },
      },
    }),
    prisma.challan.count({ where }),
  ]);

  return {
    data: challans,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getChallanById(id: string) {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: { select: { id: true, name: true, email: true, role: true } },
      items: {
        include: {
          product: { select: { id: true, currentStock: true, minimumStock: true } },
        },
      },
    },
  });

  if (!challan) {
    throw new ApiError(404, 'Challan not found');
  }

  return challan;
}

export async function updateChallan(id: string, input: UpdateChallanInput) {
  const existingChallan = await getChallanById(id);

  if (existingChallan.status !== ChallanStatus.DRAFT) {
    throw new ApiError(400, `Cannot modify a challan with status '${existingChallan.status}'. Only DRAFT challans can be modified.`);
  }

  return prisma.$transaction(async (tx) => {
    let totalQuantity = existingChallan.totalQuantity;
    let totalAmount = existingChallan.totalAmount;

    if (input.items && input.items.length > 0) {
      // Delete existing items
      await tx.challanItem.deleteMany({ where: { challanId: id } });

      totalQuantity = 0;
      totalAmount = 0;
      const newItems = [];

      for (const item of input.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new ApiError(404, `Product '${item.productId}' not found`);
        }

        const unitPrice = item.unitPrice !== undefined ? item.unitPrice : product.unitPrice;
        const itemTotal = unitPrice * item.quantity;

        totalQuantity += item.quantity;
        totalAmount += itemTotal;

        newItems.push({
          challanId: id,
          productId: product.id,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: unitPrice,
          quantity: item.quantity,
          totalPrice: itemTotal,
        });
      }

      await tx.challanItem.createMany({ data: newItems });
    }

    const updated = await tx.challan.update({
      where: { id },
      data: {
        customerId: input.customerId || existingChallan.customerId,
        totalQuantity,
        totalAmount,
      },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    return updated;
  });
}

/**
 * CRITICAL BUSINESS LOGIC: Confirm Challan
 * Transactionally verifies stock for all products.
 * If ANY product has insufficient stock: Rolls back transaction, rejects with HTTP 400.
 * If sufficient: Decrements product stock, creates OUT stock movement, updates status to CONFIRMED.
 */
export async function confirmChallan(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!challan) {
      throw new ApiError(404, 'Challan not found');
    }

    if (challan.status === ChallanStatus.CONFIRMED) {
      throw new ApiError(400, 'Challan is already confirmed');
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new ApiError(400, 'Cannot confirm a cancelled challan');
    }

    // Stock verification step for ALL items in the challan
    for (const item of challan.items) {
      if (!item.productId) {
        continue;
      }

      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new ApiError(
          400,
          `Cannot confirm challan: Associated product '${item.productNameSnapshot}' (SKU: ${item.skuSnapshot}) no longer exists in inventory`
        );
      }

      if (product.currentStock < item.quantity) {
        // Strict business rule: Throw HTTP 400 error detailing requested vs available stock
        throw new ApiError(
          400,
          `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${item.quantity}`
        );
      }
    }

    // Sufficient stock verified for ALL items -> Execute stock reduction & movement log
    for (const item of challan.items) {
      if (!item.productId) continue;

      // Decrement stock
      await tx.product.update({
        where: { id: item.productId },
        data: {
          currentStock: { decrement: item.quantity },
        },
      });

      // Log stock movement OUT
      await tx.stockMovement.create({
        data: {
          productId: item.productId,
          quantity: item.quantity,
          movementType: MovementType.OUT,
          reason: `Challan confirmation: ${challan.challanNumber}`,
          createdById: userId,
        },
      });
    }

    // Update challan status to CONFIRMED
    const confirmedChallan = await tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CONFIRMED },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    return confirmedChallan;
  });
}

/**
 * CRITICAL BUSINESS LOGIC: Cancel Challan
 * If status was CONFIRMED: Restores stock for each item, logs IN stock movement with reason.
 * Updates status to CANCELLED.
 */
export async function cancelChallan(id: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!challan) {
      throw new ApiError(404, 'Challan not found');
    }

    if (challan.status === ChallanStatus.CANCELLED) {
      throw new ApiError(400, 'Challan is already cancelled');
    }

    // If confirmed, restore inventory stock
    if (challan.status === ChallanStatus.CONFIRMED) {
      for (const item of challan.items) {
        if (!item.productId) continue;

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product) {
          // Restore stock
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } },
          });

          // Log stock movement IN
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              movementType: MovementType.IN,
              reason: `Challan cancellation: ${challan.challanNumber}`,
              createdById: userId,
            },
          });
        }
      }
    }

    const cancelledChallan = await tx.challan.update({
      where: { id },
      data: { status: ChallanStatus.CANCELLED },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true } },
        items: true,
      },
    });

    return cancelledChallan;
  });
}
