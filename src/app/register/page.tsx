'use client';

import { useState } from "react"

import React from "react"
import Link from 'next/link';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [authMethod, setAuthMethod] = useState<'email' | 'google'>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Đăng ký thành công!');
    }, 1500);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#FF6B35] to-[#E55A24] items-center justify-center relative overflow-hidden">
        {/* Luxury pattern background */}
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

        {/* Decorative elements */}
        <div className="absolute top-16 right-20 w-32 h-32 border border-white/15 rounded-3xl"></div>
        <div className="absolute bottom-24 left-16 w-24 h-24 border border-white/15 rounded-full"></div>
        <div className="absolute top-1/3 left-1/3 w-0.5 h-24 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
        <div className="absolute top-2/3 right-1/4 w-0.5 h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 text-center px-12">
          <span className="text-7xl block mb-8">👑</span>
          <h1 className="text-5xl font-bold text-white mb-6 tracking-wider">LorKingdom</h1>
          <p className="text-xl text-white/90 max-w-sm mb-8">
            Tham gia vương quốc đồ chơi ngay hôm nay
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold mb-4 text-white">Lợi ích thành viên:</h3>
            <ul className="space-y-2 text-white/90 text-sm">
              <li>Giảm giá exclusive cho thành viên</li>
              <li>Giao hàng nhanh miễn phí</li>
              <li>Điểm thưởng mỗi lần mua</li>
              <li>Thông báo ưu đãi mới nhất</li>
            </ul>
          </div>

          <p className="text-white/70 text-sm">Hơn 100.000 khách hàng hài lòng đã tham gia</p>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="lg:hidden text-center mb-8">
            <span className="text-5xl block mb-3">👑</span>
            <h1 className="text-3xl font-bold text-[#FF6B35]">LorKingdom</h1>
          </div>

          {/* Form Title */}
          <h2 className="text-3xl font-bold text-[#222] mb-2">Tạo Tài Khoản</h2>
          <p className="text-gray-600 mb-8">Tham gia để bắt đầu mua sắm</p>

          {/* Auth Method Tabs */}
          <div className="flex gap-3 mb-8 bg-[#F5F5F5] p-1.5 rounded-lg">
            <button
              onClick={() => setAuthMethod('email')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition text-sm ${
                authMethod === 'email'
                  ? 'bg-white text-[#FF6B35] shadow-sm'
                  : 'bg-transparent text-gray-600 hover:text-[#222]'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </button>
            <button
              onClick={() => setAuthMethod('google')}
              className={`flex-1 py-2.5 px-4 rounded-md font-medium transition text-sm ${
                authMethod === 'google'
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

          {/* Form */}
          {authMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">Họ và Tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition"
                    required
                  />
                </div>
              </div>

            {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">Mật Khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-medium text-[#222] mb-2">Xác Nhận Mật Khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-3 border border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#FF6B35]" required />
                <span className="text-sm text-gray-600">
                  Tôi đồng ý với{' '}
                  <a href="#" className="text-[#FF6B35] hover:underline font-medium">
                    Điều khoản dịch vụ
                  </a>
                </span>
              </label>

              {/* Signup Button */}
              <button
                type="submit"
                className="w-full bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold rounded-lg transition transform hover:scale-105 mt-6 py-3"
              >
                Tạo Tài Khoản
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button className="w-full py-3 border-2 border-[#FF6B35] text-[#FF6B35] font-semibold rounded-lg hover:bg-[#FFF5F0] transition flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Đăng Ký với Google
              </button>
              <p className="text-center text-gray-600 text-sm mt-4">
                Bạn sẽ được chuyển hướng để xác thực với Google
              </p>
            </div>
          )}

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Đã có tài khoản?{' '}
              <Link href="/login" className="text-[#FF6B35] hover:underline font-bold">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
