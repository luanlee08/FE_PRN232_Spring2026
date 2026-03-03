"use client";

import React from "react";
import {
  Bell,
  Package,
  Tag,
  Megaphone,
  Settings,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import type { AdminNotificationType, ActionType } from "@/types/notification";

export interface NotificationPreviewProps {
  title: string;
  message: string;
  imageUrl?: string;
  notificationType: AdminNotificationType;
  actionType?: ActionType;
  actionTarget?: string;
}

const TYPE_CONFIG: Record<
  AdminNotificationType,
  {
    label: string;
    bg: string;
    badge: string;
    icon: React.ReactNode;
    accent: string;
  }
> = {
  new_product: {
    label: "Sản phẩm mới",
    bg: "from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    icon: <Package className="w-5 h-5" />,
    accent: "border-blue-400",
  },
  voucher: {
    label: "Voucher",
    bg: "from-yellow-50 to-amber-50 dark:from-yellow-950/40 dark:to-amber-950/40",
    badge: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300",
    icon: <Tag className="w-5 h-5" />,
    accent: "border-yellow-400",
  },
  promotion: {
    label: "Khuyến mãi",
    bg: "from-pink-50 to-rose-50 dark:from-pink-950/40 dark:to-rose-950/40",
    badge: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
    icon: <Megaphone className="w-5 h-5" />,
    accent: "border-pink-400",
  },
  system: {
    label: "Hệ thống",
    bg: "from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300",
    icon: <Settings className="w-5 h-5" />,
    accent: "border-gray-400",
  },
  custom: {
    label: "Tùy chỉnh",
    bg: "from-purple-50 to-violet-50 dark:from-purple-950/40 dark:to-violet-950/40",
    badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
    icon: <Bell className="w-5 h-5" />,
    accent: "border-purple-400",
  },
};

function getActionLabel(actionType?: ActionType, actionTarget?: string): string | null {
  if (!actionType || actionType === "none" || !actionTarget) return null;
  if (actionType === "product") return `Xem sản phẩm #${actionTarget}`;
  if (actionType === "voucher") return `Dùng voucher: ${actionTarget}`;
  if (actionType === "url") return "Xem thêm →";
  return null;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  title,
  message,
  imageUrl,
  notificationType,
  actionType,
  actionTarget,
}) => {
  const config = TYPE_CONFIG[notificationType] ?? TYPE_CONFIG.custom;
  const actionLabel = getActionLabel(actionType, actionTarget);
  const isEmpty = !title && !message;

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
        Xem trước
      </p>

      {isEmpty ? (
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-600 gap-3">
          <Bell className="w-10 h-10 opacity-40" />
          <p className="text-sm">Nhập nội dung để xem trước</p>
        </div>
      ) : (
        <div
          className={`relative rounded-xl border-l-4 ${config.accent} bg-gradient-to-br ${config.bg} shadow-sm overflow-hidden`}
        >
          {/* Badge row */}
          <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${config.badge}`}
            >
              {config.icon}
              {config.label}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">Vừa xong</span>
          </div>

          {/* Image (if provided) */}
          {imageUrl ? (
            <div className="mx-4 mt-1.5 rounded-lg overflow-hidden h-32 bg-gray-200 dark:bg-gray-700">
              <img
                src={imageUrl}
                alt="notification"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null}

          {/* Content */}
          <div className="px-4 pt-2 pb-3">
            <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight line-clamp-1">
              {title || <span className="text-gray-400 italic">Tiêu đề thông báo</span>}
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed line-clamp-3">
              {message || <span className="italic">Nội dung thông báo sẽ hiển thị ở đây...</span>}
            </p>

            {/* Action button */}
            {actionLabel && (
              <div className="mt-2.5">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-white/70 dark:bg-black/20 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                  <ExternalLink className="w-3 h-3" />
                  {actionLabel}
                </span>
              </div>
            )}
          </div>

          {/* Unread dot indicator */}
          <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#FF6B35]" />
        </div>
      )}

      {/* Mobile bell preview */}
      {!isEmpty && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-3 flex items-start gap-3 bg-white dark:bg-gray-900">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {config.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
              {title || "Tiêu đề"}
            </p>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {message || "Nội dung thông báo..."}
            </p>
          </div>
          <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">Vừa xong</span>
        </div>
      )}
    </div>
  );
};

export default NotificationPreview;
