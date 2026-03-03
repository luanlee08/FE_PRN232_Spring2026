import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";

export interface BrandAdmin {
  brandId: number;
  brandName: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const AdminBrandService = {
  async get(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    categoryId?: number;
  }) {
    const res = await axiosInstance.get<
      ApiResponse<PagedResult<BrandAdmin>>
    >(API_ENDPOINTS.ADMIN_BRANDS_LIST, { params });

    return res.data.data;
  },

  async create(data: {
    brandName: string;
    description?: string;
    isDeleted: boolean;
  }) {
    const res = await axiosInstance.post(
      API_ENDPOINTS.ADMIN_BRANDS_LIST,
      data
    );
    return res.data;
  },

  async update(
    id: number,
    data: {
      brandName: string;
      description?: string;
      isDeleted: boolean;
    }
  ) {
    const res = await axiosInstance.put(
      API_ENDPOINTS.ADMIN_BRAND_BY_ID(id),
      data
    );
    return res.data;
  },
};