import { useState } from 'react';
import { authService } from '@/lib/auth/auth-service';
import { RegisterRequest } from '@/types/auth';
import toast from 'react-hot-toast';

export const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      
      if (response.status === 200) {
        toast.success(response.message);
        return { success: true, email: response.data };
      } else {
        // Không hiện toast khi có validation errors
        if (!response.data) {
          toast.error(response.message || 'Đăng ký thất bại');
        }
        
        return { 
          success: false, 
          message: response.message,
          errors: response.data 
        };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
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

  return { register, isLoading };
};
