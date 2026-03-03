"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import {
  RevenueStatisticsResponse,
  RevenueStatisticsQuery,
} from "@/types/statistics";
import { AdminStatisticsService } from "@/services/admin_services/admin.statistics.service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const PERIODS = [
  { label: "Theo ngày", value: "day" },
  { label: "Theo tháng", value: "month" },
  { label: "Theo năm", value: "year" },
] as const;

type Period = "day" | "month" | "year";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function RevenueStatisticsUI() {
  const [data, setData] = useState<RevenueStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query: RevenueStatisticsQuery = { period, from: from || undefined, to: to || undefined };
      const res = await AdminStatisticsService.getRevenueStatistics(query);
      if (res.status === 200) {
        setData(res.data);
      } else {
        setError(res.message);
      }
    } catch {
      setError("Không thể tải dữ liệu thống kê.");
    } finally {
      setLoading(false);
    }
  }, [period, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Revenue line chart
  const revenueChartOptions: ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "Outfit, sans-serif",
      toolbar: { show: false },
      height: 280,
    },
    colors: ["#465FFF"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { opacityFrom: 0.4, opacityTo: 0 } },
    dataLabels: { enabled: false },
    xaxis: { categories: data?.revenueChart.map((p) => p.label) ?? [] },
    yaxis: {
      labels: {
        formatter: (v) =>
          new Intl.NumberFormat("vi-VN", { notation: "compact", compactDisplay: "short", maximumFractionDigits: 1 }).format(v) + "₫",
      },
    },
    tooltip: {
      y: { formatter: (v) => formatCurrency(v) },
    },
  };

  const revenueChartSeries = [
    { name: "Doanh thu", data: data?.revenueChart.map((p) => p.revenue) ?? [] },
  ];

  // Status donut chart
  const statusChartOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: data?.ordersByStatus.map((s) => s.status) ?? [],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    colors: ["#465FFF", "#34D399", "#F59E0B", "#10B981", "#6366F1", "#EF4444", "#8B5CF6"],
  };

  const statusSeries = data?.ordersByStatus.map((s) => s.count) ?? [];

  // Payment method donut chart
  const paymentOptions: ApexOptions = {
    chart: { type: "donut", fontFamily: "Outfit, sans-serif" },
    labels: data?.paymentMethods.map((p) => p.method) ?? [],
    legend: { position: "bottom" },
    dataLabels: { enabled: false },
    colors: ["#465FFF", "#34D399", "#F59E0B", "#10B981"],
  };

  const paymentSeries = data?.paymentMethods.map((p) => p.amount) ?? [];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                period === p.value
                  ? "bg-brand-500 text-white"
                  : "border border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
          placeholder="Từ ngày"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
          placeholder="Đến ngày"
        />
        <button
          onClick={fetchData}
          className="rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-600"
        >
          Lọc
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">{error}</div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center text-gray-400">Đang tải...</div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
            {[
              { label: "Đơn hoàn tất", value: data.totalCompletedOrders.toString(), color: "text-blue-600" },
              { label: "Doanh thu gộp", value: formatCurrency(data.grossRevenue), color: "text-green-600" },
              { label: "Phí vận chuyển", value: formatCurrency(data.shippingRevenue), color: "text-indigo-600" },
              { label: "Hoàn tiền", value: formatCurrency(data.refundTotal), color: "text-red-500" },
              { label: "Doanh thu thuần", value: formatCurrency(data.netRevenue), color: "text-emerald-600" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className={`mt-1 text-lg font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Revenue chart */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
              Biểu đồ doanh thu
            </h3>
            <ReactApexChart
              options={revenueChartOptions}
              series={revenueChartSeries}
              type="area"
              height={280}
            />
          </div>

          {/* Status + Payment charts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Trạng thái đơn hàng
              </h3>
              {statusSeries.length > 0 ? (
                <ReactApexChart
                  options={statusChartOptions}
                  series={statusSeries}
                  type="donut"
                  height={260}
                />
              ) : (
                <p className="text-center text-gray-400">Không có dữ liệu</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Phương thức thanh toán
              </h3>
              {paymentSeries.length > 0 ? (
                <ReactApexChart
                  options={paymentOptions}
                  series={paymentSeries}
                  type="donut"
                  height={260}
                />
              ) : (
                <p className="text-center text-gray-400">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Top customers */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
              Top 10 khách hàng
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500 dark:border-white/10">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Tên</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4 text-right">Đơn hàng</th>
                    <th className="pb-3 text-right">Tổng chi tiêu</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topCustomers.map((c, i) => (
                    <tr
                      key={c.accountId}
                      className="border-b border-gray-50 dark:border-white/5"
                    >
                      <td className="py-2 pr-4 font-medium text-gray-400">{i + 1}</td>
                      <td className="py-2 pr-4 font-medium text-gray-800 dark:text-white">{c.name}</td>
                      <td className="py-2 pr-4 text-gray-500">{c.email}</td>
                      <td className="py-2 pr-4 text-right">{c.orderCount}</td>
                      <td className="py-2 text-right font-semibold text-green-600">
                        {formatCurrency(c.totalSpent)}
                      </td>
                    </tr>
                  ))}
                  {data.topCustomers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-400">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
