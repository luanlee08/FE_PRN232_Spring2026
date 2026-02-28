import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, ReviewBlog } from "@/types/blog";

export const customerBlogReviewService = {

  // ===== GET REVIEWS BY BLOG =====
  async getByBlog(blogId: number) {
    const res = await axiosInstance.get<
      ApiResponse<ReviewBlog[]>
    >(API_ENDPOINTS.BLOG_REVIEWS_BY_BLOG(blogId));

    return res.data;
  },

  // ===== CREATE REVIEW =====
 // customer.blogReview.service.ts

async create(
  blogPostId: number,
  comment: string,
  rating: number
) {
  const res = await axiosInstance.post<
    ApiResponse<boolean>
  >(API_ENDPOINTS.BLOG_REVIEWS, {
    blogPostId,
    comment,   // 🔥 đổi content -> comment cho đúng DTO backend
    rating,
  });

  return res.data;
}
};