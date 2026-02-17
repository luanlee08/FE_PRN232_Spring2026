"use client";

import { useState, useEffect } from "react";
import {
  customerAccountService,
  CustomerAccount,
  UpdateCustomerAccountRequest,
} from "@/services/admin_services/admin.customer.account.service";

interface Props {
  customer: CustomerAccount | null;
  onSuccess: () => void;
}

export default function CustomerAccountForm({ customer, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        status: customer.status,
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customer) return;

    setLoading(true);
    setError("");

    try {
      const updateData: UpdateCustomerAccountRequest = {
        status: formData.status,
      };

      const res = await customerAccountService.updateCustomerAccount(
        customer.accountId,
        updateData
      );

      if (res.status !== 200) {
        throw new Error(res.message);
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Chỉnh sửa tài khoản khách hàng</h2>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={customer?.email || ""}
              disabled
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Email không thể thay đổi</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Tên khách hàng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={customer?.accountName || ""}
              disabled
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Thông tin riêng tư, không thể chỉnh sửa</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={customer?.phoneNumber || ""}
              disabled
              className="w-full rounded-lg border bg-gray-100 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Thông tin riêng tư, không thể chỉnh sửa</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Trạng thái <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full rounded-lg border px-3 py-2 text-sm"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Blocked">Blocked</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
