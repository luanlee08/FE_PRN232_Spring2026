"use client";

import React, { useState } from "react";
import { Eye, Trash2, Calendar, User, Users, Image as ImageIcon, Link2, Tag } from "lucide-react";
import { NotificationDeliveryDto } from "@/services/admin_services/admin.notification.service";
import { getCategoryFromTemplate, getCategoryLabel, getCategoryColor } from "@/utils/notification.helpers";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";

interface NotificationHistoryTableProps {
  notifications: NotificationDeliveryDto[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onDelete?: (id: number) => Promise<void>;
}

const NotificationHistoryTable: React.FC<NotificationHistoryTableProps> = ({
  notifications,
  isLoading = false,
  onRefresh,
  onDelete,
}) => {
  const [selectedNotification, setSelectedNotification] = useState<NotificationDeliveryDto | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  // Delete with confirmation
  const handleDeleteClick = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId || !onDelete) return;
    setDeletingId(confirmDeleteId);
    setConfirmDeleteId(null);
    try {
      await onDelete(confirmDeleteId);
      onRefresh?.();
    } finally {
      setDeletingId(null);
    }
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
                Người nhận
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
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          {notification.accountName ?? `Người dùng #${notification.accountId}`}
                        </span>
                        {notification.accountEmail && (
                          <span className="text-xs text-gray-400">{notification.accountEmail}</span>
                        )}
                      </div>
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
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" suppressHydrationWarning>
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
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(notification)}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 transition dark:bg-blue-600 dark:hover:bg-blue-700"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                          Chi tiết
                        </button>
                        {onDelete && (
                          <button
                            onClick={(e) => handleDeleteClick(notification.deliveryId, e)}
                            disabled={deletingId === notification.deliveryId}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 transition dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 disabled:opacity-50"
                            title="Xóa thông báo"
                          >
                            <Trash2 size={14} />
                            Xóa
                          </button>
                        )}
                      </div>
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
                    Người nhận
                  </label>
                  <p className="text-sm text-gray-800 dark:text-gray-200 mt-1 font-medium">
                    {selectedNotification.accountName ?? `#${selectedNotification.accountId}`}
                  </p>
                  {selectedNotification.accountEmail && (
                    <p className="text-xs text-gray-400 mt-0.5">{selectedNotification.accountEmail}</p>
                  )}
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

              {/* Rich fields */}
              {(selectedNotification.imageUrl || selectedNotification.actionType) && (
                <div className="space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 p-3">
                  {selectedNotification.imageUrl && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                        <ImageIcon className="w-3.5 h-3.5" /> Ảnh
                      </label>
                      <div className="rounded-lg overflow-hidden h-32 bg-gray-200 dark:bg-gray-700">
                        <img
                          src={selectedNotification.imageUrl}
                          alt="notification image"
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 truncate">{selectedNotification.imageUrl}</p>
                    </div>
                  )}
                  {selectedNotification.actionType && selectedNotification.actionType !== "none" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mb-1">
                        <Link2 className="w-3.5 h-3.5" /> Hành động khi click
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                          {selectedNotification.actionType === "product" && "🛒 Sản phẩm"}
                          {selectedNotification.actionType === "voucher" && "🎟️ Voucher"}
                          {selectedNotification.actionType === "url" && "🔗 URL"}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {selectedNotification.actionTarget}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

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
      {/* Confirm Delete Dialog */}
      {confirmDeleteId !== null && (
        <Modal
          isOpen={confirmDeleteId !== null}
          onClose={() => setConfirmDeleteId(null)}
          className="max-w-sm mx-4"
        >
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Xóa thông báo?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Hành động này không thể hoàn tác. Thông báo sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex gap-3 justify-center">
              <Button size="md" variant="outline" onClick={() => setConfirmDeleteId(null)}>
                Hủy
              </Button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition"
              >
                Xóa
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default NotificationHistoryTable;
