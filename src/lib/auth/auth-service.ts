import axiosInstance from '../api/axios';
import Cookies from 'js-cookie';
import {
  RegisterRequest,
  VerifyOtpRequest,
  LoginRequest,
  LoginResponse,
  ApiResponse,
} from '@/types/auth';

export const authService = {
  // Đăng ký
  register: async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  // Xác thực OTP
  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/verify-otp', data);
    
    if (response.data.status === 201 && response.data.data) {
      // Lưu tokens vào cookies (auto login sau khi đăng ký)
      Cookies.set('accessToken', response.data.data.accessToken, { expires: 1 });
      Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.data.user), { expires: 7 });
    }
    
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/login', data);
    
    if (response.data.status === 200 && response.data.data) {
      // Lưu tokens vào cookies
      Cookies.set('accessToken', response.data.data.accessToken, { expires: 1 });
      Cookies.set('refreshToken', response.data.data.refreshToken, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.data.data.user), { expires: 7 });
    }
    
    return response.data;
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      Cookies.remove('user');
    }
  },

  // Lấy thông tin user hiện tại
  getCurrentUser: () => {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Kiểm tra đã đăng nhập
  isAuthenticated: (): boolean => {
    return !!Cookies.get('accessToken');
  },
};

// Hàm refresh token (dùng trong axios interceptor)
export const refreshAccessToken = async (
  refreshToken: string
): Promise<LoginResponse> => {
  const response = await axiosInstance.post('/auth/refresh-token', {
    refreshToken,
  });
  
  if (response.data.status !== 200) {
    throw new Error('Failed to refresh token');
  }
  
  return response.data.data;
};
