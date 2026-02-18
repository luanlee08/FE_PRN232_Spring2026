import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";

export interface SuperCategoryAdmin {
  superCategoryId: number;
  superCategoryName: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const AdminSuperCategoryService = {
  async get(params: {
    page: number;
    pageSize: number;
    keyword?: string;
  }) {
    const res = await axiosInstance.get<ApiResponse<PagedResult<SuperCategoryAdmin>>>(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORIES,
      { params }
    );

    return res.data.data;
  },

  async getActive() {
    const res = await axiosInstance.get<ApiResponse<SuperCategoryAdmin[]>>(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORIES_ACTIVE
    );

    return res.data.data;
  },

  async create(data: {
    superCategoryName: string;
    isDeleted: boolean;
  }) {
    const res = await axiosInstance.post<ApiResponse<number>>(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORIES,
      data
    );

    return res.data;
  },

  async update(
    id: number,
    data: {
      superCategoryName: string;
      isDeleted: boolean;
    }
  ) {
    const res = await axiosInstance.put<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORY_BY_ID(id),
      data
    );

    return res.data;
  },

  async toggleStatus(item: {
    superCategoryId: number;
    superCategoryName: string;
    isDeleted: boolean;
  }) {
    const res = await axiosInstance.put(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORY_BY_ID(item.superCategoryId),
      {
        superCategoryName: item.superCategoryName,
        isDeleted: !item.isDeleted,
      }
    );

    return res.data;
  }
};

