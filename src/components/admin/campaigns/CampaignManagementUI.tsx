"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, Send, Copy, Trash2, Eye, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import type { CampaignDto, CampaignQuery, CampaignStatus } from "@/types/campaign";
import {
  getCampaigns, deleteCampaign, sendCampaign, duplicateCampaign,
} from "@/services/admin_services/admin.campaign.service";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  Draft:      "bg-gray-100 text-gray-600",
  Scheduled:  "bg-blue-100 text-blue-700",
  Processing: "bg-yellow-100 text-yellow-700",
  Completed:  "bg-green-100 text-green-700",
  Failed:     "bg-red-100 text-red-600",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  Draft:      "Bản nháp",
  Scheduled:  "Đã lên lịch",
  Processing: "Đang gửi",
  Completed:  "Đã gửi",
  Failed:     "Lỗi",
};

const TARGET_LABELS: Record<string, string> = {
  ALL:    "Tất cả khách",
  GROUP:  "Theo nhóm",
  CUSTOM: "Cụ thể",
  SINGLE: "1 người",
};

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "Tất cả", value: "" },
  { label: "Bản nháp", value: "Draft" },
  { label: "Đã lên lịch", value: "Scheduled" },
  { label: "Đã gửi", value: "Completed" },
  { label: "Lỗi", value: "Failed" },
];

export default function CampaignManagementUI() {
  const router = useRouter();
  const [items, setItems]     = useState<CampaignDto[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage]       = useState(1);
  const pageSize = 12;

  const [keyword, setKeyword]       = useState("");
  const [statusFilter, setStatus]   = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const query: CampaignQuery = { page, pageSize };
      if (keyword)      query.keyword = keyword;
      if (statusFilter) query.status  = statusFilter as CampaignStatus;
      const res = await getCampaigns(query);
      setItems(res.data?.items ?? []);
      setTotal(res.data?.totalCount ?? 0);
    } catch (e) {
      console.error("Campaign list error:", e);
    } finally {
      setLoading(false);
    }
  }, [page, keyword, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSend = async (id: number) => {
    if (!confirm("Gửi chiến dịch này ngay bây giờ?")) return;
    try {
      await sendCampaign(id);
      fetchData();
    } catch (e) { alert("Gửi thất bại"); }
  };

  const handleDuplicate = async (id: number) => {
    try {
      await duplicateCampaign(id);
      fetchData();
    } catch (e) { alert("Nhân bản thất bại"); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Xóa chiến dịch "${name}"?`)) return;
    try {
      await deleteCampaign(id);
      fetchData();
    } catch (e) { alert("Xóa thất bại"); }
  };

  const totalPages = Math.ceil(total / pageSize);

  const stats = {
    sent:      items.filter(i => i.status === "Completed").length,
    scheduled: items.filter(i => i.status === "Scheduled").length,
    draft:     items.filter(i => i.status === "Draft").length,
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Tổng chiến dịch", value: total,          color: "text-brand-500" },
          { label: "Đã gửi",          value: stats.sent,      color: "text-green-600" },
          { label: "Đã lên lịch",     value: stats.scheduled, color: "text-blue-600" },
          { label: "Bản nháp",        value: stats.draft,     color: "text-gray-400" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Tìm chiến dịch..."
                value={keyword}
                onChange={e => { setKeyword(e.target.value); setPage(1); }}
                className="h-10 rounded-lg border border-gray-200 pl-9 pr-4 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="h-10 rounded-lg border border-gray-200 px-3 text-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={() => fetchData()} className="flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm hover:bg-gray-50">
              <RefreshCw size={14} /> Làm mới
            </button>
          </div>
          <button
            onClick={() => router.push("/admin/campaigns/create")}
            className="flex h-10 items-center gap-2 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Plus size={16} /> Tạo chiến dịch
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Thông báo</th>
                <th className="pb-3 font-medium">Gửi đến</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium">Người nhận</th>
                <th className="pb-3 font-medium">Đã đọc</th>
                <th className="pb-3 font-medium">Ngày tạo</th>
                <th className="pb-3 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Chưa có thông báo nào</td></tr>
              ) : items.map(c => (
                <tr key={c.campaignId} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-gray-700/50 dark:hover:bg-gray-800/20">
                  <td className="py-3 pr-4">
                    <p className="max-w-[220px] truncate font-medium text-gray-800 dark:text-white">{c.campaignName}</p>
                    {c.scheduledAt && c.status === "Scheduled" && (
                      <p className="mt-0.5 text-xs text-blue-500">
                        📅 {new Date(c.scheduledAt).toLocaleString("vi-VN")}
                      </p>
                    )}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {TARGET_LABELS[c.targetType] ?? c.targetType}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{c.totalRecipients}</td>
                  <td className="py-3 pr-4 text-gray-600">{c.totalRead}</td>
                  <td className="py-3 pr-4 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 pl-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Xem chi tiết"
                        onClick={() => router.push(`/admin/campaigns/${c.campaignId}`)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                      ><Eye size={15} /></button>
                      <button
                        title="Chỉnh sửa"
                        onClick={() => router.push(`/admin/campaigns/${c.campaignId}/edit`)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-brand-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      {(c.status === "Draft" || c.status === "Scheduled") && (
                        <button
                          title="Gửi ngay"
                          onClick={() => handleSend(c.campaignId)}
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-green-600"
                        ><Send size={15} /></button>
                      )}
                      <button
                        title="Nhân bản"
                        onClick={() => handleDuplicate(c.campaignId)}
                        className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-yellow-600"
                      ><Copy size={15} /></button>
                      {c.status === "Draft" && (
                        <button
                          title="Xóa"
                          onClick={() => handleDelete(c.campaignId, c.campaignName)}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                        ><Trash2 size={15} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Tổng {total} chiến dịch</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded border p-1 hover:bg-gray-50 disabled:opacity-40"
              ><ChevronLeft size={14} /></button>
              <span>Trang {page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded border p-1 hover:bg-gray-50 disabled:opacity-40"
              ><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
