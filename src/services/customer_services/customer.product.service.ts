import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ProductStorefront } from "@/types/products";

export interface ProductQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

interface PagedApiResponse<T> {
  status: number;
  message?: string;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export const CustomerProductService = {
  async getProducts(query?: ProductQuery) {
    const response = await axiosInstance.get<
      PagedApiResponse<ProductStorefront>
    >(API_ENDPOINTS.PRODUCTS, {
      params: query,
    });

    return response.data.data; // 🔥 trả full pagination
  },
  async getById(id: number | string) {
    const response = await axiosInstance.get<{
      status: number;
      message?: string;
      data: ProductStorefront;
    }>(`${API_ENDPOINTS.PRODUCTS}/${id}`);

    return response.data.data;
  }
};

