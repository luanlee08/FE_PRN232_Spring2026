"use client";

import { ReviewBlogAdmin } from "@/services/admin_services/admin.blogReview.service";

interface Props {
  data: ReviewBlogAdmin[];
  loading?: boolean;
  onToggleBlock?: (item: ReviewBlogAdmin) => void;
}

export default function ReviewBlogTable({
  data,
  loading,
  onToggleBlock,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1200px] text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th>ID</th>
            <th>Bài viết</th>
            <th>Khách hàng</th>
            {/* <th>Rating</th> */}
            <th>Nội dung</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th className="text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {loading && (
            <tr>
              <td colSpan={8} className="py-6 text-center">
                Đang tải...
              </td>
            </tr>
          )}

          {!loading && data.length === 0 && (
            <tr>
              <td colSpan={8} className="py-6 text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}

          {!loading &&
            data.map((item) => (
              <tr key={item.reviewBlogId} className="border-b hover:bg-gray-50">
                <td>{item.reviewBlogId}</td>
                <td className="font-medium">{item.blogTitle}</td>
                <td>{item.customerName}</td>
                {/* <td>{item.rating} ⭐</td> */}
                <td className="max-w-[300px] truncate text-gray-600">
                  {item.content}
                </td>

                <td>
                  {item.isBlocked ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                      Đã chặn
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                      Hoạt động
                    </span>
                  )}
                </td>

                <td>
                  {new Date(item.createdAt).toLocaleDateString()}
                </td>

                <td className="text-right">
                  <button
                    onClick={() => onToggleBlock?.(item)}
                    className={`rounded px-3 py-1 text-xs font-medium ${
                      item.isBlocked
                        ? "bg-emerald-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {item.isBlocked ? "Mở chặn" : "Chặn"}
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}