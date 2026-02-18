import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";

export interface CategoryAdmin {
  categoryId: number;
  categoryName: string;
  description?: string;
  superCategoryId: number;
  superCategoryName: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const AdminCategoryService = {
  async get(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    superCategoryId?: number;
  }) {
    const res = await axiosInstance.get<ApiResponse<PagedResult<CategoryAdmin>>>(
      API_ENDPOINTS.ADMIN_CATEGORIES,
      { params }
    );

    return res.data.data;
  },

  async getActive(superCategoryId?: number) {
    const res = await axiosInstance.get<ApiResponse<CategoryAdmin[]>>(
      API_ENDPOINTS.ADMIN_CATEGORIES_ACTIVE,
      { params: { superCategoryId } }
    );

    return res.data.data;
  },

  async create(data: {
    categoryName: string;
    description?: string;
    superCategoryId: number;
    isDeleted: boolean;
  }) {
    const res = await axiosInstance.post<ApiResponse<number>>(
      API_ENDPOINTS.ADMIN_CATEGORIES,
      data
    );

    return res.data;
  },

  async update(
    id: number,
    data: {
      categoryName: string;
      description?: string;
      superCategoryId: number;
      isDeleted: boolean;
    }
  ) {
    const res = await axiosInstance.put<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_CATEGORY_BY_ID(id),
      data
    );

    return res.data;
  },

  async toggleStatus(item: CategoryAdmin) {
    const res = await axiosInstance.put(
      API_ENDPOINTS.ADMIN_CATEGORY_BY_ID(item.categoryId),
      {
        categoryName: item.categoryName,
        description: item.description,
        superCategoryId: item.superCategoryId,
        isDeleted: !item.isDeleted,
      }
    );

    return res.data;
  },
};

