import axios from 'axios';
import Cookies from 'js-cookie';
import { refreshAccessToken } from '../auth/auth-service';
import { API_BASE } from '@/configs/api-configs';

const axiosInstance = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Bỏ qua refresh token logic cho auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                          originalRequest.url?.includes('/auth/register') ||
                          originalRequest.url?.includes('/auth/verify-otp');
    
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        // Gọi API refresh token
        const newTokens = await refreshAccessToken(refreshToken);
        
        // Lưu token mới
        Cookies.set('accessToken', newTokens.accessToken, { expires: 1 });
        Cookies.set('refreshToken', newTokens.refreshToken, { expires: 7 });

        // Retry request với token mới
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại - logout
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('user');
        
        // Kiểm tra xem đang ở admin hay user route
        const isAdminRoute = window.location.pathname.startsWith('/admin');
        window.location.href = isAdminRoute ? '/admin/login' : '/login';
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
