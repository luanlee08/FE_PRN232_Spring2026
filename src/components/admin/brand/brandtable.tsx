"use client";

import { Pencil } from "lucide-react";

export default function BrandTable() {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1200px] text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-500">
            <th className="px-4 py-3 w-16">ID</th>
            <th className="px-4 py-3 w-64">Tên Brand</th>
            <th className="px-4 py-3 w-64">Category</th>
            <th className="px-4 py-3">Mô tả</th>
            <th className="px-4 py-3 w-32">Trạng thái</th>
            <th className="px-4 py-3 w-32">Ngày tạo</th>
            <th className="px-4 py-3 w-32">Cập nhật</th>
            <th className="px-4 py-3 w-20 text-right">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {/* ===== MOCK ROW ===== */}
          <tr className="border-b hover:bg-gray-50 transition">
            <td className="px-4 py-3">1</td>

            <td className="px-4 py-3 font-medium">
              LEGO
            </td>

            <td className="px-4 py-3 text-gray-600">
              Đồ chơi xếp hình
            </td>

            <td className="px-4 py-3 max-w-[420px] truncate text-gray-600">
              Thương hiệu đồ chơi xếp hình nổi tiếng toàn cầu
            </td>

            <td className="px-4 py-3">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Hoạt động
              </span>
            </td>

            <td className="px-4 py-3 text-gray-600">
              02/02/2026
            </td>

            <td className="px-4 py-3 text-gray-600">
              06/02/2026
            </td>

            <td className="px-4 py-3 text-right">
              <button
                className="rounded-lg p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                title="Chỉnh sửa"
              >
                <Pencil size={16} />
              </button>
            </td>
          </tr>

          {/* EMPTY STATE */}
          {/*
          <tr>
            <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
              Chưa có brand
            </td>
          </tr>
          */}
        </tbody>
      </table>
    </div>
  );
}
