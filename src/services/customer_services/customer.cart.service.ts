// services/customer_services/customer.cart.service.ts

import axiosInstance from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/configs/api-configs';

/* ================= TYPES ================= */

export interface CartItemDto {
    cartItemId: number;
    productId: number;
    productName: string;
    productSku: string | null;
    priceAtThatTime: number;
    quantity: number;
    status: string;
    addedAt: string;
    subTotal: number;
    availableStock: number;
    mainImageUrl: string | null;
}

export interface CartDto {
    cartId: number;
    accountId: number;
    createdAt: string;
    updatedAt: string | null;
    items: CartItemDto[];
    totalAmount: number;
    totalItems: number;
}

export interface ApiResponse<T> {
    status: number;
    statusMessage: string;
    message: string;
    data: T | null;
}

/* ================= SERVICE ================= */

export const CustomerCartService = {
    // Lấy giỏ hàng
    async getCart(): Promise<ApiResponse<CartDto>> {
        const res = await axiosInstance.get(API_ENDPOINTS.CART);
        return res.data;
    },

    // Thêm sản phẩm vào giỏ
    async addToCart(productId: number, quantity: number): Promise<ApiResponse<CartDto>> {
        const res = await axiosInstance.post(API_ENDPOINTS.CART_ADD, {
            productId,
            quantity,
        });
        return res.data;
    },

    // Cập nhật số lượng
    async updateCartItem(cartItemId: number, quantity: number): Promise<ApiResponse<CartDto>> {
        const res = await axiosInstance.put(API_ENDPOINTS.CART_UPDATE, {
            cartItemId,
            quantity,
        });
        return res.data;
    },

    // Tăng số lượng +1
    async incrementItem(cartItemId: number): Promise<ApiResponse<CartDto>> {
        const res = await axiosInstance.patch(API_ENDPOINTS.CART_INCREMENT(cartItemId));
        return res.data;
    },

    // Giảm số lượng -1
    async decrementItem(cartItemId: number): Promise<ApiResponse<CartDto>> {
        const res = await axiosInstance.patch(API_ENDPOINTS.CART_DECREMENT(cartItemId));
        return res.data;
    },

    // Xóa 1 item
    async removeItem(cartItemId: number): Promise<ApiResponse<object>> {
        const res = await axiosInstance.delete(API_ENDPOINTS.CART_REMOVE(cartItemId));
        return res.data;
    },

    // Xóa toàn bộ giỏ hàng
    async clearCart(): Promise<ApiResponse<object>> {
        const res = await axiosInstance.delete(API_ENDPOINTS.CART_CLEAR);
        return res.data;
    },
};
