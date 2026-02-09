import { useState } from 'react';
import { authService } from '@/lib/auth/auth-service';
import { LoginRequest } from '@/types/auth';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

export const useAdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response.status === 200) {
        // Kiểm tra role - chỉ cho phép Staff/Warehouse/Admin đăng nhập
        const allowedRoles = ['Staff', 'Warehouse', 'Admin'];
        const userRole = response.data?.user?.roleName;
        
        if (!userRole || !allowedRoles.includes(userRole)) {
          // Clear cookies nhưng KHÔNG gọi logout() để tránh trigger side effects
          // Làm thủ công để tránh AuthContext update gây unmount/remount
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          Cookies.remove('user');
          
          // Trả về lỗi để frontend hiển thị
          return { 
            success: false, 
            message: 'Tài khoản này không có quyền truy cập hệ thống quản trị'
          };
        }
        
        toast.success(response.message);
        return { success: true };
      } else {
        // Không hiện toast - để page tự xử lý hiển thị lỗi dưới textbox
        return { 
          success: false, 
          message: response.message,
          errors: response.data 
        };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      const errors = error.response?.data?.data; 
      
      // Không hiện toast - để page tự xử lý hiển thị lỗi dưới textbox
      return { 
        success: false, 
        message,
        errors 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
};
