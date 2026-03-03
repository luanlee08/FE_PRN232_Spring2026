"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, RefreshCw, Send, Search, X, Mail, MailOpen, CalendarDays } from "lucide-react";
import {
  AdminNotificationService,
  type NotificationDeliveryDto,
  type NotificationStatsDto,
  type NotificationQuery,
} from "@/services/admin_services/admin.notification.service";
import NotificationHistoryTable from "./NotificationHistoryTable";
import SendNotificationModal from "./SendNotificationModal";

const PAGE_SIZE = 15;

export default function NotificationsPageUI() {
  /* ── Data ── */
  const [items, setItems]     = useState<NotificationDeliveryDto[]>([]);
  const [stats, setStats]     = useState<NotificationStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal]     = useState(0);
  const [page, setPage]       = useState(1);

  /* ── Modal ── */
  const [modalOpen, setModalOpen] = useState(false);

  /* ── Filters ── */
  const [keyword, setKeyword]           = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "Unread" | "Read">("");
  const [fromDate, setFromDate]         = useState("");
  const [toDate, setToDate]             = useState("");

  /* ── Fetch ── */
  const fetchList = useCallback(
    async (p: number, kw = keyword, sf = statusFilter, fd = fromDate, td = toDate) => {
      setLoading(true);
      try {
        const query: NotificationQuery = {
          page: p, pageSize: PAGE_SIZE,
          keyword:  kw || undefined,
          status:   sf || undefined,
          fromDate: fd || undefined,
          toDate:   td || undefined,
        };
        const res = await AdminNotificationService.getNotifications(query);
        if (res.data) {
          setItems(res.data.items ?? []);
          setTotal(res.data.totalCount ?? 0);
        }
      } catch { setItems([]); }
      finally { setLoading(false); }
    },
    [keyword, statusFilter, fromDate, toDate],
  );

  const fetchStats = useCallback(async () => {
    try {
      const res = await AdminNotificationService.getStats();
      if (res.data) setStats(res.data);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchList(1); fetchStats(); }, []); // eslint-disable-line

  /* ── Handlers ── */
  const handleSearch = () => { setPage(1); fetchList(1); };

  const handleReset = () => {
    setKeyword(""); setStatusFilter(""); setFromDate(""); setToDate(""); setPage(1);
    fetchList(1, "", "", "", "");
  };

  const handlePageChange = (p: number) => { setPage(p); fetchList(p); };

  const handleSendSuccess = () => { setPage(1); fetchList(1); fetchStats(); };

  /* ── Pagination helper ── */
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageNums = (): number[] => {
    const result: number[] = [];
    const left  = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    for (let i = left; i <= right; i++) result.push(i);
    if (left > 1)           result.unshift(-1, 1);
    if (right < totalPages) result.push(-2, totalPages);
    return result;
  };

  /* ── Stat cards ── */
  const statCards = [
    { label: "Tổng thông báo", value: stats?.totalDeliveries  ?? "—", icon: <Bell size={18} />,         color: "text-brand-500",  bg: "bg-brand-50  dark:bg-brand-900/20"  },
    { label: "Chưa đọc",       value: stats?.unreadDeliveries ?? "—", icon: <Mail size={18} />,         color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
    { label: "Đã đọc",         value: stats?.readDeliveries   ?? "—", icon: <MailOpen size={18} />,     color: "text-green-600",  bg: "bg-green-50  dark:bg-green-900/20"  },
    { label: "Hôm nay",        value: stats?.todayDeliveries  ?? "—", icon: <CalendarDays size={18} />, color: "text-blue-600",   bg: "bg-blue-50   dark:bg-blue-900/20"   },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-900/20">
            <Bell size={20} className="text-brand-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Quản lý thông báo</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Lịch sử gửi và gửi nhanh thông báo đến người dùng
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => { fetchList(page); fetchStats(); }}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <RefreshCw size={13} /> Làm mới
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600"
          >
            <Send size={14} /> Gửi nhanh
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statCards.map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              <span className={`rounded-lg p-1.5 ${s.bg} ${s.color}`}>{s.icon}</span>
            </div>
            <p className={`mt-2 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Table card ── */}
      <div className="rounded-2xl bg-white shadow-sm dark:bg-white/[0.03]">

        {/* Filter bar */}
        <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 p-4 dark:border-gray-700">
          <div className="relative min-w-[200px] flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Tìm tiêu đề, email người nhận..."
              className="w-full rounded-xl border border-gray-200 py-2 pl-8 pr-3 text-sm focus:border-brand-300 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as "" | "Unread" | "Read")}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Unread">Chưa đọc</option>
            <option value="Read">Đã đọc</option>
          </select>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Từ</span>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400">Đến</span>
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white" />
          </div>

          <button onClick={handleSearch}
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-600">
            Tìm kiếm
          </button>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
            <X size={13} /> Xóa lọc
          </button>
        </div>

        {/* Result info */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-400">
          <span>{loading ? "Đang tải..." : `${total.toLocaleString("vi-VN")} thông báo`}</span>
          {totalPages > 1 && <span>Trang {page} / {totalPages}</span>}
        </div>

        {/* Table — onDelete not passed: BE has no DELETE endpoint */}
        <NotificationHistoryTable
          notifications={items}
          isLoading={loading}
          onRefresh={() => fetchList(page)}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1.5 border-t border-gray-100 p-4 dark:border-gray-700">
            <button
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-400"
            >
              ← Trước
            </button>

            {pageNums().map((p, i) =>
              p < 0 ? (
                <span key={`e${i}`} className="px-1 text-gray-400">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`min-w-[36px] rounded-lg border px-3 py-1.5 text-sm transition ${
                    p === page
                      ? "border-brand-500 bg-brand-50 font-semibold text-brand-600 dark:bg-brand-900/20 dark:text-brand-400"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-40 dark:border-gray-700 dark:text-gray-400"
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* ── Send modal ── */}
      <SendNotificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSendSuccess}
      />
    </div>
  );
}
