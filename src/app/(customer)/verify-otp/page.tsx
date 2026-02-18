'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useVerifyOtp } from '@/hooks/useVerifyOtp';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  
  const { verifyOtp, isLoading } = useVerifyOtp();
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(300); // 5 phút = 300 giây
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      router.push('/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    const lastFilledIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      alert('Vui lòng nhập đầy đủ 6 số OTP');
      return;
    }

    const result = await verifyOtp({ email, otpCode });

    if (result.success) {
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FF6B35] to-[#E55A24] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Pattern */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="otp-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <line x1="100" y1="0" x2="0" y2="100" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#otp-pattern)" />
      </svg>

      {/* Card */}
      <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FFF5F0] rounded-full mb-4">
            <span className="text-4xl">✉️</span>
          </div>
          <h1 className="text-3xl font-bold text-[#222] mb-2">Xác Thực Email</h1>
          <p className="text-gray-600">
            Chúng tôi đã gửi mã OTP đến<br />
            <span className="font-semibold text-[#FF6B35]">{email}</span>
          </p>
        </div>

        {/* OTP Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-[#222] mb-3 text-center">
              Nhập Mã OTP
            </label>
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-[#E8E8E8] rounded-lg focus:outline-none focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 transition"
                />
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Mã OTP sẽ hết hạn trong:{' '}
              <span className={`font-bold ${timeLeft < 60 ? 'text-red-500' : 'text-[#FF6B35]'}`}>
                {formatTime(timeLeft)}
              </span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || timeLeft === 0}
            className="w-full bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold rounded-lg py-3 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Đang xác thực...' : 'Xác Thực'}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Không nhận được mã?{' '}
            <button
              onClick={() => router.push('/register')}
              className="text-[#FF6B35] font-semibold hover:underline"
            >
              Gửi lại
            </button>
          </p>
        </div>

        {/* Back to Register */}
        <div className="mt-4 text-center">
          <Link
            href="/register"
            className="text-sm text-gray-500 hover:text-[#FF6B35] transition"
          >
             Quay lại đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
