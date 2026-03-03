"use client";

import { Eye, Ban, CheckCircle, Edit2, MessageSquare } from "lucide-react";
import { ReviewBlogAdmin } from "@/services/admin_services/admin.blogReview.service";

interface Props {
  data: ReviewBlogAdmin[];
  loading?: boolean;
  onToggleBlock?: (item: ReviewBlogAdmin) => void;
  onView?: (item: ReviewBlogAdmin) => void;
  onReply?: (item: ReviewBlogAdmin) => void;
}

export default function ReviewBlogTable({
  data,
  loading,
  onView,
  onReply,   // 👈 thêm dòng này
}: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="px-6 py-3 text-left font-medium">ID</th>
            <th className="px-6 py-3 text-left font-medium">Bài viết</th>
            <th className="px-6 py-3 text-left font-medium">Khách hàng</th>
            <th className="px-6 py-3 text-left font-medium">Nội dung</th>
            <th className="px-6 py-3 text-left font-medium">Trạng thái</th>
            <th className="px-6 py-3 text-left font-medium">Ngày tạo</th>
            <th className="px-6 py-3 text-right font-medium">Thao tác</th>
          </tr>
        </thead>

        <tbody className="divide-y">
          {loading && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-400">
                Đang tải...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={7} className="py-10 text-center text-gray-400">
                Không có dữ liệu
              </td>
            </tr>
          )}

          {!loading &&
            data.map((item) => (
              <tr
                key={item.reviewBlogId}
                className="hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4 font-medium text-gray-700">
                  #{item.reviewBlogId}
                </td>

                <td className="px-6 py-4 font-semibold">
                  {item.blogTitle}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {item.accountName || `ID: ${item.accountId}`}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => onView?.(item)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Xem chi tiết
                  </button>
                </td>

                <td className="px-6 py-4">
                  {item.isBlocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600">
                      <Ban size={12} />
                      Đã chặn
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600">
                      <CheckCircle size={12} />
                      Hoạt động
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 text-gray-500">
                  {new Date(item.createdAt).toLocaleDateString("vi-VN")}
                </td>

                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => onView?.(item)}
                    className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  >
                    <Edit2 size={16} />
                  </button>

                  <button
                    onClick={() => onReply?.(item)}
                    className="inline-flex items-center justify-center rounded-lg p-2 
             text-blue-600 hover:bg-blue-50 hover:text-blue-700 
             transition"
                  >
                    <MessageSquare size={18} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}