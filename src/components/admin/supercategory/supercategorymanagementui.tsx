"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import SuperCategoryTable from "./supercategorytable";
import SuperCategoryForm from "./supercategoryform";
import {
  AdminSuperCategoryService,
  SuperCategoryAdmin
} from "@/services/admin_services/admin.supercategory.service";

import { Modal } from "../ui/modal";

export default function SuperCategoryManagementUI() {

  // ================= STATE =================
  const [data, setData] = useState<SuperCategoryAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [editingItem, setEditingItem] =
    useState<SuperCategoryAdmin | null>(null);

  const [openModal, setOpenModal] = useState(false);
const handleToggle = async (item: SuperCategoryAdmin) => {
  try {
    await AdminSuperCategoryService.toggleStatus(item);
    fetchData();
  } catch (err) {
    console.error(err);
  }
};

  // ================= FETCH =================
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await AdminSuperCategoryService.get({
        page,
        pageSize,
        keyword,
      });

      setData(result.items);
      setTotal(result.totalCount);
    } catch (err) {
      console.error("Load SuperCategory error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">

      {/* ================= HEADER ================= */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Super Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh mục cha cho hệ thống sản phẩm
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEARCH */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm theo tên..."
              className="h-10 rounded-lg border pl-9 pr-4 text-sm"
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* ADD BUTTON */}
          <button
            onClick={() => {
              setEditingItem(null);
              setOpenModal(true);
            }}

            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={16} />
            Thêm Super Category
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <SuperCategoryTable
        data={data}
        loading={loading}
        onEdit={(item) => {
          setEditingItem(item);
          setOpenModal(true);
        }}
        onToggle={handleToggle}
      />


      {/* ================= MODAL ================= */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        className="max-w-[600px] rounded-xl bg-white"
      >
        <div className="flex max-h-[85vh] flex-col">
          <div className="border-b px-6 py-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? "Chỉnh sửa Super Category" : "Thêm Super Category"}
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <SuperCategoryForm
              initialData={editingItem}
              onSuccess={() => {
                setOpenModal(false);
                fetchData();
              }}
            />
          </div>
        </div>
      </Modal>

      {/* ================= PAGINATION ================= */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>
          Trang {page} · Tổng {total} bản ghi
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            ←
          </button>

          <button
            onClick={() => setPage(p => p + 1)}
            className="rounded border px-3 py-1"
          >
            →
          </button>
        </div>
      </div>

    </div>
  );
}
