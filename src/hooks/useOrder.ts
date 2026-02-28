/**
 * Custom hooks for Order data fetching and mutations.
 *
 * Rules:
 *   - Components NEVER call CustomerOrderService directly
 *   - All API calls go through these hooks
 *   - Cache keys follow the pattern: ['orders', ...params]
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { CustomerOrderService } from '@/services/customer_services/customer.order.service';
import type { CreateOrderRequest } from '@/types/order';

// ------------------------------------------------------------------
// Query Keys — centralised so invalidation is consistent
// ------------------------------------------------------------------
export const orderKeys = {
  all: ['orders'] as const,
  myOrders: (status?: string, page?: number, pageSize?: number) =>
    ['orders', 'my', status, page, pageSize] as const,
  detail: (id: number) => ['orders', 'detail', id] as const,
  paymentMethods: () => ['orders', 'payment-methods'] as const,
};

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

/**
 * Fetch the authenticated user's order list.
 * Supports pagination and status filter.
 * Uses keepPreviousData to avoid layout flicker when changing page.
 */
export function useMyOrders(params: {
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { status, page = 1, pageSize = 10 } = params;

  return useQuery({
    queryKey: orderKeys.myOrders(status, page, pageSize),
    queryFn: () => CustomerOrderService.getMyOrders(status, page, pageSize),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    select: (res) => res.data,
  });
}

/**
 * Fetch a single order by ID.
 * Only runs when orderId is truthy.
 */
export function useOrderDetail(orderId: number | null | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(orderId!),
    queryFn: () => CustomerOrderService.getOrderById(orderId!),
    enabled: !!orderId,
    staleTime: 60_000,
    select: (res) => res.data,
  });
}

/**
 * Fetch available payment methods.
 * Rarely changes — 5 minute stale time.
 */
export function usePaymentMethods() {
  return useQuery({
    queryKey: orderKeys.paymentMethods(),
    queryFn: () => CustomerOrderService.getPaymentMethods(),
    staleTime: 5 * 60_000,
    select: (res) => res.data?.paymentMethods ?? [],
  });
}

// ------------------------------------------------------------------
// Mutations
// ------------------------------------------------------------------

/**
 * Create a new order.
 * Invalidates my-orders list on success.
 * Returns paymentUrl in data if external payment is needed.
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      CustomerOrderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}

/**
 * Cancel an order.
 * Invalidates my-orders list and the specific order detail on success.
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: number) => CustomerOrderService.cancelOrder(orderId),
    onSuccess: (_data, orderId) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
    },
  });
}
