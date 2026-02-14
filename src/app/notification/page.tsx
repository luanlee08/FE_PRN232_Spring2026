'use client';

import { Header } from '@/components/user/header';
import { Footer } from '@/components/user/footer';
import { Bell, BellOff, Check, CheckCheck, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import {
    CustomerNotificationService,
    NotificationDto,
} from '../../../services/customer_services/customer.notification.service';
import toast from 'react-hot-toast';
import Link from 'next/link';

type TabKey = 'all' | 'unread' | 'read';

const TABS: { key: TabKey; label: string; status?: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc', status: 'Unread' },
    { key: 'read', label: 'Đã đọc', status: 'Read' },
];

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} giờ trước`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 30) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN');
}

export default function NotificationPage() {
    const [notifications, setNotifications] = useState<NotificationDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('all');
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();

    // Auth guard
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error('Vui lòng đăng nhập để xem thông báo');
            router.push('/login');
        }
    }, [isAuthenticated, authLoading, router]);

    // Fetch notifications
    const fetchNotifications = useCallback(
        async (tab: TabKey = activeTab) => {
            try {
                setIsLoading(true);
                const status = TABS.find((t) => t.key === tab)?.status;
                const res = await CustomerNotificationService.getNotifications(status);
                if (res.status === 200 && res.data) {
                    setNotifications(res.data);
                }
            } catch {
                console.error('Failed to fetch notifications');
            } finally {
                setIsLoading(false);
            }
        },
        [activeTab]
    );

    useEffect(() => {
        if (isAuthenticated) {
            fetchNotifications();
        }
    }, [isAuthenticated, fetchNotifications]);

    // Tab change
    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        fetchNotifications(tab);
    };

    // Mark one as read
    const handleMarkRead = async (notif: NotificationDto) => {
        if (notif.status === 'Read') return;
        try {
            const res = await CustomerNotificationService.markAsRead(notif.deliveryId);
            if (res.status === 200) {
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.deliveryId === notif.deliveryId ? { ...n, status: 'Read' } : n
                    )
                );
            }
        } catch {
            toast.error('Không thể đánh dấu đã đọc');
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            const res = await CustomerNotificationService.markAllAsRead();
            if (res.status === 200) {
                setNotifications((prev) =>
                    prev.map((n) => ({ ...n, status: 'Read' }))
                );
                toast.success('Đã đánh dấu tất cả là đã đọc');
            }
        } catch {
            toast.error('Không thể đánh dấu tất cả');
        }
    };

    // Delete one
    const handleDelete = async (id: number) => {
        setDeletingIds((prev) => new Set(prev).add(id));
        try {
            const res = await CustomerNotificationService.deleteNotification(id);
            if (res.status === 200) {
                setNotifications((prev) => prev.filter((n) => n.deliveryId !== id));
                toast.success('Đã xóa thông báo');
            }
        } catch {
            toast.error('Không thể xóa thông báo');
        } finally {
            setDeletingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const unreadCount = notifications.filter((n) => n.status === 'Unread').length;

    if (authLoading) return null;

    return (
        <div className="min-h-screen bg-[#F5F5F5]">
            <Header />

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
                    {notifications.some((n) => n.status === 'Unread') && (
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-1.5 text-sm font-medium text-[#FF6B35] hover:text-[#E55A24] transition"
                        >
                            <CheckCheck className="w-4 h-4" />
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
                            className={`flex-1 py-2.5 text-sm font-medium rounded-md transition ${activeTab === tab.key
                                    ? 'bg-[#FF6B35] text-white shadow-sm'
                                    : 'text-gray-500 hover:text-[#222] hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
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
                ) : notifications.length === 0 ? (
                    /* Empty state */
                    <div className="bg-white rounded-lg p-12 text-center">
                        <BellOff className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-[#222] mb-2">
                            Không có thông báo
                        </h2>
                        <p className="text-gray-500 mb-6">
                            {activeTab === 'unread'
                                ? 'Bạn đã đọc hết tất cả thông báo!'
                                : 'Bạn chưa có thông báo nào.'}
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Quay lại trang chủ
                        </Link>
                    </div>
                ) : (
                    /* Notification list */
                    <div className="space-y-2">
                        {notifications.map((notif) => {
                            const isUnread = notif.status === 'Unread';
                            const isDeleting = deletingIds.has(notif.deliveryId);

                            return (
                                <div
                                    key={notif.deliveryId}
                                    onClick={() => handleMarkRead(notif)}
                                    className={`bg-white rounded-lg p-4 flex gap-4 cursor-pointer transition group hover:shadow-md ${isUnread
                                            ? 'border-l-4 border-[#FF6B35] bg-orange-50/40'
                                            : 'border-l-4 border-transparent'
                                        } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {/* Icon */}
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isUnread
                                                ? 'bg-[#FF6B35]/10 text-[#FF6B35]'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}
                                    >
                                        <Bell className="w-5 h-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3
                                                className={`text-sm leading-5 line-clamp-1 ${isUnread
                                                        ? 'font-bold text-[#222]'
                                                        : 'font-medium text-gray-600'
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
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-400">
                                                {timeAgo(notif.createdAt)}
                                            </span>
                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                                                {isUnread && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkRead(notif);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-[#FF6B35] transition"
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
                                                    className="p-1 text-gray-400 hover:text-red-500 transition"
                                                    title="Xóa thông báo"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
