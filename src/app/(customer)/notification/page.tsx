"use client";

import { Footer } from "@/components/customer/footer";
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Package,
  Tag,
  Wallet,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import {
  CustomerNotificationService,
} from "@/services/customer_services/customer.notification.service";
import type { NotificationDto } from "@/types/notification";
import toast from "react-hot-toast";
import Link from "next/link";
import { NotificationCategory } from "@/types/notification";
import {
  getCategoryFromTemplate,
  getCategoryLabel,
  getCategoryColor,
  parseNotificationPayload,
} from "@/utils/notification.helpers";
import {
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from "@/hooks/useNotification";

type TabKey = "all" | "unread" | "read";

const TABS: { key: TabKey; label: string; status?: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "unread", label: "Chưa đọc", status: "Unread" },
  { key: "read", label: "Đã đọc", status: "Read" },
];

const PAGE_SIZE = 20;

// Category filter options
const CATEGORY_FILTERS = [
  { key: "all", label: "Tất cả", icon: Bell },
  { key: NotificationCategory.ORDER, label: "Đơn hàng", icon: Package },
  { key: NotificationCategory.PROMOTION, label: "Khuyến mãi", icon: Tag },
  { key: NotificationCategory.PAYMENT, label: "Thanh toán", icon: Wallet },
  { key: NotificationCategory.SYSTEM, label: "Hệ thống", icon: Bell },
] as const;

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export default function NotificationPage() {
  const [allItems, setAllItems] = useState<NotificationDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // React Query mutations — these auto-invalidate ['notifications'] so the navbar badge syncs
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xem thông báo");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // ─── Core fetch: fetch a single page, optionally append ──────────
  const fetchPage = useCallback(
    async (tab: TabKey, pageNum: number, append: boolean) => {
      const status = TABS.find((t) => t.key === tab)?.status;

      if (!append) setIsLoading(true);
      else setIsFetchingMore(true);

      try {
        const res = await CustomerNotificationService.getNotifications(
          status,
          PAGE_SIZE,
          pageNum,
        );
        if (res.status === 200 && res.data) {
          const items: NotificationDto[] = Array.isArray(res.data.items)
            ? res.data.items
            : [];
          const totalCount: number = res.data.totalCount ?? 0;

          setAllItems((prev) => (append ? [...prev, ...items] : items));
          setPage(pageNum);
          setHasMore(items.length === PAGE_SIZE && pageNum * PAGE_SIZE < totalCount);
        }
      } catch {
        if (!append) setAllItems([]);
      } finally {
        if (!append) setIsLoading(false);
        else setIsFetchingMore(false);
      }
    },
    [],
  );

  // Re-fetch from page 1 whenever isAuthenticated or activeTab changes (no double-fetch)
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPage(activeTab, 1, false);
  }, [isAuthenticated, activeTab, fetchPage]);

  // Tab change — just update state; the useEffect above handles fetch
  const handleTabChange = (tab: TabKey) => {
    if (tab === activeTab) return;
    setAllItems([]);
    setHasMore(false);
    setPage(1);
    setActiveTab(tab);
  };

  // ─── Load more ───────────────────────────────────────────────────
  const handleLoadMore = () => {
    if (isFetchingMore || !hasMore) return;
    fetchPage(activeTab, page + 1, true);
  };

  // ─── Mark one as read ─────────────────────────────────────────────
  const handleMarkRead = async (notif: NotificationDto) => {
    if (notif.status === "Read") return;
    try {
      await markAsReadMutation.mutateAsync(notif.deliveryId);
      setAllItems((prev) =>
        prev.map((n) =>
          n.deliveryId === notif.deliveryId ? { ...n, status: "Read" } : n,
        ),
      );
    } catch {
      toast.error("Không thể đánh dấu đã đọc");
    }
  };

  // ─── Notification click: mark read + navigate ─────────────────────
  const handleNotificationClick = async (notif: NotificationDto) => {
    if (notif.status === "Unread") {
      try {
        await markAsReadMutation.mutateAsync(notif.deliveryId);
        setAllItems((prev) =>
          prev.map((n) =>
            n.deliveryId === notif.deliveryId ? { ...n, status: "Read" } : n,
          ),
        );
      } catch {
        // silent — still navigate
      }
    }
    if (notif.actionType && notif.actionType !== "none" && notif.actionTarget) {
      if (notif.actionType === "product") {
        router.push(`/products/${notif.actionTarget}`);
        return;
      }
      if (notif.actionType === "voucher") {
        router.push(`/vouchers?code=${encodeURIComponent(notif.actionTarget)}`);
        return;
      }
      if (notif.actionType === "url") {
        // Rewrite legacy /orders/<id> deep-links to the correct profile page route
        const target = notif.actionTarget.replace(
          /^\/orders\/(\d+)/,
          (_: string, id: string) => `/profile?tab=orders&orderId=${id}`
        );
        if (target.startsWith("/")) {
          router.push(target);
        } else {
          window.open(target, "_blank", "noopener,noreferrer");
        }
        return;
      }
    }

    // ── Fallback: legacy JSON payload link ──
    if (notif.payload) {
      const payload = parseNotificationPayload(notif.payload);
      if (payload?.link) {
        // Rewrite legacy /orders/<id> links
        const link = payload.link.replace(
          /^\/orders\/(\d+)/,
          (_: string, id: string) => `/profile?tab=orders&orderId=${id}`
        );
        router.push(link);
      } else if (payload) {
        const category = getCategoryFromTemplate(notif.templateCode);
        if (category === NotificationCategory.ORDER && payload.type === "order") {
          const orderId = (payload as any).orderId;
          router.push(orderId ? `/profile?tab=orders&orderId=${orderId}` : "/profile?tab=orders");
        } else if (
          category === NotificationCategory.PROMOTION &&
          payload.type === "promotion" &&
          (payload as any).voucherId
        ) {
          router.push(`/vouchers/${(payload as any).voucherId}`);
        } else if (category === NotificationCategory.PAYMENT && payload.type === "payment") {
          const p = payload as any;
          if (p.orderId) router.push(`/profile?tab=orders&orderId=${p.orderId}`);
        }
      }
    }
  };

  // ─── Mark all as read ─────────────────────────────────────────────
  const handleMarkAllRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      setAllItems((prev) => prev.map((n) => ({ ...n, status: "Read" })));
      toast.success("Đã đánh dấu tất cả là đã đọc");
    } catch {
      toast.error("Không thể đánh dấu tất cả");
    }
  };

  // ─── Delete one ───────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    try {
      await deleteNotificationMutation.mutateAsync(id);
      setAllItems((prev) => prev.filter((n) => n.deliveryId !== id));
      toast.success("Đã xóa thông báo");
    } catch {
      toast.error("Không thể xóa thông báo");
    }
  };

  // ─── Derived values ───────────────────────────────────────────────
  const unreadCount = allItems.filter((n) => n.status === "Unread").length;

  const filteredNotifications =
    activeCategory === "all"
      ? allItems
      : allItems.filter(
          (n) => getCategoryFromTemplate(n.templateCode) === activeCategory,
        );

  // Get icon component for notification category
  const getCategoryIconComponent = (category: NotificationCategory) => {
    const colors = getCategoryColor(category);
    const IconComponent =
      category === NotificationCategory.ORDER
        ? Package
        : category === NotificationCategory.PROMOTION
          ? Tag
          : category === NotificationCategory.PAYMENT
            ? Wallet
            : Bell;

    return { IconComponent, colors };
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex gap-2 text-sm mb-6 text-gray-600">
          <Link href="/" className="hover:text-[#FF6B35] transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-[#222] font-medium">Thông báo</span>
        </div>

        {/* Title + Mark all button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#222] flex items-center gap-3">
            <Bell className="w-7 h-7 text-[#FF6B35]" />
            Thông Báo
            {unreadCount > 0 && (
              <span className="text-sm font-semibold text-white bg-[#FF6B35] rounded-full px-2.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </h1>
          {allItems.some((n) => n.status === "Unread") && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllAsReadMutation.isPending}
              className="flex items-center gap-1.5 text-sm font-medium text-[#FF6B35] hover:text-[#E55A24] transition disabled:opacity-50"
            >
              {markAllAsReadMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCheck className="w-4 h-4" />
              )}
              Đọc tất cả
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-white rounded-lg p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition ${
                activeTab === tab.key
                  ? "bg-[#FF6B35] text-white shadow-sm"
                  : "text-gray-500 hover:text-[#222] hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORY_FILTERS.map((filter) => {
            const Icon = filter.icon;
            const isActive = activeCategory === filter.key;

            return (
              <button
                key={filter.key}
                onClick={() => setActiveCategory(filter.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition shrink-0 ${
                  isActive
                    ? "bg-[#FF6B35] text-white shadow-sm"
                    : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm border border-gray-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          /* Skeleton */
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : allItems.length === 0 ? (
          /* Empty state — tab-aware */
          <div className="bg-white rounded-lg p-12 text-center">
            <BellOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#222] mb-2">Không có thông báo</h2>
            <p className="text-gray-500 mb-6">
              {activeTab === "unread"
                ? "Bạn đã đọc hết tất cả thông báo rồi! 🎉"
                : activeTab === "read"
                  ? "Bạn chưa đọc thông báo nào."
                  : "Bạn chưa có thông báo nào."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại trang chủ
            </Link>
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty state — category-aware */
          <div className="bg-white rounded-lg p-12 text-center">
            <BellOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#222] mb-2">Không có thông báo</h2>
            <p className="text-gray-500 mb-6">
              Không có thông báo{" "}
              {getCategoryLabel(activeCategory as NotificationCategory).toLowerCase()} nào
              {activeTab !== "all"
                ? ` ${activeTab === "unread" ? "chưa đọc" : "đã đọc"}`
                : ""}.
            </p>
          </div>
        ) : (
          <>
            {/* Notification list */}
            <div className="space-y-2">
              {filteredNotifications.map((notif) => {
                const isUnread = notif.status === "Unread";
                const isDeleting =
                  deleteNotificationMutation.isPending &&
                  deleteNotificationMutation.variables === notif.deliveryId;
                const category = getCategoryFromTemplate(notif.templateCode);
                const { IconComponent, colors } = getCategoryIconComponent(category);

                return (
                  <div
                    key={notif.deliveryId}
                    onClick={() => handleNotificationClick(notif)}
                    className={`bg-white rounded-lg p-4 flex gap-4 cursor-pointer transition group hover:shadow-md ${
                      isUnread
                        ? "border-l-4 border-[#FF6B35] bg-orange-50/40"
                        : "border-l-4 border-transparent"
                    } ${isDeleting ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isUnread ? `${colors.bg} ${colors.text}` : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Optional image */}
                      {notif.imageUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden h-24 bg-gray-100">
                          <img
                            src={notif.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        </div>
                      )}
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm leading-5 line-clamp-1 ${
                            isUnread ? "font-bold text-[#222]" : "font-medium text-gray-600"
                          }`}
                        >
                          {notif.title}
                        </h3>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-[#FF6B35] shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mt-1 leading-5">
                        {notif.message}
                      </p>
                      {/* Action indicator */}
                      {notif.actionType && notif.actionType !== "none" && notif.actionTarget && (
                        <span className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-[#FF6B35]">
                          {notif.actionType === "product" && "🛒 Xem sản phẩm"}
                          {notif.actionType === "voucher" && "🎟️ Dùng voucher"}
                          {notif.actionType === "url" && "🔗 Xem thêm"}
                          <span className="text-gray-400">→</span>
                        </span>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className="text-xs text-gray-400"
                          suppressHydrationWarning
                        >
                          {timeAgo(notif.createdAt)}
                        </span>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          {isUnread && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkRead(notif);
                              }}
                              disabled={markAsReadMutation.isPending}
                              className="p-1 text-gray-400 hover:text-[#FF6B35] transition disabled:opacity-50"
                              title="Đánh dấu đã đọc"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notif.deliveryId);
                            }}
                            disabled={isDeleting}
                            className="p-1 text-gray-400 hover:text-red-500 transition disabled:opacity-50"
                            title="Xóa thông báo"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="mt-4 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isFetchingMore}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition shadow-sm disabled:opacity-50"
                >
                  {isFetchingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Xem thêm
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
