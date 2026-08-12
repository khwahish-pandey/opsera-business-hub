import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/errors';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';
import { MovementType } from '../types/enums';
import { Prisma } from '@prisma/client';

export interface ProductQueryFilter {
  search?: string;
  category?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

export async function getProducts(query: ProductQueryFilter) {
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

  // Handle lowStock filter directly
  const allProducts = await prisma.product.findMany({
    where,
    orderBy: { name: 'asc' },
  });

  let filtered = allProducts;
  if (query.lowStock) {
    filtered = allProducts.filter((p) => p.currentStock <= p.minimumStock);
  }

  const total = filtered.length;
  const paginated = filtered.slice(skip, skip + limit);

  return {
    data: paginated.map((p) => ({
      ...p,
      isLowStock: p.currentStock <= p.minimumStock,
      stockStatus: p.currentStock <= p.minimumStock ? 'LOW STOCK' : 'IN STOCK',
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      stockMovements: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return {
    ...product,
    isLowStock: product.currentStock <= product.minimumStock,
    stockStatus: product.currentStock <= product.minimumStock ? 'LOW STOCK' : 'IN STOCK',
  };
}

export async function createProduct(input: CreateProductInput, userId?: string) {
  const existingSku = await prisma.product.findUnique({
    where: { sku: input.sku.toUpperCase() },
  });

  if (existingSku) {
    throw new ApiError(409, `Product SKU '${input.sku.toUpperCase()}' already exists`);
  }

  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        sku: input.sku.toUpperCase(),
        category: input.category,
        unitPrice: input.unitPrice,
        currentStock: input.currentStock,
        minimumStock: input.minimumStock,
        warehouseLocation: input.warehouseLocation,
      },
    });

    if (input.currentStock > 0 && userId) {
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: input.currentStock,
          movementType: MovementType.IN,
          reason: 'Initial stock creation',
          createdById: userId,
        },
      });
    }

    return product;
  });
}

export async function updateProduct(id: string, input: UpdateProductInput) {
  await getProductById(id);

  if (input.sku) {
    const existingSku = await prisma.product.findFirst({
      where: { sku: input.sku.toUpperCase(), NOT: { id } },
    });
    if (existingSku) {
      throw new ApiError(409, `Product SKU '${input.sku.toUpperCase()}' is used by another product`);
    }
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      ...input,
      sku: input.sku ? input.sku.toUpperCase() : undefined,
    },
  });

  return updated;
}

export async function deleteProduct(id: string) {
  await getProductById(id);

  const linkedChallans = await prisma.challanItem.count({
    where: { productId: id },
  });

  if (linkedChallans > 0) {
    throw new ApiError(
      400,
      'Product cannot be hard-deleted because it is referenced in historical sales challans. Historical records preserve snapshot info.'
    );
  }

  await prisma.product.delete({ where: { id } });
  return { message: 'Product deleted successfully' };
}
