"use client";

import { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import AccountTable from "./AccountTable";
import AccountForm from "./AccountForm";
import { Modal } from "../ui/modal";
import {
  accountService,
  AccountAdmin,
  AccountQuery,
} from "@/services/admin_services/admin.account.service";

export default function AccountManagementUI() {
  const [accounts, setAccounts] = useState<AccountAdmin[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [selectedRole, setSelectedRole] = useState<number>(2);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountAdmin | null>(
    null
  );

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const query: AccountQuery = {
        page,
        pageSize,
        keyword: keyword || undefined,
        roleId: selectedRole,
        status: selectedStatus,
      };

      const res = await accountService.getAccounts(query);

      setAccounts(res.data.items);
      setTotalPages(
        Math.ceil(res.data.totalCount / res.data.pageSize)
      );
      setTotalItems(res.data.totalCount);
    } catch (error) {
      console.error("Failed to load accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, [page, keyword, selectedRole, selectedStatus]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý tài khoản</h1>
          <p className="text-sm text-gray-500">
            Quản lý tài khoản nhân viên hệ thống
          </p>
        </div>

        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={keyword}
              onChange={(e) => {
                setPage(1);
                setKeyword(e.target.value);
              }}
              placeholder="Tìm theo tên / email / SĐT"
              className="h-10 w-64 rounded-lg border pl-9 pr-4 text-sm"
            />
          </div>

          <select
            value={selectedRole || 2}
            onChange={(e) => {
              setPage(1);
              setSelectedRole(Number(e.target.value));
            }}
            className="h-10 rounded-lg border px-4 text-sm"
          >
            <option value="2">Staff</option>
            <option value="3">Warehouse</option>
          </select>

          <select
            value={selectedStatus || ""}
            onChange={(e) => {
              setPage(1);
              setSelectedStatus(e.target.value || undefined);
            }}
            className="h-10 rounded-lg border px-4 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Blocked">Blocked</option>
          </select>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
          >
            <Plus size={16} />
            Thêm tài khoản
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400">
          Đang tải dữ liệu...
        </div>
      ) : (
        <AccountTable
          accounts={accounts}
          onEdit={(account) => {
            setSelectedAccount(account);
            setOpenModal(true);
          }}
          onRefresh={loadAccounts}
        />
      )}

      <div className="mt-6 flex justify-between text-sm">
        <div className="text-gray-500">
          Trang {page} / {totalPages} · Tổng {totalItems} tài khoản
        </div>

        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            ←
          </button>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            →
          </button>
        </div>
      </div>

      <Modal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setSelectedAccount(null);
        }}
        className="max-w-[600px] rounded-xl bg-white"
      >
        <AccountForm
          account={selectedAccount}
          onSuccess={() => {
            setOpenModal(false);
            setSelectedAccount(null);
            loadAccounts();
          }}
        />
      </Modal>
    </div>
  );
}
