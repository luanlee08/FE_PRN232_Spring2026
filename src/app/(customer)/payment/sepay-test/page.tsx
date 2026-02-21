'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SepayTestPaymentPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);
    const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

    const orderId = searchParams.get('order_id');
    const amount = searchParams.get('amount');
    const isMock = searchParams.get('mock') === 'true';

    useEffect(() => {
        if (!isMock) {
            // Not a mock payment, redirect to real Sepay
            return;
        }

        // Simulate payment processing
        const timer = setTimeout(() => {
            setPaymentStatus('success');
            toast.success('Thanh toán thành công!');
        }, 3000);

        return () => clearTimeout(timer);
    }, [isMock]);

    useEffect(() => {
        if (paymentStatus === 'success') {
            const countdownTimer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(countdownTimer);
                        router.push('/cart'); // Or redirect to order details
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countdownTimer);
        }
    }, [paymentStatus, router]);

    const formatCurrency = (value: string | null) => {
        if (!value) return '0đ';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(parseInt(value));
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF6B35]/10 rounded-full mb-4">
                        <CreditCard className="w-8 h-8 text-[#FF6B35]" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {isMock ? 'TEST - Sepay Payment' : 'Sepay Payment'}
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">
                        {isMock ? 'Đây là môi trường test, không có giao dịch thật' : 'Cổng thanh toán Sepay'}
                    </p>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Mã đơn hàng:</span>
                        <span className="font-semibold text-gray-800">#{orderId}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-600">Số tiền:</span>
                        <span className="font-bold text-[#FF6B35] text-lg">{formatCurrency(amount)}</span>
                    </div>
                </div>

                {/* Payment Status */}
                <div className="text-center">
                    {paymentStatus === 'pending' && (
                        <div className="animate-pulse">
                            <div className="inline-block w-12 h-12 border-4 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Đang xử lý thanh toán...</p>
                        </div>
                    )}

                    {paymentStatus === 'success' && (
                        <div className="animate-fade-in">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Thanh toán thành công!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Đơn hàng #{orderId} đã được thanh toán
                            </p>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <p className="text-blue-800 text-sm">
                                    Tự động chuyển về trang chủ sau {countdown}s...
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/cart')}
                                className="w-full bg-[#FF6B35] text-white py-3 rounded-lg font-semibold hover:bg-[#FF5520] transition-colors"
                            >
                                Quay về ngay
                            </button>
                        </div>
                    )}

                    {paymentStatus === 'failed' && (
                        <div className="animate-fade-in">
                            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                Thanh toán thất bại
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Vui lòng thử lại sau
                            </p>
                            <button
                                onClick={() => router.back()}
                                className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Quay lại
                            </button>
                        </div>
                    )}
                </div>

                {/* Test Mode Warning */}
                {isMock && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-xs text-center">
                            ⚠️ Chế độ TEST - Không có giao dịch thật sự xảy ra
                        </p>
                    </div>
                )}

                {/* Dev Options */}
                {isMock && paymentStatus === 'pending' && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-3 text-center">Dev Tools:</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setPaymentStatus('success');
                                    toast.success('Simulate success');
                                }}
                                className="flex-1 bg-green-100 text-green-700 py-2 rounded text-sm hover:bg-green-200 transition-colors"
                            >
                                ✓ Success
                            </button>
                            <button
                                onClick={() => {
                                    setPaymentStatus('failed');
                                    toast.error('Simulate failed');
                                }}
                                className="flex-1 bg-red-100 text-red-700 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                            >
                                ✗ Failed
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
