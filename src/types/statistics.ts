// Statistics types matching backend DTOs

export interface RevenueStatisticsQuery {
  period?: "day" | "month" | "year";
  from?: string;
  to?: string;
}

export interface ProductStatisticsQuery {
  topN?: number;
  lowStockThreshold?: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
  totalAmount: number;
}

export interface RevenueChartPoint {
  label: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  amount: number;
}

export interface TopCustomerItem {
  accountId: number;
  name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

export interface RevenueStatisticsResponse {
  totalCompletedOrders: number;
  grossRevenue: number;
  shippingRevenue: number;
  refundTotal: number;
  netRevenue: number; // computed: grossRevenue - refundTotal
  avgOrderValue: number; // computed
  ordersByStatus: OrderStatusCount[];
  revenueChart: RevenueChartPoint[];
  paymentMethods: PaymentMethodBreakdown[];
  topCustomers: TopCustomerItem[];
}

export interface TopSellingProduct {
  productId: number;
  productName: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  quantitySold: number;
  totalRevenue: number;
  avgRating: number;
  reviewCount: number;
  currentStock: number;
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  category?: string;
  brand?: string;
  quantity: number;
  productStatus?: string;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalSold: number;
  totalRevenue: number;
}

export interface BrandBreakdown {
  brandId: number;
  brandName: string;
  productCount: number;
  totalSold: number;
  totalRevenue: number;
}

export interface ProductStatisticsResponse {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  outOfStockCount: number;
  lowStockCount: number;
  totalStockQuantity: number;
  topSellingProducts: TopSellingProduct[];
  lowStockProducts: LowStockProduct[];
  categoryBreakdown: CategoryBreakdown[];
  brandBreakdown: BrandBreakdown[];
}
