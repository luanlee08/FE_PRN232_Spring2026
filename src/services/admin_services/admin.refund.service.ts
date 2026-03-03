import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";
import { RefundDto } from "@/types/order";

export interface AdminRefundQuery {
  statusFilter?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ProcessRefundRequest {
  isApproved: boolean;
  note?: string;
}

export const AdminRefundService = {
  /** 17. Search / list all refund requests */
  async getList(params: AdminRefundQuery = {}) {
    const res = await axiosInstance.get<ApiResponse<PagedResult<RefundDto>>>(
      API_ENDPOINTS.ADMIN_REFUNDS,
      {
        params: {
          statusFilter: params.statusFilter || undefined,
          pageNumber: params.pageNumber ?? 1,
          pageSize: params.pageSize ?? 10,
        },
      },
    );
    return res.data.data;
  },

  /** 18. View detail of a single refund */
  async getById(refundId: number) {
    const res = await axiosInstance.get<ApiResponse<RefundDto>>(
      API_ENDPOINTS.ADMIN_REFUND_BY_ID(refundId),
    );
    return res.data.data;
  },

  /** 19 + 20. Process (approve / reject) a refund */
  async process(refundId: number, request: ProcessRefundRequest) {
    const res = await axiosInstance.put<ApiResponse<RefundDto>>(
      API_ENDPOINTS.ADMIN_REFUND_PROCESS(refundId),
      request,
    );
    return res.data;
  },
};
