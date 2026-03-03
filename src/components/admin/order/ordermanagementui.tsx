"use client";

import { useEffect, useState } from "react";
import { Search, FileDown } from "lucide-react";
import toast from "react-hot-toast";
import OrderTable from "./ordertable";
import OrderDetailModal from "./orderdetailmodal";
import {
  AdminOrderListItem,
  AdminOrderQuery,
  AdminOrderService,
} from "@/services/admin_services/admin.order.service";

import { Modal } from "../ui/modal";

const ORDER_STATUS_OPTIONS = [
  { id: 1, name: "Pending" },
  { id: 2, name: "Confirmed" },
  { id: 3, name: "Shipped" },
  { id: 4, name: "Delivered" },
  { id: 5, name: "Completed" },
  { id: 6, name: "Cancelled" },
  { id: 7, name: "Refunded" },
];

const EDIT_STATUS_OPTIONS = [
  { id: 1, name: "Pending" },
  { id: 2, name: "Confirmed" },
  { id: 3, name: "Shipped" },
  { id: 4, name: "Delivered" },
  { id: 5, name: "Completed" },
  { id: 6, name: "Cancelled" },
];

export default function OrderManagementUI() {
  const [data, setData] = useState<AdminOrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [statusId, setStatusId] = useState<number | undefined>();
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    order: AdminOrderListItem | null;
    newStatusId: number;
    note: string;
  }>({
    isOpen: false,
    order: null,
    newStatusId: 0,
    note: "",
  });
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const query: AdminOrderQuery = {
        page,
        pageSize,
        sortBy: "OrderDate",
        sortDesc: true,
        keyword: keyword || undefined,
        statusId: statusId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      };
      const result = await AdminOrderService.getList(query);
      setData(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);
    } catch (err) {
      console.error("Load orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, keyword, statusId, fromDate, toDate]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await AdminOrderService.exportExcel({
        keyword: keyword || undefined,
        statusId,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy: "OrderDate",
        sortDesc: true,
      });
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatusId: number, note?: string) => {
    setUpdating(true);
    try {
      // statusId 2 = Confirmed — backend requires autoCreateShipping=true to push to GHN
      const shouldCreateShipping = newStatusId === 2;
      const res = await AdminOrderService.updateStatus(orderId, {
        statusId: newStatusId,
        note,
        autoCreateShipping: shouldCreateShipping,
        shippingServiceId: 53321,
        shippingRequiredNote: 'KHONGCHOXEMHANG',
      });
      fetchData();
      // Surface GHN warning or success from backend response
      if (res.message?.includes('⚠️')) {
        toast.error(res.message, { duration: 6000 });
      } else {
        toast.success(res.message || 'Cập nhật trạng thái thành công');
      }
    } catch (err: any) {
      console.error("Update status error:", err);
      toast.error(err?.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenEditModal = (item: AdminOrderListItem) => {
    setEditModal({
      isOpen: true,
      order: item,
      newStatusId: item.statusId,
      note: "",
    });
  };

  const handleConfirmEdit = async () => {
    const { order, newStatusId, note } = editModal;
    if (!order) return;
    if (newStatusId === order.statusId) {
      setEditModal((prev) => ({ ...prev, isOpen: false }));
      return;
    }
    if (newStatusId === 6 && !note.trim()) return;
    const autoNote =
      newStatusId === 6
        ? note.trim()
        : note.trim() ||
          (() => {
            switch (newStatusId) {
              case 2:
                return "Đơn hàng đã được xác nhận.";
              case 3:
                return "Đơn hàng đang được giao.";
              case 4:
                return "Đơn hàng đã giao thành công.";
              case 5:
                return "Đơn hàng đã hoàn thành.";
              default:
                return "Cập nhật trạng thái đơn hàng.";
            }
          })();
    await handleUpdateStatus(order.orderId, newStatusId, autoNote);
    setEditModal({ isOpen: false, order: null, newStatusId: 0, note: "" });
  };

  const handleCloseEditModal = () => {
    setEditModal({ isOpen: false, order: null, newStatusId: 0, note: "" });
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý Đơn Hàng</h1>
          <p className="mt-1 text-sm text-gray-500">Theo dõi và cập nhật trạng thái đơn hàng</p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 rounded-lg border border-indigo-300 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 self-start"
        >
          <FileDown size={16} />
          {exporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="mb-5 flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Mã đơn, tên, SĐT..."
            className="h-10 rounded-lg border pl-9 pr-4 text-sm w-60"
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Status filter */}
        <select
          className="h-10 rounded-lg border px-3 text-sm"
          value={statusId ?? ""}
          onChange={(e) => {
            setStatusId(e.target.value ? Number(e.target.value) : undefined);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          {ORDER_STATUS_OPTIONS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border px-3 text-sm cursor-pointer"
            title="Từ ngày"
          />
          <span className="text-gray-400 text-sm">→</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border px-3 text-sm cursor-pointer"
            title="Đến ngày"
          />
        </div>
      </div>

      {/* TABLE */}
      <OrderTable
        data={data}
        loading={loading || updating}
        onViewDetail={(item) => {
          setSelectedOrderId(item.orderId);
          setOpenDetail(true);
        }}
        onEditStatus={handleOpenEditModal}
      />

      {/* PAGINATION */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>
          Trang {page} / {totalPages || 1} · Tổng {total} đơn hàng
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

      {/* DETAIL MODAL */}
      <OrderDetailModal
        orderId={selectedOrderId}
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        onStatusUpdated={fetchData}
      />

      {/* EDIT STATUS MODAL */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={handleCloseEditModal}
        className="max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Cập nhật trạng thái đơn hàng</h3>
        {editModal.order && (
          <p className="text-sm text-gray-500 mb-4">
            Đơn <span className="font-semibold text-indigo-600">{editModal.order.orderCode}</span> —{" "}
            {editModal.order.customerName}
          </p>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái mới</label>
        <select
          value={editModal.newStatusId}
          onChange={(e) =>
            setEditModal((prev) => ({
              ...prev,
              newStatusId: Number(e.target.value),
              note: "",
            }))
          }
          className="w-full rounded-lg border px-3 py-2 text-sm mb-4"
        >
          {EDIT_STATUS_OPTIONS.map((s) => (
            <option key={s.id} value={s.id} disabled={s.id < (editModal.order?.statusId ?? 0)}>
              {s.name}
              {s.id === (editModal.order?.statusId ?? 0) ? " (hiện tại)" : ""}
            </option>
          ))}
        </select>

        {editModal.newStatusId === 6 && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lý do hủy <span className="text-red-500">*</span>
            </label>
            <textarea
              value={editModal.note}
              onChange={(e) => setEditModal((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Nhập lý do hủy..."
              className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px] resize-y mb-4"
            />
          </>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleCloseEditModal}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirmEdit}
            disabled={
              updating ||
              editModal.newStatusId === (editModal.order?.statusId ?? 0) ||
              (editModal.newStatusId === 6 && !editModal.note.trim())
            }
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {updating ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
