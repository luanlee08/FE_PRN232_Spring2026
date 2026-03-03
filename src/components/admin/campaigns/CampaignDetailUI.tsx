"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";
import { ArrowLeft, Send, Copy, Users, Mail, MousePointer, Eye } from "lucide-react";
import type { CampaignDetailDto, CampaignStatus, RecipientRow } from "@/types/campaign";
import {
  getCampaignById,
  sendCampaign,
  duplicateCampaign,
} from "@/services/admin_services/admin.campaign.service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

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

export default function CampaignDetailUI() {
  const { id }   = useParams<{ id: string }>();
  const router   = useRouter();
  const [data, setData]   = useState<CampaignDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!id) return;
    getCampaignById(Number(id))
      .then(r => setData(r.data))
      .catch(() => setError("Không thể tải dữ liệu chiến dịch"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSend = async () => {
    if (!data) return;
    if (!confirm("Gửi chiến dịch này ngay bây giờ?")) return;
    try {
      await sendCampaign(data.campaignId);
      const r = await getCampaignById(data.campaignId);
      setData(r.data);
    } catch { alert("Gửi thất bại"); }
  };

  const handleDuplicate = async () => {
    if (!data) return;
    try {
      const r = await duplicateCampaign(data.campaignId);
      router.push(`/admin/campaigns/${r.data}`);
    } catch { alert("Nhân bản thất bại"); }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải...</div>;
  if (error || !data) return <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error || "Không tìm thấy"}</div>;

  // Chart data
  const dates  = data.clickTimeline.map(p => p.date);
  const clicks = data.clickTimeline.map(p => p.clicks);
  const reads  = data.clickTimeline.map(p => p.reads);

  const chartOptions: ApexOptions = {
    chart: { type: "line", fontFamily: "Outfit, sans-serif", toolbar: { show: false }, height: 280 },
    colors: ["#465FFF", "#22c55e"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.3, opacityTo: 0 } },
    dataLabels: { enabled: false },
    legend: { position: "top" },
    xaxis: { categories: dates, labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    tooltip: { x: { format: "yyyy-MM-dd" } },
    grid: { yaxis: { lines: { show: true } }, xaxis: { lines: { show: false } } },
  };

  const chartSeries = [
    { name: "Clicks", data: clicks },
    { name: "Reads",  data: reads  },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{data.campaignName}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[data.status]}`}>
                {STATUS_LABELS[data.status]}
              </span>
              <span className="text-xs text-gray-400">{data.targetType}</span>
              {data.templateCode && <span className="text-xs text-gray-400">· {data.templateCode}</span>}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/campaigns/${data.campaignId}/edit`)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Chỉnh sửa
          </button>
          {(data.status === "Draft" || data.status === "Scheduled") && (
            <button
              onClick={handleSend}
              className="flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-600"
            >
              <Send size={14} /> Gửi ngay
            </button>
          )}
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
          >
            <Copy size={14} /> Nhân bản
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Tổng người nhận", value: data.totalRecipients, icon: <Users size={20} />, color: "text-brand-500" },
          { label: "Đã gửi",          value: data.totalSent,       icon: <Mail size={20} />,        color: "text-blue-500" },
          { label: "Đã đọc",          value: data.totalRead,       icon: <Eye size={20} />,         color: "text-green-500" },
          { label: "Đã click",        value: data.totalClicked,    icon: <MousePointer size={20} />, color: "text-yellow-500" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white p-5 shadow-sm dark:bg-white/[0.03]">
            <div className={`${s.color} mb-2`}>{s.icon}</div>
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-0.5 text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart */}
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03] lg:col-span-2">
          <h3 className="mb-1 text-sm font-semibold text-gray-700">Lịch sử Click & Đọc theo ngày</h3>
          <p className="mb-4 text-xs text-gray-400">CTR: {data.ctrPercent}%</p>
          {dates.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">Chưa có dữ liệu</div>
          ) : (
            <ReactApexChart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={280}
            />
          )}
        </div>

        {/* Campaign info */}
        <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Thông tin chiến dịch</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Nguồn</dt>
              <dd className="font-medium text-gray-700">{data.sourceType}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Tạo bởi</dt>
              <dd className="font-medium text-gray-700">{data.createdByAccountName ?? data.createdByAccountId}</dd>
            </div>
            {data.scheduledAt && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Lên lịch</dt>
                <dd className="font-medium text-gray-700">{new Date(data.scheduledAt).toLocaleString("vi-VN")}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-500">Ngày tạo</dt>
              <dd className="font-medium text-gray-700">{new Date(data.createdAt).toLocaleDateString("vi-VN")}</dd>
            </div>
            {data.actionType && data.actionType !== "none" && (
              <div className="flex justify-between">
                <dt className="text-gray-500">Hành động</dt>
                <dd className="font-medium text-gray-700">{data.actionType}: {data.actionTarget}</dd>
              </div>
            )}
          </dl>

          {data.titleOverride && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Tiêu đề</p>
              <p className="text-sm text-gray-800">{data.titleOverride}</p>
            </div>
          )}
          {data.messageOverride && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Nội dung</p>
              <p className="text-sm text-gray-800">{data.messageOverride}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recipients table */}
      <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-white/[0.03]">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Danh sách người nhận ({data.recipients.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="pb-3 font-medium">Người dùng</th>
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Trạng thái</th>
                <th className="pb-3 font-medium">Gửi lúc</th>
                <th className="pb-3 font-medium">Đọc lúc</th>
                <th className="pb-3 font-medium">Click lúc</th>
              </tr>
            </thead>
            <tbody>
              {data.recipients.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Chưa có người nhận</td></tr>
              ) : data.recipients.map((r: RecipientRow) => (
                <tr key={r.deliveryId} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2.5 pr-4 font-medium text-gray-800">
                    {r.accountName ?? `#${r.accountId}`}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-500">{r.accountEmail ?? "—"}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.deliveryStatus === "Read" ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {r.deliveryStatus === "Read" ? "Đã đọc" : "Chưa đọc"}
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-gray-500">
                    {new Date(r.deliveredAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-gray-500">
                    {r.readAt ? new Date(r.readAt).toLocaleString("vi-VN") : "—"}
                  </td>
                  <td className="py-2.5 text-xs text-gray-500">
                    {r.clickedAt ? new Date(r.clickedAt).toLocaleString("vi-VN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
