"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Modal } from "../ui/modal";
import { AdminOrderDetail, AdminOrderService } from "@/services/admin_services/admin.order.service";

interface Props {
  orderId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: () => void;
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  Delivered: <CheckCircle size={14} className="text-green-500" />,
  Cancelled: <XCircle size={14} className="text-red-500" />,
  Refunded: <XCircle size={14} className="text-purple-500" />,
};

function formatCurrency(value?: number) {
  if (value == null) return "—";
  return value.toLocaleString("vi-VN") + "đ";
}

export default function OrderDetailModal({ orderId, isOpen, onClose, onStatusUpdated }: Props) {
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen || !orderId) {
      setDetail(null);
      return;
    }

    const fetch = async () => {
      setLoadingDetail(true);
      try {
        const data = await AdminOrderService.getDetail(orderId);
        setDetail(data);
      } catch (err) {
        console.error("Load order detail error:", err);
      } finally {
        setLoadingDetail(false);
      }
    };
    fetch();
  }, [orderId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-215 rounded-2xl bg-white shadow-2xl">
      <div className="flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <div>
            <h3 className="text-lg font-semibold">Chi tiết đơn hàng</h3>
            {detail && <p className="text-sm text-gray-500 font-mono">{detail.orderCode}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loadingDetail && <div className="py-16 text-center text-gray-400">Đang tải...</div>}

          {!loadingDetail && detail && (
            <>
              {/* ── Customer & Shipping ── */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Section title="Thông tin khách hàng">
                  <InfoRow label="Tên" value={detail.customerName} />
                  <InfoRow label="SĐT" value={detail.customerPhone} />
                  <InfoRow label="Email" value={detail.accountEmail} />
                </Section>

                <Section title="Giao hàng">
                  <InfoRow label="Địa chỉ" value={detail.shippingAddress} />
                  <InfoRow label="Phương thức" value={detail.shippingMethod ?? "—"} />
                  <InfoRow label="Phí ship" value={formatCurrency(detail.shippingFee)} />
                </Section>
              </div>

              {/* ── Order Items ── */}
              <Section title="Sản phẩm">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-gray-400 text-xs uppercase">
                        <th className="pb-2">Sản phẩm</th>
                        <th className="pb-2 text-center">SL</th>
                        <th className="pb-2 text-right">Đơn giá</th>
                        <th className="pb-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.orderDetails.map((item, index) => (
                        <tr
                          key={item.orderDetailId ?? `order-detail-${index}`}
                          className="border-b last:border-0"
                        >
                          <td className="py-3 flex items-center gap-3">
                            {item.productImage ? (
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                width={44}
                                height={44}
                                className="rounded-lg object-cover w-11 h-11 border"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">
                                IMG
                              </div>
                            )}
                            <span className="font-medium">{item.productName}</span>
                          </td>
                          <td className="py-3 text-center">{item.quantity}</td>
                          <td className="py-3 text-right text-gray-500">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="py-3 text-right font-semibold">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* ── Pricing ── */}
              <Section title="Thanh toán">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tạm tính</span>
                    <span>
                      {formatCurrency(
                        detail.orderDetails.reduce((sum, item) => sum + item.total, 0),
                      )}
                    </span>
                  </div>
                  {detail.voucherCode && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Voucher ({detail.voucherCode})</span>
                      <span className="text-green-600">
                        -{formatCurrency(detail.voucherDiscount)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span>{formatCurrency(detail.shippingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Thanh toán ví</span>
                    <span>{formatCurrency(detail.paidByWalletAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-indigo-600">{formatCurrency(detail.totalAmount)}</span>
                  </div>
                </div>
              </Section>

              {/* ── Status Timeline ── */}
              <Section title="Lịch sử trạng thái">
                {detail.statusHistories && detail.statusHistories.length > 0 ? (
                  <ol className="relative ml-3 border-l border-gray-200 space-y-5">
                    {[...detail.statusHistories].reverse().map((h, index) => (
                      <li key={h.orderStatusHistoryId ?? `history-${index}`} className="ml-5">
                        <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-white ring-2 ring-indigo-300">
                          {STATUS_ICON[h.statusName] ?? (
                            <Clock size={10} className="text-indigo-400" />
                          )}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-sm">{h.statusName}</span>
                          {h.changedByName && (
                            <span className="text-xs text-gray-400">by {h.changedByName}</span>
                          )}
                          <span className="text-xs text-gray-400 ml-auto" suppressHydrationWarning>
                            {new Date(h.changedAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                        {h.note && <p className="mt-1 text-xs text-gray-500 italic">{h.note}</p>}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-sm text-gray-400">Chưa có lịch sử</p>
                )}
              </Section>
            </>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}
