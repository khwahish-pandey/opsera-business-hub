import { prisma } from '../utils/prisma';
import { ChallanStatus, CustomerStatus } from '../types/enums';

export async function getDashboardStats() {
  const [
    totalCustomers,
    activeCustomers,
    totalProducts,
    allProducts,
    draftChallansCount,
    confirmedChallans,
    recentChallans,
    recentMovements,
    recentFollowUps,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
    prisma.product.count(),
    prisma.product.findMany({ select: { id: true, currentStock: true, minimumStock: true } }),
    prisma.challan.count({ where: { status: ChallanStatus.DRAFT } }),
    prisma.challan.findMany({
      where: { status: ChallanStatus.CONFIRMED },
      select: { totalAmount: true },
    }),
    prisma.challan.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { customerName: true, businessName: true } },
      },
    }),
    prisma.stockMovement.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        product: { select: { name: true, sku: true } },
        createdBy: { select: { name: true } },
      },
    }),
    prisma.followUp.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        customer: { select: { customerName: true, businessName: true } },
        createdBy: { select: { name: true } },
      },
    }),
  ]);

  const lowStockProductsCount = allProducts.filter((p) => p.currentStock <= p.minimumStock).length;
  const outOfStockProductsCount = allProducts.filter((p) => p.currentStock === 0).length;
  const inStockProductsCount = allProducts.filter((p) => p.currentStock > p.minimumStock).length;

  const totalSalesValue = confirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);
  const confirmedChallansCount = confirmedChallans.length;

  // Monthly sales calculation for the last 6 months
  const monthlySalesMap: Record<string, { label: string; count: number; total: number }> = {};
  const today = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('en-US', { month: 'short' });
    monthlySalesMap[key] = { label, count: 0, total: 0 };
  }

  const allConfirmedChallansWithDate = await prisma.challan.findMany({
    where: { status: ChallanStatus.CONFIRMED },
    select: { createdAt: true, totalAmount: true },
  });

  for (const c of allConfirmedChallansWithDate) {
    const d = new Date(c.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlySalesMap[key]) {
      monthlySalesMap[key].count += 1;
      monthlySalesMap[key].total += c.totalAmount;
    }
  }

  const salesTrend = Object.values(monthlySalesMap);

  return {
    overview: {
      totalCustomers,
      activeCustomers,
      totalProducts,
      lowStockProducts: lowStockProductsCount,
      inStockProducts: inStockProductsCount,
      outOfStockProducts: outOfStockProductsCount,
      draftChallans: draftChallansCount,
      confirmedChallans: confirmedChallansCount,
      totalSalesValue,
    },
    charts: {
      salesTrend,
      stockDistribution: [
        { name: 'In Stock', value: inStockProductsCount, color: '#10B981' },
        { name: 'Low Stock', value: lowStockProductsCount, color: '#F59E0B' },
        { name: 'Out of Stock', value: outOfStockProductsCount, color: '#EF4444' },
      ],
    },
    recentActivity: {
      challans: recentChallans,
      stockMovements: recentMovements,
      followUps: recentFollowUps,
    },
  };
}

export async function getReportsSummary(startDate?: string, endDate?: string) {
  const where: any = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [
    totalChallans,
    confirmedChallans,
    cancelledChallans,
    draftChallans,
    stockMovements,
    topCustomers,
    products,
  ] = await Promise.all([
    prisma.challan.count({ where }),
    prisma.challan.findMany({
      where: { ...where, status: ChallanStatus.CONFIRMED },
      select: { totalAmount: true, totalQuantity: true },
    }),
    prisma.challan.count({ where: { ...where, status: ChallanStatus.CANCELLED } }),
    prisma.challan.count({ where: { ...where, status: ChallanStatus.DRAFT } }),
    prisma.stockMovement.findMany({
      where,
      select: { movementType: true, quantity: true },
    }),
    prisma.customer.findMany({
      take: 5,
      orderBy: { challans: { _count: 'desc' } },
      select: {
        id: true,
        customerName: true,
        businessName: true,
        mobile: true,
        _count: { select: { challans: true } },
      },
    }),
    prisma.product.findMany({
      select: {
        name: true,
        sku: true,
        category: true,
        currentStock: true,
        minimumStock: true,
        unitPrice: true,
      },
    }),
  ]);

  const totalSalesRevenue = confirmedChallans.reduce((sum, c) => sum + c.totalAmount, 0);
  const totalItemsSold = confirmedChallans.reduce((sum, c) => sum + c.totalQuantity, 0);

  const totalStockIn = stockMovements
    .filter((m) => m.movementType === 'IN')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalStockOut = stockMovements
    .filter((m) => m.movementType === 'OUT')
    .reduce((sum, m) => sum + m.quantity, 0);

  const totalInventoryValue = products.reduce((sum, p) => sum + p.currentStock * p.unitPrice, 0);
  const lowStockCount = products.filter((p) => p.currentStock <= p.minimumStock).length;

  return {
    salesSummary: {
      totalChallans,
      confirmedCount: confirmedChallans.length,
      draftCount: draftChallans,
      cancelledCount: cancelledChallans,
      totalRevenue: totalSalesRevenue,
      totalItemsSold,
    },
    inventorySummary: {
      totalProductsCount: products.length,
      totalInventoryValue,
      lowStockCount,
      totalStockInQuantity: totalStockIn,
      totalStockOutQuantity: totalStockOut,
    },
    topCustomers,
    lowStockList: products.filter((p) => p.currentStock <= p.minimumStock),
  };
}
