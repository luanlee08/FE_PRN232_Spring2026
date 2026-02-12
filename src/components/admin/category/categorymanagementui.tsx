"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import CategoryTable from "./categorytable";
import CategoryForm from "./categoryform";
import { Modal } from "../ui/modal";

import {
  AdminCategoryService,
  CategoryAdmin,
} from "../../../../services/admin_services/admin.category.service";

export default function CategoryManagementUI() {

  const [data, setData] = useState<CategoryAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [superCategoryId, setSuperCategoryId] = useState<number | undefined>();

  const [editingItem, setEditingItem] =
    useState<CategoryAdmin | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await AdminCategoryService.get({
        page,
        pageSize,
        keyword,
        superCategoryId,
      });

      setData(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);

    } catch (err) {
      console.error("Load Category error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword, superCategoryId]);

  const handleToggle = async (item: CategoryAdmin) => {
    try {
      await AdminCategoryService.toggleStatus(item);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">

      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Category</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý danh mục con
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <button
            onClick={() => {
              setEditingItem(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={16} />
            Thêm Category
          </button>
        </div>
      </div>

      {/* TABLE */}
      <CategoryTable
        data={data}
        loading={loading}
        onEdit={(item) => {
          setEditingItem(item);
          setOpenModal(true);
        }}
        onToggle={handleToggle}
      />

      {/* MODAL */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        className="max-w-[600px] rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex flex-col max-h-[85vh]">

          {/* HEADER */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? "Chỉnh sửa Category" : "Thêm Category"}
            </h3>

            <button
              onClick={() => setOpenModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <CategoryForm
              initialData={editingItem}
              onSuccess={() => {
                setOpenModal(false);
                fetchData();
              }}
            />
          </div>
        </div>
      </Modal>


      {/* PAGINATION */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>
          Trang {page} · Tổng {total} bản ghi
        </span>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            ←
          </button>

          <button
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1"
          >
            →
          </button>
        </div>
      </div>

    </div>
  );
}
