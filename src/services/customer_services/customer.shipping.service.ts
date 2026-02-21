// services/customer_services/customer.shipping.service.ts

import axiosInstance from '@/lib/api/axios';
import { API_ENDPOINTS } from '@/configs/api-configs';
import { ApiResponse } from '@/types/common';
import { GetShippingMethodsResponse } from '@/types/order';

/* ================= SERVICE ================= */

export const CustomerShippingService = {
    // Lấy danh sách phương thức vận chuyển
    // Có thể truyền address info để tính phí thực tế từ GHN/GoShip
    async getShippingMethods(params?: {
        city?: string;
        district?: string;
        ward?: string;
        weight?: number;
        orderValue?: number;
        districtId?: number;
        wardCode?: string;
    }): Promise<ApiResponse<GetShippingMethodsResponse>> {
        const queryParams = new URLSearchParams();
        if (params?.city) queryParams.append('city', params.city);
        if (params?.district !== undefined && params?.district !== null) queryParams.append('district', params.district);
        if (params?.ward !== undefined && params?.ward !== null) queryParams.append('ward', params.ward);
        if (params?.weight) queryParams.append('weight', params.weight.toString());
        if (params?.orderValue) queryParams.append('orderValue', params.orderValue.toString());
        if (params?.districtId) queryParams.append('districtId', params.districtId.toString());
        if (params?.wardCode) queryParams.append('wardCode', params.wardCode);

        const url = params && Object.keys(params).length > 0
            ? `${API_ENDPOINTS.SHIPPING_METHODS}?${queryParams.toString()}`
            : API_ENDPOINTS.SHIPPING_METHODS;

        const res = await axiosInstance.get(url);
        return res.data;
    },

    // Tính phí vận chuyển cho một phương thức cụ thể
    async calculateFee(params: {
        city?: string;
        district?: string;
        ward?: string;
        weight?: number;
        orderValue?: number;
        carrier?: string;
    }): Promise<ApiResponse<number>> {
        const res = await axiosInstance.post(API_ENDPOINTS.SHIPPING_CALCULATE_FEE, params);
        return res.data;
    },
};
