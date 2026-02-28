import { API_BASE } from "@/configs/api-configs";
import { API_ENDPOINTS } from "@/configs/api-configs";

export interface ReviewBlogAdmin {
  reviewBlogId: number;
  blogTitle: string;
  customerName: string;
  rating: number;
  content: string;
  isBlocked: boolean;
  createdAt: string;
}

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

const BASE = `${API_BASE}/api/admin/reviews-blog`;

export const reviewBlogService = {
  getAll: async (page: number, pageSize: number) => {
  const res = await fetch(
    `${API_ENDPOINTS.ADMIN_REVIEW_BLOGS}?page=${page}&pageSize=${pageSize}`,
    {
      cache: "no-store",
      credentials: "include",
    }
  );
  return res.json();
},

block: async (id: number, isBlocked: boolean) => {
  const res = await fetch(
    `${API_ENDPOINTS.ADMIN_REVIEW_BLOG_BLOCK(id)}?isBlocked=${isBlocked}`,
    {
      method: "PUT",
      credentials: "include",
    }
  );
  return res.json();
},
};