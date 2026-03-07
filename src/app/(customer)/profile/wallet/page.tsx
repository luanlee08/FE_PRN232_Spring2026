"use client";

import { Footer } from "@/components/customer/footer";
import {
  Wallet,
  ArrowLeft,
  CreditCard,
  RefreshCw,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomerWalletService } from "@/services/customer_services/customer.wallet.service";
import { WalletResponse, WalletTransactionResponse, TopUpRequest } from "@/types/wallet";
import toast from "react-hot-toast";
import Link from "next/link";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

const GATEWAY_OPTIONS = [
  { value: "VNPay" as const, label: "VNPay", icon: "🏦", description: "Thẻ ATM, Visa, MasterCard" },
  { value: "Sepay" as const, label: "Sepay", icon: "🏧", description: "Chuyển khoản ngân hàng" },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

const STATUS_CONFIG = {
  Completed: { label: "Thành công", color: "text-emerald-600" },
  Pending: { label: "Đang xử lý", color: "text-amber-600" },
  Failed: { label: "Thất bại", color: "text-red-500" },
} as const;

const TYPE_LABEL: Record<string, string> = {
  TopUp: "Nạp tiền",
  Payment: "Thanh toán",
  Refund: "Hoàn tiền",
};
const TYPE_COLOR: Record<string, string> = {
  TopUp: "bg-blue-50 text-blue-600",
  Payment: "bg-orange-50 text-orange-600",
  Refund: "bg-emerald-50 text-emerald-600",
};

const PAGE_SIZE = 10;

function WalletPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  /* ── wallet state ── */
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [txns, setTxns] = useState<WalletTransactionResponse[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [filterDir, setFilterDir] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [loadingTxns, setLoadingTxns] = useState(true);

  /* ── top-up modal state ── */
  const [showModal, setShowModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [topUpInput, setTopUpInput] = useState("");
  const [gateway, setGateway] = useState<"VNPay" | "Sepay">("VNPay");
  const [submitting, setSubmitting] = useState(false);

  /* ── auth guard ── */
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  const callbackHandledRef = useRef(false);

  /* ── gateway callback handling ── */
  useEffect(() => {
    if (callbackHandledRef.current) return;
    const status = searchParams.get("topup");
    const amount = searchParams.get("amount");
    if (status === "success") {
      callbackHandledRef.current = true;
      toast.success(
        `Nạp tiền thành công${amount ? ` +${Number(amount).toLocaleString("vi-VN")}₫` : ""}`,
      );
      router.replace("/profile?tab=wallet");
    } else if (status === "failed") {
      callbackHandledRef.current = true;
      toast.error("Nạp tiền thất bại. Vui lòng thử lại.");
      router.replace("/profile?tab=wallet");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── fetch wallet balance ── */
  const fetchWallet = async () => {
    try {
      setLoadingWallet(true);
      const r = await CustomerWalletService.getWallet();
      if (r.status === 200 && r.data) setWallet(r.data);
    } catch {
      // wallet not yet created is fine
    } finally {
      setLoadingWallet(false);
    }
  };

  /* ── fetch transactions ── */
  const fetchTxns = useCallback(async () => {
    try {
      setLoadingTxns(true);
      const r = await CustomerWalletService.getTransactions({
        page,
        pageSize: PAGE_SIZE,
        type: filterType || undefined,
        direction: filterDir || undefined,
      });
      if (r.status === 200 && r.data) {
        setTxns(r.data.items);
        setTotalCount(r.data.totalCount);
      }
    } catch {
      toast.error("Không thể tải lịch sử ví");
    } finally {
      setLoadingTxns(false);
    }
  }, [page, filterType, filterDir]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWallet();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) fetchTxns();
  }, [isAuthenticated, fetchTxns]);

  /* ── top-up handler ── */
  const handleTopUp = async () => {
    if (topUpAmount < 10000) {
      toast.error("Tối thiểu 10,000 VND");
      return;
    }
    try {
      setSubmitting(true);
      const r = await CustomerWalletService.initiateTopUp({
        amount: topUpAmount,
        gateway,
        returnUrl: `${window.location.origin}/profile?tab=wallet`,
      } as TopUpRequest);
      if (r.status === 200 && r.data?.paymentUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = r.data.paymentUrl;
      } else {
        toast.error(r.message || "Lỗi tạo yêu cầu nạp tiền");
      }
    } catch {
      toast.error("Lỗi khi nạp tiền");
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = () => {
    setTopUpAmount(0);
    setTopUpInput("");
    setGateway("VNPay");
    setShowModal(true);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  /* ── skeleton ── */
  if (authLoading)
    return (
      <>
        <div className="min-h-screen bg-[#f5f5f5] py-6">
          <div className="max-w-5xl mx-auto px-4 animate-pulse space-y-3">
            <div className="h-10 bg-white rounded-sm w-64" />
            <div className="h-32 bg-white rounded-sm" />
            <div className="h-48 bg-white rounded-sm" />
          </div>
        </div>
        <Footer />
      </>
    );

  if (!isAuthenticated) return null;

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f5] py-5 pb-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-sm">
            {/* ── header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                >
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-lg font-medium text-gray-800">Ví Của Tôi</h1>
                  <p className="text-xs text-gray-400 mt-0.5">Quản lý số dư và lịch sử giao dịch</p>
                </div>
              </div>
              <button
                onClick={openModal}
                className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
              >
                <CreditCard size={15} /> Nạp tiền
              </button>
            </div>

            {/* ── balance card ── */}
            <div className="px-6 py-5 border-b border-gray-100">
              {loadingWallet ? (
                <div className="h-14 bg-gray-50 rounded animate-pulse w-52" />
              ) : (
                <div className="flex items-end gap-2">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Số dư khả dụng</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {wallet ? wallet.balance.toLocaleString("vi-VN") + "₫" : "0₫"}
                    </p>
                    {wallet?.lastTransactionAt && (
                      <p className="text-xs text-gray-400 mt-1">
                        Giao dịch cuối:{" "}
                        {new Date(wallet.lastTransactionAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}
                    {!wallet && (
                      <p className="text-xs text-gray-400 mt-1">Nạp tiền lần đầu để kích hoạt ví</p>
                    )}
                  </div>
                  <button
                    onClick={fetchWallet}
                    className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                    title="Làm mới"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* ── filters ── */}
            <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
              <p className="text-xs text-gray-400 flex-1">Lịch sử giao dịch ({totalCount})</p>
              <select
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(1);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-orange-400 transition"
              >
                <option value="">Tất cả loại</option>
                <option value="TopUp">Nạp tiền</option>
                <option value="Payment">Thanh toán</option>
                <option value="Refund">Hoàn tiền</option>
              </select>
              <select
                value={filterDir}
                onChange={(e) => {
                  setFilterDir(e.target.value);
                  setPage(1);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-orange-400 transition"
              >
                <option value="">Tất cả</option>
                <option value="In">Tiền vào</option>
                <option value="Out">Tiền ra</option>
              </select>
            </div>

            {/* ── transaction list ── */}
            <div className="divide-y divide-gray-100">
              {loadingTxns ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
                  ))}
                </div>
              ) : txns.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet size={36} className="text-orange-300" />
                  </div>
                  <h3 className="text-base font-medium text-gray-700 mb-1">
                    Chưa có giao dịch nào
                  </h3>
                  <p className="text-sm text-gray-400 mb-6">Nạp tiền để bắt đầu sử dụng ví</p>
                  <button
                    onClick={openModal}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
                  >
                    Nạp tiền ngay
                  </button>
                </div>
              ) : (
                txns.map((txn) => {
                  const isIn = txn.direction === "In";
                  const sc = STATUS_CONFIG[txn.status as keyof typeof STATUS_CONFIG] ?? {
                    label: txn.status,
                    color: "text-gray-500",
                  };
                  const typeLabel = TYPE_LABEL[txn.txnType] ?? txn.txnType;
                  const typeColor = TYPE_COLOR[txn.txnType] ?? "bg-gray-50 text-gray-600";

                  return (
                    <div
                      key={txn.walletTransactionId}
                      className="px-5 py-4 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${isIn ? "bg-emerald-50" : "bg-red-50"}`}
                          >
                            {isIn ? (
                              <ArrowDownCircle size={17} className="text-emerald-500" />
                            ) : (
                              <ArrowUpCircle size={17} className="text-red-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${typeColor}`}
                              >
                                {typeLabel}
                              </span>
                              <span className={`text-[11px] font-medium ${sc.color}`}>
                                {sc.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                              {txn.reason ||
                                (txn.relatedOrderId
                                  ? `Đơn hàng #${txn.relatedOrderId}`
                                  : txn.method || "")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`text-sm font-bold ${
                              txn.status === "Failed"
                                ? "text-gray-400"
                                : isIn
                                  ? "text-emerald-600"
                                  : "text-red-500"
                            }`}
                          >
                            {txn.status === "Failed"
                              ? "0"
                              : (isIn ? "+" : "-") + txn.amount.toLocaleString("vi-VN")}
                            ₫
                          </p>
                          {txn.status !== "Failed" && (
                            <p className="text-[11px] text-gray-400">
                              Số dư: {txn.balanceAfter.toLocaleString("vi-VN")}₫
                            </p>
                          )}
                          <p className="text-[10px] text-gray-300">
                            {new Date(txn.createdAt).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── pagination ── */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Trang {page}/{totalPages}
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-500"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-500"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* ══ TOP-UP MODAL ══ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden">
            {/* modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Nạp tiền vào ví</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* modal body */}
            <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* amount input */}
              <div>
                <label className={labelCls}>
                  Số tiền nạp (VND) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={topUpInput}
                  onChange={(e) => {
                    const n = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                    setTopUpAmount(n);
                    setTopUpInput(n > 0 ? n.toLocaleString("vi-VN") : "");
                  }}
                  placeholder="Nhập số tiền..."
                  className={inputCls}
                />
                {topUpAmount > 0 && topUpAmount < 10000 && (
                  <p className="text-xs text-red-400 mt-1">Tối thiểu 10,000 VND</p>
                )}
              </div>

              {/* quick amounts */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Chọn nhanh</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setTopUpAmount(amt);
                        setTopUpInput(amt.toLocaleString("vi-VN"));
                      }}
                      className={`py-2 px-3 rounded text-sm border transition ${
                        topUpAmount === amt
                          ? "border-orange-400 bg-orange-50 text-orange-600"
                          : "border-gray-200 hover:border-orange-300 text-gray-600 hover:bg-orange-50/30"
                      }`}
                    >
                      {(amt / 1000).toLocaleString("vi-VN")}K
                    </button>
                  ))}
                </div>
              </div>

              {/* gateway */}
              <div>
                <p className={labelCls}>Phương thức thanh toán</p>
                <div className="space-y-2">
                  {GATEWAY_OPTIONS.map((gw) => (
                    <label
                      key={gw.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        gateway === gw.value
                          ? "border-orange-400 bg-orange-50/50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="topup-gateway"
                        value={gw.value}
                        checked={gateway === gw.value}
                        onChange={() => setGateway(gw.value)}
                        className="accent-orange-500"
                      />
                      <span className="text-xl">{gw.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{gw.label}</p>
                        <p className="text-xs text-gray-400">{gw.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* modal footer */}
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-100 transition"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleTopUp}
                disabled={submitting || topUpAmount < 10000}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {submitting
                  ? "Đang xử lý..."
                  : `Nạp ${topUpAmount >= 10000 ? topUpAmount.toLocaleString("vi-VN") + "₫" : "tiền"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={null}>
      <WalletPageContent />
    </Suspense>
  );
}
