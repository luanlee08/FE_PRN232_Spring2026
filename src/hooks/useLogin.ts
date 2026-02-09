import { useState } from 'react';
import { authService } from '@/lib/auth/auth-service';
import { LoginRequest } from '@/types/auth';
import toast from 'react-hot-toast';

export const useLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      
      if (response.status === 200) {
        // Kiểm tra role - chỉ cho phép Customer đăng nhập tại trang user
        if (response.data?.user?.roleName !== 'Customer') {
          // Logout ngay nếu không phải Customer
          await authService.logout();
          toast.error('Tài khoản này không có quyền truy cập trang người dùng');
          return { success: false, message: 'Không có quyền truy cập' };
        }
        
        toast.success(response.message);
        return { success: true };
      } else {
// Không hiện toast khi có validation errors
      if (!response.data) {
          toast.error(response.message || 'Đăng nhập thất bại');
        }
        
        return { 
          success: false, 
          message: response.message,
          errors: response.data 
        };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      const errors = error.response?.data?.data; 
      
      // Chỉ hiện toast nếu không có validation errors
      if (!errors) {
        toast.error(message);
      }
      
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
