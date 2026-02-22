// services/customer_services/customer.address.service.ts

import axiosInstance from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/configs/api-configs';
import { ApiResponse } from '@/types/common';
import { AddressResponse, AddressRequest, AddressUpdateRequest } from '@/types/address';

/* ================= SERVICE ================= */

export const CustomerAddressService = {
    // Lấy tất cả địa chỉ của user
    async getAll(): Promise<ApiResponse<AddressResponse[]>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ADDRESSES);
        return res.data;
    },

    // Lấy 1 địa chỉ theo ID
    async getById(id: number): Promise<ApiResponse<AddressResponse>> {
        const res = await axiosInstance.get(API_ENDPOINTS.ADDRESS_BY_ID(id));
        return res.data;
    },

    // Tạo địa chỉ mới
    async create(data: AddressRequest): Promise<ApiResponse<AddressResponse>> {
        const res = await axiosInstance.post(API_ENDPOINTS.ADDRESSES, data);
        return res.data;
    },

    // Cập nhật địa chỉ
    async update(id: number, data: AddressUpdateRequest): Promise<ApiResponse<AddressResponse>> {
        const res = await axiosInstance.put(API_ENDPOINTS.ADDRESS_BY_ID(id), data);
        return res.data;
    },

    // Xóa địa chỉ
    async delete(id: number): Promise<ApiResponse<object>> {
        const res = await axiosInstance.delete(API_ENDPOINTS.ADDRESS_BY_ID(id));
        return res.data;
    },

    // Đặt địa chỉ làm mặc định
    async setDefault(id: number): Promise<ApiResponse<AddressResponse>> {
        const res = await axiosInstance.patch(API_ENDPOINTS.ADDRESS_SET_DEFAULT(id));
        return res.data;
    },
};
