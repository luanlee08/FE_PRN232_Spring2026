import { API_ENDPOINTS } from "@/configs/api-configs";
import axiosInstance from "@/lib/api/axios";
import { ApiResponse } from "@/types/blog";

export const customerBlogReactionService = {
  // ===== REACT =====
  react: async (
    reviewBlogId: number,
    reactionType: "Like" | "Dislike"
  ): Promise<ApiResponse<boolean>> => {
    const res = await axiosInstance.post<ApiResponse<boolean>>(
      API_ENDPOINTS.BLOG_REVIEW_REACTIONS,
      {
        reviewBlogId,
        reactionType,
      }
    );

    return res.data;
  },

  // ===== REMOVE REACTION =====
  remove: async (
    reviewBlogId: number
  ): Promise<ApiResponse<boolean>> => {
    const res = await axiosInstance.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.BLOG_REVIEW_REACTION_BY_ID(reviewBlogId)
    );

    return res.data;
  },

  getSummary: async (
  reviewBlogId: number
) => {
  const res = await axiosInstance.get(
    API_ENDPOINTS.BLOG_REVIEW_REACTION_BY_ID(reviewBlogId)
  );
  return res.data;
},
};

