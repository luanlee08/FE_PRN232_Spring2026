"use client";

import { Pencil } from "lucide-react";
import { VoucherAdmin } from "@/services/admin_services/admin.voucher.service";

interface Props {
  data: VoucherAdmin[];
  loading: boolean;
  onEdit?: (item: VoucherAdmin) => void;
  onToggle?: (item: VoucherAdmin) => void;
}

function formatCurrency(value?: number) {
  if (value == null) return "-";
  return value.toLocaleString("vi-VN") + "đ";
}

function formatDiscount(type: string, value: number) {
  if (type === "Percentage") return `${value}%`;
  return formatCurrency(value);
}

function getStatusBadge(status: string, isDeleted: boolean) {
  if (isDeleted) {
    return (
      <span className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">
        Đã xóa
      </span>
    );
  }

  switch (status) {
    case "Active":
      return (
        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
          Hoạt động
        </span>
      );
    case "Inactive":
      return (
        <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          Không hoạt động
        </span>
      );
    case "Expired":
      return (
        <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-700">
          Hết hạn
        </span>
      );
    default:
      return (
        <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
          {status}
        </span>
      );
  }
}

export default function VoucherTable({
  data,
  loading,
  onEdit,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onToggle,
}: Props) {
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
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Mã voucher
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Loại</th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Giảm giá
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Đơn tối thiểu
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Giảm tối đa
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
              Lượt dùng/người
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Thời hạn
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">
              Thao tác
            </th>
          </tr>
        </thead>

        <tbody>
          {(!data || data.length === 0) && (
            <tr>
              <td colSpan={10} className="py-10 text-center text-gray-400">
                Chưa có voucher nào
              </td>
            </tr>
          )}

          {data.map((item) => (
            <tr key={item.voucherId} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{item.voucherId}</td>

              <td className="px-4 py-3 text-sm font-medium font-mono">{item.voucherCode}</td>

              <td className="px-4 py-3 text-sm">{item.voucherTypeName}</td>

              <td className="px-4 py-3 text-sm font-medium">
                {formatDiscount(item.discountType, item.discountValue)}
              </td>

              <td className="px-4 py-3 text-sm">{formatCurrency(item.minOrderAmount)}</td>

              <td className="px-4 py-3 text-sm">{formatCurrency(item.maxDiscountAmount)}</td>

              <td className="px-4 py-3 text-sm text-center">{item.usageLimitPerUser ?? "∞"}</td>

              <td className="px-4 py-3 text-sm whitespace-nowrap" suppressHydrationWarning>
                <div>{new Date(item.startDate).toLocaleDateString("vi-VN")}</div>
                <div className="text-gray-400">
                  → {new Date(item.endDate).toLocaleDateString("vi-VN")}
                </div>
              </td>

              <td className="px-4 py-3">{getStatusBadge(item.status, item.isDeleted)}</td>

              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onEdit?.(item)}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                >
                  <Pencil size={14} />
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
