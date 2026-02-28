// services/customer_services/customer.notification.service.ts

import axiosInstance from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/configs/api-configs';
import type { ApiResponse, PagedResult } from '@/types/common';
import type { NotificationDto } from '@/types/notification';

/* ================= SERVICE ================= */

export const CustomerNotificationService = {
    // Lấy danh sách thông báo
    async getNotifications(
        status?: string,
        limit: number = 50
    ): Promise<ApiResponse<PagedResult<NotificationDto>>> {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        params.append('limit', limit.toString());
        const res = await axiosInstance.get(
            `${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`
        );
        return res.data;
    },

    // Lấy số thông báo chưa đọc
    async getUnreadCount(): Promise<ApiResponse<number>> {
        const res = await axiosInstance.get(API_ENDPOINTS.NOTIFICATIONS_UNREAD_COUNT);
        return res.data;
    },

    // Đánh dấu 1 thông báo là đã đọc
    async markAsRead(id: number): Promise<ApiResponse<boolean>> {
        const res = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATION_MARK_READ(id));
        return res.data;
    },

    // Đánh dấu tất cả đã đọc
    async markAllAsRead(): Promise<ApiResponse<boolean>> {
        const res = await axiosInstance.patch(API_ENDPOINTS.NOTIFICATIONS_READ_ALL);
        return res.data;
    },

    // Xóa 1 thông báo
    async deleteNotification(id: number): Promise<ApiResponse<boolean>> {
        const res = await axiosInstance.delete(API_ENDPOINTS.NOTIFICATION_DELETE(id));
        return res.data;
    },
};
