import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/errors';
import { StockAdjustmentInput } from '../validators/inventory.validator';
import { MovementType } from '../types/enums';
import { Prisma } from '@prisma/client';

export interface MovementQueryFilter {
  productId?: string;
  movementType?: MovementType;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getInventoryOverview(query: { search?: string; category?: string; page?: number; limit?: number }) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {};

  if (query.category) {
    where.category = { equals: query.category };
  }

  if (query.search) {
    const searchTrimmed = query.search.trim();
    where.OR = [
      { name: { contains: searchTrimmed } },
      { sku: { contains: searchTrimmed } },
      { warehouseLocation: { contains: searchTrimmed } },
    ];
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        currentStock: true,
        minimumStock: true,
        warehouseLocation: true,
        unitPrice: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data: products.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minimumStock,
      statusBadge: p.currentStock <= p.minimumStock ? 'LOW STOCK' : 'IN STOCK',
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function addStockIn(productId: string, input: StockAdjustmentInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: { increment: input.quantity },
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity: input.quantity,
        movementType: MovementType.IN,
        reason: input.reason,
        createdById: userId,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return { product: updatedProduct, movement };
  });
}

export async function removeStockOut(productId: string, input: StockAdjustmentInput, userId: string) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new ApiError(404, 'Product not found');
    }

    if (product.currentStock < input.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Available: ${product.currentStock}, Requested: ${input.quantity}`
      );
    }

    const updatedProduct = await tx.product.update({
      where: { id: productId },
      data: {
        currentStock: { decrement: input.quantity },
      },
    });

    const movement = await tx.stockMovement.create({
      data: {
        productId,
        quantity: input.quantity,
        movementType: MovementType.OUT,
        reason: input.reason,
        createdById: userId,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    return { product: updatedProduct, movement };
  });
}

export async function getStockMovements(query: MovementQueryFilter) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 15;
  const skip = (page - 1) * limit;

  const where: Prisma.StockMovementWhereInput = {};

  if (query.productId) {
    where.productId = query.productId;
  }

  if (query.movementType) {
    where.movementType = query.movementType;
  }

  if (query.search) {
    const searchTrimmed = query.search.trim();
    where.OR = [
      { reason: { contains: searchTrimmed } },
      { product: { name: { contains: searchTrimmed } } },
      { product: { sku: { contains: searchTrimmed } } },
    ];
  }

  const [movements, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        product: { select: { id: true, name: true, sku: true, category: true } },
        createdBy: { select: { id: true, name: true, role: true } },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    data: movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
