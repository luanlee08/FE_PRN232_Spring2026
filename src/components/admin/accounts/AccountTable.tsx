"use client";

import { AccountAdmin } from "@/services/admin_services/admin.account.service";
import { Edit } from "lucide-react";

interface Props {
  accounts: AccountAdmin[];
  onEdit: (account: AccountAdmin) => void;
  onRefresh: () => void;
}

export default function AccountTable({ accounts, onEdit }: Props) {
  const getRoleBadgeColor = (roleName?: string) => {
    switch (roleName) {
      case "Admin":
        return "bg-red-100 text-red-700";
      case "Staff":
        return "bg-blue-100 text-blue-700";
      case "Warehouse":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

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
              Tên tài khoản
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Số điện thoại
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Vai trò
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Trạng thái
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Ngày tạo
            </th>
            <th className="px-4 py-3 text-center text-sm font-semibold">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.accountId} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm">{account.accountId}</td>
              <td className="px-4 py-3 text-sm font-medium">
                {account.accountName}
              </td>
              <td className="px-4 py-3 text-sm">{account.email}</td>
              <td className="px-4 py-3 text-sm">
                {account.phoneNumber || "-"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(
                    account.roleName
                  )}`}
                >
                  {account.roleName || "N/A"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(
                    account.status
                  )}`}
                >
                  {account.status}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {new Date(account.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="px-4 py-3 text-center">
                <button
                  onClick={() => onEdit(account)}
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

      {accounts.length === 0 && (
        <div className="py-10 text-center text-gray-400">
          Không tìm thấy tài khoản nào
        </div>
      )}
    </div>
  );
}
