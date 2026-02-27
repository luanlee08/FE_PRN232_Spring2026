"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, MessageSquare, Edit, Trash2 } from "lucide-react";
import { AdminReviewService } from "@/services/admin_services/admin.review.service";
import { AdminReviewListQuery, ReviewItem, ReviewStatus } from "@/types/review";
import EditReviewModal from "./EditReviewModal";
import ReplyReviewModal from "./ReplyReviewModal";
import { Modal } from "@/components/admin/ui/modal";

// ── Constants ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Pending", label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Từ chối" },
];

const RATING_OPTIONS = [
  { value: "", label: "Tất cả sao" },
  { value: "5", label: "5 ★" },
  { value: "4", label: "4 ★" },
  { value: "3", label: "3 ★" },
  { value: "2", label: "2 ★" },
  { value: "1", label: "1 ★" },
];

// ── Badge helpers ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: ReviewStatus }) {
  const map: Record<ReviewStatus, string> = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Rejected: "bg-red-100 text-red-700",
  };
  const label: Record<ReviewStatus, string> = {
    Approved: "Đã duyệt",
    Pending: "Chờ duyệt",
    Rejected: "Từ chối",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${map[status]}`}>
      {label[status]}
    </span>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span>
      <span className="text-yellow-400">{"★".repeat(rating)}</span>
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/** Shows the latest reply or a "no reply" indicator */
function ReplyCell({ review }: { review: ReviewItem }) {
  const replies = review.replies ?? [];
  if (replies.length === 0) {
    return (
      <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-500">
        Chưa phản hồi
      </span>
    );
  }
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          Đã phản hồi {replies.length > 1 ? `(${replies.length})` : ""}
        </span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ReviewManagementUI() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [keyword, setKeyword] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("");

  // Modals
  const [editTarget, setEditTarget] = useState<ReviewItem | null>(null);
  const [replyTarget, setReplyTarget] = useState<ReviewItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query: AdminReviewListQuery = {
        page,
        pageSize: PAGE_SIZE,
        searchKeyword: keyword.trim() || undefined,
        rating: rating ? Number(rating) : undefined,
        status: (status as ReviewStatus) || undefined,
      };
      const result = await AdminReviewService.getList(query);
      setReviews(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);
    } catch (err) {
      console.error("Load reviews error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, rating, status]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const applyFilter = (updater: () => void) => {
    updater();
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await AdminReviewService.softDelete(deleteTarget.reviewProductId);
      setDeleteTarget(null);
      fetchData();
    } catch (err) {
      console.error("Delete review error:", err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* ── HEADER + FILTERS ── */}
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Review Sản Phẩm</h1>
          <p className="text-sm text-gray-500">
            {total > 0 ? `${total} review` : "Không có review nào"}
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-5 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => applyFilter(() => setKeyword(e.target.value))}
              placeholder="Tìm theo tên SP, tên/email KH..."
              className="h-10 w-72 rounded-lg border pl-9 pr-4 text-sm"
            />
          </div>

          <select
            value={rating}
            onChange={(e) => applyFilter(() => setRating(e.target.value))}
            className="h-10 rounded-lg border px-4 text-sm"
          >
            {RATING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => applyFilter(() => setStatus(e.target.value))}
            className="h-10 rounded-lg border px-4 text-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold">Sản phẩm</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Khách hàng</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Đánh giá</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Nội dung</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Trạng thái</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Phản hồi</th>
              <th className="px-4 py-3 text-left text-sm font-semibold">Ngày tạo</th>
              <th className="px-4 py-3 text-center text-sm font-semibold">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Đang tải...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-gray-400">
                  Không tìm thấy review nào
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.reviewProductId} className="border-b hover:bg-gray-50">
                  {/* Product */}
                  <td className="px-4 py-3 text-sm font-medium">{r.productName}</td>

                  {/* Customer */}
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-1.5">
                      <span>{r.accountName}</span>
                      {r.isVerifiedPurchase && (
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                          ✓ Mua
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-3 text-sm">
                    <StarRating rating={r.rating} />
                  </td>

                  {/* Comment */}
                  <td className="px-4 py-3 text-sm">
                    <p className="max-w-50 truncate text-gray-600">{r.comment}</p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
                  </td>

                  {/* Reply status */}
                  <td className="px-4 py-3">
                    <ReplyCell review={r} />
                  </td>

                  {/* Date */}
                  <td className="px-4 py-3 text-sm" suppressHydrationWarning>
                    {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        title="Kiểm duyệt"
                        onClick={() => setEditTarget(r)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-100"
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        title="Trả lời"
                        onClick={() => setReplyTarget(r)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-green-600 hover:bg-green-100"
                      >
                        <MessageSquare size={16} />
                      </button>

                      <button
                        title="Xoá"
                        onClick={() => setDeleteTarget(r)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {reviews.length === 0 && !loading && (
          <div className="py-10 text-center text-gray-400">Không tìm thấy review nào</div>
        )}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            ← Trước
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                p === page ? "bg-blue-600 text-white" : "border text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 hover:bg-gray-50"
          >
            Tiếp →
          </button>
        </div>
      )}

      {/* ── MODALS ── */}
      <EditReviewModal
        review={editTarget}
        isOpen={editTarget !== null}
        onClose={() => setEditTarget(null)}
        onUpdated={fetchData}
      />

      <ReplyReviewModal
        review={replyTarget}
        isOpen={replyTarget !== null}
        onClose={() => setReplyTarget(null)}
        onReplied={fetchData}
      />

      {/* Delete confirm */}
      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        className="max-w-sm p-6"
      >
        <h2 className="mb-2 text-lg font-semibold text-gray-800">Xoá review?</h2>
        <p className="mb-5 text-sm text-gray-500">
          Bạn có chắc muốn xoá review của{" "}
          <span className="font-medium">{deleteTarget?.accountName}</span> về{" "}
          <span className="font-medium">{deleteTarget?.productName}</span>? Hành động này không thể
          hoàn tác.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
          >
            Huỷ
          </button>
          <button
            onClick={handleConfirmDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Đang xoá..." : "Xoá"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
