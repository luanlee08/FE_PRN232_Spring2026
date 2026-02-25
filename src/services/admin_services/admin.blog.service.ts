import { API_ENDPOINTS } from "@/configs/api-configs";
import {
  BlogAdmin,
  BlogQuery,
  BlogCategory,
} from "@/types/blog";

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

export const blogService = {
  // ===== SEARCH =====
  searchBlogs: async (
    query: BlogQuery
  ): Promise<PagedResponse<BlogAdmin>> => {
    const params = new URLSearchParams({
      page: query.page.toString(),
      pageSize: query.pageSize.toString(),
    });

    if (query.keyword) params.append("keyword", query.keyword);

    const res = await fetch(
      `${API_ENDPOINTS.ADMIN_BLOG_SEARCH}?${params}`,
      {
        cache: "no-store",
        credentials: "include",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch blogs");
    }

    return res.json();
  },

  // ===== CREATE =====
  createBlog: async (
    data: FormData
  ): Promise<ApiResponse<number>> => {
    const res = await fetch(API_ENDPOINTS.ADMIN_BLOGS, {
      method: "POST",
      credentials: "include",
      body: data,
    });

    return res.json();
  },

  // ===== UPDATE =====
  updateBlog: async (
    id: number,
    data: FormData
  ): Promise<ApiResponse<boolean>> => {
    const res = await fetch(
      API_ENDPOINTS.ADMIN_BLOG_BY_ID(id),
      {
        method: "PUT",
        credentials: "include",
        body: data,
      }
    );

    return res.json();
  },

  // ===== GET CATEGORIES =====
  getCategories: async (): Promise<ApiResponse<BlogCategory[]>> => {
    const res = await fetch(
      API_ENDPOINTS.ADMIN_BLOG_CATEGORIES,
      {
        cache: "no-store",
        credentials: "include",
      }
    );

    return res.json();
  },
};