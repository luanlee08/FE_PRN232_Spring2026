"use client";

import { Edit, Eye } from "lucide-react";
import { AdminOrderListItem } from "@/services/admin_services/admin.order.service";

interface Props {
  data: AdminOrderListItem[];
  loading: boolean;
  onViewDetail?: (item: AdminOrderListItem) => void;
  onEditStatus?: (item: AdminOrderListItem) => void;
}

const STATUS_BADGE: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-600",
  Confirmed: "bg-indigo-100 text-indigo-700",
  Shipped: "bg-orange-100 text-orange-700",
  Delivered: "bg-blue-100 text-blue-700",
  Completed: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-600",
  Refunded: "bg-purple-100 text-purple-700",
};

const REFUND_BADGE: Record<string, string> = {
  None: "bg-gray-50 text-gray-400",
  Requested: "bg-yellow-100 text-yellow-700",
  Approved: "bg-blue-100 text-blue-600",
  Processing: "bg-orange-100 text-orange-600",
  Completed: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-600",
  PartialRefund: "bg-teal-100 text-teal-700",
  Full: "bg-teal-100 text-teal-800",
};

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

function StatusBadge({ label, map }: { label: string; map: Record<string, string> }) {
  const cls = map[label] ?? "bg-gray-100 text-gray-600";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${cls}`}>{label}</span>;
}

export default function OrderTable({ data, loading, onViewDetail, onEditStatus }: Props) {
  return (
    <div className="overflow-x-auto relative">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
          <div className="text-gray-500 font-medium">Đang tải dữ liệu...</div>
        </div>
      )}
      <table className="w-full">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Mã đơn</th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Khách hàng
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">SĐT</th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Tổng tiền
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Hoàn tiền
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Ngày đặt
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
              Hành động
            </th>
          </tr>
        </thead>

        <tbody>
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={8} className="py-10 text-center text-gray-400">
                Không có đơn hàng nào
              </td>
            </tr>
          )}

          {data.map((item) => (
            <tr
              key={item.orderId}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewDetail?.(item)}
            >
              <td className="px-4 py-3 text-sm font-mono font-semibold text-indigo-600">
                {item.orderCode}
              </td>

              <td className="px-4 py-3 text-sm font-medium">{item.customerName}</td>

              <td className="px-4 py-3 text-sm text-gray-500">{item.customerPhone}</td>

              <td className="px-4 py-3 text-sm font-semibold">
                {formatCurrency(item.totalAmount)}
              </td>
              <td className="px-4 py-3 text-sm">
                <StatusBadge label={item.statusName} map={STATUS_BADGE} />
              </td>

              <td className="px-4 py-3 text-sm">
                {item.refundStatus && item.refundStatus !== "None" ? (
                  <StatusBadge label={item.refundStatus} map={REFUND_BADGE} />
                ) : (
                  <span className="text-xs text-gray-300">—</span>
                )}
              </td>

              <td
                className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap"
                suppressHydrationWarning
              >
                {new Date(item.orderDate).toLocaleString("vi-VN")}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  <button
                    title="Xem chi tiết"
                    onClick={() => onViewDetail?.(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-cyan-600 hover:bg-sky-100"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    title="Cập nhật trạng thái"
                    onClick={() => onEditStatus?.(item)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-100"
                  >
                    <Edit size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
