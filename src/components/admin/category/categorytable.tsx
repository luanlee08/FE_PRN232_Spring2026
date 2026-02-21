"use client";

import { Pencil } from "lucide-react";
import { CategoryAdmin } from "@/services/admin_services/admin.category.service";

interface Props {
  data: CategoryAdmin[];
  loading: boolean;
  onEdit?: (item: CategoryAdmin) => void;
  onToggle?: (item: CategoryAdmin) => void;
}

export default function CategoryTable({
  data,
  loading,
  onEdit,
  onToggle,
}: Props) {

  if (loading) {
    return (
      <div className="py-16 text-center text-gray-400">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full min-w-[1200px] text-sm">

        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="py-4 px-6">ID</th>
            <th className="py-4 px-6">Tên</th>
            <th className="py-4 px-6">Super Category</th>
            <th className="py-4 px-6">Mô tả</th>
            <th className="py-4 px-6">Trạng thái</th>
            <th className="py-4 px-6">Ngày tạo</th>
            <th className="py-4 px-6">Ngày cập nhật</th>
            <th className="py-4 px-6 text-right">Hành động</th>
          </tr>
        </thead>

        <tbody>
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-gray-400">
                Chưa có category
              </td>
            </tr>
          )}

          {data.map((item) => (
            <tr
              key={item.categoryId}
              className="border-b hover:bg-gray-50 transition"
            >
              <td className="py-5 px-6">
                {item.categoryId}
              </td>

              <td className="py-5 px-6 font-semibold">
                {item.categoryName}
              </td>

              <td className="py-5 px-6">
                {item.superCategoryName}
              </td>

              <td className="py-5 px-6">
                {item.description}
              </td>

              <td className="py-5 px-6">
                {item.isDeleted ? (
                  <span className="rounded-full bg-gray-100 px-4 py-1.5 text-xs text-gray-600">
                    Không hoạt động
                  </span>
                ) : (
                  <span className="rounded-full bg-green-100 px-4 py-1.5 text-xs text-green-700">
                    Hoạt động
                  </span>
                )}
              </td>

              <td className="py-5 px-6" suppressHydrationWarning>
                {new Date(item.createdAt).toLocaleDateString('vi-VN')}
              </td>

              <td className="py-5 px-6" suppressHydrationWarning>
                {item.updatedAt
                  ? new Date(item.updatedAt).toLocaleDateString('vi-VN')
                  : "-"}
              </td>

              <td className="py-5 px-6 text-right space-x-2">

                <button
                  onClick={() => onEdit?.(item)}
                  className="rounded-lg p-2 text-indigo-500 hover:bg-indigo-50"
                >
                  <Pencil size={16} />
                </button>

              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}
