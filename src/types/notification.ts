// Notification Category Types and Utilities

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

// Get category from template code
export function getCategoryFromTemplate(templateCode: string): NotificationCategory {
  // Check exact match first
  if (TemplateCategoryMap[templateCode]) {
    return TemplateCategoryMap[templateCode];
  }
  
  // Check prefix match for dynamic template codes
  if (templateCode.startsWith("ORDER_")) {
    return NotificationCategory.ORDER;
  }
  if (templateCode.startsWith("VOUCHER_") || templateCode.startsWith("PROMOTION_")) {
    return NotificationCategory.PROMOTION;
  }
  if (templateCode.startsWith("PAYMENT_") || templateCode.startsWith("WALLET_")) {
    return NotificationCategory.PAYMENT;
  }
  
  // Default to OTHER
  return NotificationCategory.OTHER;
}

// Get Vietnamese label for category
export function getCategoryLabel(category: NotificationCategory): string {
  const labels: Record<NotificationCategory, string> = {
    [NotificationCategory.ORDER]: "Đơn hàng",
    [NotificationCategory.PROMOTION]: "Khuyến mãi",
    [NotificationCategory.PAYMENT]: "Thanh toán",
    [NotificationCategory.SYSTEM]: "Hệ thống",
    [NotificationCategory.OTHER]: "Khác",
  };
  return labels[category];
}

// Get icon name for category (using lucide-react icon names)
export function getCategoryIcon(category: NotificationCategory): string {
  const icons: Record<NotificationCategory, string> = {
    [NotificationCategory.ORDER]: "Package",
    [NotificationCategory.PROMOTION]: "Tag",
    [NotificationCategory.PAYMENT]: "Wallet",
    [NotificationCategory.SYSTEM]: "Bell",
    [NotificationCategory.OTHER]: "Info",
  };
  return icons[category];
}

// Get color scheme for category
export function getCategoryColor(category: NotificationCategory): {
  bg: string;
  text: string;
  border: string;
} {
  const colors: Record<NotificationCategory, { bg: string; text: string; border: string }> = {
    [NotificationCategory.ORDER]: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
    },
    [NotificationCategory.PROMOTION]: {
      bg: "bg-pink-50 dark:bg-pink-900/20",
      text: "text-pink-600 dark:text-pink-400",
      border: "border-pink-200 dark:border-pink-800",
    },
    [NotificationCategory.PAYMENT]: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
    },
    [NotificationCategory.SYSTEM]: {
      bg: "bg-gray-50 dark:bg-gray-900/20",
      text: "text-gray-600 dark:text-gray-400",
      border: "border-gray-200 dark:border-gray-800",
    },
    [NotificationCategory.OTHER]: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
    },
  };
  return colors[category];
}

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
  templateCode: string;
  title: string;
  message: string;
  payload?: string; // JSON string
  status: "Unread" | "Read";
  createdAt: string;
  createdByJobId?: number;
}

// Parse notification payload safely
export function parseNotificationPayload(payloadString?: string): NotificationPayload | null {
  if (!payloadString) return null;
  
  try {
    const parsed = JSON.parse(payloadString);
    if (parsed && typeof parsed === "object" && parsed.type) {
      return parsed as NotificationPayload;
    }
    return null;
  } catch (error) {
    console.error("Failed to parse notification payload:", error);
    return null;
  }
}

// Available template codes for admin dropdown
export const AVAILABLE_TEMPLATES = [
  { code: "ORDER_CONFIRMED", label: "Đơn hàng đã xác nhận", category: NotificationCategory.ORDER },
  { code: "ORDER_SHIPPED", label: "Đơn hàng đang giao", category: NotificationCategory.ORDER },
  { code: "ORDER_DELIVERED", label: "Đơn hàng đã giao", category: NotificationCategory.ORDER },
  { code: "PROMOTION", label: "Khuyến mãi", category: NotificationCategory.PROMOTION },
  { code: "WELCOME", label: "Chào mừng", category: NotificationCategory.SYSTEM },
  { code: "PAYMENT_SUCCESS", label: "Thanh toán thành công", category: NotificationCategory.PAYMENT },
  { code: "CUSTOM", label: "Tùy chỉnh", category: NotificationCategory.SYSTEM },
] as const;
