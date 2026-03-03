"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import MaterialTable from "./materialtable";
import MaterialForm from "./materialform";
import { Modal } from "../ui/modal";
import {
  AdminMaterialService,
  MaterialAdmin,
} from "@/services/admin_services/admin.material.service";

export default function MaterialManagementUI() {
  const [data, setData] = useState<MaterialAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");

  const [editingItem, setEditingItem] =
    useState<MaterialAdmin | null>(null);

  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await AdminMaterialService.get({
        page,
        pageSize,
        keyword,
      });

      setData(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, keyword]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          Quản lý Chất liệu
        </h1>

        <button
          onClick={() => {
            setEditingItem(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-white"
        >
          <Plus size={16} />
          Thêm Material
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
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

      {/* Table */}
      <MaterialTable
        data={data}
        loading={loading}
        onEdit={(item) => {
          setEditingItem(item);
          setOpenModal(true);
        }}
      />

      {/* Modal */}
      <Modal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        className="max-w-[600px] bg-white rounded-2xl"
      >
        <MaterialForm
          key={editingItem?.materialId ?? "create"}
          initialData={editingItem}
          onSuccess={() => {
            setOpenModal(false);
            fetchData();
          }}
        />
      </Modal>
    </div>
  );
}