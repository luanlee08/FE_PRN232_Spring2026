"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import BrandTable from "./brandtable";
import BrandForm from "./brandform";
import { Modal } from "../ui/modal";
import {
  AdminBrandService,
  BrandAdmin,
} from "@/services/admin_services/admin.brand.service";

export default function BrandManagementUI() {
  const [data, setData] = useState<BrandAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] =
    useState<number | undefined>();

  const [editingItem, setEditingItem] =
    useState<BrandAdmin | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await AdminBrandService.get({
        page,
        pageSize,
        keyword,
        categoryId,
      });

      setData(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword, categoryId]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Quản lý Brand
          </h1>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-white"
        >
          <Plus size={16} />
          Thêm Brand
        </button>
      </div>

      {/* FILTER */}
      <div className="mb-4 flex gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Tìm theo tên..."
            className="h-10 rounded-lg border pl-9 pr-4"
            onChange={(e) => {
              const value = e.target.value.trim();
              setKeyword(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <BrandTable
        data={data}
        loading={loading}
        onEdit={(item) => {
          setEditingItem(item);
          setOpenModal(true);
        }}
      />

      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        className="max-w-[600px] bg-white rounded-2xl"
      >
        <BrandForm
          key={editingItem?.brandId ?? "create"}
          initialData={editingItem}
          onSuccess={() => {
            setOpenModal(false);
            fetchData(); // reload list
          }}
        />
      </Modal>
    </div>
  );
}