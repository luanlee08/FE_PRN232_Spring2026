"use client";

import { Pencil } from "lucide-react";

export default function BlogTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px] text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="w-16">ID</th>
            <th className="w-60">Tiêu đề</th>
            <th className="w-[360px]">Nội dung</th>
            <th className="w-20">Ảnh</th>
            <th className="w-32">Thể loại</th>
            <th className="w-32">Trạng thái</th>
            <th className="w-24">Nổi bật</th>
            <th className="w-28">Hoạt động</th>
            <th className="w-28">Ngày tạo</th>
            <th className="w-20 text-right pr-4">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {/* ===== MOCK ROW 1 ===== */}
          <tr className="border-b hover:bg-gray-50">
            <td>1</td>
            <td className="font-medium">Giới thiệu hệ thống</td>
            <td className="max-w-[400px] truncate text-sm text-gray-600">
              Đây là nội dung blog mẫu để dựng giao diện bảng quản lý...
            </td>

            <td>
              <div className="h-10 w-10 rounded bg-gray-200" />
            </td>

            <td>Tin tức</td>

            <td>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                Đã xuất bản
              </span>
            </td>

            <td className="text-amber-600">Nổi bật</td>

            <td>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                Hoạt động
              </span>
            </td>

            <td>2026-02-02</td>

            <td className="pr-4 text-right">
              <button className="text-indigo-500 hover:text-indigo-700">
                <Pencil size={16} />
              </button>
            </td>
          </tr>

          {/* ===== MOCK ROW 2 ===== */}
          <tr className="border-b hover:bg-gray-50">
            <td>2</td>
            <td className="font-medium">Hướng dẫn sử dụng</td>
            <td className="max-w-[400px] truncate text-sm text-gray-600">
              Hướng dẫn từng bước sử dụng hệ thống quản lý blog...
            </td>

            <td>
              <div className="h-10 w-10 rounded bg-gray-200" />
            </td>

            <td>Hướng dẫn</td>

            <td>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                Bản nháp
              </span>
            </td>

            <td className="text-gray-400">Không</td>

            <td>
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                Đã xoá
              </span>
            </td>

            <td>2026-01-28</td>

            <td className="pr-4 text-right">
              <button className="text-indigo-500 hover:text-indigo-700">
                <Pencil size={16} />
              </button>
            </td>
          </tr>

          {/* ===== EMPTY STATE (UI) ===== */}
          {/* 
          <tr>
            <td colSpan={10} className="py-8 text-center text-gray-500">
              Không có blog nào
            </td>
          </tr>
          */}
        </tbody>
      </table>
    </div>
  );
}
