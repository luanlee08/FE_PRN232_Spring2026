import { API_ENDPOINTS } from "@/configs/api-configs";
import axiosInstance from "@/lib/api/axios";
import {
  BlogPublic,
  BlogCategory,
  PagedResponse,
  ApiResponse,
} from "@/types/blog";

export const customerBlogService = {

  async getFeatured(limit: number) {
  const res = await axiosInstance.get<ApiResponse<BlogPublic[]>>(
    API_ENDPOINTS.BLOG_FEATURED,
    {
      params: { limit },
    }
  );

  return res.data;
},

  // ===== LIST =====
  getBlogs: async (
    page: number,
    pageSize: number,
    keyword?: string,
    categoryId?: number
  ): Promise<PagedResponse<BlogPublic>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (keyword) params.append("keyword", keyword);
    if (categoryId)
      params.append("categoryId", categoryId.toString());

    const res = await fetch(
      `${API_ENDPOINTS.BLOGS}?${params}`,
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Fetch blogs failed");

    return res.json();
  },

  // ===== DETAIL =====
  getBlogDetail: async (
    id: number
  ): Promise<ApiResponse<BlogPublic>> => {
    const res = await fetch(
      API_ENDPOINTS.BLOG_BY_ID(id),
      { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Fetch detail failed");

    return res.json();
  },

  // ===== RECENT =====
  getRecent: async (
    limit: number
  ): Promise<ApiResponse<BlogPublic[]>> => {
    const res = await fetch(
      `${API_ENDPOINTS.BLOG_RECENT}?limit=${limit}`,
      { cache: "no-store" }
    );

    return res.json();
  },

  // ===== CATEGORIES =====


  
  getCategories: async (): Promise<
    ApiResponse<BlogCategory[]>
  > => {
    const res = await fetch(
      API_ENDPOINTS.BLOG_CATEGORIES,
      { cache: "no-store" }
    );

    return res.json();
  },
};