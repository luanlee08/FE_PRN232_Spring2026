// Order types matching backend DTOs

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
