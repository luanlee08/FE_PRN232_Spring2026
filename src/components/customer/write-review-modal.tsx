"use client";

import { useState, useRef } from "react";
import { Star, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { CustomerReviewService } from "@/services/customer_services/customer.review.service";
import { ReviewResponse } from "@/types/review";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderDetailId: number;
  productId: number;
  productName: string;
  productImage?: string | null;
  /** Provide when editing an existing review */
  existingReview?: ReviewResponse;
  onSuccess: (review: ReviewResponse) => void;
}

const MAX_IMAGES = 3;
const MAX_COMMENT_LEN = 500;
const MIN_COMMENT_LEN = 10;

export function WriteReviewModal({
  isOpen,
  onClose,
  orderDetailId,
  productId,
  productName,
  productImage,
  existingReview,
  onSuccess,
}: Props) {
  const isEdit = Boolean(existingReview);

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? "");
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [keepImageUrls, setKeepImageUrls] = useState<string[]>(existingReview?.imageUrls ?? []);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const totalImageCount = keepImageUrls.length + newImages.length;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - totalImageCount;
    const toAdd = files.slice(0, remaining);
    if (files.length > remaining) {
      toast.error(`Tối đa ${MAX_IMAGES} ảnh`);
    }
    setNewImages((prev) => [...prev, ...toAdd]);
    setNewImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeKeepImage = (url: string) => {
    setKeepImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Vui lòng chọn số sao đánh giá");
      return;
    }
    if (!comment.trim()) {
      toast.error("Vui lòng nhập nhận xét");
      return;
    }
    if (comment.trim().length < MIN_COMMENT_LEN) {
      toast.error(`Nhận xét phải có ít nhất ${MIN_COMMENT_LEN} ký tự`);
      return;
    }

    const formData = new FormData();
    formData.append("rating", String(rating));
    formData.append("comment", comment.trim());

    if (isEdit && existingReview) {
      keepImageUrls.forEach((url) => formData.append("keepImageUrls", url));
      newImages.forEach((file) => formData.append("newImages", file));
    } else {
      formData.append("orderDetailId", String(orderDetailId));
      newImages.forEach((file) => formData.append("images", file));
    }

    setSubmitting(true);
    try {
      let res;
      if (isEdit && existingReview) {
        res = await CustomerReviewService.editReview(existingReview.reviewProductId, formData);
      } else {
        res = await CustomerReviewService.addReview(formData);
      }

      if (res.status === 200 || res.status === 201) {
        toast.success("Đánh giá đang được kiểm duyệt. Cảm ơn bạn!");
        onSuccess(res.data!);
        onClose();
      } else {
        toast.error(res.message || "Không thể gửi đánh giá");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  const starLabels = ["Tệ", "Không tốt", "Bình thường", "Tốt", "Tuyệt vời"];
  const displayRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {isEdit ? "Sửa đánh giá" : "Viết đánh giá"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Product info */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={productName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200 text-xl">
                  📦
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-gray-700 line-clamp-2">{productName}</p>
          </div>

          {/* Star rating */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= displayRating
                        ? "fill-[#F5A623] text-[#F5A623]"
                        : "text-gray-200 hover:text-[#F5A623]"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm font-medium text-gray-600 h-5">
              {displayRating > 0 ? starLabels[displayRating - 1] : "Chọn số sao"}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nhận xét <span className="text-red-400">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LEN))}
              rows={4}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition"
            />
            <p className="text-right text-xs mt-1">
              <span
                className={
                  comment.trim().length > 0 && comment.trim().length < MIN_COMMENT_LEN
                    ? "text-red-400"
                    : "text-gray-400"
                }
              >
                {comment.length}/{MAX_COMMENT_LEN}
                {comment.trim().length > 0 &&
                  comment.trim().length < MIN_COMMENT_LEN &&
                  ` · Tối thiểu ${MIN_COMMENT_LEN} ký tự`}
              </span>
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh <span className="text-gray-400 font-normal">(tối đa {MAX_IMAGES} ảnh)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Existing images to keep */}
              {keepImageUrls.map((url) => (
                <div
                  key={url}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group"
                >
                  <Image
                    src={url}
                    alt="Ảnh đã có"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeKeepImage(url)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}

              {/* New image previews */}
              {newImagePreviews.map((preview, idx) => (
                <div
                  key={preview}
                  className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 group"
                >
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}

              {/* Upload button */}
              {totalImageCount < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px]">Thêm ảnh</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || rating === 0}
            className="px-5 py-2 text-sm font-semibold bg-[#FF6B35] hover:bg-[#E55A24] text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Đang gửi..." : isEdit ? "Cập nhật đánh giá" : "Gửi đánh giá"}
          </button>
        </div>
      </div>
    </div>
  );
}
