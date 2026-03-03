'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useLogin } from '@/hooks/useLogin';
import { useGoogleAuth } from '@/hooks/useGoogleAuth';
import { useAuth } from '@/lib/auth/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useLogin();
  const { googleLogin, isLoading: isGoogleLoading } = useGoogleAuth();
  const { refreshUser } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = await login({ email, password });

    if (result.success) {
      refreshUser();

      setTimeout(() => {
        router.push('/');
      }, 1000);
    } else if (result.errors) {
      const backendErrors: { [key: string]: string } = {};

      Object.keys(result.errors).forEach((key) => {
        const fieldName = key.toLowerCase();
        const errorMessages = result.errors[key];

        if (Array.isArray(errorMessages) && errorMessages.length > 0) {
          backendErrors[fieldName] = errorMessages[0];
        }
      });

      setErrors(backendErrors);
    } else if (result.message) {
      const errorMessage = result.message;

      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('mật khẩu') || errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      } else {
        setErrors({ email: errorMessage });
      }
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const result = await googleLogin(tokenResponse.access_token);
      if (result.success) {
        refreshUser();
        setTimeout(() => {
          router.push('/');
        }, 1000);
      }
    },
    onError: () => {
      setErrors({ google: 'Đăng nhập Google thất bại. Vui lòng thử lại.' });
    },
  });

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Premium Background */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FF6B35] to-[#E55A24] relative overflow-hidden items-center justify-center">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="premium-lines" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#premium-lines)" />
        </svg>

        <div className="absolute top-16 right-20 w-32 h-32 border border-white/15 rounded-3xl"></div>
        <div className="absolute bottom-24 left-16 w-24 h-24 border border-white/15 rounded-full"></div>
        <div className="absolute top-1/3 left-1/3 w-0.5 h-24 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
        <div className="absolute top-2/3 right-1/4 w-0.5 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

        <div className="relative z-10 text-center px-12">
          <span className="text-7xl block mb-8">👑</span>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-wider">LorKingdom</h1>
          <p className="text-xl text-white/90 max-w-sm">
            Vào vương quốc đồ chơi thần kỳ nơi niềm vui không có giới hạn
          </p>
          <div className="flex gap-2 justify-center mt-10">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
            <div className="w-2 h-2 bg-white/30 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl block mb-3">👑</span>
            <h1 className="text-3xl font-bold text-[#FF6B35]">LorKingdom</h1>
          </div>

          <h2 className="text-3xl font-bold text-[#222] mb-2">Đăng Nhập</h2>
          <p className="text-gray-600 mb-8">Chào mừng bạn quay trở lại</p>

          {/* Auth Method Tabs */}
          <div className="flex gap-3 mb-8 bg-[#F5F5F5] p-1.5 rounded-lg">
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition text-sm ${authMethod === 'email'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'bg-transparent text-gray-600 hover:text-[#222]'
                }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition text-sm ${authMethod === 'google'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'bg-transparent text-gray-600 hover:text-[#222]'
                }`}
            >
              <svg className="w-4 h-4 inline mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          {/* Email Form */}
          {authMethod === 'email' && (
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition ${errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#E8E8E8] focus:border-[#FF6B35] focus:ring-[#FF6B35]'
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">Mật Khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-1 transition ${errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-[#E8E8E8] focus:border-[#FF6B35] focus:ring-[#FF6B35]'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#E8E8E8] text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer"
                  />
                  <span className="text-gray-600">Ghi nhớ tôi</span>
                </label>
                <a href="#" className="text-sm text-[#FF6B35] hover:underline font-medium">
                  Quên mật khẩu?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold rounded-lg transition transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
              </button>
            </form>
          )}

          {/* Google Login */}
          {authMethod === 'google' && (
            <div className="space-y-4">
              {errors.google && (
                <p className="text-sm text-red-500 text-center">{errors.google}</p>
              )}
              <button
                onClick={() => triggerGoogleLogin()}
                disabled={isGoogleLoading}
                className="w-full py-3 border-2 border-[#FF6B35] text-[#FF6B35] font-semibold rounded-lg hover:bg-[#FFF5F0] transition flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <span>Đang xử lý...</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Đăng Nhập với Google
                  </>
                )}
              </button>
              <p className="text-center text-gray-500 text-xs mt-3">
                Chỉ tài khoản đã đăng ký bằng Google mới có thể đăng nhập tại đây.
              </p>
            </div>
          )}

          <p className="text-center text-gray-600 mt-8 text-sm">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="text-[#FF6B35] font-semibold hover:underline">
              Đăng Ký Ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
