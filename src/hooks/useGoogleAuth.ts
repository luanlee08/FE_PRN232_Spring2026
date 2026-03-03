import { useState } from 'react';
import { authService } from '@/lib/auth/auth-service';
import toast from 'react-hot-toast';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const googleLogin = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleLogin(accessToken);

      if (response.status === 200) {
        if (response.data?.user?.roleName !== 'Customer') {
          toast.error('Tài khoản này không có quyền truy cập trang người dùng');
          return { success: false, message: 'Không có quyền truy cập' };
        }

        if (response.data) {
          authService.saveLoginData(response.data);
          toast.success(response.message || 'Đăng nhập thành công');
          return { success: true };
        }

        return { success: false, message: 'Đăng nhập thành công nhưng không có dữ liệu trả về' };
      } else {
        toast.error(response.message || 'Đăng nhập thất bại');
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const googleRegister = async (accessToken: string) => {
    setIsLoading(true);
    try {
      const response = await authService.googleRegister(accessToken);

      if (response.status === 201 || response.status === 200) {
        if (response.data?.user?.roleName !== 'Customer') {
          toast.error('Tài khoản này không có quyền truy cập trang người dùng');
          return { success: false, message: 'Không có quyền truy cập' };
        }

        if (response.data) {
          authService.saveLoginData(response.data);
          toast.success(response.message || 'Đăng ký tài khoản thành công');
          return { success: true };
        }

        return { success: false, message: 'Đăng ký thành công nhưng không có dữ liệu trả về' };
      } else {
        toast.error(response.message || 'Đăng ký thất bại');
        return { success: false, message: response.message };
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return { googleLogin, googleRegister, isLoading };
};
