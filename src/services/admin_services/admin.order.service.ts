import axiosInstance from "@/lib/api/axios";
import { API_ENDPOINTS } from "@/configs/api-configs";
import { ApiResponse, PagedResult } from "@/types/common";

// ── List item returned by GET /api/admin/orders ──────────────────────────────
export interface AdminOrderListItem {
  orderId: number;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  statusId: number;
  statusName: string;
  totalAmount: number;
  shippingAddress: string;
  orderDate: string;
  paymentCompletedAt?: string;
  refundStatus: string;
  orderDetails: AdminOrderDetailItem[];
}

export interface AdminOrderDetailItem {
  orderDetailId: number;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// ── Full detail returned by GET /api/admin/orders/{id} ───────────────────────
export interface AdminOrderDetail extends AdminOrderListItem {
  accountId: number;
  accountEmail: string;
  voucherId?: number;
  voucherCode?: string;
  voucherDiscount?: number;
  shippingMethod?: string;
  shippingFee: number;
  paidByWalletAmount: number;
  paidByExternalAmount: number;
  createdAt: string;
  updatedAt?: string;
  statusHistories: OrderStatusHistory[];
  shippingInfo?: {
    provider: string;
    trackingNumber?: string;
    status?: string;
    estimatedDelivery?: string;
    actualDelivery?: string;
  };
}

export interface OrderStatusHistory {
  orderStatusHistoryId: number;
  statusId: number;
  statusName: string;
  changedAt: string;
  changedBy?: number;
  changedByName?: string;
  note?: string;
}

// ── Query params ──────────────────────────────────────────────────────────────
export interface AdminOrderQuery {
  keyword?: string;
  statusId?: number;
  fromDate?: string;
  toDate?: string;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDesc?: boolean;
}

// ── Update status request ─────────────────────────────────────────────────────
export interface UpdateOrderStatusRequest {
  statusId: number;
  note?: string;
  /** Pass true when transitioning to Shipped (statusId=3) to auto-create GHN order */
  autoCreateShipping?: boolean;
  /** GHN service ID (53321 = Standard, 53322 = Express). Defaults to 53321 on backend. */
  shippingServiceId?: number;
  /** Required note for GHN: CHOTHUHANG | CHOXEMHANGKHONGTHU | KHONGCHOXEMHANG */
  shippingRequiredNote?: 'CHOTHUHANG' | 'CHOXEMHANGKHONGTHU' | 'KHONGCHOXEMHANG';
  shippingNote?: string;
}

export const AdminOrderService = {
  async getList(params: AdminOrderQuery) {
    const res = await axiosInstance.get<ApiResponse<PagedResult<AdminOrderListItem>>>(
      API_ENDPOINTS.ADMIN_ORDERS,
      { params },
    );
    return res.data.data;
  },

  async getDetail(id: number) {
    const res = await axiosInstance.get<ApiResponse<AdminOrderDetail>>(
      API_ENDPOINTS.ADMIN_ORDER_BY_ID(id),
    );
    return res.data.data;
  },

  async seedDemoShipping(orderId: number) {
    const res = await axiosInstance.post<ApiResponse<{ trackingNumber: string; status: string }>>(
      `/api/AOrderController/admin/demo/seed-shipping/${orderId}`,
    );
    return res.data;
  },

  async updateStatus(id: number, data: UpdateOrderStatusRequest) {
    const res = await axiosInstance.put<ApiResponse<boolean>>(
      API_ENDPOINTS.ADMIN_ORDER_STATUS(id),
      data,
    );
    return res.data;
  },

  async exportExcel(params: Omit<AdminOrderQuery, "page" | "pageSize">) {
    const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_ORDERS_EXPORT, {
      params,
      responseType: "blob",
    });

    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href = url;
    const date = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `orders_${date}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
