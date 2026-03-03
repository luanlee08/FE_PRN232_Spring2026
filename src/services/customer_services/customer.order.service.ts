// services/customer_services/customer.order.service.ts

import axiosInstance from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/configs/api-configs';
import { ApiResponse, PagedResult } from '@/types/common';
import { 
    CreateOrderRequest, 
    CreateOrderResponse, 
    PaymentMethodDTO,
    GetPaymentMethodsResponse,
    OrderResponse,
    OrderDto,
    RefundDto,
    CreateRefundRequest,
} from '@/types/order';

/* ================= SERVICE ================= */

export const CustomerOrderService = {
    // Lấy danh sách phương thức thanh toán
    async getPaymentMethods(): Promise<ApiResponse<GetPaymentMethodsResponse>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ORDER_PAYMENT_METHODS);
        return res.data;
    },

    // Tạo đơn hàng
    async createOrder(data: CreateOrderRequest): Promise<ApiResponse<CreateOrderResponse>> {
        const res = await axiosInstance.post(API_ENDPOINTS.ORDERS, data);
        return res.data;
    },

    // Lấy chi tiết đơn hàng theo ID
    async getOrderById(id: number): Promise<ApiResponse<OrderDto>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ORDER_BY_ID(id));
        return res.data;
    },

    // Lấy danh sách đơn hàng của user (server-side filter by status)
    async getMyOrders(status?: string, pageNumber = 1, pageSize = 50): Promise<ApiResponse<PagedResult<OrderDto>>> {
        const params = new URLSearchParams();
        params.append('pageNumber', String(pageNumber));
        params.append('pageSize', String(pageSize));
        if (status) params.append('status', status);
        const res = await axiosInstance.get(`${API_ENDPOINTS.ORDER_MY_ORDERS}?${params.toString()}`);
        return res.data;
    },

    // Hủy đơn hàng
    async cancelOrder(id: number): Promise<ApiResponse<object>> {
        const res = await axiosInstance.post(API_ENDPOINTS.ORDER_CANCEL(id));
        return res.data;
    },

    // ── REFUND ──
    // Tạo yêu cầu hoàn tiền (chỉ với đơn ở trạng thái Completed)
    async createRefundRequest(data: CreateRefundRequest): Promise<ApiResponse<RefundDto>> {
        const res = await axiosInstance.post(API_ENDPOINTS.ORDER_REFUND_REQUEST, data);
        return res.data;
    },

    // Lấy danh sách yêu cầu hoàn tiền của tôi
    async getMyRefunds(pageNumber = 1, pageSize = 10): Promise<ApiResponse<PagedResult<RefundDto>>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ORDER_MY_REFUNDS, {
            params: { pageNumber, pageSize },
        });
        return res.data;
    },

    // Lấy chi tiết yêu cầu hoàn tiền
    async getRefundById(refundId: number): Promise<ApiResponse<RefundDto>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ORDER_REFUND_BY_ID(refundId));
        return res.data;
    },
};

