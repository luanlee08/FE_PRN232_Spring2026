"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/admin/ui/modal";
import { ReviewBlogAdmin } from "@/services/admin_services/admin.blogReview.service";

interface Props {
  review: ReviewBlogAdmin | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, isBlocked: boolean) => void;
}

export default function EditReviewBlogModal({
  review,
  isOpen,
  onClose,
  onSave,
}: Props) {
  const [isBlocked, setIsBlocked] = useState(
  review?.isBlocked ?? false
);

  if (!review) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <h2 className="mb-4 text-lg font-semibold">
        Chỉnh sửa trạng thái Review
      </h2>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-gray-500">Bài viết</p>
          <p className="font-medium">{review.blogTitle}</p>
        </div>

        <div>
          <p className="text-gray-500">Khách hàng</p>
          <p className="font-medium">
            {review.accountName} (ID: {review.accountId})
          </p>
        </div>

        <div>
          <p className="text-gray-500">Nội dung</p>
          <div className="rounded-lg bg-gray-50 p-3">
            {review.comment}
          </div>
        </div>

        <div>
          <p className="text-gray-500 mb-1">Trạng thái</p>
          <select
            value={isBlocked ? "blocked" : "active"}
            onChange={(e) =>
              setIsBlocked(e.target.value === "blocked")
            }
            className="w-full rounded-lg border p-2"
          >
            <option value="active">Hoạt động</option>
            <option value="blocked">Chặn</option>
          </select>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onClose}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Hủy
        </button>

        <button
          onClick={() => onSave(review.reviewBlogId, isBlocked)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Lưu thay đổi
        </button>
      </div>
    </Modal>
  );
}