"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/admin/ui/modal";
import { ReviewBlogAdmin } from "@/services/admin_services/admin.blogReview.service";
import { reviewReplyService } from "@/services/admin_services/admin.reviewReply.service";

interface Props {
  review: ReviewBlogAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReplyReviewBlogModal({
  review,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔥 RESET mỗi lần mở modal
  useEffect(() => {
    if (isOpen) {
      setContent("");
    }
  }, [isOpen]);

  if (!review) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;

    try {
      setSubmitting(true);

      const res = await reviewReplyService.create(
        review.reviewBlogId,
        content
      );

      if (res.status !== 201) {
        alert(res.message);
        return;
      }

      // reset sau khi gửi thành công
      setContent("");
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setContent("");   // đảm bảo reset khi đóng
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} className="max-w-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        Reply Review #{review.reviewBlogId}
      </h2>

      <div className="mb-4 text-sm text-gray-600 space-y-1">
        <p>
          <b>Khách hàng:</b> {review.accountName}
        </p>
        <p>
          <b>Nội dung:</b> {review.comment}
        </p>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Nhập nội dung trả lời..."
        className="w-full border rounded-lg p-3 text-sm resize-none"
        rows={4}
      />

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={handleClose}
          disabled={submitting}
          className="border px-4 py-2 rounded-lg text-sm hover:bg-gray-50"
        >
          Hủy
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Đang gửi..." : "Gửi Reply"}
        </button>
      </div>
    </Modal>
  );
}