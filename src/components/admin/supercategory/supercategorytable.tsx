"use client";

import { Pencil } from "lucide-react";

export default function SuperCategoryTable() {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[1100px] text-sm">
        {/* ================= HEADER ================= */}
        <thead className="bg-gray-50">
          <tr className="border-b text-left text-gray-500">
            <th className="w-16 px-4 py-3">ID</th>
            <th className="w-60 px-4 py-3">Tên</th>
            {/* <th className="w-56 px-4 py-3">Slug</th> */}
            <th className="px-4 py-3">Mô tả</th>
            <th className="w-32 px-4 py-3">Trạng thái</th>
            <th className="w-32 px-4 py-3">Ngày tạo</th>
            <th className="w-32 px-4 py-3">Cập nhật</th>
            <th className="w-20 px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        {/* ================= BODY ================= */}
        <tbody>
          {/* ===== MOCK ROW ===== */}
          <tr className="border-b hover:bg-gray-50 transition">
            <td className="px-4 py-3">1</td>

            <td className="px-4 py-3 font-medium">
              Đồ chơi giáo dục
            </td>
{/* 
            <td className="px-4 py-3 text-gray-600">
              do-choi-giao-duc
            </td> */}

            <td className="px-4 py-3 max-w-[420px] truncate text-gray-600">
              Danh mục tổng cho các loại đồ chơi hỗ trợ phát triển trí tuệ
            </td>

            <td className="px-4 py-3">
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                Hoạt động
              </span>
            </td>

            <td className="px-4 py-3 text-gray-600">
              02/02/2026
            </td>

            <td className="px-4 py-3 text-gray-600">
              05/02/2026
            </td>

            <td className="px-4 py-3 text-right">
              <button
                className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-700"
                title="Chỉnh sửa"
              >
                <Pencil size={16} />
              </button>
            </td>
          </tr>

          {/* ===== EMPTY STATE ===== */}
          {/*
          <tr>
            <td
              colSpan={8}
              className="px-4 py-10 text-center text-gray-500"
            >
              Chưa có super category nào
            </td>
          </tr>
          */}
        </tbody>
      </table>
    </div>
  );
}
