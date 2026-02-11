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
      // Tự động login sau khi verify OTP thành công
      authService.saveLoginData(response.data.data);
    }
    
    return response.data;
  },

  // Đăng nhập
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  // Lưu thông tin đăng nhập (gọi từ hook sau khi check role)
  saveLoginData: (loginResponse: LoginResponse): void => {
    Cookies.set('accessToken', loginResponse.accessToken, { expires: 1 });
    Cookies.set('refreshToken', loginResponse.refreshToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(loginResponse.user), { expires: 7 });
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
    
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
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
