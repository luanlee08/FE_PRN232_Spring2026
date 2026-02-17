// services/admin_services/admin.notification.service.ts

import { API_BASE, API_ENDPOINTS } from "@/configs/api-configs";
import axiosInstance from '@/lib/api/axios';

/* ================= TYPES ================= */

export type TargetType = "All" | "Specific" | "Condition";

export interface SendNotificationRequest {
  templateCode: string;
  title: string;
  message: string;
  payload?: string; // JSON string
  targetType: TargetType;
  targetUserIds?: number[]; // For Specific target type
  conditionJson?: string; // For Condition target type (optional/advanced)
  scheduledFor?: string; // ISO datetime string for scheduled notifications
}

export interface NotificationDeliveryDto {
  deliveryId: number;
  accountId: number;
  templateCode: string;
  title: string;
  message: string;
  payload?: string;
  status: "Unread" | "Read";
  createdAt: string;
  createdByJobId?: number;
}

export interface NotificationStatsDto {
  totalDeliveries: number;
  unreadDeliveries: number;  // Backend field name
  readDeliveries: number;     // Backend field name
  todayDeliveries: number;
  deliveriesByTemplate: Record<string, number>;
}

export interface NotificationQuery {
  page?: number;
  pageSize?: number;
  accountId?: number; // Filter by specific user
  templateCode?: string;
  status?: string; // "Unread" | "Read"
  keyword?: string;
  fromDate?: string;
  toDate?: string;
}

interface PagedResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data?: T;
}

/* ================= SERVICE ================= */

export const AdminNotificationService = {
  /**
   * Send notification (immediate or scheduled)
   */
  async sendNotification(
    request: SendNotificationRequest
  ): Promise<ApiResponse<any>> {
    const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_NOTIFICATIONS, request);
    return res.data;
  },

  /**
   * Get all notifications with filtering and pagination (admin view)
   */
  async getNotifications(
    query: NotificationQuery = {}
  ): Promise<PagedResponse<NotificationDeliveryDto>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS, {
      params: query
    });
    return res.data;
  },

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<ApiResponse<NotificationDeliveryDto>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATION_BY_ID(id));
    return res.data;
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<ApiResponse<NotificationStatsDto>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS);
    return res.data;
  },

  /**
   * Delete notification (admin can delete any notification)
   */
  async deleteNotification(id: number): Promise<ApiResponse<void>> {
    const res = await axiosInstance.delete(API_ENDPOINTS.ADMIN_NOTIFICATION_BY_ID(id));
    return res.data;
  },
};
