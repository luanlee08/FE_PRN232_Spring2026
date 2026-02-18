"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Send, Search, Calendar } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import SendNotificationModal from "@/components/admin/notifications/SendNotificationModal";
import NotificationHistoryTable from "@/components/admin/notifications/NotificationHistoryTable";
import { useModal } from "@/hooks/useModal";
import {
  AdminNotificationService,
  NotificationDeliveryDto,
  NotificationQuery,
  NotificationStatsDto,
} from "@/services/admin_services/admin.notification.service";
import Select from "@/components/admin/form/Select";
import { AVAILABLE_TEMPLATES } from "@/utils/notification.helpers";

export default function NotificationManagementPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { isOpen: isSendModalOpen, openModal: openSendModal, closeModal: closeSendModal } = useModal();

  // Data state
  const [notifications, setNotifications] = useState<NotificationDeliveryDto[]>([]);
  const [stats, setStats] = useState<NotificationStatsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filter state
  const [keyword, setKeyword] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [accountIdFilter, setAccountIdFilter] = useState<string>("");

  // Auth guard
  useEffect(() => {
    if (!authLoading && user && user.roleName !== "Admin") {
      toast.error("Chỉ Admin mới có quyền truy cập trang này");
      router.push("/admin/");
    }
  }, [user, authLoading, router]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const query: NotificationQuery = {
        page,
        pageSize,
        keyword: keyword || undefined,
        templateCode: selectedTemplate || undefined,
        status: selectedStatus || undefined,
        accountId: accountIdFilter ? parseInt(accountIdFilter) : undefined,
      };

      const response = await AdminNotificationService.getNotifications(query);

      if (response.status === 200 && response.data) {
        setNotifications(response.data.items);
        setTotalCount(response.data.totalCount);
        setTotalPages(Math.ceil(response.data.totalCount / response.data.pageSize));
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
      toast.error("Không thể tải danh sách thông báo");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, keyword, selectedTemplate, selectedStatus, accountIdFilter]);

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const response = await AdminNotificationService.getStats();
      if (response.status === 200 && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  }, []);

  // Load data on mount and when filters change
  useEffect(() => {
    if (user && user.roleName === "Admin") {
      loadNotifications();
      loadStats();
    }
  }, [user, loadNotifications, loadStats]);

  // Handle filter changes
  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const handleTemplateFilter = (value: string) => {
    setSelectedTemplate(value);
    setPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setSelectedStatus(value);
    setPage(1);
  };

  const handleAccountIdFilter = (value: string) => {
    setAccountIdFilter(value);
    setPage(1);
  };

  // Handle send success
  const handleSendSuccess = () => {
    loadNotifications();
    loadStats();
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-10 w-10 animate-spin text-brand-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Unauthorized
  if (!user || user.roleName !== "Admin") {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Thông báo" />

      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Total Deliveries */}
            <div className="rounded-2xl bg-white p-6 shadow-theme-xl dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tổng thông báo
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {(stats.totalDeliveries || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                  <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            {/* Unread Count */}
            <div className="rounded-2xl bg-white p-6 shadow-theme-xl dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chưa đọc
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {(stats.unreadDeliveries || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                  <Bell className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </div>

            {/* Unread Rate */}
            <div className="rounded-2xl bg-white p-6 shadow-theme-xl dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tỷ lệ chưa đọc
                  </p>
                  <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalDeliveries > 0
                      ? ((stats.unreadDeliveries / stats.totalDeliveries) * 100).toFixed(1)
                      : '0.0'}%
                  </p>
                </div>
                <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                  <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="rounded-2xl bg-white p-6 shadow-theme-xl dark:bg-gray-900">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Lịch sử Thông báo
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Quản lý và theo dõi các thông báo đã gửi
              </p>
            </div>

            <button
              onClick={openSendModal}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-white hover:bg-brand-600 transition dark:bg-brand-600 dark:hover:bg-brand-700 font-medium"
            >
              <Send size={18} />
              Gửi Thông báo
            </button>
          </div>

          {/* Filters */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Tìm theo tiêu đề, nội dung..."
                className="h-11 w-full rounded-lg border border-gray-300 pl-9 pr-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-800"
              />
            </div>

            {/* Template Filter */}
            <Select
              options={[
                { value: "", label: "Tất cả loại" },
                ...AVAILABLE_TEMPLATES.map((t) => ({
                  value: t.code,
                  label: t.label,
                })),
              ]}
              placeholder="Lọc theo template"
              onChange={handleTemplateFilter}
              defaultValue={selectedTemplate}
            />

            {/* Status Filter */}
            <Select
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "Unread", label: "Chưa đọc" },
                { value: "Read", label: "Đã đọc" },
              ]}
              placeholder="Lọc theo trạng thái"
              onChange={handleStatusFilter}
              defaultValue={selectedStatus}
            />

            {/* Account ID Filter */}
            <input
              type="number"
              value={accountIdFilter}
              onChange={(e) => handleAccountIdFilter(e.target.value)}
              placeholder="Lọc theo User ID"
              className="h-11 w-full rounded-lg border border-gray-300 px-4 text-sm focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-800"
            />
          </div>

          {/* Table */}
          <NotificationHistoryTable
            notifications={notifications}
            isLoading={isLoading}
            onRefresh={loadNotifications}
          />

          {/* Pagination */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-sm">
            <div className="text-gray-500 dark:text-gray-400">
              Trang {page} / {totalPages} · Tổng {totalCount.toLocaleString()} thông báo
            </div>

            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
              >
                ← Trước
              </button>

              <button
                disabled={page === totalPages || totalPages === 0}
                onClick={() => setPage(page + 1)}
                className="rounded-lg border border-gray-300 px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition dark:border-gray-700 dark:hover:bg-gray-800 dark:text-gray-300"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={isSendModalOpen}
        onClose={closeSendModal}
        onSuccess={handleSendSuccess}
      />
    </div>
  );
}
