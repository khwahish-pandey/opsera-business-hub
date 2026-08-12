export type Role = 'ADMIN' | 'SALES' | 'WAREHOUSE' | 'ACCOUNTS';
export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';
export type MovementType = 'IN' | 'OUT';
export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    challans?: number;
    followUps?: number;
    stockMovements?: number;
  };
}

export interface Customer {
  id: string;
  customerName: string;
  mobile: string;
  email: string;
  businessName: string;
  gstNumber?: string | null;
  customerType: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    challans: number;
    followUps: number;
  };
  followUps?: FollowUp[];
  challans?: Challan[];
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  followUpDate: string;
  createdById: string;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
  isLowStock?: boolean;
  stockStatus?: 'LOW STOCK' | 'IN STOCK';
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdById: string;
  createdAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category?: string;
  };
  createdBy?: {
    id: string;
    name: string;
    role?: Role;
  };
}

export interface ChallanItem {
  id: string;
  challanId: string;
  productId?: string | null;
  productNameSnapshot: string;
  skuSnapshot: string;
  unitPriceSnapshot: number;
  quantity: number;
  totalPrice: number;
  product?: {
    id: string;
    currentStock: number;
    minimumStock: number;
  };
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  totalAmount: number;
  status: ChallanStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  createdBy?: {
    id: string;
    name: string;
    email?: string;
    role?: Role;
  };
  items?: ChallanItem[];
  _count?: {
    items: number;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
}

export interface DashboardStats {
  overview: {
    totalCustomers: number;
    activeCustomers: number;
    totalProducts: number;
    lowStockProducts: number;
    inStockProducts: number;
    outOfStockProducts: number;
    draftChallans: number;
    confirmedChallans: number;
    totalSalesValue: number;
  };
  charts: {
    salesTrend: { label: string; count: number; total: number }[];
    stockDistribution: { name: string; value: number; color: string }[];
  };
  recentActivity: {
    challans: Challan[];
    stockMovements: StockMovement[];
    followUps: FollowUp[];
  };
}
