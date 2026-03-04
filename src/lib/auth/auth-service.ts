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
  register: async (data: RegisterRequest): Promise<ApiResponse<string>> => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },

  verifyOtp: async (data: VerifyOtpRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/verify-otp', data);
    
    if (response.data.status === 201 && response.data.data) {
      authService.saveLoginData(response.data.data);
    }
    
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },

  googleLogin: async (accessToken: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/google-login', { accessToken });
    return response.data;
  },

  googleRegister: async (accessToken: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await axiosInstance.post('/auth/google-register', { accessToken });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<boolean>> => {
    const response = await axiosInstance.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  saveLoginData: (loginResponse: LoginResponse): void => {
    Cookies.set('accessToken', loginResponse.accessToken, { expires: 1 });
    Cookies.set('refreshToken', loginResponse.refreshToken, { expires: 7 });
    Cookies.set('user', JSON.stringify(loginResponse.user), { expires: 7 });
  },

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

  getCurrentUser: () => {
    const userStr = Cookies.get('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!Cookies.get('accessToken');
  },
};

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
