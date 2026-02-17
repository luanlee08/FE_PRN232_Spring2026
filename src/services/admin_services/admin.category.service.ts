import axios from "axios";
import { API_ENDPOINTS } from "@/configs/api-configs";

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

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T;
}

export const AdminCategoryService = {
  async get(params: {
    page: number;
    pageSize: number;
    keyword?: string;
    superCategoryId?: number;
  }) {
    const res = await axios.get<ApiResponse<PagedResult<CategoryAdmin>>>(
      API_ENDPOINTS.ADMIN_CATEGORIES,
      { params }
    );

    return res.data.data;
  },

  async getActive(superCategoryId?: number) {
    const res = await axios.get<ApiResponse<CategoryAdmin[]>>(
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
    const res = await axios.post<ApiResponse<number>>(
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
    const res = await axios.put<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_CATEGORY_BY_ID(id),
      data
    );

    return res.data;
  },

  async toggleStatus(item: CategoryAdmin) {
    const res = await axios.put(
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
