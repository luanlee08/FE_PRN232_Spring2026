"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User, MapPin, ClipboardList, Ticket, LogOut,
  Camera, X, Plus, Trash2, Star, Package,
  ChevronRight, Edit2, Check, Search,
  Clock, Truck, CheckCircle, XCircle, RefreshCw, CreditCard, Calendar, Phone, FileText, Inbox,
} from "lucide-react";
import {
  CustomerProfileService,
  ProfileResponse,
} from "@/services/customer_services/customer.profile.service";
import { CustomerAddressService } from "@/services/customer_services/customer.address.service";
import { CustomerOrderService } from "@/services/customer_services/customer.order.service";
import { AddressResponse, AddressRequest, AddressUpdateRequest } from "@/types/address";
import { OrderDto } from "@/types/order";
import { LocationService, Province, District, Ward } from "@/services/location.service";
import { useAuth } from "@/lib/auth/auth-context";
import { Footer } from "@/components/customer/footer";
import { API_BASE } from "@/configs/api-configs";
import Cookies from "js-cookie";

type Tab = "profile" | "addresses" | "orders" | "vouchers";
type StatusKey = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

/* ── helpers ── */
const imgUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending: { label: "Chờ xử lý", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  processing: { label: "Đang xử lý", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: RefreshCw },
  shipped: { label: "Đang giao", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: Truck },
  delivered: { label: "Hoàn thành", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
  cancelled: { label: "Đã huỷ", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: XCircle },
};
const ORDER_TABS: { key: StatusKey; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xử lý" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipped", label: "Đang giao" },
  { key: "delivered", label: "Hoàn thành" },
  { key: "cancelled", label: "Đã huỷ" },
];
const ORDER_PAGE_SIZE = 5;

const fmtVND = (n: number) => n?.toLocaleString("vi-VN") + "₫";
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

const inputCls = "w-full px-3 py-2.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 transition bg-white disabled:bg-gray-50 disabled:cursor-not-allowed";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

/* ── hover nav ── */
type SubItem = { label: string; action: (setTab: (t: Tab) => void) => void };
const SUB_MENUS: Record<Tab, SubItem[]> = {
  profile: [{ label: "Thông tin cá nhân", action: s => s("profile") }],
  addresses: [{ label: "Địa chỉ của tôi", action: s => s("addresses") }],
  orders: [{ label: "Đơn mua của tôi", action: s => s("orders") }],
  vouchers: [{ label: "Kho voucher", action: s => s("vouchers") }],
};

