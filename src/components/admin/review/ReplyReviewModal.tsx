"use client";

import { useState } from "react";
import { Modal } from "@/components/admin/ui/modal";
import { ReviewItem } from "@/types/review";
import { AdminReviewService } from "@/services/admin_services/admin.review.service";

interface Props {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReplied: () => void;
}

export default function ReplyReviewModal({ review, isOpen, onClose, onReplied }: Props) {
  const [replyText, setReplyText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setReplyText("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!review) return;
    if (!replyText.trim()) {
      setError("Vui lòng nhập nội dung trả lời.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await AdminReviewService.reply({
        reviewProductId: review.reviewProductId,
        replyText: replyText.trim(),
      });
      setReplyText("");
      onReplied();
      onClose();
    } catch {
      setError("Gửi phản hồi thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (!review) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Trả lời Review</h2>

      {/* Original review */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium text-gray-700">{review.accountName}</span>
          <span className="text-yellow-500">
            {"★".repeat(review.rating)}
            {"☆".repeat(5 - review.rating)}
          </span>
          {review.isVerifiedPurchase && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
              Đã mua hàng
            </span>
          )}
        </div>
        <p className="font-medium text-gray-500">{review.productName}</p>
        <p className="mt-1 text-gray-600">{review.comment}</p>
      </div>

      {/* Existing replies */}
      {review.replies && review.replies.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Phản hồi trước đó
          </p>
          {review.replies.map((r) => (
            <div
              key={r.reviewProductReplyId}
              className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm"
            >
              <p className="mb-0.5 font-medium text-blue-700">{r.accountName}</p>
              <p className="text-gray-700">{r.replyText}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(r.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Reply textarea */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nội dung phản hồi</label>
        <textarea
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          rows={4}
          placeholder="Nhập phản hồi của bạn cho khách hàng..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          onClick={handleClose}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Huỷ
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving || !replyText.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Đang gửi..." : "Gửi phản hồi"}
        </button>
      </div>
    </Modal>
  );
}
