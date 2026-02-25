"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import VoucherTable from "./vouchertable";
import VoucherForm from "./voucherform";
import { Modal } from "../ui/modal";

import { AdminVoucherService, VoucherAdmin } from "@/services/admin_services/admin.voucher.service";

export default function VoucherManagementUI() {
  const [data, setData] = useState<VoucherAdmin[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const [editingItem, setEditingItem] = useState<VoucherAdmin | null>(null);
  const [openModal, setOpenModal] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await AdminVoucherService.get({
        page,
        pageSize,
        voucherCode: keyword || undefined,
        status: statusFilter,
      });

      setData(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);
    } catch (err) {
      console.error("Load Voucher error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, statusFilter]);

  const handleToggle = async (item: VoucherAdmin) => {
    try {
      await AdminVoucherService.toggleStatus(item);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Voucher</h1>
          <p className="mt-1 text-sm text-gray-500">Tạo, chỉnh sửa và quản lý mã giảm giá</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Tìm theo mã voucher..."
              className="h-10 rounded-lg border pl-9 pr-4 text-sm"
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Status filter */}
          <select
            className="h-10 rounded-lg border px-3 text-sm"
            value={statusFilter ?? ""}
            onChange={(e) => {
              setStatusFilter(e.target.value || undefined);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Hoạt động</option>
            <option value="Inactive">Không hoạt động</option>
            <option value="Expired">Hết hạn</option>
          </select>

          {/* Add button */}
          <button
            onClick={() => {
              setEditingItem(null);
              setOpenModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
          >
            <Plus size={16} />
            Thêm Voucher
          </button>
        </div>
      </div>

      {/* TABLE */}
      <VoucherTable
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
        className="max-w-175 rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex flex-col max-h-[85vh]">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h3 className="text-lg font-semibold">
              {editingItem ? "Chỉnh sửa Voucher" : "Thêm Voucher"}
            </h3>
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <VoucherForm
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
          Trang {page} / {totalPages || 1} · Tổng {total} bản ghi
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
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
