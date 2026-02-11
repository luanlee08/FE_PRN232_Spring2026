"use client";

import { Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CategoryTable from "./categorytable";

export default function CategoryManagementUI() {
  const [keyword, setKeyword] = useState("");
  const [superCategoryId, setSuperCategoryId] = useState<number | "">("");

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh mục con theo Super Category
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
          <Plus size={16} />
          Thêm Category
        </button>
      </div>

      {/* ================= FILTER ================= */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Tìm theo tên category..."
            className="h-10 rounded-lg border pl-9 pr-4 text-sm"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* SuperCategory Filter */}
        <select
          className="h-10 rounded-lg border px-3 text-sm"
          value={superCategoryId}
          onChange={(e) =>
            setSuperCategoryId(
              e.target.value ? Number(e.target.value) : ""
            )
          }
        >
          <option value="">-- Tất cả Super Category --</option>
          {/* MOCK */}
          <option value={1}>Đồ chơi giáo dục</option>
          <option value={2}>Đồ chơi vận động</option>
        </select>
      </div>

      {/* ================= TABLE ================= */}
      <CategoryTable />

      {/* ================= PAGINATION (UI) ================= */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>
          Trang <strong>1</strong> / <strong>5</strong> · Tổng <strong>50</strong>{" "}
          category
        </span>

        <div className="flex gap-2">
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
            →
          </button>
        </div>
      </div>
    </div>
  );
}
