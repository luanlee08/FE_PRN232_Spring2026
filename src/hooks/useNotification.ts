/**
 * Custom hooks for Notification data fetching and mutations.
 *
 * Rules:
 *   - Components NEVER call CustomerNotificationService directly
 *   - All API calls go through these hooks
 *   - Unread count is polled every 30 seconds for real-time feel
 *   - Cache keys follow the pattern: ['notifications', ...params]
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CustomerNotificationService } from '@/services/customer_services/customer.notification.service';
import type { NotificationQuery } from '@/types/notification';

// ------------------------------------------------------------------
// Query Keys
// ------------------------------------------------------------------
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (query: NotificationQuery) => ['notifications', 'list', query] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
};

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

/**
 * Fetch the user's notification list.
 * Passes status + pageSize filters to the API.
 */
export function useNotifications(query: NotificationQuery = {}) {
  const { status, pageSize = 20 } = query;

  return useQuery({
    queryKey: notificationKeys.list(query),
    queryFn: () => CustomerNotificationService.getNotifications(status, pageSize),
    staleTime: 0, // Always re-fetch — notifications should feel real-time
    select: (res) => res.data,
  });
}

/**
 * Fetch the unread notification count.
 * Polls every 30 seconds so the badge in the navbar stays current.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => CustomerNotificationService.getUnreadCount(),
    refetchInterval: 30_000,
    staleTime: 0,
    select: (res) => res.data ?? 0,
  });
}

// ------------------------------------------------------------------
// Mutations
// ------------------------------------------------------------------

/**
 * Mark a single notification as read.
 * Immediately updates the unread count and notification list.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliveryId: number) =>
      CustomerNotificationService.markAsRead(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Mark all notifications as read in one request.
 * Invalidates both the list and the count badge.
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => CustomerNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * Delete a single notification.
 * Removes it from the list and refreshes the unread count.
 */
export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (deliveryId: number) =>
      CustomerNotificationService.deleteNotification(deliveryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
