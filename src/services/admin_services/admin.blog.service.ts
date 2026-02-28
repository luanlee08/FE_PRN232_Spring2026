// services/admin_services/admin.blog.service.ts

import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import {
  BlogAdmin,
  BlogQuery,
  BlogCategory,
} from "@/types/blog";

/* ================= RESPONSE TYPES ================= */

interface PagedResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T;
}

/* ================= SERVICE ================= */

export const blogService = {
  /* ===== SEARCH ===== */
  async searchBlogs(
    query: BlogQuery
  ): Promise<PagedResponse<BlogAdmin>> {
    const res = await axiosInstance.get<
      PagedResponse<BlogAdmin>
    >(API_ENDPOINTS.ADMIN_BLOG_SEARCH, {
      params: query,
    });

    return res.data;
  },

  /* ===== CREATE ===== */
  async createBlog(
    formData: FormData
  ): Promise<ApiResponse<number>> {
    const res = await axiosInstance.post(
      API_ENDPOINTS.ADMIN_BLOGS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  /* ===== UPDATE ===== */
  async updateBlog(
    id: number,
    formData: FormData
  ): Promise<ApiResponse<boolean>> {
    const res = await axiosInstance.put(
      API_ENDPOINTS.ADMIN_BLOG_BY_ID(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  /* ===== GET CATEGORIES ===== */
  async getCategories(): Promise<
    ApiResponse<BlogCategory[]>
  > {
    const res = await axiosInstance.get<
      ApiResponse<BlogCategory[]>
    >(API_ENDPOINTS.ADMIN_BLOG_CATEGORIES);

    return res.data;
  },
};