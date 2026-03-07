"use client";
import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
  RefreshCw,
  CreditCard,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { CustomerWalletService } from "@/services/customer_services/customer.wallet.service";
import { WalletResponse, WalletTransactionResponse, TopUpRequest } from "@/types/wallet";

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

const GATEWAY_OPTIONS = [
  { value: "VNPay" as const, label: "VNPay", icon: "🏦", description: "Thẻ ATM, Visa, MasterCard" },
  { value: "Sepay" as const, label: "Sepay", icon: "🏧", description: "Chuyển khoản ngân hàng" },
];
const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

interface WalletTabProps {
  visible: boolean;
  refreshKey?: number;
}

export function WalletTab({ visible, refreshKey = 0 }: WalletTabProps) {
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [walletTxns, setWalletTxns] = useState<WalletTransactionResponse[]>([]);
  const [walletTotalCount, setWalletTotalCount] = useState(0);
  const [walletPage, setWalletPage] = useState(1);
  const walletPageSize = 10;
  const [walletFilterType, setWalletFilterType] = useState("");
  const [walletFilterDir, setWalletFilterDir] = useState("");
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [loadingWalletTxns, setLoadingWalletTxns] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  const [topUpAmountInput, setTopUpAmountInput] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<"VNPay" | "Sepay">("VNPay");
  const [submittingTopUp, setSubmittingTopUp] = useState(false);

  const fetchWallet = async () => {
    try {
      setLoadingWallet(true);
      const r = await CustomerWalletService.getWallet();
      if (r.status === 200 && r.data) setWallet(r.data);
    } catch {
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchWalletTxns = useCallback(async () => {
    try {
      setLoadingWalletTxns(true);
      const r = await CustomerWalletService.getTransactions({
        page: walletPage,
        pageSize: walletPageSize,
        type: walletFilterType || undefined,
        direction: walletFilterDir || undefined,
      });
      if (r.status === 200 && r.data) {
        setWalletTxns(r.data.items);
        setWalletTotalCount(r.data.totalCount);
      }
    } catch {
      toast.error("Không thể tải lịch sử ví");
    } finally {
      setLoadingWalletTxns(false);
    }
  }, [walletPage, walletPageSize, walletFilterType, walletFilterDir]);

  useEffect(() => {
    if (visible) {
      fetchWallet();
      fetchWalletTxns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, refreshKey]);

  useEffect(() => {
    if (visible) fetchWalletTxns();
  }, [visible, fetchWalletTxns]);

  const handleTopUp = async () => {
    if (topUpAmount < 10000) {
      toast.error("Tối thiểu 10,000 VND");
      return;
    }
    try {
      setSubmittingTopUp(true);
      const r = await CustomerWalletService.initiateTopUp({
        amount: topUpAmount,
        gateway: selectedGateway,
        returnUrl: `${window.location.origin}/profile?tab=wallet`,
      } as TopUpRequest);
      if (r.status === 200 && r.data?.paymentUrl) {
        toast.success("Đang chuyển đến trang thanh toán...");
        window.location.href = r.data.paymentUrl;
      } else toast.error(r.message || "Lỗi tạo yêu cầu nạp tiền");
    } catch {
      toast.error("Lỗi khi nạp tiền");
    } finally {
      setSubmittingTopUp(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <div className="bg-white rounded-sm">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium text-gray-800">Ví Của Tôi</h1>
            <p className="text-xs text-gray-400 mt-0.5">Quản lý số dư và lịch sử giao dịch</p>
          </div>
          <button
            onClick={() => {
              setShowTopUpModal(true);
              setTopUpAmount(0);
              setTopUpAmountInput("");
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
          >
            <CreditCard size={15} /> Nạp tiền
          </button>
        </div>

        {/* Balance card */}
        <div className="px-6 py-5 border-b border-gray-100">
          {loadingWallet ? (
            <div className="h-14 bg-gray-50 rounded animate-pulse w-48" />
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
                onClick={() => {
                  fetchWallet();
                  fetchWalletTxns();
                }}
                className="ml-2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                title="Làm mới"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3">
          <p className="text-xs text-gray-400 flex-1">Lịch sử giao dịch ({walletTotalCount})</p>
          <select
            value={walletFilterType}
            onChange={(e) => {
              setWalletFilterType(e.target.value);
              setWalletPage(1);
            }}
            className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-orange-400 transition"
          >
            <option value="">Tất cả loại</option>
            <option value="TopUp">Nạp tiền</option>
            <option value="Payment">Thanh toán</option>
            <option value="Refund">Hoàn tiền</option>
          </select>
          <select
            value={walletFilterDir}
            onChange={(e) => {
              setWalletFilterDir(e.target.value);
              setWalletPage(1);
            }}
            className="text-xs border border-gray-200 rounded px-2 py-1.5 bg-white focus:outline-none focus:border-orange-400 transition"
          >
            <option value="">Tất cả</option>
            <option value="In">Tiền vào</option>
            <option value="Out">Tiền ra</option>
          </select>
        </div>

        {/* Transaction list */}
        <div className="divide-y divide-gray-100">
          {loadingWalletTxns ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-gray-50 rounded animate-pulse" />
              ))}
            </div>
          ) : walletTxns.length === 0 ? (
            <div className="text-center py-16">
              <Wallet size={40} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Chưa có giao dịch nào</p>
              <p className="text-gray-300 text-xs mt-1">Nạp tiền để bắt đầu sử dụng ví</p>
            </div>
          ) : (
            walletTxns.map((txn) => {
              const isIn = txn.direction === "In";
              const statusConf = {
                Completed: { label: "Thành công", color: "text-emerald-600" },
                Pending: { label: "Đang xử lý", color: "text-amber-600" },
                Failed: { label: "Thất bại", color: "text-red-500" },
              } as const;
              const typeLabel =
                (
                  {
                    TopUp: "Nạp tiền",
                    Payment: "Thanh toán",
                    Refund: "Hoàn tiền",
                  } as Record<string, string>
                )[txn.txnType] ?? txn.txnType;
              const typeColor =
                (
                  {
                    TopUp: "bg-blue-50 text-blue-600",
                    Payment: "bg-orange-50 text-orange-600",
                    Refund: "bg-emerald-50 text-emerald-600",
                  } as Record<string, string>
                )[txn.txnType] ?? "bg-gray-50 text-gray-600";
              const sc = statusConf[txn.status as keyof typeof statusConf] ?? {
                label: txn.status,
                color: "text-gray-500",
              };
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
                          <span className={`text-[11px] font-medium ${sc.color}`}>{sc.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[240px]">
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
                        <p className="text-[12px] text-gray-500">
                          Số dư: {txn.balanceAfter.toLocaleString("vi-VN")}₫
                        </p>
                      )}
                      <p className="text-[12px] text-gray-400">
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

        {/* Pagination */}
        {Math.ceil(walletTotalCount / walletPageSize) > 1 && (
          <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Trang {walletPage}/{Math.ceil(walletTotalCount / walletPageSize)}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setWalletPage((p) => Math.max(1, p - 1))}
                disabled={walletPage <= 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-500"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() =>
                  setWalletPage((p) =>
                    Math.min(Math.ceil(walletTotalCount / walletPageSize), p + 1),
                  )
                }
                disabled={walletPage >= Math.ceil(walletTotalCount / walletPageSize)}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-gray-500"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══ TOP-UP MODAL ══ */}
      {showTopUpModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTopUpModal(false);
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">Nạp tiền vào ví</h2>
              <button
                onClick={() => setShowTopUpModal(false)}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Amount */}
              <div>
                <label className={labelCls}>
                  Số tiền nạp (VND) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={topUpAmountInput}
                  onChange={(e) => {
                    const n = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
                    setTopUpAmount(n);
                    setTopUpAmountInput(n > 0 ? n.toLocaleString("vi-VN") : "");
                  }}
                  placeholder="Nhập số tiền..."
                  className={inputCls}
                />
                {topUpAmount > 0 && topUpAmount < 10000 && (
                  <p className="text-xs text-red-400 mt-1">Tối thiểu 10,000 VND</p>
                )}
              </div>
              {/* Quick amounts */}
              <div>
                <p className="text-xs text-gray-400 mb-2">Chọn nhanh</p>
                <div className="grid grid-cols-3 gap-2">
                  {QUICK_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setTopUpAmount(amt);
                        setTopUpAmountInput(amt.toLocaleString("vi-VN"));
                      }}
                      className={`py-2 px-3 rounded text-sm border transition ${topUpAmount === amt ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 hover:border-orange-300 text-gray-600 hover:bg-orange-50/30"}`}
                    >
                      {(amt / 1000).toLocaleString("vi-VN")}K
                    </button>
                  ))}
                </div>
              </div>
              {/* Gateway */}
              <div>
                <p className={labelCls}>Phương thức thanh toán</p>
                <div className="space-y-2">
                  {GATEWAY_OPTIONS.map((gw) => (
                    <label
                      key={gw.value}
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedGateway === gw.value
                          ? "border-orange-400 bg-orange-50/50"
                          : "border-gray-200 hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="topup-gateway"
                        value={gw.value}
                        checked={selectedGateway === gw.value}
                        onChange={() => setSelectedGateway(gw.value)}
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
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                disabled={submittingTopUp}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-100 transition"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleTopUp}
                disabled={submittingTopUp || topUpAmount < 10000}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submittingTopUp && (
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
                {submittingTopUp
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
