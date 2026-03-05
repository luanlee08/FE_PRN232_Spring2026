"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle, XCircle, Loader2, Wallet } from "lucide-react";
import toast from "react-hot-toast";
import { API_BASE } from "@/configs/api-configs";

type PaymentStatus = "pending" | "processing" | "success" | "failed";

function SepayTestPaymentPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [processingMsg, setProcessingMsg] = useState("Đang xử lý thanh toán...");

  const orderId = searchParams.get("order_id") ?? "";
  const amount = searchParams.get("amount") ?? "0";
  const isMock = searchParams.get("mock") === "true";

  // Detect context: top-up or order payment
  const isTopUp = orderId.startsWith("TOPUP_");

  const formatCurrency = (value: string) => {
    const n = parseInt(value) || 0;
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
  };

  /** Call the backend webhook to actually complete the transaction in DB */
  const callWebhook = async (status: "success" | "failed") => {
    try {
      const ts = Math.floor(Date.now() / 1000);
      const body = {
        order_id: orderId,
        transaction_id: `MOCK-TXN-${Date.now()}`,
        reference_number: `MOCK-REF-${Date.now()}`,
        amount: parseInt(amount),
        content: isTopUp ? `Nap vi LorKingDom MOCK` : `Thanh toan don hang MOCK`,
        status,
        bank_code: "MOCK",
        account_number: "0000000000",
        timestamp: ts,
        signature: "mock-signature", // bypassed in SP-TEST mode
      };

      await fetch(`${API_BASE}/api/CWallet/topup/webhook/sepay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      console.warn("[SepayMock] Webhook call failed:", e);
    }
  };

  const redirectAfter = (status: "success" | "failed") => {
    if (isTopUp) {
      const dest =
        status === "success"
          ? `/profile/wallet?topup=success&amount=${amount}`
          : `/profile/wallet?topup=failed`;
      router.push(dest);
    } else {
      router.push(status === "success" ? "/profile?tab=orders" : "/cart");
    }
  };

  /** Simulate payment: show spinner, call webhook, show result, then redirect */
  const simulate = async (result: "success" | "failed") => {
    setPaymentStatus("processing");
    setProcessingMsg("Đang xác thực giao dịch với ngân hàng...");

    await callWebhook(result);

    if (result === "success") {
      toast.success(isTopUp ? "Nạp tiền thành công!" : "Thanh toán thành công!");
      setPaymentStatus("success");
    } else {
      toast.error(isTopUp ? "Nạp tiền thất bại!" : "Thanh toán thất bại!");
      setPaymentStatus("failed");
    }
  };

  // Auto-simulate success after 3 s in mock mode
  useEffect(() => {
    if (!isMock) return;
    const t = setTimeout(() => simulate("success"), 3000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMock]);

  // Countdown + redirect after success
  useEffect(() => {
    if (paymentStatus !== "success") return;
    if (countdown <= 0) {
      redirectAfter("success");
      return;
    }
    const t = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(t);
          redirectAfter("success");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentStatus]);

  const destLabel = isTopUp ? "trang ví" : "đơn hàng";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] px-8 py-6 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-full mb-3">
            {isTopUp ? (
              <Wallet className="w-7 h-7 text-white" />
            ) : (
              <CreditCard className="w-7 h-7 text-white" />
            )}
          </div>
          <h1 className="text-xl font-bold">{isMock ? "TEST — Sepay Payment" : "Sepay Payment"}</h1>
          <p className="text-white/80 text-sm mt-1">
            {isTopUp ? "Nạp tiền vào ví LorKingdom" : "Thanh toán đơn hàng"}
            {isMock && " · Môi trường thử nghiệm"}
          </p>
        </div>

        {/* Order Info */}
        <div className="px-8 py-4 border-b border-gray-100 bg-gray-50">
          <div className="flex justify-between text-sm mb-1.5">
            <span className="text-gray-500">{isTopUp ? "Mã giao dịch:" : "Mã đơn hàng:"}</span>
            <span className="font-medium text-gray-800 truncate max-w-[220px] text-right">
              #{orderId}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Số tiền:</span>
            <span className="font-bold text-[#FF6B35] text-base">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Status Body */}
        <div className="px-8 py-8 text-center">
          {/* Pending / Processing */}
          {(paymentStatus === "pending" || paymentStatus === "processing") && (
            <div>
              <Loader2 className="w-14 h-14 text-[#FF6B35] mx-auto mb-4 animate-spin" />
              <p className="text-gray-700 font-medium">{processingMsg}</p>
              <p className="text-gray-400 text-sm mt-1">Vui lòng không đóng trang này</p>
            </div>
          )}

          {/* Success */}
          {paymentStatus === "success" && (
            <div>
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {isTopUp ? "Nạp tiền thành công!" : "Thanh toán thành công!"}
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                {isTopUp
                  ? `${formatCurrency(amount)} đã được nạp vào ví LorKingdom`
                  : `Đơn hàng #${orderId} đã được thanh toán`}
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 mb-5">
                <p className="text-emerald-700 text-sm font-medium">
                  Tự động chuyển đến {destLabel} sau <span className="font-bold">{countdown}s</span>
                  ...
                </p>
              </div>
              <button
                onClick={() => redirectAfter("success")}
                className="w-full bg-[#FF6B35] hover:bg-[#E55A24] text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {isTopUp ? "Xem ví ngay" : "Xem đơn hàng"}
              </button>
            </div>
          )}

          {/* Failed */}
          {paymentStatus === "failed" && (
            <div>
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {isTopUp ? "Nạp tiền thất bại" : "Thanh toán thất bại"}
              </h3>
              <p className="text-gray-500 text-sm mb-5">
                Giao dịch không thành công. Vui lòng thử lại.
              </p>
              <button
                onClick={() => redirectAfter("failed")}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {isTopUp ? "Quay lại ví" : "Quay lại giỏ hàng"}
              </button>
            </div>
          )}
        </div>

        {/* Mock Dev Tools */}
        {isMock && (paymentStatus === "pending" || paymentStatus === "processing") && (
          <div className="px-8 pb-6 border-t border-dashed border-gray-200 pt-4">
            <p className="text-xs text-gray-400 mb-3 text-center">⚡ Dev Tools</p>
            <div className="flex gap-2">
              <button
                onClick={() => simulate("success")}
                disabled={paymentStatus === "processing"}
                className="flex-1 bg-emerald-100 text-emerald-700 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-200 transition-colors disabled:opacity-50"
              >
                ✓ Thành công
              </button>
              <button
                onClick={() => simulate("failed")}
                disabled={paymentStatus === "processing"}
                className="flex-1 bg-red-100 text-red-700 py-2.5 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                ✗ Thất bại
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SepayTestPaymentPage() {
  return (
    <Suspense fallback={null}>
      <SepayTestPaymentPageContent />
    </Suspense>
  );
}
