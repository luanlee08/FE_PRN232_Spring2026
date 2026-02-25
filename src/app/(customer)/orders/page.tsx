"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    Package, ArrowLeft, Search, ChevronDown, X,
    MapPin, Phone, User, Calendar, CreditCard,
    Clock, Truck, CheckCircle, XCircle, RefreshCw,
} from "lucide-react";
import { CustomerOrderService } from "@/services/customer_services/customer.order.service";
import { OrderResponse, OrderDetailItemResponse } from "@/types/order";
import { useAuth } from "@/lib/auth/auth-context";
import { Footer } from "@/components/customer/footer";
import { API_BASE } from "@/configs/api-configs";

/* ── helpers ── */
const imgUrl = (u?: string | null) => {
    if (!u) return null;
    if (u.startsWith("data:") || u.startsWith("http")) return u;
    return `${API_BASE}${u}`;
};

type StatusKey = "all" | "pending" | "processing" | "shipped" | "delivered" | "cancelled";

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
    pending: { label: "Chờ xử lý", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
    processing: { label: "Đang xử lý", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: RefreshCw },
    shipped: { label: "Đang giao", color: "text-violet-600", bg: "bg-violet-50 border-violet-200", icon: Truck },
    delivered: { label: "Hoàn thành", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle },
    cancelled: { label: "Đã huỷ", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: XCircle },
};

const TABS: { key: StatusKey; label: string }[] = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "processing", label: "Đang xử lý" },
    { key: "shipped", label: "Đang giao" },
    { key: "delivered", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã huỷ" },
];

