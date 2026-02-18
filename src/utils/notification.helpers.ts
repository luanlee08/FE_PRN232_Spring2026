// Notification helper functions and UI constants
// Extracted from types/notification.ts to follow single-responsibility principle

import {
    NotificationCategory,
    TemplateCategoryMap,
    type NotificationPayload,
} from "@/types/notification";

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
