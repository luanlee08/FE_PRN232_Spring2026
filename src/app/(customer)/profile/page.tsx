"use client";
import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  ClipboardList,
  Ticket,
  LogOut,
  Camera,
  X,
  Plus,
  Trash2,
  Star,
  Package,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Check,
  Search,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
  CreditCard,
  FileText,
  Inbox,
  ArrowDownCircle,
  Wallet,
} from "lucide-react";
import {
  CustomerProfileService,
  ProfileResponse,
} from "@/services/customer_services/customer.profile.service";
import { CustomerAddressService } from "@/services/customer_services/customer.address.service";
import {
  CustomerOrderService,
  GHNTrackingDetail,
} from "@/services/customer_services/customer.order.service";
import { AddressResponse, AddressRequest, AddressUpdateRequest } from "@/types/address";
import { OrderDto, RefundDto, CreateRefundRequest } from "@/types/order";
import { LocationService, Province, District, Ward } from "@/services/location.service";
import { useAuth } from "@/lib/auth/auth-context";
import { authService } from "@/lib/auth/auth-service";
import { Footer } from "@/components/customer/footer";
import { API_BASE } from "@/configs/api-configs";
import Cookies from "js-cookie";
import { useShippingStatus } from "@/hooks/useShippingStatus";
import { WalletTab } from "@/components/customer/wallet-tab";
import { CustomerReviewService } from "@/services/customer_services/customer.review.service";
import { ReviewResponse } from "@/types/review";
import { WriteReviewModal } from "@/components/customer/write-review-modal";
import Image from "next/image";

type Tab = "profile" | "addresses" | "orders" | "vouchers" | "wallet";
type StatusKey =
  | "all"
  | "pending"
  | "processing"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "refunded";

/* ── helpers ── */
const imgUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

const STATUS_MAP: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: "Chờ xác nhận",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-200",
    icon: Clock,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  processing: {
    label: "Đã xác nhận",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200",
    icon: CheckCircle,
  },
  shipped: {
    label: "Đang giao",
    color: "text-violet-600",
    bg: "bg-violet-50 border-violet-200",
    icon: Truck,
  },
  delivered: {
    label: "Đã giao hàng",
    color: "text-emerald-600",
    bg: "bg-emerald-50 border-emerald-200",
    icon: CheckCircle,
  },
  completed: {
    label: "Hoàn tất",
    color: "text-green-700",
    bg: "bg-green-50 border-green-300",
    icon: CheckCircle,
  },
  refunded: {
    label: "Đã hoàn tiền",
    color: "text-indigo-600",
    bg: "bg-indigo-50 border-indigo-200",
    icon: ArrowDownCircle,
  },
  cancelled: {
    label: "Đã huỷ",
    color: "text-red-500",
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
  },
};
const ORDER_TABS: { key: StatusKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "confirmed", label: "Đã xác nhận" },
  { key: "shipped", label: "Đang giao" },
  { key: "delivered", label: "Đã giao hàng" },
  { key: "completed", label: "Hoàn tất" },
  { key: "cancelled", label: "Đã huỷ" },
];
const ORDER_PAGE_SIZE = 5;

const fmtVND = (n: number) => n?.toLocaleString("vi-VN") + "₫";
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

/* ── hover nav ── */
type SubItem = { label: string; action?: (setTab: (t: Tab) => void) => void; href?: string };
const SUB_MENUS: Record<Tab, SubItem[]> = {
  profile: [{ label: "Thông tin cá nhân", action: (s) => s("profile") }],
  addresses: [{ label: "Địa chỉ của tôi", action: (s) => s("addresses") }],
  orders: [{ label: "Đơn mua của tôi", action: (s) => s("orders") }],
  vouchers: [{ label: "Kho voucher", action: (s) => s("vouchers") }],
  wallet: [{ label: "Ví của tôi", action: (s) => s("wallet") }],
};

