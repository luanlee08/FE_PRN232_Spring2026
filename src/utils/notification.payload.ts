// Notification Payload Helper Functions
// These functions help create standardized payload structures for different notification types

import type {
  OrderNotificationPayload,
  PromotionNotificationPayload,
  PaymentNotificationPayload,
  SystemNotificationPayload,
} from "@/types/notification";

// Maximum payload size allowed by database
const MAX_PAYLOAD_SIZE = 1000;

// Helper to validate and stringify payload
function stringifyPayload(payload: any): string {
  const jsonString = JSON.stringify(payload);
  
  if (jsonString.length > MAX_PAYLOAD_SIZE) {
    console.warn(
      `Payload size (${jsonString.length}) exceeds maximum (${MAX_PAYLOAD_SIZE}). Truncating...`
    );
    // Truncate the payload if too large
    return jsonString.substring(0, MAX_PAYLOAD_SIZE);
  }
  
  return jsonString;
}

// Create payload for order notifications
export function createOrderNotificationPayload(
  orderId: number,
  orderCode?: string,
  status?: string
): string {
  const payload: OrderNotificationPayload = {
    type: "order",
    orderId,
    orderCode,
    status,
    link: `/orders/${orderId}`,
  };
  
  return stringifyPayload(payload);
}

// Create payload for promotion notifications
export function createPromotionNotificationPayload(
  voucherId?: number,
  voucherCode?: string,
  customLink?: string
): string {
  const payload: PromotionNotificationPayload = {
    type: "promotion",
    voucherId,
    voucherCode,
    link: customLink || (voucherId ? `/vouchers/${voucherId}` : "/promotions"),
  };
  
  return stringifyPayload(payload);
}

// Create payload for payment notifications
export function createPaymentNotificationPayload(
  transactionId?: number,
  amount?: number,
  relatedOrderId?: number
): string {
  const payload: PaymentNotificationPayload = {
    type: "payment",
    transactionId,
    amount,
    link: relatedOrderId ? `/orders/${relatedOrderId}` : "/wallet",
  };
  
  return stringifyPayload(payload);
}

// Create payload for system notifications
export function createSystemNotificationPayload(
  link?: string,
  metadata?: Record<string, any>
): string {
  const payload: SystemNotificationPayload = {
    type: "system",
    link,
    metadata,
  };
  
  return stringifyPayload(payload);
}

// Create generic custom payload
export function createCustomPayload(data: Record<string, any>): string {
  return stringifyPayload(data);
}

// Validate payload before sending
export function validatePayload(payloadString: string): {
  isValid: boolean;
  error?: string;
} {
  // Check size
  if (payloadString.length > MAX_PAYLOAD_SIZE) {
    return {
      isValid: false,
      error: `Payload vượt quá giới hạn ${MAX_PAYLOAD_SIZE} ký tự`,
    };
  }
  
  // Check if valid JSON
  try {
    const parsed = JSON.parse(payloadString);
    
    // Check if has type field (recommended)
    if (!parsed.type) {
      return {
        isValid: true,
        error: "Cảnh báo: Payload nên có trường 'type' để xác định loại thông báo",
      };
    }
    
    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: "Payload không phải là JSON hợp lệ",
    };
  }
}

// Example payload templates for common use cases
// NOTE: These are EXAMPLES ONLY with placeholder values
// Always use actual dynamic IDs from your database, NOT hardcoded values
export const PAYLOAD_EXAMPLES = {
  order: `{
  "type": "order",
  "orderId": {{ORDER_ID}},
  "orderCode": "{{ORDER_CODE}}",
  "status": "{{STATUS}}",
  "link": "/orders/{{ORDER_ID}}"
}`,
  promotion: `{
  "type": "promotion",
  "voucherId": {{VOUCHER_ID}},
  "voucherCode": "{{VOUCHER_CODE}}",
  "link": "/vouchers/{{VOUCHER_ID}}"
}`,
  payment: `{
  "type": "payment",
  "transactionId": {{TRANSACTION_ID}},
  "amount": {{AMOUNT}},
  "link": "/orders/{{ORDER_ID}}"
}`,
  system: `{
  "type": "system",
  "link": "{{DYNAMIC_LINK}}",
  "metadata": {
    "action": "{{ACTION_TYPE}}"
  }
}`,
  // Human-readable descriptions for clarity
  descriptions: {
    order: "Thay {{ORDER_ID}}, {{ORDER_CODE}}, {{STATUS}} bằng giá trị thực từ database",
    promotion: "Thay {{VOUCHER_ID}}, {{VOUCHER_CODE}} bằng ID và mã voucher thực tế",
    payment: "Thay {{TRANSACTION_ID}}, {{AMOUNT}}, {{ORDER_ID}} bằng giá trị giao dịch thực",
    system: "Thay {{DYNAMIC_LINK}}, {{ACTION_TYPE}} bằng đường dẫn và hành động cụ thể",
  },
};
