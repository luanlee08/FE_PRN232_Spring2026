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
