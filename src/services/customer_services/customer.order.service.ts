// services/customer_services/customer.order.service.ts

import axiosInstance from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/configs/api-configs';
import { ApiResponse } from '@/types/common';
import { 
    CreateOrderRequest, 
    CreateOrderResponse, 
    PaymentMethodDTO,
    GetPaymentMethodsResponse,
    OrderResponse 
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
    async getOrderById(id: number): Promise<ApiResponse<OrderResponse>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ORDER_BY_ID(id));
        return res.data;
    },

    // Lấy danh sách đơn hàng của user
    async getMyOrders(): Promise<ApiResponse<OrderResponse[]>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ORDER_MY_ORDERS);
        return res.data;
    },

    // Hủy đơn hàng
    async cancelOrder(id: number): Promise<ApiResponse<object>> {
        const res = await axiosInstance.post(API_ENDPOINTS.ORDER_CANCEL(id));
        return res.data;
    },
};
