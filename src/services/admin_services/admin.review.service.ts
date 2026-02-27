import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";
import {
  AdminReviewListQuery,
  AdminUpdateReviewRequest,
  AddReplyRequest,
  ReviewItem,
  ReviewReply,
} from "@/types/review";

export const AdminReviewService = {
  /** GET /api/admin/reviews — paginated list with filters */
  async getList(params: AdminReviewListQuery) {
    const res = await axiosInstance.get<ApiResponse<PagedResult<ReviewItem>>>(
      API_ENDPOINTS.ADMIN_REVIEWS,
      { params },
    );
    return res.data.data;
  },

  /** PUT /api/admin/reviews/{id} — moderation update (Status / Visibility / ModerationDetail) */
  async update(reviewId: number, body: AdminUpdateReviewRequest) {
    const res = await axiosInstance.put<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_REVIEW_BY_ID(reviewId),
      body,
    );
    return res.data;
  },

  /** DELETE /api/admin/reviews/{id} — soft delete */
  async softDelete(reviewId: number) {
    const res = await axiosInstance.delete<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_REVIEW_BY_ID(reviewId),
    );
    return res.data;
  },

  /** POST /api/admin/reviews/replies — add staff / admin reply */
  async reply(body: AddReplyRequest) {
    const res = await axiosInstance.post<ApiResponse<ReviewReply>>(
      API_ENDPOINTS.ADMIN_REVIEW_REPLIES,
      body,
    );
    return res.data;
  },
};
