"use client";

import { useState, useEffect } from "react";
import {
  accountService,
  AccountAdmin,
  CreateAccountRequest,
  UpdateAccountRequest,
} from "../../../../services/admin_services/admin.account.service";

interface Props {
  account?: AccountAdmin | null;
  onSuccess: () => void;
}

export default function AccountForm({ account, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    accountName: "",
    email: "",
    password: "",
    phoneNumber: "",
    roleId: 2,
    status: "Active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName,
        email: account.email,
        password: "",
        phoneNumber: account.phoneNumber || "",
        roleId: account.roleId || 2,
        status: account.status,
      });
    } else {
      setFormData({
        accountName: "",
        email: "",
        password: "",
        phoneNumber: "",
        roleId: 2,
        status: "Active",
      });
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (account) {
        const updateData: UpdateAccountRequest = {
          accountName: formData.accountName,
          phoneNumber: formData.phoneNumber || undefined,
          roleId: formData.roleId,
          status: formData.status,
          password: formData.password || undefined,
        };

        const res = await accountService.updateAccount(account.accountId, updateData);
        if (res.status !== 200) {
          throw new Error(res.message);
        }
      } else {
        const createData: CreateAccountRequest = {
          accountName: formData.accountName,
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber || undefined,
          roleId: formData.roleId,
          status: formData.status,
        };

        const res = await accountService.createAccount(createData);
        if (res.status !== 201) {
          throw new Error(res.message);
        }
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
        <h2 className="text-xl font-bold">
          {account ? "Chỉnh sửa tài khoản" : "Thêm tài khoản mới"}
        </h2>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">
            Tên tài khoản <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.accountName}
            onChange={(e) =>
              setFormData({ ...formData, accountName: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Nhập tên tài khoản"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            required={!account}
            disabled={!!account}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-gray-100"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Mật khẩu {!account && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            required={!account}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder={
              account ? "Để trống nếu không đổi mật khẩu" : "Nhập mật khẩu"
            }
          />
          {!account && (
            <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Số điện thoại</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="0123456789"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Vai trò <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.roleId}
            onChange={(e) =>
              setFormData({ ...formData, roleId: Number(e.target.value) })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value={2}>Staff</option>
            <option value={3}>Warehouse</option>
            <option value={4}>Admin</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">
            Trạng thái <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-lg bg-indigo-500 py-2.5 font-medium text-white hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : account ? "Cập nhật" : "Tạo tài khoản"}
          </button>
          <button
            type="button"
            onClick={onSuccess}
            className="flex-1 rounded-lg border py-2.5 font-medium hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
