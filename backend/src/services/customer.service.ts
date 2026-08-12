import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/errors';
import { CreateCustomerInput, UpdateCustomerInput, CreateFollowUpInput } from '../validators/customer.validator';
import { CustomerStatus, CustomerType } from '../types/enums';
import { Prisma } from '@prisma/client';

export interface CustomerQueryFilter {
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
  page?: number;
  limit?: number;
}

export async function getCustomers(query: CustomerQueryFilter) {
  const page = query.page && query.page > 0 ? query.page : 1;
  const limit = query.limit && query.limit > 0 ? query.limit : 10;
  const skip = (page - 1) * limit;

  const where: Prisma.CustomerWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.customerType) {
    where.customerType = query.customerType;
  }

  if (query.search) {
    const searchLower = query.search.trim();
    where.OR = [
      { customerName: { contains: searchLower } },
      { businessName: { contains: searchLower } },
      { mobile: { contains: searchLower } },
      { email: { contains: searchLower } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        _count: {
          select: { challans: true, followUps: true },
        },
      },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(id: string) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      followUps: {
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
      },
      challans: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          items: true,
        },
      },
    },
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found');
  }

  return customer;
}

export async function createCustomer(input: CreateCustomerInput) {
  const existingMobile = await prisma.customer.findFirst({
    where: { mobile: input.mobile },
  });

  if (existingMobile) {
    throw new ApiError(409, 'Customer with this mobile number already exists');
  }

  const existingEmail = await prisma.customer.findFirst({
    where: { email: input.email.toLowerCase() },
  });

  if (existingEmail) {
    throw new ApiError(409, 'Customer with this email address already exists');
  }

  const customer = await prisma.customer.create({
    data: {
      customerName: input.customerName,
      mobile: input.mobile,
      email: input.email.toLowerCase(),
      businessName: input.businessName,
      gstNumber: input.gstNumber || null,
      customerType: input.customerType,
      address: input.address,
      status: input.status,
      followUpDate: input.followUpDate ? new Date(input.followUpDate) : null,
      notes: input.notes || null,
    },
  });

  return customer;
}

export async function updateCustomer(id: string, input: UpdateCustomerInput) {
  await getCustomerById(id);

  if (input.mobile) {
    const existingMobile = await prisma.customer.findFirst({
      where: { mobile: input.mobile, NOT: { id } },
    });
    if (existingMobile) {
      throw new ApiError(409, 'Mobile number is already used by another customer');
    }
  }

  if (input.email) {
    const existingEmail = await prisma.customer.findFirst({
      where: { email: input.email.toLowerCase(), NOT: { id } },
    });
    if (existingEmail) {
      throw new ApiError(409, 'Email address is already used by another customer');
    }
  }

  const updated = await prisma.customer.update({
    where: { id },
    data: {
      ...input,
      email: input.email ? input.email.toLowerCase() : undefined,
      followUpDate: input.followUpDate !== undefined ? (input.followUpDate ? new Date(input.followUpDate) : null) : undefined,
    },
  });

  return updated;
}

export async function deleteCustomer(id: string) {
  await getCustomerById(id);

  // Check if customer has confirmed challans
  const activeChallans = await prisma.challan.count({
    where: { customerId: id },
  });

  if (activeChallans > 0) {
    throw new ApiError(400, 'Cannot delete customer with existing sales challans. Consider setting status to INACTIVE.');
  }

  await prisma.customer.delete({ where: { id } });
  return { message: 'Customer deleted successfully' };
}

export async function addFollowUp(customerId: string, input: CreateFollowUpInput, userId: string) {
  const customer = await getCustomerById(customerId);

  const followUp = await prisma.followUp.create({
    data: {
      customerId,
      note: input.note,
      followUpDate: new Date(input.followUpDate),
      createdById: userId,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Update customer's followUpDate
  await prisma.customer.update({
    where: { id: customerId },
    data: { followUpDate: new Date(input.followUpDate) },
  });

  return followUp;
}

export async function getCustomerFollowUps(customerId: string) {
  await getCustomerById(customerId);

  return prisma.followUp.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
    },
  });
}
