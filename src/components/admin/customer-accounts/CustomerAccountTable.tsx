"use client";

import { CustomerAccount } from "@/services/admin_services/admin.customer.account.service";
import { Edit } from "lucide-react";

interface Props {
  customers: CustomerAccount[];
  onEdit: (customer: CustomerAccount) => void;
  onRefresh: () => void;
}

export default function CustomerAccountTable({ customers, onEdit }: Props) {
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700";
      case "Inactive":
        return "bg-yellow-100 text-yellow-700";
      case "Blocked":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Tên khách hàng
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Số điện thoại
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Ngày đăng ký
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.accountId} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{customer.accountId}</td>
              <td className="px-4 py-3 text-sm font-medium">
                {customer.accountName}
              </td>
              <td className="px-4 py-3 text-sm">{customer.email}</td>
              <td className="px-4 py-3 text-sm">
                {customer.phoneNumber || "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(
                    customer.status
                  )}`}
                >
                  {customer.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {new Date(customer.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onEdit(customer)}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600"
                >
                  <Edit size={14} />
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {customers.length === 0 && (
        <div className="py-10 text-center text-gray-400">
          Không có dữ liệu
        </div>
      )}
    </div>
  );
}
