import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";
import {
  WalletResponse,
  WalletTransactionResponse,
  TopUpRequest,
  TopUpResponse,
  WalletTransactionListParams,
} from "@/types/wallet";

export const CustomerWalletService = {
  // Lấy thông tin ví (số dư, trạng thái)
  async getWallet(): Promise<ApiResponse<WalletResponse>> {
    const res = await axiosInstance.get(API_ENDPOINTS.WALLET_BALANCE);
    return res.data;
  },

  // Lấy lịch sử giao dịch ví (phân trang + filter)
  async getTransactions(
    params?: WalletTransactionListParams,
  ): Promise<ApiResponse<PagedResult<WalletTransactionResponse>>> {
    const res = await axiosInstance.get(API_ENDPOINTS.WALLET_TRANSACTIONS, {
      params,
    });
    return res.data;
  },

  // Khởi tạo nạp tiền qua payment gateway
  async initiateTopUp(data: TopUpRequest): Promise<ApiResponse<TopUpResponse>> {
    const res = await axiosInstance.post(API_ENDPOINTS.WALLET_TOPUP, data);
    return res.data;
  },
};
