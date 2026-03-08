"use client";

import { Star, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { CustomerReviewService } from "@/services/customer_services/customer.review.service";
import { ReviewResponse, ReviewSummaryResponse } from "@/types/review";
import { API_BASE } from "@/configs/api-configs";
import { useAuth } from "@/lib/auth/auth-context";
import toast from "react-hot-toast";

const mockReviews = [
  {
    id: 1,
    user: { name: "Jane Cooper", avatar: "https://i.pravatar.cc/150?u=1" },
    time: "1 ngày trước",
    rating: 5,
    content:
      "Bàn phím tuyệt vời, chất lượng hoàn thiện tốt và cảm giác gõ rất đã. Đèn RGB sáng và có thể tùy chỉnh. Rất đáng tiền!",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80",
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&q=80",
    ],
    likes: 12,
    dislikes: 0,
    adminReply: {
      time: "10 giờ trước",
      content:
        "Cảm ơn bạn đã tin tưởng và ủng hộ LorKingdom! Chúc bạn có những trải nghiệm tuyệt vời với sản phẩm nhé.",
    },
  },
  {
    id: 2,
    user: { name: "Cody Fisher", avatar: "https://i.pravatar.cc/150?u=2" },
    time: "3 ngày trước",
    rating: 4,
    content:
      "Sản phẩm tốt, giao hàng nhanh. Tuy nhiên hộp hơi móp một chút do vận chuyển. Bàn phím dùng ngon, switch êm.",
    images: [],
    likes: 5,
    dislikes: 1,
  },
  {
    id: 3,
    user: { name: "Kristin Watson", avatar: "https://i.pravatar.cc/150?u=3" },
    time: "4 ngày trước",
    rating: 5,
    content: "Đẹp xuất sắc! Setup góc làm việc cực kỳ hợp. Sẽ ủng hộ shop thêm các sản phẩm khác.",
    images: ["https://images.unsplash.com/photo-1600439614353-174ad0ee3b25?w=200&q=80"],
    likes: 24,
    dislikes: 4,
    adminReply: {
      time: "3 ngày trước",
      content:
        "Dạ LorKingdom cảm ơn đánh giá 5 sao của bạn ạ. Mong bạn sẽ tiếp tục ủng hộ shop trong tương lai!",
    },
  },
  {
    id: 4,
    user: { name: "Leslie Alexander", avatar: "https://i.pravatar.cc/150?u=4" },
    time: "1 tuần trước",
    rating: 1,
    content:
      "Giao hàng quá chậm, hộp nát bét. Nhắn tin cho shop không thấy trả lời. Trải nghiệm tệ.",
    images: [],
    likes: 2,
    dislikes: 10,
    adminReply: {
      time: "6 ngày trước",
      content:
        "Chào bạn, LorKingdom rất xin lỗi về sự cố vận chuyển này. Shop đã liên hệ qua tin nhắn để hỗ trợ đổi trả sản phẩm mới cho bạn ạ.",
    },
  },
  {
    id: 5,
    user: { name: "Jacob Jones", avatar: "https://i.pravatar.cc/150?u=5" },
    time: "1 tuần trước",
    rating: 4,
    content:
      "Bàn phím gõ êm, phù hợp cho cả chơi game và gõ văn bản. Đèn LED đẹp. Hơi ồn một chút nếu dùng trong văn phòng yên tĩnh.",
    images: [],
    likes: 8,
    dislikes: 2,
  },
  {
    id: 6,
    user: { name: "Floyd Miles", avatar: "https://i.pravatar.cc/150?u=6" },
    time: "2 tuần trước",
    rating: 5,
    content:
      "Tuyệt vời! Không có gì để chê. Đóng gói cẩn thận, giao hàng nhanh. Sẽ giới thiệu cho bạn bè.",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80",
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=200&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80",
    ],
    likes: 45,
    dislikes: 3,
  },
];

const REVIEW_PAGE_SIZE = 10;

const resolveAvatarUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
};

const relativeTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);
  if (days > 30) return new Date(dateStr).toLocaleDateString("vi-VN");
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;
  return "Vừa xong";
};

export function ProductReviews({ productId }: { productId: number }) {
  const { isAuthenticated, user } = useAuth();

  const [summary, setSummary] = useState<ReviewSummaryResponse | null>(null);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [reactingId, setReactingId] = useState<number | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await CustomerReviewService.getSummary(productId);
      if (res.status === 200) setSummary(res.data ?? null);
    } catch {
      // summary is non-critical
    }
  }, [productId]);

  const fetchReviews = useCallback(
    async (p: number, rating?: number) => {
      setLoading(true);
      try {
        const res = await CustomerReviewService.getReviews({
          productId,
          page: p,
          pageSize: REVIEW_PAGE_SIZE,
          rating,
        });
        if (res.status === 200 && res.data) {
          setReviews(res.data.items ?? []);
          setTotalCount(res.data.totalCount ?? 0);
        }
      } catch {
        // keep previous reviews on error
      } finally {
        setLoading(false);
      }
    },
    [productId],
  );

  useEffect(() => {
    if (!productId) return;
    fetchSummary();
    fetchReviews(1, undefined);
  }, [productId, fetchSummary, fetchReviews]);

  const handleFilterRating = (rating?: number) => {
    setFilterRating(rating);
    setPage(1);
    fetchReviews(1, rating);
  };

  const handlePage = (p: number) => {
    setPage(p);
    fetchReviews(p, filterRating);
    document
      .getElementById("product-reviews")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReaction = async (reviewId: number, type: "Like" | "Dislike") => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }
    setReactingId(reviewId);
    try {
      await CustomerReviewService.toggleReaction({ reviewProductId: reviewId, reactionType: type });
      await fetchReviews(page, filterRating);
    } catch {
      toast.error("Không thể thực hiện hành động này");
    } finally {
      setReactingId(null);
    }
  };

  const totalPages = Math.ceil(totalCount / REVIEW_PAGE_SIZE);
  const averageRating = summary?.averageRating ?? 0;
  const totalReviews = summary?.totalReviews ?? totalCount;
  const distribution = summary?.ratingDistribution ?? {};

  return (
    <div id="product-reviews" className="mt-12 border border-[#E8E8E8] rounded-xl p-8 bg-white">
      <h3 className="text-2xl font-bold text-[#222] mb-8">Đánh giá &amp; Nhận xét</h3>

      {/* ── Stats ── */}
      <div className="flex flex-col md:flex-row justify-center mb-8 gap-4">
        <div className="flex flex-col justify-center items-center md:items-start min-w-[200px]">
          <div className="text-5xl font-bold text-[#222] mb-2">
            {averageRating > 0 ? averageRating.toFixed(1) : "—"}
          </div>
          <div className="flex mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${star <= Math.round(averageRating) ? "fill-[#00B578] text-[#00B578]" : "text-gray-200"}`}
              />
            ))}
          </div>
          <div className="text-gray-500">{totalReviews.toLocaleString("vi-VN")} Đánh giá</div>
        </div>

        <div className="flex-1 space-y-2 max-w-xl">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[String(star)] ?? 0;
            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <div className="flex items-center gap-1 w-10 text-base font-medium text-gray-600">
                  {star} <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
                </div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#F5A623] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleFilterRating(undefined)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${filterRating === undefined ? "bg-[#FFF5F0] text-[#FF6B35] border-[#FF6B35]" : "bg-white border-[#E8E8E8] text-gray-600 hover:bg-gray-50"}`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => handleFilterRating(star)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition ${filterRating === star ? "bg-[#FFF5F0] text-[#FF6B35] border-[#FF6B35]" : "bg-white border-[#E8E8E8] text-gray-600 hover:bg-gray-50"}`}
          >
            {star} ★
          </button>
        ))}
      </div>

      <hr className="border-[#E8E8E8] mb-8" />

      {/* ── Review list ── */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-32" />
                <div className="h-3 bg-gray-100 rounded w-24" />
                <div className="h-16 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          <p>Chưa có đánh giá nào cho sản phẩm này</p>
          <p className="text-sm mt-1 text-gray-300">Hãy mua và trải nghiệm sản phẩm để đánh giá!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review) => {
            const isOwn = isAuthenticated && (user as any)?.accountId === review.accountId;
            const isPending = review.status === "Pending" && review.visibility === "AuthorOnly";
            const isRejected = review.status === "Rejected";
            const avatarSrc = resolveAvatarUrl(review.accountImage);

            return (
              <div
                key={review.reviewProductId}
                className="flex gap-4 pb-8 border-b border-[#E8E8E8] last:border-0 last:pb-0"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={review.accountName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-300 font-bold text-lg">
                      {review.accountName?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#222]">{review.accountName}</span>
                    {isOwn && isPending && (
                      <span className="text-[11px] px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full">
                        Đang chờ duyệt
                      </span>
                    )}
                    {isOwn && isRejected && (
                      <span className="text-[11px] px-2 py-0.5 bg-red-50 text-red-500 border border-red-200 rounded-full">
                        Không được duyệt
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${star <= review.rating ? "fill-[#00B578] text-[#00B578]" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">|</span>
                    <span className="text-sm text-gray-400">{relativeTime(review.createdAt)}</span>
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-4">{review.comment}</p>

                  {review.imageUrls?.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-4">
                      {review.imageUrls.map((img, idx) => (
                        <div
                          key={idx}
                          className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition"
                        >
                          <Image
                            src={img}
                            alt={`Ảnh đánh giá ${idx + 1}`}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {isOwn && isRejected && review.moderationDetail && (
                    <div className="mb-4 px-3 py-2 bg-red-50 border border-red-100 rounded text-xs text-red-600">
                      Lý do: {review.moderationDetail}
                    </div>
                  )}

                  <div className="flex items-center gap-5 text-sm text-gray-500 mb-4">
                    <button
                      onClick={() => handleReaction(review.reviewProductId, "Like")}
                      disabled={reactingId === review.reviewProductId}
                      className={`flex items-center gap-1.5 hover:text-[#FF6B35] transition disabled:opacity-50 ${review.isLikedByCurrentUser ? "text-[#FF6B35]" : ""}`}
                    >
                      <ThumbsUp
                        className={`w-4 h-4 ${review.isLikedByCurrentUser ? "fill-current" : ""}`}
                      />
                      Hữu ích ({review.likeCount})
                    </button>
                    <button
                      onClick={() => handleReaction(review.reviewProductId, "Dislike")}
                      disabled={reactingId === review.reviewProductId}
                      className="flex items-center gap-1.5 hover:text-[#FF6B35] transition disabled:opacity-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Không hữu ích ({review.dislikeCount})
                    </button>
                  </div>

                  {review.replies?.map((reply) => (
                    <div
                      key={reply.reviewProductReplyId}
                      className="bg-orange-50 p-4 rounded-lg border border-orange-100 mt-2 relative"
                    >
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-orange-50 border-t border-l border-orange-100 transform rotate-45" />
                      <div className="flex items-center gap-2 mb-2 relative z-10">
                        <span className="font-semibold text-[#222]">Phản hồi từ LorKingdom</span>
                        <span className="text-xs text-gray-400">
                          • {relativeTime(reply.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm relative z-10">{reply.replyText}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => handlePage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .reduce<(number | "...")[]>((acc, p, idx, arr) => {
              if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((p, i) =>
              p === "..." ? (
                <span key={`e${i}`} className="px-2 text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePage(p as number)}
                  className={`w-9 h-9 rounded-lg text-sm border transition ${p === page ? "bg-[#FF6B35] border-[#FF6B35] text-white" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                >
                  {p}
                </button>
              ),
            )}
          <button
            onClick={() => handlePage(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
