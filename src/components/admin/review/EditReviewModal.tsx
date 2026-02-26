"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/admin/ui/modal";
import {
  ReviewItem,
  AdminUpdateReviewRequest,
  ReviewStatus,
  ReviewVisibility,
} from "@/types/review";
import { AdminReviewService } from "@/services/admin_services/admin.review.service";

interface Props {
  review: ReviewItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const STATUS_OPTIONS: { value: ReviewStatus; label: string }[] = [
  { value: "Pending", label: "Chờ duyệt" },
  { value: "Approved", label: "Đã duyệt" },
  { value: "Rejected", label: "Từ chối" },
];

const VISIBILITY_OPTIONS: { value: ReviewVisibility; label: string }[] = [
  { value: "Public", label: "Công khai" },
  { value: "AuthorOnly", label: "Chỉ tác giả" },
];

export default function EditReviewModal({ review, isOpen, onClose, onUpdated }: Props) {
  const [status, setStatus] = useState<ReviewStatus>("Pending");
  const [visibility, setVisibility] = useState<ReviewVisibility>("Public");
  const [moderationDetail, setModerationDetail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (review) {
      setStatus(review.status);
      setVisibility(review.visibility);
      setModerationDetail(review.moderationDetail ?? "");
      setError("");
    }
  }, [review]);

  const handleSubmit = async () => {
    if (!review) return;
    setSaving(true);
    setError("");
    try {
      const body: AdminUpdateReviewRequest = {
        status,
        visibility,
        moderationDetail: moderationDetail.trim() || undefined,
      };
      await AdminReviewService.update(review.reviewProductId, body);
      onUpdated();
      onClose();
    } catch {
      setError("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  if (!review) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Chỉnh sửa Review</h2>

      {/* Review info */}
      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm">
        <p className="font-medium text-gray-700">{review.productName}</p>
        <p className="text-gray-500">
          {review.accountName} &nbsp;·&nbsp;
          {"★".repeat(review.rating)}
          {"☆".repeat(5 - review.rating)}
        </p>
        <p className="mt-1 text-gray-600 line-clamp-3">{review.comment}</p>
      </div>

      {/* Status */}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-gray-700">Trạng thái</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ReviewStatus)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Visibility */}
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-gray-700">Hiển thị</label>
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value as ReviewVisibility)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {VISIBILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Moderation detail */}
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Ghi chú kiểm duyệt <span className="text-gray-400">(tuỳ chọn)</span>
        </label>
        <textarea
          value={moderationDetail}
          onChange={(e) => setModerationDetail(e.target.value)}
          rows={3}
          placeholder="Lý do từ chối hay ghi chú nội bộ..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Huỷ
        </button>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </Modal>
  );
}
