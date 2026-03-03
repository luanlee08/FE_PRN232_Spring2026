"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { ProductStatisticsResponse } from "@/types/statistics";
import { AdminStatisticsService } from "@/services/admin_services/admin.statistics.service";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function ProductStatisticsUI() {
  const [data, setData] = useState<ProductStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [topN, setTopN] = useState(10);
  const [lowStockThreshold, setLowStockThreshold] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await AdminStatisticsService.getProductStatistics({ topN, lowStockThreshold });
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
  }, [topN, lowStockThreshold]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Category bar chart
  const categoryOptions: ApexOptions = {
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#465FFF"],
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: data?.categoryBreakdown.slice(0, 8).map((c) => c.categoryName) ?? [] },
    tooltip: { y: { formatter: (v) => `${v} sản phẩm đã bán` } },
  };

  const categorySeries = [
    { name: "Đã bán", data: data?.categoryBreakdown.slice(0, 8).map((c) => c.totalSold) ?? [] },
  ];

  // Brand bar chart
  const brandOptions: ApexOptions = {
    chart: { type: "bar", fontFamily: "Outfit, sans-serif", toolbar: { show: false } },
    colors: ["#10B981"],
    plotOptions: { bar: { horizontal: true, borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: data?.brandBreakdown.slice(0, 8).map((b) => b.brandName) ?? [] },
    tooltip: { y: { formatter: (v) => `${v} sản phẩm đã bán` } },
  };

  const brandSeries = [
    { name: "Đã bán", data: data?.brandBreakdown.slice(0, 8).map((b) => b.totalSold) ?? [] },
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Top N sản phẩm:</label>
          <input
            type="number"
            min={1}
            max={50}
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600 dark:text-gray-400">Ngưỡng tồn kho thấp:</label>
          <input
            type="number"
            min={1}
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(Number(e.target.value))}
            className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-white/5"
          />
        </div>
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {[
              { label: "Tổng SP", value: data.totalProducts, color: "text-blue-600" },
              { label: "Đang hoạt động", value: data.activeProducts, color: "text-green-600" },
              { label: "Ngừng bán", value: data.inactiveProducts, color: "text-gray-500" },
              { label: "Hết hàng", value: data.outOfStockCount, color: "text-red-500" },
              { label: "Sắp hết hàng", value: data.lowStockCount, color: "text-amber-500" },
              { label: "Tổng tồn kho", value: data.totalStockQuantity, color: "text-indigo-600" },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className={`mt-1 text-xl font-bold ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Top selling products table */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
              Top {topN} sản phẩm bán chạy
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-left text-xs uppercase text-gray-500 dark:border-white/10">
                    <th className="pb-3 pr-4">#</th>
                    <th className="pb-3 pr-4">Sản phẩm</th>
                    <th className="pb-3 pr-4">Danh mục</th>
                    <th className="pb-3 pr-4">Thương hiệu</th>
                    <th className="pb-3 pr-4 text-right">Đã bán</th>
                    <th className="pb-3 pr-4 text-right">Doanh thu</th>
                    <th className="pb-3 pr-4 text-center">Đánh giá</th>
                    <th className="pb-3 text-right">Tồn kho</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSellingProducts.map((p, i) => (
                    <tr
                      key={p.productId}
                      className="border-b border-gray-50 dark:border-white/5"
                    >
                      <td className="py-2 pr-4 font-medium text-gray-400">{i + 1}</td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          {p.imageUrl ? (
                            <Image
                              src={p.imageUrl}
                              alt={p.productName}
                              width={36}
                              height={36}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-gray-100 dark:bg-white/10" />
                          )}
                          <span className="max-w-[160px] truncate font-medium text-gray-800 dark:text-white">
                            {p.productName}
                          </span>
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-gray-500">{p.category ?? "—"}</td>
                      <td className="py-2 pr-4 text-gray-500">{p.brand ?? "—"}</td>
                      <td className="py-2 pr-4 text-right font-medium">{p.quantitySold}</td>
                      <td className="py-2 pr-4 text-right font-semibold text-green-600">
                        {formatCurrency(p.totalRevenue)}
                      </td>
                      <td className="py-2 pr-4 text-center text-amber-500">
                        ★ {p.avgRating} ({p.reviewCount})
                      </td>
                      <td
                        className={`py-2 text-right font-medium ${
                          p.currentStock === 0
                            ? "text-red-500"
                            : p.currentStock <= lowStockThreshold
                              ? "text-amber-500"
                              : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {p.currentStock}
                      </td>
                    </tr>
                  ))}
                  {data.topSellingProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-400">
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category + Brand charts */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Theo danh mục (top 8)
              </h3>
              {data.categoryBreakdown.length > 0 ? (
                <ReactApexChart
                  options={categoryOptions}
                  series={categorySeries}
                  type="bar"
                  height={260}
                />
              ) : (
                <p className="text-center text-gray-400">Không có dữ liệu</p>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white">
                Theo thương hiệu (top 8)
              </h3>
              {data.brandBreakdown.length > 0 ? (
                <ReactApexChart
                  options={brandOptions}
                  series={brandSeries}
                  type="bar"
                  height={260}
                />
              ) : (
                <p className="text-center text-gray-400">Không có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Low stock alert */}
          {data.lowStockProducts.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-400/5">
              <h3 className="mb-3 text-base font-semibold text-amber-700 dark:text-amber-400">
                ⚠ Sản phẩm sắp hết hàng ({data.lowStockProducts.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-200/50 text-left text-xs uppercase text-amber-600 dark:border-amber-400/20 dark:text-amber-400">
                      <th className="pb-2 pr-4">Sản phẩm</th>
                      <th className="pb-2 pr-4">Danh mục</th>
                      <th className="pb-2 pr-4">Thương hiệu</th>
                      <th className="pb-2 pr-4 text-right">Tồn kho</th>
                      <th className="pb-2 text-center">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockProducts.map((p) => (
                      <tr key={p.productId} className="border-b border-amber-100/50 dark:border-amber-400/10">
                        <td className="py-1.5 pr-4 font-medium text-gray-800 dark:text-white">{p.productName}</td>
                        <td className="py-1.5 pr-4 text-gray-500">{p.category ?? "—"}</td>
                        <td className="py-1.5 pr-4 text-gray-500">{p.brand ?? "—"}</td>
                        <td
                          className={`py-1.5 pr-4 text-right font-bold ${
                            p.quantity === 0 ? "text-red-500" : "text-amber-600"
                          }`}
                        >
                          {p.quantity === 0 ? "Hết hàng" : p.quantity}
                        </td>
                        <td className="py-1.5 text-center">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              p.productStatus === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.productStatus ?? "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
