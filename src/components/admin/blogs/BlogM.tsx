"use client";

import { Search, Plus } from "lucide-react";
import BlogTable from "./BlogTable";
import BlogForm from "./BlogForm";
import { Modal } from "../ui/modal";

export default function BlogManagementUI() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý bài viết, xuất bản và blog nổi bật
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH INPUT (UI ONLY) */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm theo tiêu đề..."
              className="h-10 rounded-lg border pl-9 pr-4 text-sm"
            />
          </div>

          {/* ADD BLOG BUTTON */}
          <button
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={16} />
            Thêm Blog
          </button>
        </div>
      </div>

      {/* ================= TABLE (UI ONLY) ================= */}
      <BlogTable />

      {/* ================= MODAL (UI ONLY) ================= */}
      <Modal
        isOpen={false}
        onClose={() => {}}
        className="max-w-[720px] rounded-xl bg-white"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">Thêm Blog</h3>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <BlogForm />
          </div>
        </div>
      </Modal>

      {/* ================= PAGINATION (UI ONLY) ================= */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <div className="text-gray-500">
          Trang <span className="font-medium">1</span> /
          <span className="font-medium"> 5</span> · Tổng
          <span className="font-medium"> 50</span> blog
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded border px-3 py-1 text-gray-400">
            ←
          </button>

          <button className="rounded border bg-indigo-500 px-3 py-1 text-white">
            1
          </button>
          <button className="rounded border px-3 py-1 hover:bg-gray-100">
            2
          </button>
          <button className="rounded border px-3 py-1 hover:bg-gray-100">
            3
          </button>

          <button className="rounded border px-3 py-1 hover:bg-gray-100">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
