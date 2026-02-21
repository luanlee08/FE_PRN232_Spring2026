// Address types matching backend DTOs

export interface AddressResponse {
    addressId: number;
    accountId: number;
    recipientName?: string;
    phoneNumber?: string;
    addressLine: string;
    district?: string;
    ward?: string;
    city: string;
    // GHN IDs (for shipping fee calculation)
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
    isDefault: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface AddressRequest {
    recipientName: string;
    phoneNumber: string;
    addressLine: string;
    district?: string;
    ward?: string;
    city: string;
    // GHN IDs (for shipping fee calculation)
    provinceId?: number;
    districtId?: number;
    wardCode?: string;
    isDefault: boolean;
}

export interface AddressUpdateRequest extends AddressRequest {
    // Required by backend: must match the ID in the URL
    addressId: number;
}
