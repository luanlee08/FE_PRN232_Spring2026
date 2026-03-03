import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse } from "@/types/common";
import {
  RevenueStatisticsQuery,
  RevenueStatisticsResponse,
  ProductStatisticsQuery,
  ProductStatisticsResponse,
} from "@/types/statistics";

export const AdminStatisticsService = {
  /** Feature 13: Revenue statistics — Admin only */
  async getRevenueStatistics(params: RevenueStatisticsQuery = {}) {
    const res = await axiosInstance.get<ApiResponse<RevenueStatisticsResponse>>(
      API_ENDPOINTS.ADMIN_STATISTICS_REVENUE,
      {
        params: {
          period: params.period ?? "month",
          from: params.from,
          to: params.to,
        },
      },
    );
    return res.data;
  },

  /** Feature 14: Product statistics — Admin + Warehouse */
  async getProductStatistics(params: ProductStatisticsQuery = {}) {
    const res = await axiosInstance.get<ApiResponse<ProductStatisticsResponse>>(
      API_ENDPOINTS.ADMIN_STATISTICS_PRODUCTS,
      {
        params: {
          topN: params.topN ?? 10,
          lowStockThreshold: params.lowStockThreshold ?? 10,
        },
      },
    );
    return res.data;
  },
};
