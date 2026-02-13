"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import CustomerAccountTable from "./CustomerAccountTable";
import CustomerAccountForm from "./CustomerAccountForm";
import { Modal } from "../ui/modal/index";
import {
  customerAccountService,
  CustomerAccount,
  CustomerAccountQuery,
} from "../../../../services/admin_services/admin.customer.account.service";

export default function CustomerAccountManagementUI() {
  const [customers, setCustomers] = useState<CustomerAccount[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(
    null
  );

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const query: CustomerAccountQuery = {
        page,
        pageSize,
        keyword: keyword || undefined,
        status: selectedStatus,
      };

      const res = await customerAccountService.getCustomerAccounts(query);

      setCustomers(res.data.items);
      setTotalPages(
        Math.ceil(res.data.totalCount / res.data.pageSize)
      );
      setTotalItems(res.data.totalCount);
    } catch (error) {
      console.error("Failed to load customer accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, keyword, selectedStatus]);

  return (
    <div className="rounded-2xl bg-white p-6 shadow-theme-xl">
      <div className="mb-6 flex justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản lý khách hàng</h1>
          <p className="text-sm text-gray-500">
            Quản lý tài khoản khách hàng hệ thống
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
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-gray-400">
          Đang tải dữ liệu...
        </div>
      ) : (
        <CustomerAccountTable
          customers={customers}
          onEdit={(customer) => {
            setSelectedCustomer(customer);
            setOpenModal(true);
          }}
          onRefresh={loadCustomers}
        />
      )}

      <div className="mt-6 flex justify-between text-sm">
        <div className="text-gray-500">
          Trang {page} / {totalPages} · Tổng {totalItems} khách hàng
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
          setSelectedCustomer(null);
        }}
        className="max-w-[600px] rounded-xl bg-white"
      >
        <CustomerAccountForm
          customer={selectedCustomer}
          onSuccess={() => {
            setOpenModal(false);
            setSelectedCustomer(null);
            loadCustomers();
          }}
        />
      </Modal>
    </div>
  );
}
