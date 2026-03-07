// services/admin_services/admin.notification.service.ts

import { API_ENDPOINTS } from "@/configs/api-configs";
import axiosInstance from '@/lib/api/axios';
import type { ActionType } from '@/types/notification';

/* ================= TYPES ================= */

export type TargetType = "All" | "User" | "Role" | "Condition";

export interface SendNotificationRequest {
  templateCode?: string;           // Optional: auto-fills title/message from DB template
  title: string;
  message: string;
  imageUrl?: string;               // Optional image for notification card
  actionType?: ActionType;         // 'product' | 'voucher' | 'url' | 'none'
  actionTarget?: string;           // productId, voucherCode, or URL
  payload?: string;                // Legacy JSON payload (backward compat)
  targetType: TargetType;
  targetUserIds?: number[];        // For TargetType = "User" (multi-select)
  targetRoleId?: number;           // For TargetType = "Role" (1=Customer, 2=Staff, 3=Warehouse)
  scheduledFor?: string;           // ISO datetime string for scheduled delivery
}

export interface TemplateOptionDto {
  templateCode: string;
  title: string;
  message: string;
}

export interface AccountSearchResultDto {
  accountId: number;
  accountName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
}

export interface NotificationDeliveryDto {
  deliveryId: number;
  accountId: number;
  accountName?: string;   // resolved by mapper from Account join
  accountEmail?: string;  // resolved by mapper from Account join
  templateCode: string;
  title: string;
  message: string;
  payload?: string;
  imageUrl?: string;
  actionType?: string;
  actionTarget?: string;
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

// Types specific to admin notification service responses
interface PagedNotificationResponse<T> {
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

interface AdminApiResponse<T> {
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
  ): Promise<AdminApiResponse<any>> {
    // Map FE request to BE expected format
    const payload = {
      templateCode: request.templateCode || undefined,
      title: request.title,
      message: request.message,
      imageUrl: request.imageUrl || undefined,
      actionType: request.actionType && request.actionType !== 'none' ? request.actionType : undefined,
      actionTarget: request.actionTarget || undefined,
      targetType: request.targetType,
      targetUserIds: request.targetType === 'User' ? request.targetUserIds : undefined,
      targetRoleId: request.targetType === 'Role' ? request.targetRoleId : undefined,
      scheduledAt: request.scheduledFor || undefined,
    };
    const res = await axiosInstance.post(API_ENDPOINTS.ADMIN_NOTIFICATIONS, payload);
    return res.data;
  },

  /**
   * Get all notifications with filtering and pagination (admin view)
   */
  async getNotifications(
    query: NotificationQuery = {}
  ): Promise<PagedNotificationResponse<NotificationDeliveryDto>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS, {
      params: query
    });
    return res.data;
  },

  /**
   * Get notification by ID
   */
  async getNotificationById(id: number): Promise<AdminApiResponse<NotificationDeliveryDto>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATION_BY_ID(id));
    return res.data;
  },

  /**
   * Get notification statistics
   */
  async getStats(): Promise<AdminApiResponse<NotificationStatsDto>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS_STATS);
    return res.data;
  },

  /**
   * Delete notification (admin can delete any notification)
   */
  async deleteNotification(id: number): Promise<AdminApiResponse<void>> {
    const res = await axiosInstance.delete(API_ENDPOINTS.ADMIN_NOTIFICATION_BY_ID(id));
    return res.data;
  },

  /**
   * Get all admin-allowed templates for dropdown (with auto-fill support)
   */
  async getTemplates(): Promise<AdminApiResponse<TemplateOptionDto[]>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS_TEMPLATES);
    return res.data;
  },

  /**
   * Search users by name / email / phone for multi-select targeting
   */
  async searchUsers(q: string, pageSize = 10): Promise<AdminApiResponse<AccountSearchResultDto[]>> {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_NOTIFICATIONS_USER_SEARCH, {
      params: { q, pageSize }
    });
    return res.data;
  },
};