function SideNavItem({
  id,
  label,
  icon: Icon,
  active,
  onSelect,
  setTab,
  href,
}: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  active: boolean;
  onSelect: (id: Tab) => void;
  setTab: (t: Tab) => void;
  href?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 200);
  };
  return (
    <div className="relative overflow-visible" onMouseEnter={enter} onMouseLeave={leave}>
      <button
        onClick={() => {
          if (href) {
            router.push(href);
          } else {
            onSelect(id);
          }
          setOpen(false);
        }}
        className={`w-full relative flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 text-left select-none
          ${
            active
              ? "text-orange-600 bg-orange-50/50 font-bold"
              : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/30"
          }`}
      >
        {/* Active Indicator Bar */}
        <div
          className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-all duration-300 ${active ? "bg-orange-500 opacity-100" : "bg-transparent opacity-0"}`}
        />

        <Icon
          size={18}
          className={`transition-colors duration-200 ${active ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"}`}
        />
        <span className="flex-1 truncate">{label}</span>
        {active && <ChevronRight size={14} className="text-orange-400/70 shrink-0 animate-pulse" />}
      </button>

      {open && <div className="absolute left-full top-0 w-2 h-full" />}
      {open && (
        <div
          onMouseEnter={enter}
          onMouseLeave={leave}
          className="absolute left-full top-0 ml-2 z-9999 w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-1.5 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200"
        >
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          </div>
          {SUB_MENUS[id].map((sub, i) => (
            <button
              key={i}
              onClick={() => {
                if (sub.href) router.push(sub.href);
                else if (sub.action) sub.action(setTab);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-150 flex items-center justify-between group"
            >
              <span>{sub.label}</span>
              <ChevronRight
                size={12}
                className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ GHN STATUS BADGE ═══════════ */
function GHNStatusBadge({ status, label }: { status: string; label?: string }) {
  type Cfg = { bg: string; text: string };
  const map: Record<string, Cfg> = {
    ready_to_pick: { bg: "bg-amber-50 border border-amber-200", text: "text-amber-600" },
    picking: { bg: "bg-blue-50 border border-blue-200", text: "text-blue-600" },
    picked: { bg: "bg-blue-50 border border-blue-200", text: "text-blue-700" },
    storing: { bg: "bg-indigo-50 border border-indigo-200", text: "text-indigo-600" },
    transporting: { bg: "bg-yellow-50 border border-yellow-200", text: "text-yellow-700" },
    delivering: { bg: "bg-orange-50 border border-orange-200", text: "text-orange-600" },
    delivered: { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700" },
    return: { bg: "bg-red-50 border border-red-200", text: "text-red-500" },
    returned: { bg: "bg-red-50 border border-red-200", text: "text-red-600" },
    exception: { bg: "bg-red-50 border border-red-200", text: "text-red-600" },
    cancel: { bg: "bg-gray-100 border border-gray-200", text: "text-gray-500" },
  };
  const defaultLabel: Record<string, string> = {
    ready_to_pick: "Chờ lấy hàng",
    picking: "Đang lấy hàng",
    picked: "Đã lấy hàng",
    storing: "Đang lưu kho",
    transporting: "Đang vận chuyển",
    delivering: "Đang giao hàng",
    delivered: "Đã giao hàng",
    return: "Đang hoàn hàng",
    returned: "Đã hoàn hàng",
    exception: "Ngoại lệ",
    cancel: "Đã hủy",
  };
  const key = status?.toLowerCase() ?? "";
  const cfg = map[key] ?? { bg: "bg-gray-50 border border-gray-200", text: "text-gray-500" };
  const display = label ?? defaultLabel[key] ?? status ?? "—";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {display}
    </span>
  );
}

/* ═══════════ PAGE ═══════════ */
function CustomerProfilePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, logout } = useAuth();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "profile");

  /* ── deep-link: /profile?tab=orders — reactive to URL changes ── */
  useEffect(() => {
    const validTabs: Tab[] = ["profile", "addresses", "orders", "vouchers", "wallet"];
    const t = searchParams.get("tab") as Tab | null;
    if (t && validTabs.includes(t)) setTab(t);
  }, [searchParams]);

  /* ── profile state ── */
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [form, setForm] = useState({ accountName: "", phoneNumber: "" });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  /* ── change password state ── */
  const [changePwForm, setChangePwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePwLoading, setChangePwLoading] = useState(false);
  const [googlePwChanged, setGooglePwChanged] = useState(false);

  /* ── addresses state ── */
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressResponse | null>(null);
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const emptyAddrForm = (): AddressRequest => ({
    recipientName: "",
    phoneNumber: "",
    addressLine: "",
    district: "",
    ward: "",
    city: "",
    isDefault: false,
  });
  const [addrForm, setAddrForm] = useState<AddressRequest>(emptyAddrForm());
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selProv, setSelProv] = useState<number | null>(null);
  const [selDist, setSelDist] = useState<number | null>(null);
  const [selWard, setSelWard] = useState<string | null>(null);

  /* ── orders state ── */
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [orderTotalCount, setOrderTotalCount] = useState(0);
  const [orderPage, setOrderPage] = useState(1);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderTab, setOrderTab] = useState<StatusKey>("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [confirming, setConfirming] = useState<number | null>(null);

  /* ── review state ── */
  const [ordersViewMode, setOrdersViewMode] = useState<"orders" | "reviews">("orders");
  const [reviewSubTab, setReviewSubTab] = useState<"pending" | "done">("pending");
  const [completedOrders, setCompletedOrders] = useState<OrderDto[]>([]);
  const [loadingCompletedOrders, setLoadingCompletedOrders] = useState(false);
  const [writeReviewTarget, setWriteReviewTarget] = useState<{
    orderDetailId: number;
    productId: number;
    productName: string;
    productImage?: string | null;
    existingReview?: ReviewResponse;
  } | null>(null);
  const [reviewHistoryMap, setReviewHistoryMap] = useState<Record<number, ReviewResponse | null>>(
    {},
  );

  /* ── live shipping via SignalR ── */
  const { liveStatus: liveShipping, connected: shippingConnected } = useShippingStatus(
    selectedOrder?.orderId ?? null,
  );

  /* ── GHN tracking detail ── */
  const [ghnTracking, setGhnTracking] = useState<GHNTrackingDetail | null>(null);
  const [loadingTracking, setLoadingTracking] = useState(false);
  const [ghnTrackingError, setGhnTrackingError] = useState(false);

  useEffect(() => {
    if (!selectedOrder?.orderId) {
      setGhnTracking(null);
      setGhnTrackingError(false);
      return;
    }
    const s = selectedOrder.statusName?.toLowerCase() ?? "";
    if (["pending", "cancelled"].includes(s)) {
      setGhnTracking(null);
      setGhnTrackingError(false);
      return;
    }
    setLoadingTracking(true);
    setGhnTrackingError(false);
    CustomerOrderService.getOrderTracking(selectedOrder.orderId)
      .then((res) => setGhnTracking(res.data ?? null))
      .catch((err) => {
        // 404 = chưa có GHN order (bình thường), không phải lỗi
        if (err?.response?.status === 404) {
          setGhnTracking(null);
        } else {
          setGhnTrackingError(true);
        }
      })
      .finally(() => setLoadingTracking(false));
  }, [selectedOrder?.orderId]);

  // Auto-refresh tracking log khi SignalR báo có update mới
  useEffect(() => {
    if (!liveShipping || !selectedOrder?.orderId) return;
    CustomerOrderService.getOrderTracking(selectedOrder.orderId)
      .then((res) => {
        setGhnTracking(res.data ?? null);
        setGhnTrackingError(false);
      })
      .catch(() => {});
  }, [liveShipping?.occurredAt]);

  /* ── refund state ── */
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState<OrderDto | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<string>("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [myRefunds, setMyRefunds] = useState<RefundDto[]>([]);
  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [showRefundStatus, setShowRefundStatus] = useState(false);

  /* ── auth guard ── */
  useEffect(() => {
    if (!Cookies.get("accessToken")) {
      router.push("/login");
      return;
    }
    fetchProfile();
    LocationService.getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (tab === "addresses" && addresses.length === 0) fetchAddresses();
    if (tab === "orders") {
      setOrderTab("all");
      setOrderPage(1);
      fetchOrders("all", 1);
      // Deep-link from notification: open specific order detail
      const deeplinkOrderId = searchParams.get("orderId");
      if (deeplinkOrderId) {
        CustomerOrderService.getOrderById(parseInt(deeplinkOrderId))
          .then((res) => { if (res.status === 200 && res.data) setSelectedOrder(res.data); })
          .catch(() => {});
      }
    }
  }, [tab]);

  /* ── wallet refresh key (incremented on topup callback to force re-fetch) ── */
  const [walletRefreshKey, setWalletRefreshKey] = useState(0);

  // Handle top-up callback redirect from gateway
  const topupCallbackHandledRef = useRef(false);
  useEffect(() => {
    if (topupCallbackHandledRef.current) return;
    const topupStatus = searchParams.get("topup");
    const topupAmt = searchParams.get("amount");
    if (topupStatus === "success") {
      topupCallbackHandledRef.current = true;
      toast.success(
        `Nạp tiền thành công${topupAmt ? ` +${Number(topupAmt).toLocaleString("vi-VN")}₫` : ""}`,
      );
      setWalletRefreshKey((k) => k + 1);
      router.replace("/profile?tab=wallet");
    } else if (topupStatus === "failed") {
      topupCallbackHandledRef.current = true;
      toast.error("Nạp tiền thất bại. Vui lòng thử lại.");
      setWalletRefreshKey((k) => k + 1);
      router.replace("/profile?tab=wallet");
    }
  }, []);

  // Handle VNPay / MoMo / Sepay order payment callback
  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    const orderId = searchParams.get("orderId");
    if (paymentStatus === "success") {
      toast.success("Thanh toán thành công! Đơn hàng đang được xử lý.");
      setTab("orders");
      router.replace("/profile?tab=orders");
    } else if (paymentStatus === "failed") {
      toast.error(
        `Thanh toán thất bại${orderId ? ` - đơn hàng #${orderId} đã bị hủy` : ""}. Vui lòng đặt lại.`,
      );
      setTab("orders");
      router.replace("/profile?tab=orders");
    }
  }, []);

  useEffect(() => {
    if (selProv) LocationService.getDistricts(selProv).then(setDistricts);
    else {
      setDistricts([]);
      setWards([]);
    }
  }, [selProv]);

  useEffect(() => {
    if (selDist) LocationService.getWards(selDist).then(setWards);
    else setWards([]);
  }, [selDist]);

  /* ── fetchers ── */
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const r = await CustomerProfileService.getProfile();
      if (r.status === 200 && r.data) {
        setProfile(r.data);
        setForm({ accountName: r.data.accountName, phoneNumber: r.data.phoneNumber || "" });
        if (r.data.image) setAvatarPreview(r.data.image);
      }
    } catch (e: any) {
      if (e?.status === 401) router.push("/login");
      else toast.error("Không thể tải thông tin profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAddresses = async () => {
    try {
      setLoadingAddr(true);
      const r = await CustomerAddressService.getAll();
      if (r.status === 200) setAddresses(r.data || []);
    } catch {
      toast.error("Không thể tải địa chỉ");
    } finally {
      setLoadingAddr(false);
    }
  };

  const fetchOrders = useCallback(async (status: StatusKey = "all", page = 1) => {
    try {
      setLoadingOrders(true);
      const statusParam =
        status === "all" ? undefined : status.charAt(0).toUpperCase() + status.slice(1);
      const r = await CustomerOrderService.getMyOrders(statusParam, page, ORDER_PAGE_SIZE);
      if (r.status === 200 && r.data) {
        setOrders(r.data.items ?? []);
        setOrderTotalCount(r.data.totalCount ?? 0);
      }
    } catch {
      toast.error("Không thể tải đơn hàng");
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const fetchCompletedOrders = useCallback(async () => {
    setLoadingCompletedOrders(true);
    try {
      const r = await CustomerOrderService.getMyOrders("Completed", 1, 200);
      if (r.status === 200 && r.data) {
        const items = r.data.items ?? [];
        setCompletedOrders(items);
        // Fetch review history for each unique product in completed orders
        const uniqueProductIds = Array.from(
          new Set(items.flatMap((o) => o.orderDetails.map((d) => d.productId))),
        );
        const historyEntries = await Promise.all(
          uniqueProductIds.map(async (pid) => {
            try {
              const hr = await CustomerReviewService.getMyHistory(pid);
              const review = hr.data?.[0] ?? null;
              return [pid, review] as [number, ReviewResponse | null];
            } catch {
              return [pid, null] as [number, ReviewResponse | null];
            }
          }),
        );
        setReviewHistoryMap(Object.fromEntries(historyEntries));
      }
    } catch {
      toast.error("Không thể tải đơn hàng hoàn tất");
    } finally {
      setLoadingCompletedOrders(false);
    }
  }, []);

  /* ── profile handlers ── */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Chọn file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ảnh < 5 MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
    try {
      setSaving(true);
      await CustomerProfileService.updateAvatar(file);
      toast.success("Cập nhật ảnh thành công 🎉");
      await fetchProfile();
      refreshUser();
    } catch {
      toast.error("Cập nhật ảnh thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (changePwForm.newPassword !== changePwForm.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (changePwForm.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    try {
      setChangePwLoading(true);
      const res = await authService.changePassword(
        changePwForm.currentPassword,
        changePwForm.newPassword,
      );
      if (res.status === 200) {
        toast.success("Đổi mật khẩu thành công!");
        setChangePwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setGooglePwChanged(true);
        setProfile((prev) => (prev ? { ...prev, provider: undefined } : prev));
      } else {
        toast.error(res.message || "Đổi mật khẩu thất bại");
      }
    } catch {
      toast.error("Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setChangePwLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const r = await CustomerProfileService.updateProfile(form);
      if (r.status === 200) {
        toast.success("Cập nhật thành công 🎉");
        const up = await CustomerProfileService.getProfile();
        if (up.status === 200 && up.data) {
          const raw = Cookies.get("user");
          if (raw)
            Cookies.set("user", JSON.stringify({ ...JSON.parse(raw), ...up.data }), { expires: 7 });
        }
        await fetchProfile();
        refreshUser();
        setEditing(false);
        setSelectedFile(null);
      }
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({ accountName: profile?.accountName || "", phoneNumber: profile?.phoneNumber || "" });
    setAvatarPreview(profile?.image || null);
    setSelectedFile(null);
  };

  /* ── address modal ── */
  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm({ ...emptyAddrForm(), isDefault: addresses.length === 0 });
    setSelProv(null);
    setSelDist(null);
    setSelWard(null);
    setDistricts([]);
    setWards([]);
    setShowAddrModal(true);
  };

  const openEditAddr = async (addr: AddressResponse) => {
    setEditingAddr(addr);
    setAddrForm({
      recipientName: addr.recipientName || "",
      phoneNumber: addr.phoneNumber || "",
      addressLine: addr.addressLine,
      district: addr.district || "",
      ward: addr.ward || "",
      city: addr.city,
      provinceId: addr.provinceId,
      districtId: addr.districtId,
      wardCode: addr.wardCode,
      isDefault: addr.isDefault,
    });
    if (addr.city) {
      const mp = provinces.find((p) => p.name === addr.city || p.full_name === addr.city);
      if (mp) {
        setSelProv(mp.code);
        const dl = await LocationService.getDistricts(mp.code);
        setDistricts(dl);
        if (addr.district) {
          const md = dl.find((d) => d.name === addr.district || d.full_name === addr.district);
          if (md) {
            setSelDist(md.code);
            const wl = await LocationService.getWards(md.code);
            setWards(wl);
            if (addr.ward) {
              const mw = wl.find((w) => w.name === addr.ward || w.full_name === addr.ward);
              if (mw) setSelWard(String(mw.code));
            }
          }
        }
      } else {
        setSelProv(null);
        setSelDist(null);
        setSelWard(null);
        setDistricts([]);
        setWards([]);
      }
    }
    setShowAddrModal(true);
  };

  const closeAddrModal = () => {
    setShowAddrModal(false);
    setEditingAddr(null);
    setAddrForm(emptyAddrForm());
    setSelProv(null);
    setSelDist(null);
    setSelWard(null);
    setDistricts([]);
    setWards([]);
  };

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelProv(code || null);
    setSelDist(null);
    setSelWard(null);
    setDistricts([]);
    setWards([]);
    const prov = provinces.find((p) => p.code === code);
    if (prov) {
      const name = prov.name;
      setAddrForm((prev) => ({
        ...prev,
        city: name,
        provinceId: undefined,
        district: "",
        districtId: undefined,
        ward: "",
        wardCode: undefined,
      }));
      LocationService.resolveGHNProvince(name).then((ghn) => {
        if (ghn) setAddrForm((prev) => ({ ...prev, provinceId: ghn.provinceId }));
      });
    }
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelDist(code || null);
    setSelWard(null);
    setWards([]);
    const dist = districts.find((d) => d.code === code);
    if (dist) {
      const name = dist.name;
      setAddrForm((prev) => ({
        ...prev,
        district: name,
        districtId: undefined,
        ward: "",
        wardCode: undefined,
      }));
      setAddrForm((prev) => {
        if (prev.provinceId)
          LocationService.resolveGHNDistrict(prev.provinceId, name).then((ghn) => {
            if (ghn) setAddrForm((p) => ({ ...p, districtId: ghn.districtId }));
          });
        return prev;
      });
    } else
      setAddrForm((prev) => ({
        ...prev,
        district: "",
        districtId: undefined,
        ward: "",
        wardCode: undefined,
      }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const ward = wards.find((w) => w.code === code);
    if (ward) {
      const name = ward.name;
      setSelWard(String(code));
      setAddrForm((prev) => ({ ...prev, ward: name, wardCode: undefined }));
      setAddrForm((prev) => {
        if (prev.districtId)
          LocationService.resolveGHNWard(prev.districtId, name).then((ghn) => {
            if (ghn) setAddrForm((p) => ({ ...p, wardCode: ghn.wardCode }));
          });
        return prev;
      });
    }
  };

  const handleAddrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !addrForm.recipientName.trim() ||
      !addrForm.phoneNumber.trim() ||
      !addrForm.addressLine.trim() ||
      !addrForm.city.trim() ||
      !addrForm.district?.trim() ||
      !addrForm.ward?.trim()
    ) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ");
      return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(addrForm.phoneNumber.trim())) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }
    setAddrSubmitting(true);
    try {
      if (editingAddr) {
        const res = await CustomerAddressService.update(editingAddr.addressId, {
          ...addrForm,
          addressId: editingAddr.addressId,
        } as AddressUpdateRequest);
        if (res.status === 200) {
          toast.success("Cập nhật địa chỉ thành công");
          fetchAddresses();
          closeAddrModal();
        }
      } else {
        const res = await CustomerAddressService.create(addrForm);
        if (res.status === 201 || res.status === 200) {
          toast.success("Thêm địa chỉ thành công");
          fetchAddresses();
          closeAddrModal();
        }
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setAddrSubmitting(false);
    }
  };

  const handleDeleteAddr = async (id: number) => {
    if (!confirm("Xoá địa chỉ này?")) return;
    try {
      await CustomerAddressService.delete(id);
      toast.success("Đã xoá");
      setAddresses((p) => p.filter((a) => a.addressId !== id));
    } catch {
      toast.error("Xoá thất bại");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await CustomerAddressService.setDefault(id);
      toast.success("Đã đặt mặc định");
      fetchAddresses();
    } catch {
      toast.error("Thất bại");
    }
  };

  /* ── order handlers ── */
  const handleCancelOrder = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
    setCancelling(orderId);
    try {
      const res = await CustomerOrderService.cancelOrder(orderId);
      if (res.status === 200) {
        toast.success("Đã huỷ đơn hàng");
        fetchOrders(orderTab, orderPage);
        if (selectedOrder?.orderId === orderId) setSelectedOrder(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể huỷ đơn");
    } finally {
      setCancelling(null);
    }
  };

  const handleConfirmDelivery = async (orderId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Đơn hàng sẽ chuyển sang trạng thái Hoàn thành. Xác nhận đã nhận hàng?")) return;
    setConfirming(orderId);
    try {
      const res = await CustomerOrderService.confirmDelivery(orderId);
      if (res.status === 200) {
        toast.success("Đã xác nhận nhận hàng");
        fetchOrders(orderTab, orderPage);
        if (selectedOrder?.orderId === orderId) setSelectedOrder(null);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể xác nhận");
    } finally {
      setConfirming(null);
    }
  };

  const handleOpenRefundModal = (order: OrderDto, e: React.MouseEvent) => {
    e.stopPropagation();
    setRefundTargetOrder(order);
    setRefundReason("");
    setRefundAmount(String(order.totalAmount));
    setShowRefundModal(true);
  };

  const handleSubmitRefund = async () => {
    if (!refundTargetOrder) return;
    const amount = parseFloat(refundAmount);
    if (!refundReason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền");
      return;
    }
    if (isNaN(amount) || amount <= 0 || amount > refundTargetOrder.totalAmount) {
      toast.error(`Số tiền hoàn phải từ 1₫ đến ${fmtVND(refundTargetOrder.totalAmount)}`);
      return;
    }
    setSubmittingRefund(true);
    try {
      const req: CreateRefundRequest = {
        orderId: refundTargetOrder.orderId,
        refundAmount: amount,
        refundMode: "Wallet",
        reason: refundReason.trim(),
      };
      const res = await CustomerOrderService.createRefundRequest(req);
      if (res.status === 201 || res.status === 200) {
        toast.success(
          "Gửi yêu cầu hoàn tiền thành công! Chúng tôi sẽ xử lý trong 1–3 ngày làm việc.",
        );
        setShowRefundModal(false);
        fetchOrders(orderTab, orderPage);
      } else {
        toast.error(res.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền");
    } finally {
      setSubmittingRefund(false);
    }
  };

  const fetchMyRefunds = async () => {
    setLoadingRefunds(true);
    try {
      const res = await CustomerOrderService.getMyRefunds(1, 20);
      if (res.status === 200 && res.data) {
        setMyRefunds(res.data.items ?? []);
      }
    } catch {
      toast.error("Không thể tải lịch sử hoàn tiền");
    } finally {
      setLoadingRefunds(false);
    }
  };

  const handleOrderTab = (key: StatusKey) => {
    setOrderTab(key);
    setOrderPage(1);
    fetchOrders(key, 1);
  };

  const handleOrderPage = (page: number) => {
    setOrderPage(page);
    fetchOrders(orderTab, page);
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return o.orderCode?.toLowerCase().includes(q) || o.shippingName?.toLowerCase().includes(q);
  });

  const orderTabCount = (key: StatusKey) => (key === orderTab ? orderTotalCount : 0);
  const totalOrderPages = Math.ceil(orderTotalCount / ORDER_PAGE_SIZE);

  /* ── nav ── */
  const navItems: { id: Tab; label: string; icon: React.ElementType; href?: string }[] = [
    { id: "profile", label: "Tài Khoản Của Tôi", icon: User },
    { id: "addresses", label: "Địa Chỉ", icon: MapPin },
    { id: "orders", label: "Đơn Mua", icon: ClipboardList },
    { id: "vouchers", label: "Kho Voucher", icon: Ticket },
    { id: "wallet", label: "Ví Của Tôi", icon: Wallet },
  ];

  /* skeleton */
  if (loadingProfile)
    return (
      <>
        <div className="min-h-screen bg-[#f5f5f5] py-6">
          <div className="max-w-5xl mx-auto px-4 flex gap-4 animate-pulse">
            <div className="w-48 bg-white rounded-sm h-64 shrink-0" />
            <div className="flex-1 bg-white rounded-sm h-64" />
          </div>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <div className="min-h-screen bg-[#f5f5f5] py-5 pb-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex gap-4 items-start">
            {/* ══ SIDEBAR ══ */}
            <aside className="w-55 shrink-0 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-visible sticky top-20 self-start">
              <div className="px-5 py-6 border-b border-gray-50 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    {avatarPreview ? (
                      <Image
                        src={imgUrl(avatarPreview)!}
                        alt="avatar"
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                        <User size={28} className="text-orange-300" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-bold text-sm text-gray-800 truncate px-2">
                    {profile?.accountName || "User"}
                  </p>
                  <button
                    onClick={() => setTab("profile")}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-orange-500 transition-colors mt-1 group"
                  >
                    <Edit2 size={10} className="group-hover:rotate-12 transition-transform" /> Sửa
                    Hồ Sơ
                  </button>
                </div>
              </div>
              <nav className="p-2.5 overflow-visible">
                {navItems.map(({ id, label, icon, href }) => (
                  <SideNavItem
                    key={id}
                    id={id}
                    label={label}
                    icon={icon}
                    active={tab === id}
                    onSelect={setTab}
                    setTab={setTab}
                    href={href}
                  />
                ))}
                <div className="border-t border-gray-50 pt-2 mt-2">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all duration-200"
                  >
                    <LogOut size={18} className="text-gray-400 group-hover:text-red-400" />
                    <span className="font-medium">Đăng Xuất</span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* ══ CONTENT ══ */}
            <div className="flex-1 min-w-0">
              {/* ─── HỒ SƠ ─── */}
              {tab === "profile" && (
                <div className="bg-white rounded-sm">
                  <div className="px-8 py-5 border-b border-gray-100">
                    <h1 className="text-lg font-medium text-gray-800">Hồ Sơ Của Tôi</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Quản lý thông tin hồ sơ để bảo mật tài khoản
                    </p>
                  </div>
                  <div className="px-8 py-7">
                    {profile?.provider === "Google" && !googlePwChanged && (
                      <div className="mb-6 space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                          <svg
                            className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
                            viewBox="0 0 24 24"
                          >
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-semibold text-blue-800 mb-1">
                              Tài khoản đăng ký bằng Google
                            </p>
                            <p className="text-sm text-blue-700">
                              Mật khẩu mặc định của tài khoản bạn là:{" "}
                              <strong className="font-mono bg-blue-100 px-1.5 py-0.5 rounded">
                                Customer123@
                              </strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Vui lòng đổi mật khẩu bên dưới để bảo vệ tài khoản của bạn.
                            </p>
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg p-5">
                          <h3 className="text-sm font-semibold text-gray-800 mb-4">
                            Đặt mật khẩu mới
                          </h3>
                          <form onSubmit={handleChangePassword} className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Mật khẩu hiện tại
                              </label>
                              <input
                                type="password"
                                value={changePwForm.currentPassword}
                                onChange={(e) =>
                                  setChangePwForm((f) => ({
                                    ...f,
                                    currentPassword: e.target.value,
                                  }))
                                }
                                placeholder="Nhập mật khẩu hiện tại"
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Mật khẩu mới
                              </label>
                              <input
                                type="password"
                                value={changePwForm.newPassword}
                                onChange={(e) =>
                                  setChangePwForm((f) => ({ ...f, newPassword: e.target.value }))
                                }
                                placeholder="Nhập mật khẩu mới"
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-1">
                                Xác nhận mật khẩu mới
                              </label>
                              <input
                                type="password"
                                value={changePwForm.confirmPassword}
                                onChange={(e) =>
                                  setChangePwForm((f) => ({
                                    ...f,
                                    confirmPassword: e.target.value,
                                  }))
                                }
                                placeholder="Nhập lại mật khẩu mới"
                                required
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={changePwLoading}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium py-2 rounded-lg transition-colors"
                            >
                              {changePwLoading ? "Đang lưu..." : "Đổi mật khẩu"}
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-10">
                      <form onSubmit={handleSave} className="flex-1 space-y-5">
                        {(
                          [
                            { label: "Tên đăng nhập", field: "accountName" as const, type: "text" },
                            { label: "Số điện thoại", field: "phoneNumber" as const, type: "tel" },
                          ] as const
                        ).map(({ label, field, type }) => (
                          <div key={field} className="flex items-center">
                            <label className="w-36 text-sm text-gray-500 text-right pr-5 shrink-0">
                              {label}
                            </label>
                            {editing ? (
                              <input
                                type={type}
                                value={form[field]}
                                onChange={(e) =>
                                  setForm((p) => ({ ...p, [field]: e.target.value }))
                                }
                                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 transition"
                              />
                            ) : (
                              <span className="text-sm text-gray-700">
                                {form[field] || (
                                  <span className="text-gray-400 italic">Chưa cập nhật</span>
                                )}
                              </span>
                            )}
                          </div>
                        ))}
                        <div className="flex items-center">
                          <label className="w-36 text-sm text-gray-500 text-right pr-5 shrink-0">
                            Email
                          </label>
                          <span className="text-sm text-gray-700">{profile?.email}</span>
                        </div>
                        <div className="flex items-center">
                          <label className="w-36 text-sm text-gray-500 text-right pr-5 shrink-0">
                            Thành viên từ
                          </label>
                          <span className="text-sm text-gray-500" suppressHydrationWarning>
                            {profile?.createdAt
                              ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-36 shrink-0" />
                          {editing ? (
                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={saving}
                                className="px-6 py-2 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50 transition"
                              >
                                Huỷ
                              </button>
                              <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition disabled:opacity-60 flex items-center gap-2"
                              >
                                {saving && (
                                  <svg
                                    className="animate-spin h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
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
                                {saving ? "Đang lưu..." : "Lưu"}
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditing(true)}
                              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition"
                            >
                              Chỉnh sửa
                            </button>
                          )}
                        </div>
                      </form>
                      <div className="flex flex-col items-center gap-4 shrink-0 w-36 border-l border-gray-100 pl-8">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                            {avatarPreview ? (
                              <Image
                                src={imgUrl(avatarPreview)!}
                                alt="avatar"
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            ) : (
                              <div className="w-full h-full bg-linear-to-br from-orange-300 to-red-400 flex items-center justify-center">
                                <User size={36} className="text-white" />
                              </div>
                            )}
                          </div>
                          {editing && (
                            <label className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition">
                              <Camera size={13} className="text-gray-500" />
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                              />
                            </label>
                          )}
                        </div>
                        {editing && (
                          <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Click icon camera
                            <br />
                            để đổi ảnh. Tối đa 5 MB
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── ĐỊA CHỈ ─── */}
              {tab === "addresses" && (
                <div className="bg-white rounded-sm">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h1 className="text-lg font-medium text-gray-800">Địa Chỉ Của Tôi</h1>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {addresses.length} địa chỉ đã lưu
                      </p>
                    </div>
                    <button
                      onClick={openAddAddr}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
                    >
                      <Plus size={15} /> Thêm địa chỉ mới
                    </button>
                  </div>
                  <div className="p-6">
                    {loadingAddr ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-24 bg-gray-50 rounded animate-pulse" />
                        ))}
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MapPin size={30} className="text-orange-300" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">Bạn chưa có địa chỉ nào</p>
                        <p className="text-gray-400 text-sm mb-5">
                          Thêm địa chỉ để thanh toán nhanh hơn
                        </p>
                        <button
                          onClick={openAddAddr}
                          className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition"
                        >
                          Thêm địa chỉ đầu tiên
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {addresses.map((addr) => (
                          <div key={addr.addressId} className="py-5 flex items-start gap-4">
                            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
                              {addr.isDefault ? (
                                <Star size={16} className="text-orange-400 fill-orange-400" />
                              ) : (
                                <MapPin size={16} className="text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <span className="font-semibold text-gray-800">
                                  {addr.recipientName}
                                </span>
                                <span className="text-gray-200">|</span>
                                <span className="text-sm text-gray-500">{addr.phoneNumber}</span>
                                {addr.isDefault && (
                                  <span className="px-1.5 py-0.5 border border-orange-400 text-orange-500 text-[11px] rounded">
                                    Mặc Định
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{addr.addressLine}</p>
                              <p className="text-sm text-gray-400 mt-0.5">
                                {[addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => openEditAddr(addr)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                >
                                  <Edit2 size={12} /> Cập nhật
                                </button>
                                {!addr.isDefault && (
                                  <button
                                    onClick={() => handleDeleteAddr(addr.addressId)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                  >
                                    <Trash2 size={12} /> Xóa
                                  </button>
                                )}
                              </div>
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(addr.addressId)}
                                  className="flex items-center gap-1 px-3 py-1 border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 rounded transition-colors"
                                >
                                  <Check size={11} /> Thiết lập mặc định
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─── ĐƠN MUA ─── */}
              {tab === "orders" && (
                <>
                  <div className="bg-white rounded-sm">
                    {/* sticky header + tabs */}
                    <div className="sticky top-16 z-20 bg-white rounded-t-sm">
                      {/* header */}
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                        <div>
                          <h1 className="text-lg font-medium text-gray-800">Đơn Mua</h1>
                          {ordersViewMode === "orders" && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {orderTotalCount} đơn hàng
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {/* View mode toggle */}
                          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                            <button
                              onClick={() => setOrdersViewMode("orders")}
                              className={`px-3 py-1.5 text-xs font-medium transition-colors ${ordersViewMode === "orders" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                            >
                              Đơn hàng
                            </button>
                            <button
                              onClick={() => {
                                setOrdersViewMode("reviews");
                                fetchCompletedOrders();
                              }}
                              className={`px-3 py-1.5 text-xs font-medium transition-colors ${ordersViewMode === "reviews" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                            >
                              Đánh giá
                            </button>
                          </div>
                          {ordersViewMode === "orders" && (
                            <div className="relative shrink-0 w-52">
                              <Search
                                size={13}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                              <input
                                type="text"
                                value={orderSearch}
                                onChange={(e) => setOrderSearch(e.target.value)}
                                placeholder="Tìm mã đơn..."
                                className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 transition"
                              />
                              {orderSearch && (
                                <button
                                  onClick={() => setOrderSearch("")}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  <X size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* status tabs — only in orders mode */}
                      {ordersViewMode === "orders" && (
                        <div className="flex border-b border-gray-100 overflow-x-auto">
                          {ORDER_TABS.map((t) => {
                            const cnt = orderTabCount(t.key);
                            const active = orderTab === t.key;
                            return (
                              <button
                                key={t.key}
                                onClick={() => handleOrderTab(t.key)}
                                className={`shrink-0 flex items-center gap-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${active ? "border-orange-500 text-orange-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                              >
                                {t.label}
                                {cnt > 0 && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}
                                  >
                                    {cnt}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* order list — only in orders mode */}
                    {ordersViewMode === "orders" && (
                      <>
                        <div className="divide-y divide-gray-100">
                          {loadingOrders ? (
                            <div className="p-6 space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="h-28 bg-gray-50 rounded animate-pulse" />
                              ))}
                            </div>
                          ) : filteredOrders.length === 0 ? (
                            <div className="text-center py-16">
                              <Package size={40} className="text-gray-200 mx-auto mb-2" />
                              <p className="text-gray-400 text-sm">
                                {orderSearch
                                  ? `Không tìm thấy "${orderSearch}"`
                                  : "Không có đơn hàng nào"}
                              </p>
                            </div>
                          ) : (
                            filteredOrders.map((order) => {
                              const skey = order.statusName?.toLowerCase() as string;
                              const st = STATUS_MAP[skey] ?? {
                                label: order.statusName,
                                color: "text-gray-500",
                                bg: "bg-gray-50 border-gray-200",
                                icon: Package,
                              };
                              const Icon = st.icon;
                              const canCancel = skey === "pending";
                              const canConfirmDelivery = skey === "delivered";
                              const canRefund =
                                skey === "completed" && order.refundStatus === "None";
                              const hasRefundRequest =
                                order.refundStatus !== "None" &&
                                order.refundStatus !== "" &&
                                skey === "completed";
                              return (
                                <div
                                  key={order.orderId}
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                >
                                  {/* order meta */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Package size={13} className="text-orange-400" />
                                      <span className="text-xs font-medium text-gray-600">
                                        #{order.orderCode}
                                      </span>
                                      {order.orderDate && (
                                        <span className="text-xs text-gray-400">
                                          {fmtDate(order.orderDate)}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${st.bg} ${st.color}`}
                                    >
                                      <Icon size={11} />
                                      {st.label}
                                    </div>
                                  </div>
                                  {/* items */}
                                  <div className="space-y-2">
                                    {order.orderDetails?.slice(0, 2).map((item) => (
                                      <div
                                        key={item.orderDetailId}
                                        className="flex items-center gap-3"
                                      >
                                        <div className="w-12 h-12 rounded border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                                          {item.productImage ? (
                                            <Image
                                              src={imgUrl(item.productImage)!}
                                              alt={item.productName || "Product image"}
                                              fill
                                              className="object-cover"
                                              sizes="48px"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                              <Package size={14} className="text-gray-300" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm text-gray-700 truncate">
                                            {item.productName}
                                          </p>
                                          <p className="text-xs text-gray-400">x{item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-orange-500 shrink-0">
                                          {fmtVND(item.total)}
                                        </p>
                                      </div>
                                    ))}
                                    {(order.orderDetails?.length ?? 0) > 2 && (
                                      <p className="text-xs text-gray-400 italic pl-15">
                                        +{order.orderDetails.length - 2} sản phẩm khác
                                      </p>
                                    )}
                                  </div>
                                  {/* footer */}
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-2">
                                      {canCancel && (
                                        <button
                                          onClick={(e) => handleCancelOrder(order.orderId, e)}
                                          disabled={cancelling === order.orderId}
                                          className="px-3 py-1 border border-gray-200 text-gray-500 text-xs rounded hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                        >
                                          {cancelling === order.orderId ? "Đang huỷ..." : "Huỷ đơn"}
                                        </button>
                                      )}
                                      {canConfirmDelivery && (
                                        <button
                                          onClick={(e) => handleConfirmDelivery(order.orderId, e)}
                                          disabled={confirming === order.orderId}
                                          className="px-3 py-1 border border-green-300 text-green-600 text-xs rounded hover:bg-green-50 hover:border-green-500 transition-colors disabled:opacity-50"
                                        >
                                          {confirming === order.orderId ? "Đang xác nhận..." : "Đã nhận hàng"}
                                        </button>
                                      )}
                                      {canRefund && (
                                        <button
                                          onClick={(e) => handleOpenRefundModal(order, e)}
                                          className="flex items-center gap-1 px-3 py-1 border border-orange-200 text-orange-600 text-xs rounded hover:bg-orange-50 hover:border-orange-400 transition-colors"
                                        >
                                          <ArrowDownCircle size={11} />
                                          Yêu cầu hoàn tiền
                                        </button>
                                      )}
                                      {hasRefundRequest && (
                                        <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full border border-indigo-100">
                                          <RefreshCw size={10} />
                                          Đã gửi YC hoàn tiền
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400">Xem chi tiết →</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-xs text-gray-500">Tổng:</span>
                                      <span className="text-sm font-bold text-orange-500">
                                        {fmtVND(order.totalAmount)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* pagination */}
                        {totalOrderPages > 1 && (
                          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              Trang {orderPage}/{totalOrderPages} · {orderTotalCount} đơn
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOrderPage(orderPage - 1)}
                                disabled={orderPage === 1}
                                className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                ‹
                              </button>
                              {Array.from({ length: totalOrderPages }, (_, i) => i + 1)
                                .filter(
                                  (p) =>
                                    p === 1 ||
                                    p === totalOrderPages ||
                                    Math.abs(p - orderPage) <= 1,
                                )
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                  if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1)
                                    acc.push("...");
                                  acc.push(p);
                                  return acc;
                                }, [])
                                .map((p, i) =>
                                  p === "..." ? (
                                    <span key={`e${i}`} className="px-1.5 text-xs text-gray-400">
                                      …
                                    </span>
                                  ) : (
                                    <button
                                      key={p}
                                      onClick={() => handleOrderPage(p as number)}
                                      className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                                        p === orderPage
                                          ? "bg-orange-500 border-orange-500 text-white"
                                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  ),
                                )}
                              <button
                                onClick={() => handleOrderPage(orderPage + 1)}
                                disabled={orderPage === totalOrderPages}
                                className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                ›
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ─── REVIEW SECTION ─── */}
                    {ordersViewMode === "reviews" && (
                      <div>
                        {/* sub-tab buttons */}
                        <div className="flex border-b border-gray-100">
                          {(["pending", "done"] as const).map((st) => {
                            const allDetails = completedOrders.flatMap((o) => o.orderDetails);
                            const count =
                              st === "pending"
                                ? allDetails.filter((d) => !d.reviewed).length
                                : allDetails.filter((d) => d.reviewed).length;
                            const isActive = reviewSubTab === st;
                            return (
                              <button
                                key={st}
                                onClick={() => setReviewSubTab(st)}
                                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-medium border-b-2 transition-colors ${isActive ? "border-orange-500 text-orange-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}
                              >
                                {st === "pending" ? "Chưa đánh giá" : "Đã đánh giá"}
                                {count > 0 && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}
                                  >
                                    {count}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        {loadingCompletedOrders ? (
                          <div className="p-6 space-y-3">
                            {[1, 2, 3].map((i) => (
                              <div key={i} className="h-24 bg-gray-50 rounded animate-pulse" />
                            ))}
                          </div>
                        ) : (
                          (() => {
                            const allDetails = completedOrders.flatMap((o) =>
                              o.orderDetails.map((d) => ({
                                ...d,
                                orderId: o.orderId,
                                orderCode: o.orderCode,
                              })),
                            );
                            const items =
                              reviewSubTab === "pending"
                                ? allDetails.filter((d) => !d.reviewed)
                                : allDetails.filter((d) => d.reviewed);

                            if (items.length === 0) {
                              return (
                                <div className="text-center py-16">
                                  <Star size={40} className="text-gray-200 mx-auto mb-2" />
                                  <p className="text-gray-400 text-sm">
                                    {reviewSubTab === "pending"
                                      ? "Không có sản phẩm nào cần đánh giá"
                                      : "Chưa có đánh giá nào"}
                                  </p>
                                </div>
                              );
                            }

                            return (
                              <div className="divide-y divide-gray-100">
                                {items.map((item) => {
                                  const existingReview =
                                    reviewHistoryMap[item.productId] ?? undefined;
                                  return (
                                    <div
                                      key={`${item.orderId}-${item.orderDetailId}`}
                                      className="px-5 py-4 flex items-center gap-4"
                                    >
                                      <div className="w-14 h-14 rounded border border-gray-100 overflow-hidden shrink-0 bg-gray-50">
                                        {item.productImage ? (
                                          <Image
                                            src={imgUrl(item.productImage)!}
                                            alt={item.productName || "Product image"}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package size={16} className="text-gray-300" />
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                          {item.productName}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          Đơn #{item.orderCode}
                                        </p>
                                        {reviewSubTab === "done" && existingReview && (
                                          <div className="mt-1">
                                            <div className="flex items-center gap-1 flex-wrap">
                                              {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                  key={i}
                                                  size={12}
                                                  className={
                                                    i < existingReview.rating
                                                      ? "text-yellow-400 fill-yellow-400"
                                                      : "text-gray-200 fill-gray-200"
                                                  }
                                                />
                                              ))}
                                              {existingReview.status === "Pending" && (
                                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                                                  Đang duyệt
                                                </span>
                                              )}
                                              {/* {existingReview.status === "Approved" && (
                                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                                                  Đã duyệt
                                                </span>
                                              )} */}
                                              {existingReview.status === "Rejected" && (
                                                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                                                  Vi phạm
                                                </span>
                                              )}
                                            </div>
                                            {existingReview.comment && (
                                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                {existingReview.comment}
                                              </p>
                                            )}
                                            {existingReview.status === "Rejected" &&
                                              existingReview.moderationDetail && (
                                                <p className="text-[10px] text-red-500 mt-0.5 line-clamp-2">
                                                  Lý do: {existingReview.moderationDetail}
                                                </p>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                      <div className="shrink-0">
                                        {reviewSubTab === "pending" ? (
                                          <button
                                            onClick={() =>
                                              setWriteReviewTarget({
                                                orderDetailId: item.orderDetailId,
                                                productId: item.productId,
                                                productName: item.productName,
                                                productImage: item.productImage,
                                              })
                                            }
                                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded transition-colors"
                                          >
                                            <Star size={12} /> Đánh giá ngay
                                          </button>
                                        ) : (
                                          existingReview?.canEdit && (
                                            <button
                                              onClick={() =>
                                                setWriteReviewTarget({
                                                  orderDetailId: item.orderDetailId,
                                                  productId: item.productId,
                                                  productName: item.productName,
                                                  productImage: item.productImage,
                                                  existingReview,
                                                })
                                              }
                                              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 text-xs rounded transition-colors"
                                            >
                                              Sửa đánh giá
                                            </button>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </div>

                  {/* ─── Link xem trạng thái hoàn tiền ─── */}
                  <div className="bg-white rounded-sm mt-3 px-5 py-3 flex items-center justify-between border border-dashed border-orange-200">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Đơn yêu cầu hoàn tiền</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Xem trạng thái các yêu cầu hoàn tiền của bạn
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setShowRefundStatus(true);
                        fetchMyRefunds();
                      }}
                      className="flex items-center gap-1.5 text-xs text-orange-500 font-medium border border-orange-200 rounded-lg px-3 py-1.5 hover:bg-orange-50 transition-colors"
                    >
                      <ArrowDownCircle size={13} />
                      Xem lịch sử hoàn tiền
                    </button>
                  </div>

                  {/* WriteReviewModal */}
                  {writeReviewTarget && (
                    <WriteReviewModal
                      isOpen={Boolean(writeReviewTarget)}
                      onClose={() => setWriteReviewTarget(null)}
                      orderDetailId={writeReviewTarget.orderDetailId}
                      productId={writeReviewTarget.productId}
                      productName={writeReviewTarget.productName}
                      productImage={writeReviewTarget.productImage}
                      existingReview={writeReviewTarget.existingReview}
                      onSuccess={(review) => {
                        setCompletedOrders((prev) =>
                          prev.map((order) => ({
                            ...order,
                            orderDetails: order.orderDetails?.map((d) =>
                              d.orderDetailId === writeReviewTarget!.orderDetailId
                                ? { ...d, reviewed: true }
                                : d,
                            ),
                          })),
                        );
                        setReviewHistoryMap((prev) => ({
                          ...prev,
                          [writeReviewTarget!.productId]: review,
                        }));
                        setWriteReviewTarget(null);
                      }}
                    />
                  )}
                </>
              )}

              {/* ─── VOUCHER ─── */}
              {tab === "vouchers" && (
                <div className="bg-white rounded-sm">
                  <div className="px-6 py-4 border-b border-gray-100">
                    <h1 className="text-lg font-medium text-gray-800">Kho Voucher</h1>
                  </div>
                  <div className="p-6 text-center py-16">
                    <Ticket size={44} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Bạn chưa có voucher nào</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Theo dõi chương trình khuyến mãi để nhận voucher
                    </p>
                  </div>
                </div>
              )}

              {/* ─── VÍ ─── */}
              <WalletTab visible={tab === "wallet"} refreshKey={walletRefreshKey} />
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ══ ADDRESS MODAL ══ */}
      {showAddrModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAddrModal();
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">
                {editingAddr ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h2>
              <button
                onClick={closeAddrModal}
                className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            <form
              id="addr-form"
              onSubmit={handleAddrSubmit}
              className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Tên người nhận <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={addrForm.recipientName}
                    onChange={(e) => setAddrForm({ ...addrForm, recipientName: e.target.value })}
                    placeholder="VD: Nguyễn Văn A"
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>
                    Số điện thoại <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="tel"
                    value={addrForm.phoneNumber}
                    onChange={(e) => setAddrForm({ ...addrForm, phoneNumber: e.target.value })}
                    placeholder="0912345678"
                    className={inputCls}
                    required
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Địa chỉ chi tiết <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={addrForm.addressLine}
                  onChange={(e) => setAddrForm({ ...addrForm, addressLine: e.target.value })}
                  placeholder="Số nhà, tên đường..."
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>
                  Tỉnh / Thành phố <span className="text-red-400">*</span>
                </label>
                <select
                  value={selProv || ""}
                  onChange={handleProvChange}
                  className={inputCls}
                  required
                >
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>
                    Quận / Huyện <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selDist || ""}
                    onChange={handleDistChange}
                    disabled={!selProv}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {districts.map((d) => (
                      <option key={d.code} value={d.code}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>
                    Phường / Xã <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={selWard || ""}
                    onChange={handleWardChange}
                    disabled={!selDist}
                    className={inputCls}
                    required
                  >
                    <option value="">-- Chọn Phường / Xã --</option>
                    {wards.map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addrForm.isDefault}
                  onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  disabled={addresses.length === 0 || editingAddr?.isDefault === true}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</span>
              </label>
            </form>
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={closeAddrModal}
                disabled={addrSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-100 transition"
              >
                Huỷ
              </button>
              <button
                type="submit"
                form="addr-form"
                disabled={addrSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded font-medium transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {addrSubmitting && (
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
                {addrSubmitting ? "Đang lưu..." : editingAddr ? "Lưu cập nhật" : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ORDER DETAIL MODAL ══ */}
      {selectedOrder &&
        (() => {
          const s = selectedOrder.statusName?.toLowerCase() ?? "";
          const isFailed = ["cancelled", "refunded"].includes(s);
          const steps = [
            {
              key: "pending",
              label: "Đơn hàng đã đặt",
              subLabel: selectedOrder.orderDate
                ? new Date(selectedOrder.orderDate).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }) +
                  ", " +
                  new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                : "--:--, --/--",
              icon: <FileText size={16} />,
            },
            {
              key: "confirmed",
              label: "Đã xác nhận",
              subLabel: (() => {
                const d =
                  selectedOrder.paymentCompletedAt ||
                  selectedOrder.statusHistory?.find((h) =>
                    ["Confirmed", "Processing"].includes(h.statusName || ""),
                  )?.changedAt;
                return d
                  ? new Date(d).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) +
                      ", " +
                      new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                  : "--:--, --/--";
              })(),
              icon: <CheckCircle size={16} />,
            },
            {
              key: "shipped",
              label: "Đã giao ĐVVC",
              subLabel: (() => {
                const d = selectedOrder.statusHistory?.find(
                  (h) => h.statusName === "Shipped",
                )?.changedAt;
                return d
                  ? new Date(d).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }) +
                      ", " +
                      new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                  : "Đang xử lý";
              })(),
              icon: <Truck size={16} />,
            },
            {
              key: "delivered",
              label: "Đã nhận hàng",
              subLabel: (() => {
                const d = selectedOrder.statusHistory?.find(
                  (h) => h.statusName === "Delivered",
                )?.changedAt;
                return d
                  ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
                  : "Dự kiến --/--";
              })(),
              icon: <Package size={16} />,
            },
            {
              key: "completed",
              label: "Đánh giá",
              subLabel: "Sau khi nhận",
              icon: <Star size={16} />,
            },
          ];
          let activeIdx = 0;
          if (["confirmed", "processing"].includes(s)) activeIdx = 1;
          else if (s === "shipped") activeIdx = 2;
          else if (s === "delivered") activeIdx = 3;
          else if (s === "completed") activeIdx = 4;

          const trackingCode = ghnTracking?.orderCode ?? selectedOrder.shippingInfo?.trackingNumber;
          const currentGhnStatus =
            liveShipping?.ghnStatus ?? ghnTracking?.status ?? selectedOrder.shippingInfo?.status;
          const currentGhnStatusText = liveShipping?.displayText ?? ghnTracking?.statusText;
          const estimatedDelivery =
            ghnTracking?.expectedDeliveryTime ?? selectedOrder.shippingInfo?.estimatedDelivery;
          const subtotal = selectedOrder.orderDetails?.reduce((acc, i) => acc + i.total, 0) ?? 0;
          const discount = Math.max(
            0,
            subtotal + selectedOrder.shippingFee - selectedOrder.totalAmount,
          );

          const statusBadge = STATUS_MAP[s] ?? {
            label: selectedOrder.statusName,
            color: "text-gray-500",
            bg: "bg-gray-50 border-gray-200",
            icon: Package,
          };

          return (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-2 sm:p-4">
              <div className="bg-slate-50 rounded-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
                {/* ── Header ── */}
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex items-center justify-center rounded-xl h-10 w-10 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div>
                      <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-800">
                        Chi tiết đơn hàng
                      </h2>
                      <p className="text-xs text-slate-500">
                        #{selectedOrder.orderCode} •{" "}
                        {selectedOrder.orderDate
                          ? new Date(selectedOrder.orderDate).toLocaleDateString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {trackingCode && (
                      <a
                        href={`https://tracking.ghn.dev/?order_code=${trackingCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center gap-1.5 h-9 px-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-semibold transition-colors"
                      >
                        <Search size={14} /> Tra cứu đơn hàng
                      </a>
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusBadge.bg} ${statusBadge.color}`}
                    >
                      {statusBadge.label}
                    </span>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex items-center justify-center h-9 w-9 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* ── Body ── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* ── Left (2/3) ── */}
                    <div className="lg:col-span-2 flex flex-col gap-5">
                      {/* Status Stepper */}
                      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-base font-bold tracking-tight text-slate-800">
                            Trạng thái vận chuyển
                          </h3>
                        </div>
                        {isFailed ? (
                          <div className="flex items-center justify-center gap-3 py-6 bg-red-50 rounded-xl border border-red-100">
                            <XCircle size={22} className="text-red-500" />
                            <p className="text-red-600 font-semibold">Đơn hàng đã bị huỷ</p>
                          </div>
                        ) : (
                          <div className="relative flex justify-between px-2">
                            {/* Background line */}
                            <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100" />
                            {/* Active line */}
                            <div
                              className="absolute top-5 left-8 h-0.5 bg-orange-500 transition-all duration-500"
                              style={{
                                width: `calc(${(activeIdx / (steps.length - 1)) * 100}% - 2rem)`,
                              }}
                            />
                            {steps.map((step, idx) => {
                              const isCompleted = idx < activeIdx;
                              const isCurrent = idx === activeIdx;
                              const isPending = idx > activeIdx;
                              return (
                                <div
                                  key={step.key}
                                  className={`flex flex-col items-center gap-2 relative z-10 flex-1 ${isPending ? "opacity-30" : ""}`}
                                >
                                  <div
                                    className={`flex size-10 items-center justify-center rounded-full transition-all duration-300 ${
                                      isCompleted
                                        ? "bg-orange-500 text-white shadow-sm shadow-orange-200"
                                        : isCurrent
                                          ? "bg-white text-orange-500 ring-2 ring-orange-500 shadow-lg"
                                          : "bg-slate-100 text-slate-400"
                                    }`}
                                  >
                                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.icon}
                                  </div>
                                  <div className="text-center px-1">
                                    <p
                                      className={`text-[10px] font-bold leading-tight ${isCurrent ? "text-orange-500" : isCompleted ? "text-slate-800" : "text-slate-500"}`}
                                    >
                                      {step.label}
                                    </p>
                                    <p
                                      className={`text-[9px] mt-0.5 ${isCurrent ? "text-orange-400" : "text-slate-400"}`}
                                    >
                                      {step.subLabel}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </section>

                      {/* GHN Timeline */}
                      {!["pending", "cancelled"].includes(s) && (
                        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="flex items-center gap-3 mb-5">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                              <Clock size={16} />
                            </div>
                            <h3 className="text-base font-bold tracking-tight text-slate-800">
                              Lịch trình giao hàng
                            </h3>
                            <div className="ml-auto flex items-center gap-2">
                              {shippingConnected && (
                                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                  LIVE
                                </span>
                              )}
                              {currentGhnStatus && (
                                <GHNStatusBadge
                                  status={currentGhnStatus}
                                  label={currentGhnStatusText}
                                />
                              )}
                            </div>
                          </div>

                          {trackingCode && (
                            <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-slate-50 rounded-lg border border-slate-100">
                              <Truck size={13} className="text-slate-400" />
                              <span className="text-xs text-slate-500">Mã vận đơn:</span>
                              <span className="text-xs font-mono font-bold text-slate-700 select-all">
                                {trackingCode}
                              </span>
                              {estimatedDelivery && (
                                <>
                                  <span className="text-slate-300 mx-1">•</span>
                                  <span className="text-xs text-slate-500">Dự kiến:</span>
                                  <span className="text-xs font-semibold text-orange-500">
                                    {new Date(estimatedDelivery).toLocaleDateString("vi-VN", {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                    })}
                                  </span>
                                </>
                              )}
                            </div>
                          )}

                          {loadingTracking ? (
                            <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
                              <span className="w-4 h-4 border-2 border-slate-200 border-t-orange-400 rounded-full animate-spin" />
                              Đang tải lịch sử vận chuyển...
                            </div>
                          ) : ghnTrackingError ? (
                            <div className="text-center py-6">
                              <p className="text-xs text-red-400 mb-2">
                                Không thể tải dữ liệu vận chuyển
                              </p>
                              <button
                                onClick={() => {
                                  if (!selectedOrder?.orderId) return;
                                  setLoadingTracking(true);
                                  setGhnTrackingError(false);
                                  CustomerOrderService.getOrderTracking(selectedOrder.orderId)
                                    .then((res) => setGhnTracking(res.data ?? null))
                                    .catch((err) => {
                                      if (err?.response?.status === 404) setGhnTracking(null);
                                      else setGhnTrackingError(true);
                                    })
                                    .finally(() => setLoadingTracking(false));
                                }}
                                className="text-xs text-orange-500 hover:text-orange-600 underline"
                              >
                                Thử lại
                              </button>
                            </div>
                          ) : ghnTracking && ghnTracking.log.length > 0 ? (
                            <div className="relative flex flex-col gap-5 ml-3">
                              <div className="absolute top-2 bottom-2 left-1.25 w-px bg-slate-200" />
                              {ghnTracking.log.map((entry, idx) => {
                                const isFirst = idx === 0;
                                const dt = new Date(entry.updatedDate);
                                return (
                                  <div key={idx} className="relative flex items-start gap-5">
                                    <div
                                      className={`relative z-10 mt-1.5 flex size-2.75 items-center justify-center rounded-full shrink-0 ${isFirst ? "bg-orange-500 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]" : "bg-slate-300"}`}
                                    />
                                    <div className="flex flex-col min-w-0">
                                      <p
                                        className={`text-[11px] font-bold uppercase tracking-wider ${isFirst ? "text-orange-500" : "text-slate-400"}`}
                                      >
                                        {dt.toLocaleDateString("vi-VN", {
                                          day: "2-digit",
                                          month: "2-digit",
                                          year: "numeric",
                                        })}{" "}
                                        {dt.toLocaleTimeString("vi-VN", {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                      <p
                                        className={`mt-0.5 text-sm font-medium ${isFirst ? "text-slate-700" : "text-slate-500 opacity-70"}`}
                                      >
                                        {entry.statusText}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                              {liveShipping && (
                                <p className="text-[10px] text-emerald-600 font-medium pl-8">
                                  ● Cập nhật lúc{" "}
                                  {new Date(liveShipping.occurredAt).toLocaleTimeString("vi-VN")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 text-center py-6 italic">
                              {trackingCode
                                ? "Chưa có cập nhật từ GHN"
                                : "Đơn hàng đang được chuẩn bị bàn giao cho ĐVVC..."}
                            </p>
                          )}
                        </section>
                      )}

                      {/* Products */}
                      <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                          <h3 className="text-base font-bold tracking-tight text-slate-800">
                            Sản phẩm đã chọn
                            <span className="ml-2 text-sm font-normal text-slate-400">
                              ({selectedOrder.orderDetails?.length ?? 0})
                            </span>
                          </h3>
                        </div>
                        <div className="p-2 space-y-1">
                          {selectedOrder.orderDetails?.map((item) => (
                            <div
                              key={item.orderDetailId}
                              className="p-3 flex items-center gap-4 rounded-xl hover:bg-slate-50 transition-colors"
                            >
                              <div className="h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-slate-50 shadow-sm border border-slate-100">
                                {item.productImage ? (
                                  <Image
                                    src={imgUrl(item.productImage)!}
                                    alt={item.productName || "Product image"}
                                    fill
                                    className="object-cover"
                                    sizes="72px"
                                  />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center">
                                    <Package size={22} className="text-slate-300" />
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-1 flex-col min-w-0">
                                <h4 className="font-bold text-slate-900 line-clamp-2 leading-snug">
                                  {item.productName}
                                </h4>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  {fmtVND(item.unitPrice)} / sản phẩm
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    SL: {item.quantity}
                                  </span>
                                  {selectedOrder.statusName === "Completed" && !item.reviewed && (
                                    <button
                                      onClick={() =>
                                        toast("Tính năng đánh giá sắp ra mắt!", { icon: "⭐" })
                                      }
                                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-semibold text-slate-600"
                                    >
                                      <Star size={12} /> Đánh giá
                                    </button>
                                  )}
                                  {item.reviewed && (
                                    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                                      <Star size={11} className="fill-amber-400 text-amber-400" />{" "}
                                      Đã đánh giá
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-orange-500 text-base">
                                  {fmtVND(item.total)}
                                </p>
                                {item.unitPrice !== item.total / item.quantity && (
                                  <p className="text-xs text-slate-400 line-through">
                                    {fmtVND(item.unitPrice * item.quantity)}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>

                    {/* ── Right (1/3) ── */}
                    <div className="flex flex-col gap-5">
                      {/* Shipping info */}
                      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="flex size-8 items-center justify-center rounded-lg bg-orange-100 text-orange-500">
                            <MapPin size={16} />
                          </div>
                          <h3 className="text-base font-bold tracking-tight text-slate-800">
                            Thông tin nhận hàng
                          </h3>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                                Người nhận
                              </p>
                              <p className="text-sm font-bold text-slate-900">
                                {selectedOrder.shippingName || selectedOrder.accountName || "—"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                                Điện thoại
                              </p>
                              <p className="text-sm font-bold text-slate-900">
                                {selectedOrder.shippingPhone || "—"}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
                              Địa chỉ giao hàng
                            </p>
                            <p className="text-sm font-medium leading-relaxed text-slate-600">
                              {[
                                selectedOrder.shippingAddressLine,
                                selectedOrder.shippingWard,
                                selectedOrder.shippingDistrict,
                                selectedOrder.shippingCity,
                              ]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Truck size={12} />
                              <span className="text-xs">
                                {selectedOrder.shippingMethod || "Tiêu chuẩn"}
                              </span>
                            </div>
                            {selectedOrder.shippingInfo?.trackingNumber && (
                              <a
                                href={`https://tracking.ghn.dev/?order_code=${selectedOrder.shippingInfo.trackingNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1"
                              >
                                <Search size={11} /> Tra cứu
                              </a>
                            )}
                          </div>
                        </div>
                      </section>

                      {/* Payment summary */}
                      <section className="rounded-xl border border-orange-200 bg-orange-50/60 p-5 shadow-sm">
                        <h3 className="text-base font-bold tracking-tight text-slate-800 mb-5">
                          Tổng kết thanh toán
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Tạm tính</span>
                            <span className="text-sm font-bold text-slate-900">
                              {fmtVND(subtotal)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">Phí vận chuyển</span>
                            <span className="text-sm font-bold text-slate-900">
                              {fmtVND(selectedOrder.shippingFee)}
                            </span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500">
                                Giảm giá
                                {selectedOrder.voucherCode ? ` (${selectedOrder.voucherCode})` : ""}
                              </span>
                              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                − {fmtVND(discount)}
                              </span>
                            </div>
                          )}
                          {selectedOrder.paidByWalletAmount > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-slate-500 flex items-center gap-1">
                                <Wallet size={12} /> Ví điện tử
                              </span>
                              <span className="text-sm font-bold text-indigo-600">
                                {fmtVND(selectedOrder.paidByWalletAmount)}
                              </span>
                            </div>
                          )}
                          <div className="pt-3 mt-1 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-base font-bold text-slate-900">Tổng cộng</span>
                            <div className="text-right">
                              <p className="text-2xl font-black text-orange-500">
                                {fmtVND(selectedOrder.totalAmount)}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                                Đã bao gồm VAT
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Payment method */}
                        {(selectedOrder.paymentInfo?.paymentMethod ||
                          selectedOrder.paymentInfo?.paymentStatus) && (
                          <div className="mt-4 p-3 rounded-lg bg-white/60 border border-white flex items-center gap-2">
                            <CreditCard size={15} className="text-slate-400 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-500 font-medium truncate">
                                {selectedOrder.paymentInfo.paymentMethod ?? "—"}
                              </p>
                              {selectedOrder.paymentInfo.transactionCode && (
                                <p className="text-[10px] text-slate-400 truncate font-mono">
                                  {selectedOrder.paymentInfo.transactionCode}
                                </p>
                              )}
                            </div>
                            <span
                              className={`text-xs font-semibold shrink-0 ${
                                selectedOrder.paymentInfo.paymentStatus === "Completed"
                                  ? "text-emerald-600"
                                  : selectedOrder.paymentInfo.paymentStatus === "Pending"
                                    ? "text-amber-500"
                                    : "text-red-500"
                              }`}
                            >
                              {selectedOrder.paymentInfo.paymentStatus === "Completed"
                                ? "Đã TT"
                                : selectedOrder.paymentInfo.paymentStatus === "Pending"
                                  ? "Chờ TT"
                                  : (selectedOrder.paymentInfo.paymentStatus ?? "")}
                            </span>
                          </div>
                        )}

                        {/* Refund status */}
                        {selectedOrder.refundStatus && selectedOrder.refundStatus !== "None" && (
                          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg">
                            <ArrowDownCircle size={13} className="text-indigo-500 shrink-0" />
                            <span className="text-xs text-indigo-600 font-medium">
                              {selectedOrder.refundStatus}
                            </span>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-5 flex flex-col gap-2">
                          {selectedOrder.statusName?.toLowerCase() === "pending" && (
                            <button
                              onClick={(e) => handleCancelOrder(selectedOrder.orderId, e)}
                              disabled={cancelling === selectedOrder.orderId}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                            >
                              {cancelling === selectedOrder.orderId ? (
                                <>
                                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                                  Đang huỷ...
                                </>
                              ) : (
                                <>
                                  <XCircle size={15} /> Huỷ đơn hàng
                                </>
                              )}
                            </button>
                          )}
                          {selectedOrder.statusName?.toLowerCase() === "delivered" && (
                            <button
                              onClick={(e) => handleConfirmDelivery(selectedOrder.orderId, e)}
                              disabled={confirming === selectedOrder.orderId}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
                            >
                              {confirming === selectedOrder.orderId ? (
                                <>
                                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />{" "}
                                  Đang xác nhận...
                                </>
                              ) : (
                                <>✓ Đã nhận hàng</>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedOrder(null)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors"
                          >
                            Đóng
                          </button>
                        </div>
                      </section>

                      {/* Order meta */}
                      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-700 mb-3">
                          Thông tin đơn hàng
                        </h3>
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Mã đơn hàng</span>
                            <span className="text-xs font-mono font-bold text-slate-700 select-all">
                              #{selectedOrder.orderCode}
                            </span>
                          </div>
                          {selectedOrder.shippingInfo?.trackingNumber && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Mã vận đơn GHN</span>
                              <span className="text-xs font-mono font-semibold text-blue-600 select-all">
                                {selectedOrder.shippingInfo.trackingNumber}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400">Ngày đặt</span>
                            <span className="text-xs text-slate-600">
                              {selectedOrder.orderDate ? fmtDate(selectedOrder.orderDate) : "—"}
                            </span>
                          </div>
                          {selectedOrder.paymentCompletedAt && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Ngày thanh toán</span>
                              <span className="text-xs text-slate-600">
                                {fmtDate(selectedOrder.paymentCompletedAt)}
                              </span>
                            </div>
                          )}
                          {selectedOrder.voucherCode && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-slate-400">Voucher</span>
                              <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                🏷 {selectedOrder.voucherCode}
                              </span>
                            </div>
                          )}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {/* ─── REFUND REQUEST MODAL ─── */}
      {showRefundModal && refundTargetOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <ArrowDownCircle size={18} className="text-orange-500" />
                Yêu cầu hoàn tiền
              </h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 overflow-y-auto">
              {/* Order info */}
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mã đơn hàng</span>
                  <span className="font-semibold text-gray-800">{refundTargetOrder.orderCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tổng giá trị</span>
                  <span className="font-semibold text-orange-600">
                    {fmtVND(refundTargetOrder.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phương thức hoàn tiền</span>
                  <span className="font-semibold text-indigo-600 flex items-center gap-1">
                    <Wallet size={13} /> Ví điện tử
                  </span>
                </div>
              </div>

              {/* Refund amount */}
              <div>
                <label className={labelCls}>
                  Số tiền hoàn <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={refundTargetOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={`Tối đa ${fmtVND(refundTargetOrder.totalAmount)}`}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Nhập số tiền bạn muốn hoàn (tối đa {fmtVND(refundTargetOrder.totalAmount)})
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className={labelCls}>
                  Lý do hoàn tiền <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Mô tả lý do bạn muốn hoàn tiền..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Note */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-start gap-2">
                <FileText size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-600">
                  Tiền sẽ được hoàn vào <strong>ví điện tử</strong> của bạn sau khi yêu cầu được xét
                  duyệt. Thời gian xử lý thường từ 1-3 ngày làm việc.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowRefundModal(false)}
                disabled={submittingRefund}
                className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-60"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmitRefund}
                disabled={submittingRefund || !refundReason.trim() || !refundAmount}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {submittingRefund ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle size={15} /> Gửi yêu cầu
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── REFUND STATUS MODAL ─── */}
      {showRefundStatus && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <RefreshCw size={18} className="text-indigo-500" />
                Lịch sử hoàn tiền
              </h3>
              <button
                onClick={() => setShowRefundStatus(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5">
              {loadingRefunds ? (
                <div className="flex items-center justify-center py-12">
                  <span className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
                  <span className="ml-3 text-sm text-gray-500">Đang tải...</span>
                </div>
              ) : myRefunds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Inbox size={40} className="mb-3 opacity-40" />
                  <p className="text-sm">Bạn chưa có yêu cầu hoàn tiền nào</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myRefunds.map((refund) => {
                    const refundStatusConfig: Record<
                      string,
                      { label: string; color: string; bg: string }
                    > = {
                      Requested: {
                        label: "Chờ xét duyệt",
                        color: "text-amber-600",
                        bg: "bg-amber-50 border-amber-200",
                      },
                      Approved: {
                        label: "Đã duyệt",
                        color: "text-blue-600",
                        bg: "bg-blue-50 border-blue-200",
                      },
                      Processing: {
                        label: "Đang xử lý",
                        color: "text-violet-600",
                        bg: "bg-violet-50 border-violet-200",
                      },
                      Completed: {
                        label: "Hoàn tất",
                        color: "text-green-600",
                        bg: "bg-green-50 border-green-200",
                      },
                      Rejected: {
                        label: "Từ chối",
                        color: "text-red-500",
                        bg: "bg-red-50 border-red-200",
                      },
                      PartialRefund: {
                        label: "Hoàn một phần",
                        color: "text-orange-500",
                        bg: "bg-orange-50 border-orange-200",
                      },
                      FullRefund: {
                        label: "Hoàn toàn bộ",
                        color: "text-emerald-600",
                        bg: "bg-emerald-50 border-emerald-200",
                      },
                    };
                    const sc = refundStatusConfig[refund.refundStatus] ?? {
                      label: refund.refundStatus,
                      color: "text-gray-500",
                      bg: "bg-gray-50 border-gray-200",
                    };
                    return (
                      <div
                        key={refund.refundId}
                        className="border border-gray-100 rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              {refund.orderCode ?? `#${refund.orderId}`}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {refund.createdAt ? fmtDate(refund.createdAt) : "—"}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.color}`}
                          >
                            {sc.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="text-gray-400">Số tiền YC:</span>{" "}
                            <span className="font-medium text-orange-600">
                              {fmtVND(refund.refundAmount)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Phương thức:</span>{" "}
                            <span className="font-medium">
                              {refund.refundMode === "Wallet" ? "Ví điện tử" : refund.refundMode}
                            </span>
                          </div>
                          {refund.approvedByName && (
                            <div className="col-span-2">
                              <span className="text-gray-400">Xét duyệt bởi:</span>{" "}
                              <span className="font-medium">{refund.approvedByName}</span>
                            </div>
                          )}
                        </div>

                        {refund.reason && (
                          <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 italic">
                            &ldquo;{refund.reason}&rdquo;
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
              <button
                onClick={() => setShowRefundStatus(false)}
                className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CustomerProfilePage() {
  return (
    <Suspense fallback={null}>
      <CustomerProfilePageContent />
    </Suspense>
  );
}
