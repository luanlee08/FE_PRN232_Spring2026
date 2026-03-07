import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";
import {
  ReviewResponse,
  ReviewListQuery,
  ReviewSummaryResponse,
  ReactionRequest,
} from "@/types/review";

export const CustomerReviewService = {
  async getReviews(query: ReviewListQuery): Promise<ApiResponse<PagedResult<ReviewResponse>>> {
    const res = await axiosInstance.get<ApiResponse<PagedResult<ReviewResponse>>>(
      API_ENDPOINTS.CUSTOMER_REVIEWS,
      { params: query },
    );
    return res.data;
  },

  async getSummary(productId: number): Promise<ApiResponse<ReviewSummaryResponse>> {
    const res = await axiosInstance.get<ApiResponse<ReviewSummaryResponse>>(
      API_ENDPOINTS.CUSTOMER_REVIEW_SUMMARY(productId),
    );
    return res.data;
  },

  async addReview(formData: FormData): Promise<ApiResponse<ReviewResponse>> {
    const res = await axiosInstance.post<ApiResponse<ReviewResponse>>(
      API_ENDPOINTS.CUSTOMER_REVIEWS,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  async editReview(reviewId: number, formData: FormData): Promise<ApiResponse<ReviewResponse>> {
    const res = await axiosInstance.put<ApiResponse<ReviewResponse>>(
      `${API_ENDPOINTS.CUSTOMER_REVIEWS}/${reviewId}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data;
  },

  async toggleReaction(body: ReactionRequest): Promise<ApiResponse<null>> {
    const res = await axiosInstance.post<ApiResponse<null>>(
      API_ENDPOINTS.CUSTOMER_REVIEW_REACTIONS,
      body,
    );
    return res.data;
  },

  async getMyHistory(productId: number): Promise<ApiResponse<ReviewResponse[]>> {
    const res = await axiosInstance.get<ApiResponse<ReviewResponse[]>>(
      API_ENDPOINTS.CUSTOMER_REVIEW_HISTORY,
      { params: { productId } },
    );
    return res.data;
  },
};
