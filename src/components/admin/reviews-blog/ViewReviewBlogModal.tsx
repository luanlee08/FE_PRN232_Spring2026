"use client";

import { Modal } from "@/components/admin/ui/modal";
import { ReviewBlogAdmin } from "@/services/admin_services/admin.blogReview.service";

interface Props {
  review: ReviewBlogAdmin | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ViewReviewBlogModal({
  review,
  isOpen,
  onClose,
}: Props) {
  if (!review) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">
        Chi tiết Review Blog
      </h2>

      <div className="space-y-4 text-sm">
        <div>
          <p className="text-gray-500">Bài viết</p>
          <p className="font-medium">{review.blogTitle}</p>
        </div>

        <div>
          <p className="text-gray-500">Khách hàng</p>
          <p className="font-medium">{review.accountName} (ID: {review.accountId})</p>
        </div>

        <div>
          <p className="text-gray-500">Nội dung</p>
          <p className="rounded-lg bg-gray-50 p-3 text-gray-700">
            {review.comment}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Trạng thái</p>
          {review.isBlocked ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
              Đã chặn
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
              Hoạt động
            </span>
          )}
        </div>

        <div>
          <p className="text-gray-500">Ngày tạo</p>
          <p>{new Date(review.createdAt).toLocaleDateString("vi-VN")}</p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={onClose}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
        >
          Đóng
        </button>
      </div>
    </Modal>
  );
}