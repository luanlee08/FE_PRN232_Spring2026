import { API_BASE } from "../../configs/api-configs";
import Cookies from "js-cookie";

export interface ProfileResponse {
  accountId: number;
  accountName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  roleId?: number;
  roleName?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateProfileRequest {
  accountName: string;
  phoneNumber?: string;
}

interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T;
}

const PROFILE_ENDPOINT = `${API_BASE}/api/profile`;

export const CustomerProfileService = {
  async getProfile(): Promise<ApiResponse<ProfileResponse>> {
    const token = Cookies.get("accessToken");
    const response = await fetch(PROFILE_ENDPOINT, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error: any = new Error(`Failed to fetch profile`);
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<ApiResponse<boolean>> {
    const token = Cookies.get("accessToken");
    const response = await fetch(PROFILE_ENDPOINT, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    return response.json();
  },

  async updateAvatar(file: File): Promise<ApiResponse<string>> {
    const token = Cookies.get("accessToken");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${PROFILE_ENDPOINT}/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to update avatar");
    }

    return response.json();
  },
};