function SideNavItem({ id, label, icon: Icon, active, onSelect, setTab }: {
  id: Tab; label: string; icon: React.ElementType; active: boolean;
  onSelect: (id: Tab) => void; setTab: (t: Tab) => void;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enter = () => { if (timer.current) clearTimeout(timer.current); setOpen(true); };
  const leave = () => { timer.current = setTimeout(() => setOpen(false), 200); };
  return (
    <div className="relative overflow-visible" onMouseEnter={enter} onMouseLeave={leave}>
      <button onClick={() => { onSelect(id); setOpen(false); }}
        className={`w-full relative flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 text-left select-none
          ${active
            ? "text-orange-600 bg-orange-50/50 font-bold"
            : "text-gray-600 hover:text-orange-500 hover:bg-orange-50/30"
          }`}>
        {/* Active Indicator Bar */}
        <div className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-all duration-300 ${active ? "bg-orange-500 opacity-100" : "bg-transparent opacity-0"}`} />

        <Icon size={18} className={`transition-colors duration-200 ${active ? "text-orange-500" : "text-gray-400 group-hover:text-orange-400"}`} />
        <span className="flex-1 truncate">{label}</span>
        {active && <ChevronRight size={14} className="text-orange-400/70 flex-shrink-0 animate-pulse" />}
      </button>

      {open && <div className="absolute left-full top-0 w-2 h-full" />}
      {open && (
        <div onMouseEnter={enter} onMouseLeave={leave}
          className="absolute left-full top-0 ml-2 z-[9999] w-56 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-gray-100 py-1.5 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
          <div className="px-4 py-2 border-b border-gray-50 mb-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.1em]">{label}</p>
          </div>
          {SUB_MENUS[id].map((sub, i) => (
            <button key={i} onClick={() => { sub.action(setTab); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-all duration-150 flex items-center justify-between group">
              <span>{sub.label}</span>
              <ChevronRight size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════ ORDER TRACKING STEPPER ═══════════ */
function OrderTrackingStepper({ order }: { order: OrderDto }) {
  const steps = [
    { key: "Pending", label: "Đơn hàng đã đặt", icon: FileText },
    { key: "Confirmed", label: "Đã xác nhận", icon: CreditCard },
    { key: "Shipped", label: "Đã giao ĐVVC", icon: Truck },
    { key: "Delivered", label: "Đã nhận hàng", icon: Inbox },
    { key: "Completed", label: "Đánh giá", icon: Star },
  ];

  const s = order.statusName?.toLowerCase() || "";
  let activeIdx = 0;
  if (["confirmed", "processing"].includes(s)) activeIdx = 1;
  else if (s === "shipped") activeIdx = 2;
  else if (s === "delivered") activeIdx = 3;
  else if (s === "completed") activeIdx = 4;
  
  const isFailed = ["cancelled", "refunded"].includes(s);

  const getDate = (stepKey: string) => {
    if (stepKey === "Pending") return order.orderDate;
    if (stepKey === "Confirmed") return order.paymentCompletedAt || order.statusHistory?.find(h => ["Confirmed", "Processing"].includes(h.statusName || ""))?.changedAt;
    return order.statusHistory?.find(h => h.statusName === stepKey)?.changedAt;
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }); // Redefine just in case context is weird, but actually it is defined above. Wait, if I use the one above, I don't need this.
  // Actually, let's just use the one from scope if available.
  
  return (
    <div className="w-full px-4 pt-10 pb-6">
      <div className="relative flex items-center justify-between">
        {/* Background Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 -z-10 rounded-full" />
        
        {/* Active Line */}
        <div 
          className={`absolute top-5 left-0 h-1 rounded-full transition-all duration-500 -z-10 ${isFailed ? "bg-red-500" : "bg-green-600"}`}
          style={{ width: isFailed ? "100%" : `${Math.min(100, (activeIdx / (steps.length - 1)) * 100)}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = !isFailed && index <= activeIdx;
          const isCurrent = !isFailed && index === activeIdx;
          const date = getDate(step.key);

          let circleClass = "border-gray-300 bg-white text-gray-400";
          let labelClass = "text-gray-400";
          let iconSize = 18;

          if (isFailed) {
             circleClass = "border-red-500 bg-white text-red-500";
             labelClass = "text-red-500";
          } else if (isCompleted) {
             circleClass = "border-green-600 bg-green-600 text-white shadow-md shadow-green-200 scale-110";
             labelClass = "text-green-700 font-semibold";
             iconSize = 20;
          } else if (isCurrent) {
             circleClass = "border-green-600 bg-white text-green-600 ring-4 ring-green-50 scale-110";
             labelClass = "text-green-600 font-medium";
             iconSize = 20;
          }

          return (
            <div key={step.key} className="flex flex-col items-center relative group" style={{ width: "20%" }}>
              <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${circleClass}`}>
                {isFailed && index === steps.length -1 ? <XCircle size={18} /> : 
                 (isCompleted && !isFailed ? <Check size={iconSize} strokeWidth={3} /> : <Icon size={iconSize} />)}
              </div>
              <p className={`text-[11px] mt-3 text-center transition-all duration-300 px-1 leading-tight ${labelClass}`}>
                {step.label}
              </p>
              <div className="h-8 flex flex-col items-center justify-start mt-1">
                <p className="text-[10px] text-gray-400 font-medium leading-none">
                    {date ? new Date(date).toLocaleDateString("vi-VN", {day:"2-digit", month:"2-digit"}) : ""}
                </p>
                {date && (
                    <p className="text-[9px] text-gray-400 leading-none mt-0.5">
                    {new Date(date).toLocaleTimeString("vi-VN", {hour:"2-digit", minute:"2-digit"})}
                    </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isFailed && <p className="text-center text-red-500 font-medium mt-2 bg-red-50 py-2 rounded-lg border border-red-100">Đơn hàng đã bị huỷ</p>}
    </div>
  );
}

/* ═══════════ PAGE ═══════════ */
export default function CustomerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, logout } = useAuth();
  const [tab, setTab] = useState<Tab>("profile");

  /* ── deep-link: /profile?tab=orders — reactive to URL changes ── */
  useEffect(() => {
    const validTabs: Tab[] = ["profile", "addresses", "orders", "vouchers"];
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

  /* ── addresses state ── */
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressResponse | null>(null);
  const [addrSubmitting, setAddrSubmitting] = useState(false);
  const emptyAddrForm = (): AddressRequest => ({ recipientName: "", phoneNumber: "", addressLine: "", district: "", ward: "", city: "", isDefault: false });
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

  /* ── auth guard ── */
  useEffect(() => {
    if (!Cookies.get("accessToken")) { router.push("/login"); return; }
    fetchProfile();
    LocationService.getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (tab === "addresses" && addresses.length === 0) fetchAddresses();
    if (tab === "orders") { setOrderTab("all"); setOrderPage(1); fetchOrders("all", 1); }
  }, [tab]);

  useEffect(() => {
    if (selProv) LocationService.getDistricts(selProv).then(setDistricts);
    else { setDistricts([]); setWards([]); }
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
    } finally { setLoadingProfile(false); }
  };

  const fetchAddresses = async () => {
    try { setLoadingAddr(true); const r = await CustomerAddressService.getAll(); if (r.status === 200) setAddresses(r.data || []); }
    catch { toast.error("Không thể tải địa chỉ"); } finally { setLoadingAddr(false); }
  };

  const fetchOrders = useCallback(async (status: StatusKey = "all", page = 1) => {
    try {
      setLoadingOrders(true);
      const statusParam = status === "all" ? undefined : status.charAt(0).toUpperCase() + status.slice(1);
      const r = await CustomerOrderService.getMyOrders(statusParam, page, ORDER_PAGE_SIZE);
      if (r.status === 200 && r.data) {
        setOrders(r.data.items ?? []);
        setOrderTotalCount(r.data.totalCount ?? 0);
      }
    } catch { toast.error("Không thể tải đơn hàng"); } finally { setLoadingOrders(false); }
  }, []);

  /* ── profile handlers ── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Chọn file ảnh"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh < 5 MB"); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (selectedFile) await CustomerProfileService.updateAvatar(selectedFile);
      const r = await CustomerProfileService.updateProfile(form);
      if (r.status === 200) {
        toast.success("Cập nhật thành công 🎉");
        const up = await CustomerProfileService.getProfile();
        if (up.status === 200 && up.data) {
          const raw = Cookies.get("user");
          if (raw) Cookies.set("user", JSON.stringify({ ...JSON.parse(raw), ...up.data }), { expires: 7 });
        }
        await fetchProfile(); refreshUser();
        setEditing(false); setSelectedFile(null);
      }
    } catch { toast.error("Cập nhật thất bại"); } finally { setSaving(false); }
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
    setSelProv(null); setSelDist(null); setSelWard(null);
    setDistricts([]); setWards([]);
    setShowAddrModal(true);
  };

  const openEditAddr = async (addr: AddressResponse) => {
    setEditingAddr(addr);
    setAddrForm({
      recipientName: addr.recipientName || "", phoneNumber: addr.phoneNumber || "",
      addressLine: addr.addressLine, district: addr.district || "",
      ward: addr.ward || "", city: addr.city,
      provinceId: addr.provinceId, districtId: addr.districtId,
      wardCode: addr.wardCode, isDefault: addr.isDefault,
    });
    if (addr.city) {
      const mp = provinces.find(p => p.name === addr.city || p.full_name === addr.city);
      if (mp) {
        setSelProv(mp.code);
        const dl = await LocationService.getDistricts(mp.code);
        setDistricts(dl);
        if (addr.district) {
          const md = dl.find(d => d.name === addr.district || d.full_name === addr.district);
          if (md) {
            setSelDist(md.code);
            const wl = await LocationService.getWards(md.code);
            setWards(wl);
            if (addr.ward) {
              const mw = wl.find(w => w.name === addr.ward || w.full_name === addr.ward);
              if (mw) setSelWard(String(mw.code));
            }
          }
        }
      } else { setSelProv(null); setSelDist(null); setSelWard(null); setDistricts([]); setWards([]); }
    }
    setShowAddrModal(true);
  };

  const closeAddrModal = () => {
    setShowAddrModal(false); setEditingAddr(null); setAddrForm(emptyAddrForm());
    setSelProv(null); setSelDist(null); setSelWard(null);
    setDistricts([]); setWards([]);
  };

  const handleProvChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelProv(code || null); setSelDist(null); setSelWard(null); setDistricts([]); setWards([]);
    const prov = provinces.find(p => p.code === code);
    if (prov) {
      const name = prov.name;
      setAddrForm(prev => ({ ...prev, city: name, provinceId: undefined, district: "", districtId: undefined, ward: "", wardCode: undefined }));
      LocationService.resolveGHNProvince(name).then(ghn => { if (ghn) setAddrForm(prev => ({ ...prev, provinceId: ghn.provinceId })); });
    }
  };

  const handleDistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    setSelDist(code || null); setSelWard(null); setWards([]);
    const dist = districts.find(d => d.code === code);
    if (dist) {
      const name = dist.name;
      setAddrForm(prev => ({ ...prev, district: name, districtId: undefined, ward: "", wardCode: undefined }));
      setAddrForm(prev => {
        if (prev.provinceId) LocationService.resolveGHNDistrict(prev.provinceId, name).then(ghn => { if (ghn) setAddrForm(p => ({ ...p, districtId: ghn.districtId })); });
        return prev;
      });
    } else setAddrForm(prev => ({ ...prev, district: "", districtId: undefined, ward: "", wardCode: undefined }));
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = parseInt(e.target.value);
    const ward = wards.find(w => w.code === code);
    if (ward) {
      const name = ward.name;
      setSelWard(String(code));
      setAddrForm(prev => ({ ...prev, ward: name, wardCode: undefined }));
      setAddrForm(prev => {
        if (prev.districtId) LocationService.resolveGHNWard(prev.districtId, name).then(ghn => { if (ghn) setAddrForm(p => ({ ...p, wardCode: ghn.wardCode })); });
        return prev;
      });
    }
  };

  const handleAddrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrForm.recipientName.trim() || !addrForm.phoneNumber.trim() || !addrForm.addressLine.trim() || !addrForm.city.trim() || !addrForm.district?.trim() || !addrForm.ward?.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin địa chỉ"); return;
    }
    if (!/^(0|\+84)[0-9]{9,10}$/.test(addrForm.phoneNumber.trim())) {
      toast.error("Số điện thoại không hợp lệ"); return;
    }
    setAddrSubmitting(true);
    try {
      if (editingAddr) {
        const res = await CustomerAddressService.update(editingAddr.addressId, { ...addrForm, addressId: editingAddr.addressId } as AddressUpdateRequest);
        if (res.status === 200) { toast.success("Cập nhật địa chỉ thành công"); fetchAddresses(); closeAddrModal(); }
      } else {
        const res = await CustomerAddressService.create(addrForm);
        if (res.status === 201 || res.status === 200) { toast.success("Thêm địa chỉ thành công"); fetchAddresses(); closeAddrModal(); }
      }
    } catch (err: any) { toast.error(err?.response?.data?.message || "Có lỗi xảy ra"); }
    finally { setAddrSubmitting(false); }
  };

  const handleDeleteAddr = async (id: number) => {
    if (!confirm("Xoá địa chỉ này?")) return;
    try { await CustomerAddressService.delete(id); toast.success("Đã xoá"); setAddresses(p => p.filter(a => a.addressId !== id)); }
    catch { toast.error("Xoá thất bại"); }
  };

  const handleSetDefault = async (id: number) => {
    try { await CustomerAddressService.setDefault(id); toast.success("Đã đặt mặc định"); fetchAddresses(); }
    catch { toast.error("Thất bại"); }
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
    } catch (err: any) { toast.error(err?.response?.data?.message || "Không thể huỷ đơn"); }
    finally { setCancelling(null); }
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

  const filteredOrders = orders.filter(o => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return o.orderCode?.toLowerCase().includes(q) || o.shippingName?.toLowerCase().includes(q);
  });

  const orderTabCount = (key: StatusKey) => key === orderTab ? orderTotalCount : 0;
  const totalOrderPages = Math.ceil(orderTotalCount / ORDER_PAGE_SIZE);

  /* ── nav ── */
  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Tài Khoản Của Tôi", icon: User },
    { id: "addresses", label: "Địa Chỉ", icon: MapPin },
    { id: "orders", label: "Đơn Mua", icon: ClipboardList },
    { id: "vouchers", label: "Kho Voucher", icon: Ticket },
  ];

  /* skeleton */
  if (loadingProfile) return (
    <>
      <div className="min-h-screen bg-[#f5f5f5] py-6">
        <div className="max-w-5xl mx-auto px-4 flex gap-4 animate-pulse">
          <div className="w-48 bg-white rounded-sm h-64 flex-shrink-0" />
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
            <aside className="w-[220px] flex-shrink-0 bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100 overflow-visible sticky top-20 self-start">
              <div className="px-5 py-6 border-b border-gray-50 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    {avatarPreview
                      ? <img src={imgUrl(avatarPreview)!} alt="avatar" className="w-full h-full object-cover" />
                      : <div className="w-full h-full bg-orange-50 flex items-center justify-center"><User size={28} className="text-orange-300" /></div>
                    }
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full shadow-sm" />
                </div>
                <div className="mt-3 text-center">
                  <p className="font-bold text-sm text-gray-800 truncate px-2">{profile?.accountName || "User"}</p>
                  <button onClick={() => setTab("profile")} className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-orange-500 transition-colors mt-1 group">
                    <Edit2 size={10} className="group-hover:rotate-12 transition-transform" /> Sửa Hồ Sơ
                  </button>
                </div>
              </div>
              <nav className="p-2.5 overflow-visible">
                {navItems.map(({ id, label, icon }) => (
                  <SideNavItem key={id} id={id} label={label} icon={icon} active={tab === id} onSelect={setTab} setTab={setTab} />
                ))}
                <div className="border-t border-gray-50 pt-2 mt-2">
                  <button onClick={() => logout()}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-all duration-200">
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
                    <p className="text-sm text-gray-400 mt-0.5">Quản lý thông tin hồ sơ để bảo mật tài khoản</p>
                  </div>
                  <div className="px-8 py-7">
                    <div className="flex gap-10">
                      <form onSubmit={handleSave} className="flex-1 space-y-5">
                        {([
                          { label: "Tên đăng nhập", field: "accountName" as const, type: "text" },
                          { label: "Số điện thoại", field: "phoneNumber" as const, type: "tel" },
                        ] as const).map(({ label, field, type }) => (
                          <div key={field} className="flex items-center">
                            <label className="w-36 text-sm text-gray-500 text-right pr-5 flex-shrink-0">{label}</label>
                            {editing
                              ? <input type={type} value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 transition" />
                              : <span className="text-sm text-gray-700">{form[field] || <span className="text-gray-400 italic">Chưa cập nhật</span>}</span>
                            }
                          </div>
                        ))}
                        <div className="flex items-center">
                          <label className="w-36 text-sm text-gray-500 text-right pr-5 flex-shrink-0">Email</label>
                          <span className="text-sm text-gray-700">{profile?.email}</span>
                        </div>
                        <div className="flex items-center">
                          <label className="w-36 text-sm text-gray-500 text-right pr-5 flex-shrink-0">Thành viên từ</label>
                          <span className="text-sm text-gray-500" suppressHydrationWarning>
                            {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-36 flex-shrink-0" />
                          {editing ? (
                            <div className="flex gap-3">
                              <button type="button" onClick={cancelEdit} disabled={saving}
                                className="px-6 py-2 border border-gray-300 text-gray-600 rounded text-sm hover:bg-gray-50 transition">Huỷ</button>
                              <button type="submit" disabled={saving}
                                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition disabled:opacity-60 flex items-center gap-2">
                                {saving && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                                {saving ? "Đang lưu..." : "Lưu"}
                              </button>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setEditing(true)}
                              className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-sm font-medium transition">Chỉnh sửa</button>
                          )}
                        </div>
                      </form>
                      <div className="flex flex-col items-center gap-4 flex-shrink-0 w-36 border-l border-gray-100 pl-8">
                        <div className="relative">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-100">
                            {avatarPreview
                              ? <img src={imgUrl(avatarPreview)!} alt="avatar" className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-gradient-to-br from-orange-300 to-red-400 flex items-center justify-center"><User size={36} className="text-white" /></div>
                            }
                          </div>
                          {editing && (
                            <label className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 transition">
                              <Camera size={13} className="text-gray-500" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                          )}
                        </div>
                        {editing && <p className="text-xs text-gray-400 text-center leading-relaxed">Click icon camera<br />để đổi ảnh. Tối đa 5 MB</p>}
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
                      <p className="text-xs text-gray-400 mt-0.5">{addresses.length} địa chỉ đã lưu</p>
                    </div>
                    <button onClick={openAddAddr}
                      className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition">
                      <Plus size={15} /> Thêm địa chỉ mới
                    </button>
                  </div>
                  <div className="p-6">
                    {loadingAddr ? (
                      <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-50 rounded animate-pulse" />)}</div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MapPin size={30} className="text-orange-300" />
                        </div>
                        <p className="text-gray-500 font-medium mb-1">Bạn chưa có địa chỉ nào</p>
                        <p className="text-gray-400 text-sm mb-5">Thêm địa chỉ để thanh toán nhanh hơn</p>
                        <button onClick={openAddAddr} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition">
                          Thêm địa chỉ đầu tiên
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {addresses.map(addr => (
                          <div key={addr.addressId} className="py-5 flex items-start gap-4">
                            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              {addr.isDefault ? <Star size={16} className="text-orange-400 fill-orange-400" /> : <MapPin size={16} className="text-gray-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 flex-wrap mb-1">
                                <span className="font-semibold text-gray-800">{addr.recipientName}</span>
                                <span className="text-gray-200">|</span>
                                <span className="text-sm text-gray-500">{addr.phoneNumber}</span>
                                {addr.isDefault && <span className="px-1.5 py-0.5 border border-orange-400 text-orange-500 text-[11px] rounded">Mặc Định</span>}
                              </div>
                              <p className="text-sm text-gray-600">{addr.addressLine}</p>
                              <p className="text-sm text-gray-400 mt-0.5">{[addr.ward, addr.district, addr.city].filter(Boolean).join(", ")}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <button onClick={() => openEditAddr(addr)}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors">
                                  <Edit2 size={12} /> Cập nhật
                                </button>
                                {!addr.isDefault && (
                                  <button onClick={() => handleDeleteAddr(addr.addressId)}
                                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                                    <Trash2 size={12} /> Xóa
                                  </button>
                                )}
                              </div>
                              {!addr.isDefault && (
                                <button onClick={() => handleSetDefault(addr.addressId)}
                                  className="flex items-center gap-1 px-3 py-1 border border-gray-200 text-xs text-gray-500 hover:border-orange-400 hover:text-orange-500 rounded transition-colors">
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
                <div className="bg-white rounded-sm">
                  {/* sticky header + tabs */}
                  <div className="sticky top-16 z-20 bg-white rounded-t-sm">
                    {/* header */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                      <div>
                        <h1 className="text-lg font-medium text-gray-800">Đơn Mua</h1>
                        <p className="text-xs text-gray-400 mt-0.5">{orderTotalCount} đơn hàng</p>
                      </div>
                      <div className="relative flex-shrink-0 w-52">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                          placeholder="Tìm mã đơn..."
                          className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 transition" />
                        {orderSearch && (
                          <button onClick={() => setOrderSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>
                        )}
                      </div>
                    </div>

                    {/* status tabs */}
                    <div className="flex border-b border-gray-100 overflow-x-auto">
                      {ORDER_TABS.map(t => {
                        const cnt = orderTabCount(t.key);
                        const active = orderTab === t.key;
                        return (
                          <button key={t.key} onClick={() => handleOrderTab(t.key)}
                            className={`flex-shrink-0 flex items-center gap-1 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${active ? "border-orange-500 text-orange-500" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                            {t.label}
                            {cnt > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>{cnt}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* order list */}
                  <div className="divide-y divide-gray-100">
                    {loadingOrders ? (
                      <div className="p-6 space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-50 rounded animate-pulse" />)}</div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-16">
                        <Package size={40} className="text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">{orderSearch ? `Không tìm thấy "${orderSearch}"` : "Không có đơn hàng nào"}</p>
                      </div>
                    ) : (
                      filteredOrders.map(order => {
                        const skey = order.statusName?.toLowerCase() as string;
                        const st = STATUS_MAP[skey] ?? { label: order.statusName, color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: Package };
                        const Icon = st.icon;
                        const canCancel = skey === "pending";
                        return (
                          <div key={order.orderId} onClick={() => setSelectedOrder(order)}
                            className="px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                            {/* order meta */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Package size={13} className="text-orange-400" />
                                <span className="text-xs font-medium text-gray-600">#{order.orderCode}</span>
                                {order.orderDate && <span className="text-xs text-gray-400">{fmtDate(order.orderDate)}</span>}
                              </div>
                              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${st.bg} ${st.color}`}>
                                <Icon size={11} />{st.label}
                              </div>
                            </div>
                            {/* items */}
                            <div className="space-y-2">
                              {order.orderDetails?.slice(0, 2).map(item => (
                                <div key={item.orderDetailId} className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                                    {item.productImage
                                      ? <img src={imgUrl(item.productImage)!} alt={item.productName} className="w-full h-full object-cover" />
                                      : <div className="w-full h-full flex items-center justify-center"><Package size={14} className="text-gray-300" /></div>
                                    }
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-700 truncate">{item.productName}</p>
                                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                                  </div>
                                  <p className="text-sm font-semibold text-orange-500 flex-shrink-0">{fmtVND(item.total)}</p>
                                </div>
                              ))}
                              {(order.orderDetails?.length ?? 0) > 2 && (
                                <p className="text-xs text-gray-400 italic pl-15">+{order.orderDetails.length - 2} sản phẩm khác</p>
                              )}
                            </div>
                            {/* footer */}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                {canCancel && (
                                  <button onClick={e => handleCancelOrder(order.orderId, e)}
                                    disabled={cancelling === order.orderId}
                                    className="px-3 py-1 border border-gray-200 text-gray-500 text-xs rounded hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
                                    {cancelling === order.orderId ? "Đang huỷ..." : "Huỷ đơn"}
                                  </button>
                                )}
                                <span className="text-xs text-gray-400">Xem chi tiết →</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-gray-500">Tổng:</span>
                                <span className="text-sm font-bold text-orange-500">{fmtVND(order.totalAmount)}</span>
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
                        >‹</button>
                        {Array.from({ length: totalOrderPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalOrderPages || Math.abs(p - orderPage) <= 1)
                          .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) =>
                            p === "..." ? (
                              <span key={`e${i}`} className="px-1.5 text-xs text-gray-400">…</span>
                            ) : (
                              <button
                                key={p}
                                onClick={() => handleOrderPage(p as number)}
                                className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                                  p === orderPage
                                    ? "bg-orange-500 border-orange-500 text-white"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50"
                                }`}
                              >{p}</button>
                            )
                          )}
                        <button
                          onClick={() => handleOrderPage(orderPage + 1)}
                          disabled={orderPage === totalOrderPages}
                          className="px-2 py-1 text-xs rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >›</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── VOUCHER ─── */}
              {tab === "vouchers" && (
                <div className="bg-white rounded-sm">
                  <div className="px-6 py-4 border-b border-gray-100"><h1 className="text-lg font-medium text-gray-800">Kho Voucher</h1></div>
                  <div className="p-6 text-center py-16">
                    <Ticket size={44} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Bạn chưa có voucher nào</p>
                    <p className="text-gray-300 text-sm mt-1">Theo dõi chương trình khuyến mãi để nhận voucher</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* ══ ADDRESS MODAL ══ */}
      {showAddrModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) closeAddrModal(); }}>
          <div className="bg-white rounded-lg w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-800">{editingAddr ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}</h2>
              <button onClick={closeAddrModal} className="text-gray-400 hover:text-gray-600 transition p-1 rounded hover:bg-gray-100"><X size={18} /></button>
            </div>
            <form id="addr-form" onSubmit={handleAddrSubmit} className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tên người nhận <span className="text-red-400">*</span></label>
                  <input type="text" value={addrForm.recipientName} onChange={e => setAddrForm({ ...addrForm, recipientName: e.target.value })} placeholder="VD: Nguyễn Văn A" className={inputCls} required />
                </div>
                <div>
                  <label className={labelCls}>Số điện thoại <span className="text-red-400">*</span></label>
                  <input type="tel" value={addrForm.phoneNumber} onChange={e => setAddrForm({ ...addrForm, phoneNumber: e.target.value })} placeholder="0912345678" className={inputCls} required />
                </div>
              </div>
              <div>
                <label className={labelCls}>Địa chỉ chi tiết <span className="text-red-400">*</span></label>
                <input type="text" value={addrForm.addressLine} onChange={e => setAddrForm({ ...addrForm, addressLine: e.target.value })} placeholder="Số nhà, tên đường..." className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Tỉnh / Thành phố <span className="text-red-400">*</span></label>
                <select value={selProv || ""} onChange={handleProvChange} className={inputCls} required>
                  <option value="">-- Chọn Tỉnh / Thành phố --</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Quận / Huyện <span className="text-red-400">*</span></label>
                  <select value={selDist || ""} onChange={handleDistChange} disabled={!selProv} className={inputCls} required>
                    <option value="">-- Chọn Quận / Huyện --</option>
                    {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Phường / Xã <span className="text-red-400">*</span></label>
                  <select value={selWard || ""} onChange={handleWardChange} disabled={!selDist} className={inputCls} required>
                    <option value="">-- Chọn Phường / Xã --</option>
                    {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                  disabled={addresses.length === 0 || editingAddr?.isDefault === true} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-gray-600">Đặt làm địa chỉ mặc định</span>
              </label>
            </form>
            <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button type="button" onClick={closeAddrModal} disabled={addrSubmitting}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded hover:bg-gray-100 transition">Huỷ</button>
              <button type="submit" form="addr-form" disabled={addrSubmitting}
                className="flex-1 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded font-medium transition disabled:opacity-60 flex items-center justify-center gap-2">
                {addrSubmitting && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                {addrSubmitting ? "Đang lưu..." : editingAddr ? "Lưu cập nhật" : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ORDER DETAIL MODAL ══ */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={e => { if (e.target === e.currentTarget) setSelectedOrder(null); }}>
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-800">Chi tiết đơn hàng</h2>
                <p className="text-xs text-gray-400 mt-0.5">#{selectedOrder.orderCode}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {/* status - Order Tracking Stepper */}
              <OrderTrackingStepper order={selectedOrder} />
              {/* info grid */}
              <div className="px-6 mt-5 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Khách hàng</h3>
                  <div className="flex items-start gap-2"><User size={13} className="text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-700">{selectedOrder.shippingName || selectedOrder.accountName || "—"}</p></div>
                  <div className="flex items-start gap-2"><Phone size={13} className="text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-700">{selectedOrder.shippingPhone || "—"}</p></div>
                  <div className="flex items-start gap-2"><MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-700 leading-relaxed">{[selectedOrder.shippingAddressLine, selectedOrder.shippingWard, selectedOrder.shippingDistrict, selectedOrder.shippingCity].filter(Boolean).join(", ") || "—"}</p></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2.5">
                  <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Đơn hàng</h3>
                  <div className="flex items-start gap-2"><Calendar size={13} className="text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-700">{selectedOrder.orderDate ? fmtDate(selectedOrder.orderDate) : "—"}</p></div>
                  {selectedOrder.paymentCompletedAt && (
                    <div className="flex items-start gap-2"><CreditCard size={13} className="text-gray-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-gray-700">TT: {fmtDate(selectedOrder.paymentCompletedAt)}</p></div>
                  )}
                  {selectedOrder.refundStatus && selectedOrder.refundStatus !== "None" && (
                    <div className="flex items-start gap-2"><RefreshCw size={13} className="text-orange-400 mt-0.5 flex-shrink-0" /><p className="text-sm text-orange-600">{selectedOrder.refundStatus}</p></div>
                  )}
                </div>
              </div>
              {/* products */}
              <div className="px-6 mt-5">
                <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Sản phẩm ({selectedOrder.orderDetails?.length ?? 0})</h3>
                <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                  {selectedOrder.orderDetails?.map(item => (
                    <div key={item.orderDetailId} className="flex items-center gap-4 p-4">
                      <div className="w-14 h-14 rounded border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                        {item.productImage ? <img src={imgUrl(item.productImage)!} alt={item.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-gray-300" /></div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{fmtVND(item.unitPrice)} × {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-orange-500 flex-shrink-0">{fmtVND(item.total)}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* total */}
              <div className="px-6 mt-4 mb-6">
                <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Tổng thanh toán</span>
                  <span className="text-xl font-bold text-orange-500">{fmtVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">Đóng</button>
              {selectedOrder.statusName?.toLowerCase() === "pending" && (
                <button onClick={e => handleCancelOrder(selectedOrder.orderId, e)} disabled={cancelling === selectedOrder.orderId}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2">
                  {cancelling === selectedOrder.orderId
                    ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Đang huỷ...</>
                    : <><XCircle size={15} /> Huỷ đơn hàng</>
                  }
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
