import { useState } from 'react';
import { authService } from '@/lib/auth/auth-service';
import { VerifyOtpRequest } from '@/types/auth';
import { useAuth } from '@/lib/auth/auth-context';
import toast from 'react-hot-toast';

export const useVerifyOtp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();

  const verifyOtp = async (data: VerifyOtpRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(data);
      
      if (response.status === 201) {
        toast.success(response.message);
        refreshUser(); // Update auth context để hiển thị user trên header
        return { success: true };
      } else {
        const errorMessage = response.message || 'Xác thực OTP thất bại';
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xác thực OTP thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyOtp, isLoading };
};
