// Order types matching backend DTOs

// ------------------------------------------------------------------
// Order Status constants (mirrors backend OrderStatusNames)
// ------------------------------------------------------------------
export const ORDER_STATUS = {
  PENDING: 'Pending',
  PROCESSING: 'Processing',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
} as const;

export type OrderStatusName = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// ------------------------------------------------------------------
// Payment method constants (mirrors backend PaymentMethods)
// ------------------------------------------------------------------
export const PAYMENT_METHOD = {
  COD: 'COD',
  WALLET: 'Wallet',
  VNPAY: 'VNPay',
  MOMO: 'MoMo',
  SEPAY: 'Sepay',
} as const;

export type PaymentMethodCode = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

// ------------------------------------------------------------------
// Valid status transitions (mirrors backend OrderStatusTransitions)
// Useful for disabling buttons client-side before API call.
// ------------------------------------------------------------------
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatusName, OrderStatusName[]> = {
  Pending: ['Processing', 'Cancelled'],
  Processing: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: ['Refunded'],
  Cancelled: [],
  Refunded: [],
};

export function canTransition(from: OrderStatusName, to: OrderStatusName): boolean {
  return ORDER_STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isCustomerCancellable(status: OrderStatusName): boolean {
  return status === ORDER_STATUS.PENDING || status === ORDER_STATUS.PROCESSING;
}

export interface CreateOrderRequest {
    accountId?: number; // Will be set by controller from JWT
    voucherId?: number;
    paymentMethod: string; // "COD", "Wallet", "VNPay", "MoMo", "Sepay"
    
    // Shipping Information
    addressId?: number; // Optional: Use saved address
    shippingName?: string;
    shippingPhone?: string;
    shippingAddressLine?: string;
    shippingCity?: string;
    shippingDistrict?: string;
    shippingWard?: string;
    // GHN Master Data IDs (required for reliable shipping)
    shippingProvinceId?: number;
    shippingDistrictId?: number;
    shippingWardCode?: string;
    shippingMethod: string; // "Express", "Standard", "Economy"
    shippingFee?: number; // Optional: Use client-calculated fee from GHN API
    
    // Payment Split (for hybrid payment)
    paidByWalletAmount?: number;
    paidByExternalAmount?: number;
    
    note?: string;
    idempotencyKey?: string; // Prevent duplicate orders
}

export interface CreateOrderResponse {
    orderId: number;
    paymentMethod: string;
    paymentUrl?: string; // For external payment redirect
    totalAmount: number;
    message: string;
}

export interface PaymentMethodDTO {
    code: string;
    name: string;
    description: string;
    icon: string;
    isAvailable: boolean;
    minAmount: number;
    maxAmount: number;
    transactionFee: number;
    transactionFeeType: string; // "Percentage" or "Fixed"
}

export interface GetPaymentMethodsResponse {
    paymentMethods: PaymentMethodDTO[];
}

export interface OrderResponse {
    orderId: number;
    orderCode: string;
    customerName: string;
    customerPhone: string;
    statusId: number;
    statusName: string;
    totalAmount: number;
    shippingAddress: string;
    orderDate: string;
    paymentCompletedAt?: string;
    refundStatus: string;
    orderDetails: OrderDetailItemResponse[];
}

export interface OrderDetailItemResponse {
    orderDetailId: number;
    productId: number;
    productName: string;
    productImage: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
}

export type ShippingMethod = "Express" | "Standard" | "Economy";

export interface ShippingMethodOption {
    value: ShippingMethod;
    label: string;
    fee: number;
    estimatedDays: string;
}

// Shipping method info from API
export interface ShippingMethodInfo {
    code: string; // Unique identifier (e.g. "GHN-53322")
    type: string; // "Express", "Standard", "Economy" - for backend
    name: string;
    description: string;
    fee: number;
    estimatedDays: string;
    carrier: string;
    isAvailable: boolean;
}

export interface GetShippingMethodsResponse {
    shippingMethods: ShippingMethodInfo[];
}

/* ─── Customer Order DTOs (matches backend OrderDto / PagedResult) ─── */

export interface OrderDetailDto {
    orderDetailId: number;
    productId: number;
    productName: string;
    productImage?: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    reviewed: boolean;
}

export interface OrderStatusHistoryDto {
    orderStatusHistoryId: number;
    statusId?: number;
    statusName?: string;
    changedAt: string;
    changedBy?: number;
    changedByName?: string;
    note?: string;
}

export interface PaymentInfoDto {
    paymentMethod: string;
    paymentStatus: string;
    transactionCode?: string;
    amount: number;
    paymentUrl?: string;
    createdAt: string;
}

export interface ShippingInfoDto {
    provider: string;
    trackingNumber?: string;
    status?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
}

export interface OrderDto {
    orderId: number;
    orderCode?: string;
    accountId: number;
    accountName?: string;
    voucherId?: number;
    voucherCode?: string;
    statusId: number;
    statusName: string;
    shippingName?: string;
    shippingPhone?: string;
    shippingAddressLine?: string;
    shippingCity?: string;
    shippingDistrict?: string;
    shippingWard?: string;
    shippingMethod?: string;
    shippingFee: number;
    orderDate: string;
    totalAmount: number;
    paidByWalletAmount: number;
    paidByExternalAmount: number;
    paymentCompletedAt?: string;
    refundStatus: string;
    orderDetails: OrderDetailDto[];
    statusHistory: OrderStatusHistoryDto[];
    paymentInfo?: PaymentInfoDto;
    shippingInfo?: ShippingInfoDto;
    createdAt: string;
    updatedAt?: string;
}

// -------------------------------------------------------------------
// Refund DTOs
// -------------------------------------------------------------------
export const REFUND_STATUS = {
    NONE: 'None',
    REQUESTED: 'Requested',
    APPROVED: 'Approved',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    REJECTED: 'Rejected',
    PARTIAL_REFUND: 'PartialRefund',
    FULL_REFUND: 'FullRefund',
} as const;

export type RefundStatusType = (typeof REFUND_STATUS)[keyof typeof REFUND_STATUS];

export const REFUND_MODE = {
    WALLET: 'Wallet',
    ORIGINAL: 'Original',
} as const;

export interface RefundDto {
    refundId: number;
    orderId: number;
    orderCode: string;
    accountId: number;
    customerName?: string;
    customerEmail?: string;
    refundMode: string;
    refundStatus: string;
    totalAmount: number;
    refundAmount: number;
    reason: string;
    createdAt: string;
    approvedAt?: string;
    processedAt?: string;
    approvedByName?: string;
}

export interface CreateRefundRequest {
    orderId: number;
    refundAmount: number;
    refundMode: string;
    reason: string;
}

export interface ApproveRefundRequest {
    refundId: number;
    isApproved: boolean;
    note?: string;
}
