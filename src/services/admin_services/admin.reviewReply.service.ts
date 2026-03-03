import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";

/* ================= RESPONSE TYPE ================= */

interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T;
}

/* ================= SERVICE ================= */

export const reviewReplyService = {
  async create(
    reviewBlogId: number,
    content: string
  ): Promise<ApiResponse<boolean>> {

    const res = await axiosInstance.post<
      ApiResponse<boolean>
    >(API_ENDPOINTS.ADMIN_REVIEW_BLOG_REPLIES, {
      reviewBlogId,
      content,
    });

    return res.data;
  },
};