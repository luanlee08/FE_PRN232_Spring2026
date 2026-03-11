"use client";

import { useEffect, useState } from "react";
import { Search, Eye, CheckCircle, XCircle, Clock, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import {
  AdminRefundService,
  ProcessRefundRequest,
} from "@/services/admin_services/admin.refund.service";
import { RefundDto } from "@/types/order";
import RefundDetailModal from "./refunddetailmodal";


const REFUND_STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "Requested", label: "Chờ xử lý" },
  { value: "Completed", label: "Đã hoàn tiền" },
  { value: "Rejected", label: "Đã từ chối" },
];

const STATUS_BADGE: Record<
  string,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  Requested: {
    label: "Chờ xử lý",
    icon: <Clock size={12} />,
    classes: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  Approved: {
    label: "Đã duyệt",
    icon: <CheckCircle size={12} />,
    classes: "bg-blue-50 text-blue-700 border-blue-200",
  },
  Completed: {
    label: "Đã hoàn tiền",
    icon: <CheckCircle size={12} />,
    classes: "bg-green-50 text-green-700 border-green-200",
  },
  Rejected: {
    label: "Đã từ chối",
    icon: <XCircle size={12} />,
    classes: "bg-red-50 text-red-700 border-red-200",
  },
  Processing: {
    label: "Đang xử lý",
    icon: <RotateCcw size={12} />,
    classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
};

export default function RefundManagementUI() {
  const [data, setData] = useState<RefundDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  // Detail modal
  const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);
  const [openDetail, setOpenDetail] = useState(false);

  // Process modal
  const [processModal, setProcessModal] = useState<{
    isOpen: boolean;
    refund: RefundDto | null;
    isApproved: boolean;
    note: string;
  }>({ isOpen: false, refund: null, isApproved: true, note: "" });
  const [processing, setProcessing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await AdminRefundService.getList({
        statusFilter: statusFilter || undefined,
        pageNumber: page,
        pageSize,
      });
      setData(result?.items ?? []);
      setTotal(result?.totalCount ?? 0);
    } catch (err) {
      console.error("Load refunds error:", err);
      toast.error("Không thể tải danh sách hoàn tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const handleOpenProcess = (refund: RefundDto, approve: boolean) => {
    setProcessModal({ isOpen: true, refund, isApproved: approve, note: "" });
  };

  const handleConfirmProcess = async () => {
    const { refund, isApproved, note } = processModal;
    if (!refund) return;
    setProcessing(true);
    try {
      const req: ProcessRefundRequest = { isApproved, note: note.trim() || undefined };
      const res = await AdminRefundService.process(refund.refundId, req);
      if (res.status === 200) {
        toast.success(
          isApproved
            ? "Đã duyệt và hoàn tiền vào ví khách hàng thành công!"
            : "Đã từ chối yêu cầu hoàn tiền",
        );
        fetchData();
        setProcessModal({ isOpen: false, refund: null, isApproved: true, note: "" });
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const fmtVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
  const toUtc = (s: string) => (/Z$|[+-]\d{2}:\d{2}$/.test(s) ? s : s + "Z");
  const fmtDate = (s: string) =>
    new Date(toUtc(s)).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Hoàn Tiền</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xử lý các yêu cầu hoàn tiền từ khách hàng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
            {total} yêu cầu
          </span>
        </div>
      </div>

      {/* FILTERS */}
      <div className="mb-5 flex flex-wrap gap-3">
        <select
          className="h-10 rounded-lg border px-3 text-sm"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          {REFUND_STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              <th className="pb-3 pr-4">Mã YC</th>
              <th className="pb-3 pr-4">Đơn hàng</th>
              <th className="pb-3 pr-4">Khách hàng</th>
              <th className="pb-3 pr-4">Số tiền hoàn</th>
              <th className="pb-3 pr-4">Lý do</th>
              <th className="pb-3 pr-4">Ngày yêu cầu</th>
              <th className="pb-3 pr-4">Trạng thái</th>
              <th className="pb-3">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="py-4 pr-4">
                      <div className="h-4 rounded bg-gray-100 animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-gray-400">
                  <RotateCcw size={40} className="mx-auto mb-2 text-gray-200" />
                  Không có yêu cầu hoàn tiền nào
                </td>
              </tr>
            ) : (
              data.map((refund) => {
                const badge = STATUS_BADGE[refund.refundStatus] ?? {
                  label: refund.refundStatus,
                  icon: null,
                  classes: "bg-gray-50 text-gray-500 border-gray-200",
                };
                const canProcess = refund.refundStatus === "Requested";
                return (
                  <tr
                    key={refund.refundId}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="py-3.5 pr-4">
                      <span className="font-mono text-xs text-gray-400">#{refund.refundId}</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-semibold text-indigo-600">{refund.orderCode}</span>
                    </td>
                    <td className="py-3.5 pr-4">
                      <div>
                        <p className="font-medium text-gray-800">{refund.customerName ?? "—"}</p>
                        <p className="text-xs text-gray-400">{refund.customerEmail ?? ""}</p>
                      </div>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span className="font-semibold text-orange-500">
                        {fmtVND(refund.refundAmount)}
                      </span>
                      <p className="text-xs text-gray-400">
                        / {fmtVND(refund.totalAmount)}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p
                        className="max-w-[160px] truncate text-gray-600"
                        title={refund.reason}
                      >
                        {refund.reason || "—"}
                      </p>
                    </td>
                    <td className="py-3.5 pr-4 text-gray-500 text-xs">
                      {fmtDate(refund.createdAt)}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`flex w-fit items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.classes}`}
                      >
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRefundId(refund.refundId);
                            setOpenDetail(true);
                          }}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-100 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                        {canProcess && (
                          <>
                            <button
                              onClick={() => handleOpenProcess(refund, true)}
                              className="rounded-lg border border-green-200 p-1.5 text-green-600 hover:bg-green-50 transition-colors"
                              title="Duyệt & Hoàn tiền"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => handleOpenProcess(refund, false)}
                              className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition-colors"
                              title="Từ chối"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
        <span>
          Trang {page} / {totalPages || 1} · Tổng {total} yêu cầu
        </span>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
          >
            ←
          </button>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded border px-3 py-1 disabled:opacity-40 hover:bg-gray-50"
          >
            →
          </button>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <RefundDetailModal
        refundId={selectedRefundId}
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        onProcessed={() => { fetchData(); setOpenDetail(false); }}
      />

      {/* PROCESS CONFIRM MODAL */}
      {processModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {processModal.isApproved ? "✅ Duyệt hoàn tiền" : "❌ Từ chối hoàn tiền"}
        </h3>
        {processModal.refund && (
          <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm space-y-1">
            <p>
              <span className="font-medium text-gray-500">Đơn hàng:</span>{" "}
              <span className="font-semibold text-indigo-600">
                {processModal.refund.orderCode}
              </span>
            </p>
            <p>
              <span className="font-medium text-gray-500">Khách hàng:</span>{" "}
              {processModal.refund.customerName}
            </p>
            <p>
              <span className="font-medium text-gray-500">Số tiền hoàn:</span>{" "}
              <span className="font-semibold text-orange-500">
                {fmtVND(processModal.refund.refundAmount)}
              </span>
            </p>
            {processModal.isApproved && (
              <p className="text-xs text-green-600 mt-1">
                💰 Tiền sẽ được cộng vào ví khách hàng (tự động tạo ví nếu chưa có)
              </p>
            )}
          </div>
        )}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ghi chú {!processModal.isApproved && <span className="text-red-500">*</span>}
        </label>
        <textarea
          value={processModal.note}
          onChange={(e) =>
            setProcessModal((prev) => ({ ...prev, note: e.target.value }))
          }
          placeholder={
            processModal.isApproved
              ? "Ghi chú tùy chọn..."
              : "Nhập lý do từ chối (bắt buộc)..."
          }
          className="w-full rounded-lg border px-3 py-2 text-sm min-h-[80px] resize-y mb-4"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() =>
              setProcessModal({ isOpen: false, refund: null, isApproved: true, note: "" })
            }
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirmProcess}
            disabled={
              processing ||
              (!processModal.isApproved && !processModal.note.trim())
            }
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              processModal.isApproved
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {processing
              ? "Đang xử lý..."
              : processModal.isApproved
              ? "Duyệt & Hoàn tiền"
              : "Từ chối"}
          </button>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}
