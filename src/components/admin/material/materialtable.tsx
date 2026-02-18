"use client";

import { Pencil } from "lucide-react";

export default function MaterialTable() {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-gray-50">
          <tr className="text-left text-gray-500">
            <th className="px-4 py-3 w-16">ID</th>
            <th className="px-4 py-3 w-64">Tên Material</th>
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
              Nhựa ABS
            </td>

            <td className="px-4 py-3 max-w-[420px] truncate text-gray-600">
              Chất liệu nhựa an toàn, bền, thường dùng cho đồ chơi trẻ em
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
              07/02/2026
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
            <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
              Chưa có material
            </td>
          </tr>
          */}
        </tbody>
      </table>
    </div>
  );
}
