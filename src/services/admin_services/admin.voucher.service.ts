import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";

export interface VoucherAdmin {
  voucherId: number;
  voucherTypeId: number;
  voucherTypeName: string;
  createBy?: number;
  createByName?: string;
  voucherCode: string;
  discountType: string; // "Fixed" | "Percentage"
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimitPerUser?: number;
  isStackable: boolean;
  startDate: string;
  endDate: string;
  status: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateVoucherRequest {
  voucherTypeId: number;
  voucherCode: string;
  discountType: string;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimitPerUser?: number;
  isStackable: boolean;
  startDate: string;
  endDate: string;
  status: string;
}

export interface UpdateVoucherRequest {
  voucherTypeId?: number;
  voucherCode?: string;
  discountType?: string;
  discountValue?: number;
  maxDiscountAmount?: number;
  minOrderAmount?: number;
  usageLimitPerUser?: number;
  isStackable?: boolean;
  startDate?: string;
  endDate?: string;
  status?: string;
  isDeleted?: boolean;
}

export const AdminVoucherService = {
  async get(params: {
    page: number;
    pageSize: number;
    voucherCode?: string;
    status?: string;
    voucherTypeId?: number;
  }) {
    const res = await axiosInstance.get<ApiResponse<PagedResult<VoucherAdmin>>>(
      API_ENDPOINTS.ADMIN_VOUCHERS,
      { params },
    );

    return res.data.data;
  },

  async create(data: CreateVoucherRequest) {
    const res = await axiosInstance.post<ApiResponse<number>>(API_ENDPOINTS.ADMIN_VOUCHERS, data);

    return res.data;
  },

  async update(id: number, data: UpdateVoucherRequest) {
    const res = await axiosInstance.put<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_VOUCHER_BY_ID(id),
      data,
    );

    return res.data;
  },

  async toggleStatus(item: VoucherAdmin) {
    const res = await axiosInstance.put(API_ENDPOINTS.ADMIN_VOUCHER_BY_ID(item.voucherId), {
      isDeleted: !item.isDeleted,
    });

    return res.data;
  },
};
