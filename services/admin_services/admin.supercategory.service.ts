import axios from "axios";
import { API_ENDPOINTS } from "../../configs/api-configs";

export interface SuperCategoryAdmin {
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

export const AdminSuperCategoryService = {
  async get(params: {
    page: number;
    pageSize: number;
    keyword?: string;
  }) {
    const res = await axios.get<ApiResponse<PagedResult<SuperCategoryAdmin>>>(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORIES,
      { params }
    );

    return res.data.data;
  },

  async getActive() {
    const res = await axios.get<ApiResponse<SuperCategoryAdmin[]>>(
      API_ENDPOINTS.ADMIN_SUPER_CATEGORIES_ACTIVE
    );

    return res.data.data;
  },

  async create(data: {
    superCategoryName: string;
  }) {
    const res = await axios.post<ApiResponse<number>>(
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
    const res = await axios.put<ApiResponse<boolean>>(
      `${API_ENDPOINTS.ADMIN_SUPER_CATEGORIES}/${id}`,
      data
    );

    return res.data;
  },
};
