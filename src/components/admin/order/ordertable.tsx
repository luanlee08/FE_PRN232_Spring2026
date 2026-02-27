"use client";

import { Eye } from "lucide-react";
import { AdminOrderListItem } from "@/services/admin_services/admin.order.service";

interface Props {
  data: AdminOrderListItem[];
  loading: boolean;
  onViewDetail?: (item: AdminOrderListItem) => void;
  onUpdateStatus?: (orderId: number, newStatusId: number, note?: string) => void;
  onRequestCancel?: (orderId: number) => void;
}

const ORDER_STATUSES = [
  { id: 1, name: "Pending" },
  { id: 2, name: "Confirmed" },
  { id: 3, name: "Shipped" },
  { id: 4, name: "Delivered" },
  { id: 5, name: "Completed" },
  { id: 6, name: "Cancelled" },
];

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

function generateNoteForStatus(statusId: number) {
  switch (statusId) {
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
}

export default function OrderTable({
  data,
  loading,
  onViewDetail,
  onUpdateStatus,
  onRequestCancel,
}: Props) {
  const handleStatusChange = (item: AdminOrderListItem, newStatusId: number) => {
    if (newStatusId === 6) {
      onRequestCancel?.(item.orderId);
    } else {
      const note = generateNoteForStatus(newStatusId);
      onUpdateStatus?.(item.orderId, newStatusId, note);
    }
  };

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
            <tr key={item.orderId} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono font-semibold text-indigo-600">
                {item.orderCode}
              </td>

              <td className="px-4 py-3 text-sm font-medium">{item.customerName}</td>

              <td className="px-4 py-3 text-sm text-gray-500">{item.customerPhone}</td>

              <td className="px-4 py-3 text-sm font-semibold">
                {formatCurrency(item.totalAmount)}
              </td>

              <td className="px-4 py-3 text-sm">
                {item.statusId >= 5 ? (
                  <StatusBadge label={item.statusName} map={STATUS_BADGE} />
                ) : (
                  <select
                    value={item.statusId}
                    onChange={(e) => handleStatusChange(item, Number(e.target.value))}
                    className={`rounded-full px-3 py-1 text-xs font-medium border-none outline-none cursor-pointer ${
                      STATUS_BADGE[item.statusName] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {ORDER_STATUSES.map((s) => (
                      <option
                        key={s.id}
                        value={s.id}
                        disabled={s.id <= item.statusId}
                        // className="bg-white text-gray-800"
                      >
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
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
                <button
                  onClick={() => onViewDetail?.(item)}
                  className="hover:text-blue-700 p-2"
                  title="Xem chi tiết"
                >
                  <Eye size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