const fmtVND = (n: number) => n.toLocaleString("vi-VN") + "₫";
const fmtDate = (s: string) => new Date(s).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function OrdersPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<StatusKey>("all");
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState<OrderResponse | null>(null);
    const [cancelling, setCancelling] = useState<number | null>(null);

    /* auth */
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            toast.error("Vui lòng đăng nhập");
            router.push("/login");
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await CustomerOrderService.getMyOrders();
            if (res.status === 200) {
                const data = res.data;
                setOrders(Array.isArray(data) ? data : []);
            }
        } catch { toast.error("Không thể tải đơn hàng"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { if (isAuthenticated) fetchOrders(); }, [isAuthenticated, fetchOrders]);

    /* cancel */
    const handleCancel = async (orderId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
        setCancelling(orderId);
        try {
            const res = await CustomerOrderService.cancelOrder(orderId);
            if (res.status === 200) {
                toast.success("Đã huỷ đơn hàng");
                fetchOrders();
                if (selected?.orderId === orderId) setSelected(null);
            }
        } catch (err: any) { toast.error(err?.response?.data?.message || "Không thể huỷ đơn"); }
        finally { setCancelling(null); }
    };

    /* filter */
    const filtered = orders.filter(o => {
        const matchTab = activeTab === "all" || o.statusName?.toLowerCase() === activeTab;
        const matchSearch = !search.trim() ||
            o.orderCode?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerName?.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const tabCount = (key: StatusKey) =>
        key === "all" ? orders.length : orders.filter(o => o.statusName?.toLowerCase() === key).length;

    if (authLoading || loading) return (
        <>
            <div className="min-h-screen bg-[#f5f5f5] py-6">
                <div className="max-w-5xl mx-auto px-4 space-y-3 animate-pulse">
                    <div className="h-12 bg-white rounded-sm" />
                    <div className="h-14 bg-white rounded-sm" />
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-white rounded-sm" />)}
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <>
            <div className="min-h-screen bg-[#f5f5f5] py-5 pb-16">
                <div className="max-w-5xl mx-auto px-4 space-y-3">

                    {/* ── page header ── */}
                    <div className="bg-white rounded-sm px-6 py-4 flex items-center gap-4">
                        <Link href="/profile" className="text-gray-400 hover:text-orange-500 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-lg font-medium text-gray-800">Đơn Mua</h1>
                            <p className="text-xs text-gray-400">{orders.length} đơn hàng</p>
                        </div>
                        {/* search */}
                        <div className="relative w-64">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Tìm mã đơn, tên khách..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-orange-400 transition"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── status tabs ── */}
                    <div className="bg-white rounded-sm">
                        <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
                            {TABS.map(tab => {
                                const cnt = tabCount(tab.key);
                                const active = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`flex-shrink-0 flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${active ? "border-orange-500 text-orange-500" : "border-transparent text-gray-500 hover:text-gray-800"
                                            }`}
                                    >
                                        {tab.label}
                                        {cnt > 0 && (
                                            <span className={`text-[11px] px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${active ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"
                                                }`}>
                                                {cnt}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── order list ── */}
                    {filtered.length === 0 ? (
                        <div className="bg-white rounded-sm py-20 text-center">
                            <Package size={52} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Không có đơn hàng nào</p>
                            <p className="text-gray-400 text-sm mt-1">
                                {search ? `Không tìm thấy kết quả cho "${search}"` : "Bạn chưa có đơn hàng ở trạng thái này"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(order => {
                                const skey = order.statusName?.toLowerCase() as string;
                                const st = STATUS_MAP[skey] ?? { label: order.statusName, color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: Package };
                                const Icon = st.icon;
                                const canCancel = skey === "pending";
                                const isCancelling = cancelling === order.orderId;

                                return (
                                    <div
                                        key={order.orderId}
                                        onClick={() => setSelected(order)}
                                        className="bg-white rounded-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
                                    >
                                        {/* order header */}
                                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Package size={15} className="text-orange-400" />
                                                <span className="text-sm font-medium text-gray-700">#{order.orderCode}</span>
                                                <span className="text-xs text-gray-400">
                                                    {order.orderDate ? fmtDate(order.orderDate) : ""}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${st.bg} ${st.color}`}>
                                                    <Icon size={12} />
                                                    {st.label}
                                                </div>
                                            </div>
                                        </div>

                                        {/* products preview */}
                                        <div className="px-5 py-4">
                                            <div className="space-y-3">
                                                {order.orderDetails?.slice(0, 2).map(item => (
                                                    <div key={item.orderDetailId} className="flex items-center gap-3">
                                                        <div className="w-16 h-16 rounded border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                                                            {item.productImage
                                                                ? <img src={imgUrl(item.productImage)!} alt={item.productName} className="w-full h-full object-cover" />
                                                                : <div className="w-full h-full flex items-center justify-center"><Package size={20} className="text-gray-300" /></div>
                                                            }
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-800 font-medium truncate">{item.productName}</p>
                                                            <p className="text-xs text-gray-400 mt-0.5">Số lượng: {item.quantity}</p>
                                                        </div>
                                                        <p className="text-sm font-semibold text-orange-500 flex-shrink-0">{fmtVND(item.totalPrice)}</p>
                                                    </div>
                                                ))}
                                                {(order.orderDetails?.length ?? 0) > 2 && (
                                                    <p className="text-xs text-gray-400 italic">+ {order.orderDetails.length - 2} sản phẩm khác...</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* order footer */}
                                        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {canCancel && (
                                                    <button
                                                        onClick={e => handleCancel(order.orderId, e)}
                                                        disabled={isCancelling}
                                                        className="px-4 py-1.5 border border-gray-300 text-gray-600 text-xs rounded hover:border-red-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                                                    >
                                                        {isCancelling ? "Đang huỷ..." : "Huỷ đơn"}
                                                    </button>
                                                )}
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <ChevronDown size={12} className="rotate-[-90deg]" /> Xem chi tiết
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-500">Tổng tiền:</span>
                                                <span className="text-base font-bold text-orange-500">{fmtVND(order.totalAmount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <Footer />

            {/* ══ ORDER DETAIL MODAL ══ */}
            {selected && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}
                >
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* modal header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div>
                                <h2 className="text-base font-semibold text-gray-800">Chi tiết đơn hàng</h2>
                                <p className="text-xs text-gray-400 mt-0.5">#{selected.orderCode}</p>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {/* status banner */}
                            {(() => {
                                const skey = selected.statusName?.toLowerCase() as string;
                                const st = STATUS_MAP[skey] ?? { label: selected.statusName, color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: Package };
                                const Icon = st.icon;
                                return (
                                    <div className={`mx-6 mt-5 flex items-center gap-3 p-3 rounded-lg border ${st.bg}`}>
                                        <Icon size={20} className={st.color} />
                                        <div>
                                            <p className={`text-sm font-semibold ${st.color}`}>{st.label}</p>
                                            {selected.orderDate && <p className="text-xs text-gray-400 mt-0.5">Đặt ngày {fmtDate(selected.orderDate)}</p>}
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* info grid */}
                            <div className="px-6 mt-5 grid grid-cols-2 gap-4">
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Thông tin khách hàng</h3>
                                    <div className="flex items-start gap-2.5">
                                        <User size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{selected.customerName || "—"}</p>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <Phone size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{selected.customerPhone || "—"}</p>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700 leading-relaxed">{selected.shippingAddress || "—"}</p>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Thông tin đơn hàng</h3>
                                    <div className="flex items-start gap-2.5">
                                        <Calendar size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-700">{selected.orderDate ? fmtDate(selected.orderDate) : "—"}</p>
                                    </div>
                                    {selected.paymentCompletedAt && (
                                        <div className="flex items-start gap-2.5">
                                            <CreditCard size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">Thanh toán: {fmtDate(selected.paymentCompletedAt)}</p>
                                        </div>
                                    )}
                                    {selected.refundStatus && selected.refundStatus !== "None" && (
                                        <div className="flex items-start gap-2.5">
                                            <RefreshCw size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-orange-600">Hoàn tiền: {selected.refundStatus}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* products */}
                            <div className="px-6 mt-5">
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                                    Sản phẩm ({selected.orderDetails?.length ?? 0})
                                </h3>
                                <div className="border border-gray-100 rounded-lg overflow-hidden divide-y divide-gray-100">
                                    {selected.orderDetails?.map(item => (
                                        <div key={item.orderDetailId} className="flex items-center gap-4 p-4">
                                            <div className="w-14 h-14 rounded border border-gray-100 overflow-hidden flex-shrink-0 bg-gray-50">
                                                {item.productImage
                                                    ? <img src={imgUrl(item.productImage)!} alt={item.productName} className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Package size={18} className="text-gray-300" /></div>
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {fmtVND(item.unitPrice)} × {item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-orange-500 flex-shrink-0">{fmtVND(item.totalPrice)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* total */}
                            <div className="px-6 mt-4 mb-6">
                                <div className="bg-orange-50 border border-orange-100 rounded-lg px-4 py-3 flex items-center justify-between">
                                    <span className="text-sm text-gray-600 font-medium">Tổng thanh toán</span>
                                    <span className="text-xl font-bold text-orange-500">{fmtVND(selected.totalAmount)}</span>
                                </div>
                            </div>
                        </div>

                        {/* modal footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <button onClick={() => setSelected(null)}
                                className="px-5 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors">
                                Đóng
                            </button>
                            {selected.statusName?.toLowerCase() === "pending" && (
                                <button
                                    onClick={e => handleCancel(selected.orderId, e)}
                                    disabled={cancelling === selected.orderId}
                                    className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors disabled:opacity-60 flex items-center gap-2"
                                >
                                    {cancelling === selected.orderId
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
