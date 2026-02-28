// Notification types, interfaces, and enums ONLY
// Functions and UI helpers have been moved to @/utils/notification.helpers

export enum NotificationCategory {
  ORDER = "ORDER",
  PROMOTION = "PROMOTION",
  PAYMENT = "PAYMENT",
  SYSTEM = "SYSTEM",
  OTHER = "OTHER",
}

// Mapping from Template Code to Category
export const TemplateCategoryMap: Record<string, NotificationCategory> = {
  // Order related templates
  ORDER_CONFIRMED: NotificationCategory.ORDER,
  ORDER_SHIPPED: NotificationCategory.ORDER,
  ORDER_DELIVERED: NotificationCategory.ORDER,
  ORDER_CANCELLED: NotificationCategory.ORDER,
  ORDER_CREATED: NotificationCategory.ORDER,
  ORDER_UPDATE: NotificationCategory.ORDER,

  // Promotion related templates
  PROMOTION: NotificationCategory.PROMOTION,
  VOUCHER_AVAILABLE: NotificationCategory.PROMOTION,
  VOUCHER_EXPIRING: NotificationCategory.PROMOTION,

  // Payment related templates
  PAYMENT_SUCCESS: NotificationCategory.PAYMENT,
  PAYMENT_FAILED: NotificationCategory.PAYMENT,
  WALLET_UPDATE: NotificationCategory.PAYMENT,

  // System related templates
  WELCOME: NotificationCategory.SYSTEM,
  CUSTOM: NotificationCategory.SYSTEM,
  REVIEW_REJECTED: NotificationCategory.SYSTEM,
  ACCOUNT_UPDATE: NotificationCategory.SYSTEM,
};

// Notification Payload Interfaces for deep linking (future use)
export interface BaseNotificationPayload {
  type: string;
  link?: string; // Deep link path
}

export interface OrderNotificationPayload extends BaseNotificationPayload {
  type: "order";
  orderId: number;
  orderCode?: string;
  status?: string;
  link: string; // e.g., "/orders/123"
}

export interface PromotionNotificationPayload extends BaseNotificationPayload {
  type: "promotion";
  voucherId?: number;
  voucherCode?: string;
  link?: string; // e.g., "/vouchers/123" or "/promotions"
}

export interface PaymentNotificationPayload extends BaseNotificationPayload {
  type: "payment";
  transactionId?: number;
  amount?: number;
  link?: string; // e.g., "/wallet" or "/orders/123"
}

export interface SystemNotificationPayload extends BaseNotificationPayload {
  type: "system";
  link?: string; // e.g., "/profile" or any custom path
  metadata?: Record<string, any>;
}

export type NotificationPayload =
  | OrderNotificationPayload
  | PromotionNotificationPayload
  | PaymentNotificationPayload
  | SystemNotificationPayload;

// Notification DTO from API
export interface NotificationDto {
  deliveryId: number;
  accountId: number;
  accountName?: string | null;
  accountEmail?: string | null;
  createdByJobId?: number | null;
  jobName?: string | null;
  templateCode: string;
  title: string;
  message: string;
  payload?: string; // JSON string — deserialize with NotificationPayload union
  status: 'Unread' | 'Read';
  createdAt: string;
}

// Query params for fetching notifications
export interface NotificationQuery {
  status?: 'Unread' | 'Read';
  templateCode?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}
