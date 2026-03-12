"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import {
  AdminRefundService,
  ProcessRefundRequest,
} from "@/services/admin_services/admin.refund.service";
import { RefundDto } from "@/types/order";
import { Modal } from "../ui/modal";

interface Props {
  refundId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onProcessed?: () => void;
}

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  Requested: { label: "Chờ xử lý", classes: "bg-yellow-100 text-yellow-700" },
  Approved: { label: "Đã duyệt", classes: "bg-blue-100 text-blue-700" },
  Completed: { label: "Đã hoàn tiền", classes: "bg-green-100 text-green-700" },
  Rejected: { label: "Đã từ chối", classes: "bg-red-100 text-red-700" },
  Processing: { label: "Đang xử lý", classes: "bg-indigo-100 text-indigo-700" },
};

export default function RefundDetailModal({ refundId, isOpen, onClose, onProcessed }: Props) {
  const [refund, setRefund] = useState<RefundDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | "approve" | "reject">(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (isOpen && refundId != null) {
      setLoading(true);
      setRefund(null);
      setConfirmAction(null);
      setNote("");
      AdminRefundService.getById(refundId)
        .then((data) => setRefund(data ?? null))
        .catch(() => toast.error("Không thể tải chi tiết hoàn tiền"))
        .finally(() => setLoading(false));
    }
  }, [isOpen, refundId]);

  const handleProcess = async () => {
    if (!refund || !confirmAction) return;
    setProcessing(true);
    try {
      const req: ProcessRefundRequest = {
        isApproved: confirmAction === "approve",
        note: note.trim() || undefined,
      };
      const res = await AdminRefundService.process(refund.refundId, req);
      if (res.status === 200) {
        toast.success(
          confirmAction === "approve"
            ? "Đã duyệt và hoàn tiền vào ví khách hàng!"
            : "Đã từ chối yêu cầu hoàn tiền",
        );
        onProcessed?.();
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const fmtVND = (v: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(v);
  const toUtc = (s: string) => (/Z$|[+-]\d{2}:\d{2}$/.test(s) ? s : s + "Z");
  const fmtDate = (s?: string) =>
    s
      ? new Date(toUtc(s)).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      : "—";

  const canProcess = refund?.refundStatus === "Requested";
  const badge = refund
    ? (STATUS_BADGE[refund.refundStatus] ?? {
        label: refund.refundStatus,
        classes: "bg-gray-100 text-gray-700",
      })
    : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl rounded-2xl bg-white shadow-2xl">
      <div className="flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center border-b px-6 py-4 shrink-0 gap-10">
          <div>
            <h3 className="text-lg font-semibold">Chi tiết Yêu cầu Hoàn tiền</h3>
            {refund && (
              <p className="text-sm text-gray-500 font-mono">
                #{refund.refundId} · {refund.orderCode}
              </p>
            )}
          </div>
          {badge && (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.classes}`}>
              {badge.label}
            </span>
          )}
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 rounded bg-gray-100 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && refund && (
            <>
              {/* ── Customer Info ── */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Section title="Thông tin khách hàng">
                  <InfoRow label="Khách hàng" value={refund.customerName ?? "—"} />
                  <InfoRow label="Email" value={refund.customerEmail ?? "—"} />
                </Section>

                <Section title="Đơn hàng">
                  <InfoRow label="Mã đơn hàng" value={refund.orderCode} highlight />
                  <InfoRow label="Tổng giá trị đơn" value={fmtVND(refund.totalAmount)} />
                </Section>
              </div>

              {/* ── Refund Details ── */}
              <Section title="Chi tiết hoàn tiền">
                <div className="space-y-0.5">
                  <InfoRow
                    label="Số tiền yêu cầu hoàn"
                    value={fmtVND(refund.refundAmount)}
                    highlight
                  />
                  <InfoRow
                    label="Hình thức hoàn"
                    value={
                      refund.refundMode === "Wallet" ? "🔥 Hoàn vào ví" : (refund.refundMode ?? "—")
                    }
                  />
                  <InfoRow label="Lý do" value={refund.reason || "—"} />
                  <InfoRow label="Ngày yêu cầu" value={fmtDate(refund.createdAt)} />
                </div>
              </Section>

              {/* ── Process Info ── */}
              <Section title="Thông tin xử lý">
                <div className="space-y-0.5">
                  <InfoRow label="Ngày duyệt" value={fmtDate(refund.approvedAt)} />
                  <InfoRow label="Người duyệt" value={refund.approvedByName ?? "—"} />
                  <InfoRow label="Ngày hoàn tiền" value={fmtDate(refund.processedAt)} />
                  {refund.note && <InfoRow label="Ghi chú" value={refund.note} />}
                </div>
              </Section>

              {/* ── Action buttons ── */}
              {canProcess && !confirmAction && (
                <div className="flex gap-3 border-t pt-2">
                  <button
                    onClick={() => setConfirmAction("approve")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle size={15} />
                    Duyệt & Hoàn tiền
                  </button>
                  <button
                    onClick={() => setConfirmAction("reject")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <XCircle size={15} />
                    Từ chối
                  </button>
                </div>
              )}

              {confirmAction && (
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-800 mb-2">
                    {confirmAction === "approve"
                      ? "✅ Xác nhận duyệt hoàn tiền"
                      : "❌ Xác nhận từ chối"}
                  </p>
                  {confirmAction === "approve" && (
                    <p className="text-xs text-green-600 mb-3">
                      💰 Số tiền {fmtVND(refund.refundAmount)} sẽ được cộng vào ví khách hàng. Nếu
                      khách chưa có ví, hệ thống sẽ tự động tạo.
                    </p>
                  )}
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                      confirmAction === "approve"
                        ? "Ghi chú tùy chọn..."
                        : "Nhập lý do từ chối (bắt buộc)..."
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm min-h-17.5 resize-y mb-3 bg-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmAction(null);
                        setNote("");
                      }}
                      className="flex-1 rounded-lg border border-gray-200 py-2 text-sm text-gray-600 hover:bg-white transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={handleProcess}
                      disabled={processing || (confirmAction === "reject" && !note.trim())}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors ${
                        confirmAction === "approve"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-500 hover:bg-red-600"
                      }`}
                    >
                      {processing ? "Đang xử lý..." : "Xác nhận"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {!loading && !refund && (
            <p className="text-center text-gray-400 py-8">Không tìm thấy thông tin hoàn tiền</p>
          )}
        </div>
      </div>
    </Modal>
  );
}

// ── Helper sub-components ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">{title}</h4>
      <div className="rounded-xl border p-4">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span
        className={`font-medium text-right max-w-[60%] ${highlight ? "text-indigo-600" : "text-gray-800"}`}
      >
        {value}
      </span>
    </div>
  );
}
