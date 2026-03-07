// ── Enums / Unions ────────────────────────────────────────────────────────────
export type ReviewStatus = "Pending" | "Approved" | "Rejected";
export type ReviewVisibility = "Public" | "AuthorOnly";

// ── Core types ────────────────────────────────────────────────────────────────
export interface ReviewReply {
  reviewProductReplyId: number;
  reviewProductId: number;
  accountId: number;
  accountName: string;
  accountImage?: string;
  replyText: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewItem {
  reviewProductId: number;
  accountId: number;
  accountName: string;
  accountImage?: string;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  status: ReviewStatus;
  visibility: ReviewVisibility;
  moderationDetail?: string;
  isVerifiedPurchase: boolean;
  likeCount: number;
  dislikeCount: number;
  editCount: number;
  createdAt: string;
  updatedAt?: string;
  replies?: ReviewReply[];
}

// ── Query / Request DTOs ──────────────────────────────────────────────────────
export interface AdminReviewListQuery {
  searchKeyword?: string; // searches comment, account name, product name
  rating?: number;
  status?: ReviewStatus | "All";
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
}

export interface AdminUpdateReviewRequest {
  status?: ReviewStatus;
  visibility?: ReviewVisibility;
  moderationDetail?: string;
}

export interface AddReplyRequest {
  reviewProductId: number;
  replyText: string;
}

// ── Customer-facing response types ────────────────────────────────────────────
export interface ReviewReplyItem {
  reviewProductReplyId: number;
  reviewProductId: number;
  accountId: number;
  accountName: string;
  accountImage?: string | null;
  replyText: string;
  createdAt: string;
}

export interface ReviewResponse {
  reviewProductId: number;
  accountId: number;
  accountName: string;
  accountImage?: string | null;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  status: ReviewStatus;
  visibility: ReviewVisibility;
  moderationDetail?: string | null;
  likeCount: number;
  dislikeCount: number;
  isLikedByCurrentUser: boolean;
  editCount: number;
  canEdit: boolean;
  replies: ReviewReplyItem[];
  createdAt: string;
  updatedAt?: string | null;
}

export interface ReviewListQuery {
  productId: number;
  page?: number;
  pageSize?: number;
  status?: string;
  rating?: number;
}

export interface ReviewSummaryResponse {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}

export interface ReactionRequest {
  reviewProductId: number;
  reactionType: "Like" | "Dislike";
}
