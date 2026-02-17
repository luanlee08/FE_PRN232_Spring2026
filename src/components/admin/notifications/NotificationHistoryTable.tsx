"use client";

import React, { useState } from "react";
import { Eye, Trash2, Calendar, User, Users } from "lucide-react";
import { NotificationDeliveryDto } from "@/services/admin_services/admin.notification.service";
import { getCategoryFromTemplate, getCategoryLabel, getCategoryColor } from "@/types/notification";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface NotificationHistoryTableProps {
  notifications: NotificationDeliveryDto[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

const NotificationHistoryTable: React.FC<NotificationHistoryTableProps> = ({
  notifications,
  isLoading = false,
  onRefresh,
}) => {
  const [selectedNotification, setSelectedNotification] = useState<NotificationDeliveryDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status: "Unread" | "Read") => {
    return status === "Unread"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
  };

  // View detail
  const handleViewDetail = (notification: NotificationDeliveryDto) => {
    setSelectedNotification(notification);
    setIsDetailModalOpen(true);
  };

  // Parse payload safely
  const parsePayload = (payloadStr?: string) => {
    if (!payloadStr) return null;
    try {
      return JSON.parse(payloadStr);
    } catch {
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="py-10 text-center text-gray-400 dark:text-gray-500">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Loại
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tiêu đề
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                User ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Trạng thái
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Gửi lúc
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                Job ID
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-10 text-center text-gray-400 dark:text-gray-500">
                  Không tìm thấy thông báo nào
                </td>
              </tr>
            ) : (
              notifications.map((notification) => {
                const category = getCategoryFromTemplate(notification.templateCode);
                const colors = getCategoryColor(category);

                return (
                  <tr
                    key={notification.deliveryId}
                    className="border-b hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {notification.deliveryId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
                      >
                        {getCategoryLabel(category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 max-w-xs truncate">
                      {notification.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {notification.accountId}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(
                          notification.status
                        )}`}
                      >
                        {notification.status === "Unread" ? "Chưa đọc" : "Đã đọc"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(notification.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {notification.createdByJobId ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {notification.createdByJobId}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleViewDetail(notification)}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                        title="Xem chi tiết"
                      >
                        <Eye size={14} />
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedNotification(null);
          }}
          className="max-w-2xl mx-4"
        >
          <div className="p-6 sm:p-8">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Eye className="w-6 h-6 text-brand-500" />
                Chi tiết Thông báo
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ID: {selectedNotification.deliveryId}
              </p>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {/* Template Code */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Template Code
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedNotification.templateCode}
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Loại thông báo
                </label>
                <div className="mt-1">
                  {(() => {
                    const category = getCategoryFromTemplate(selectedNotification.templateCode);
                    const colors = getCategoryColor(category);
                    return (
                      <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${colors.bg} ${colors.text}`}>
                        {getCategoryLabel(category)}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Tiêu đề
                </label>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-medium">
                  {selectedNotification.title}
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Nội dung
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-wrap">
                  {selectedNotification.message}
                </p>
              </div>

              {/* Payload */}
              {selectedNotification.payload && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Payload
                  </label>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 mt-1 bg-gray-100 dark:bg-gray-800 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(parsePayload(selectedNotification.payload), null, 2)}
                  </pre>
                </div>
              )}

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    User ID
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {selectedNotification.accountId}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Trạng thái
                  </label>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeColor(
                        selectedNotification.status
                      )}`}
                    >
                      {selectedNotification.status === "Unread" ? "Chưa đọc" : "Đã đọc"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Time Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Gửi lúc
                  </label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {formatDate(selectedNotification.createdAt)}
                  </p>
                </div>
                {selectedNotification.createdByJobId && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Background Job ID
                    </label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedNotification.createdByJobId}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                size="md"
                variant="outline"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedNotification(null);
                }}
              >
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NotificationHistoryTable;
