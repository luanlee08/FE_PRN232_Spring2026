// Wallet types matching backend DTOs

export interface WalletResponse {
  walletId: number;
  accountId: number;
  balance: number;
  currency: string;
  status: string;
  lastTransactionAt: string | null;
  createdAt: string;
}

export interface WalletTransactionResponse {
  walletTransactionId: number;
  txnType: "Payment" | "Refund" | "TopUp";
  direction: "In" | "Out";
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  method: string | null;
  externalRef: string | null;
  status: "Pending" | "Completed" | "Failed";
  reason: string | null;
  relatedOrderId: number | null;
  createdAt: string;
  completedAt: string | null;
}

export interface TopUpRequest {
  amount: number;
  gateway: "VNPay" | "MoMo" | "Sepay";
  returnUrl: string;
}

export interface TopUpResponse {
  paymentUrl: string;
  idempotencyKey: string;
  transactionId: number;
  gateway: string;
}

export interface WalletTransactionListParams {
  page?: number;
  pageSize?: number;
  type?: string;
  direction?: string;
}
