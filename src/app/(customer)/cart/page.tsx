"use client";

import { Footer } from "@/components/customer/footer";
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, PackageX } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import {
  CustomerCartService,
  CartDto,
  CartItemDto,
} from "@/services/customer_services/customer.cart.service";
import { API_BASE } from "@/configs/api-configs";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<CartDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để xem giỏ hàng");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch cart
  const fetchCart = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await CustomerCartService.getCart();
      if (res.status === 200 && res.data) {
        setCart(res.data);
        // Select all by default
        setSelectedItems(new Set(res.data.items.map((i) => i.cartItemId)));
        localStorage.setItem("cart_count", String(res.data.items.length));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {
      console.error("Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  // Helpers
  const setItemLoading = (id: number, loading: boolean) => {
    setLoadingItems((prev) => {
      const next = new Set(prev);
      loading ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const getImageUrl = (item: CartItemDto) => {
    if (!item.mainImageUrl) return null;
    if (item.mainImageUrl.startsWith("http")) return item.mainImageUrl;
    return `${API_BASE}${item.mainImageUrl}`;
  };

  // Actions
  const handleIncrement = async (item: CartItemDto) => {
    if (item.quantity >= item.availableStock) {
      toast.error("Đã đạt số lượng tối đa");
      return;
    }
    setItemLoading(item.cartItemId, true);
    try {
      const res = await CustomerCartService.incrementItem(item.cartItemId);
      if (res.status === 200 && res.data) {
        setCart(res.data);
        localStorage.setItem("cart_count", String(res.data.items.length));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {
      toast.error("Không thể tăng số lượng");
    } finally {
      setItemLoading(item.cartItemId, false);
    }
  };

  const handleDecrement = async (item: CartItemDto) => {
    if (item.quantity <= 1) return;
    setItemLoading(item.cartItemId, true);
    try {
      const res = await CustomerCartService.decrementItem(item.cartItemId);
      if (res.status === 200 && res.data) {
        setCart(res.data);
        localStorage.setItem("cart_count", String(res.data.items.length));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {
      toast.error("Không thể giảm số lượng");
    } finally {
      setItemLoading(item.cartItemId, false);
    }
  };

  const handleRemove = async (cartItemId: number) => {
    setItemLoading(cartItemId, true);
    try {
      const res = await CustomerCartService.removeItem(cartItemId);
      if (res.status === 200) {
        setCart((prev) => {
          if (!prev) return prev;
          const items = prev.items.filter((i) => i.cartItemId !== cartItemId);
          return {
            ...prev,
            items,
            totalAmount: items.reduce((sum, i) => sum + i.subTotal, 0),
            totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
          };
        });
        setSelectedItems((prev) => {
          const next = new Set(prev);
          next.delete(cartItemId);
          return next;
        });
        toast.success("Đã xóa sản phẩm");
        const newCount = cart!.items.filter((i) => i.cartItemId !== cartItemId).length;
        localStorage.setItem("cart_count", String(newCount));
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch {
      toast.error("Không thể xóa sản phẩm");
    } finally {
      setItemLoading(cartItemId, false);
    }
  };

  const handleClearCart = async () => {
    try {
      const res = await CustomerCartService.clearCart();
      if (res.status === 200) {
        setCart((prev) => (prev ? { ...prev, items: [], totalAmount: 0, totalItems: 0 } : prev));
        setSelectedItems(new Set());
        localStorage.setItem("cart_count", "0");
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Đã xóa toàn bộ giỏ hàng");
      }
    } catch {
      toast.error("Không thể xóa giỏ hàng");
    }
  };

  // Selection
  const toggleSelectAll = () => {
    if (!cart) return;
    if (selectedItems.size === cart.items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cart.items.map((i) => i.cartItemId)));
    }
  };

  const toggleSelectItem = (cartItemId: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(cartItemId) ? next.delete(cartItemId) : next.add(cartItemId);
      return next;
    });
  };

  // Computed
  const selectedTotal =
    cart?.items
      .filter((i) => selectedItems.has(i.cartItemId))
      .reduce((sum, i) => sum + i.subTotal, 0) ?? 0;

  const selectedCount =
    cart?.items
      .filter((i) => selectedItems.has(i.cartItemId))
      .reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  // Format currency
  const formatPrice = (price: number) => price.toLocaleString("vi-VN") + "₫";

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Breadcrumb */}
        <div className="flex gap-2 text-sm mb-6 text-gray-600">
          <Link href="/" className="hover:text-[#FF6B35] transition">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-[#222] font-medium">Giỏ hàng</span>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-[#222] mb-6 flex items-center gap-3">
          <ShoppingBag className="w-7 h-7 text-[#FF6B35]" />
          Giỏ Hàng
          {cart && cart.items.length > 0 && (
            <span className="text-base font-normal text-gray-500">
              ({cart.totalItems} sản phẩm)
            </span>
          )}
        </h1>

        {/* Loading */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-24 h-24 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !cart || cart.items.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-lg p-12 text-center">
            <PackageX className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-[#222] mb-2">Giỏ hàng trống</h2>
            <p className="text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B35] hover:bg-[#E55A24] text-white font-semibold rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          /* Cart content */
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left - Cart Items */}
            <div className="flex-1">
              {/* Table Header (desktop) */}
              <div className="hidden md:flex bg-white rounded-lg px-4 py-3 mb-3 items-center text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cart.items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer"
                  />
                  <span>Chọn tất cả ({cart.items.length} sản phẩm)</span>
                </div>
                <div className="w-28 text-center">Đơn Giá</div>
                <div className="w-36 text-center">Số Lượng</div>
                <div className="w-28 text-center">Thành Tiền</div>
                <div className="w-16 text-center">
                  <button
                    onClick={handleClearCart}
                    className="text-gray-400 hover:text-red-500 transition"
                    title="Xóa tất cả"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mobile select all */}
              <div className="md:hidden bg-white rounded-lg px-4 py-3 mb-3 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cart.items.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                  />
                  <span className="text-[#222] font-medium">Chọn tất cả</span>
                </label>
                <button
                  onClick={handleClearCart}
                  className="text-sm text-gray-400 hover:text-red-500 transition"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Cart Items */}
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const imgUrl = getImageUrl(item);
                  const isItemLoading = loadingItems.has(item.cartItemId);

                  return (
                    <div
                      key={item.cartItemId}
                      className={`bg-white rounded-lg p-4 transition ${
                        isItemLoading ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {/* Desktop layout */}
                      <div className="hidden md:flex items-center">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.cartItemId)}
                            onChange={() => toggleSelectItem(item.cartItemId)}
                            className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer shrink-0"
                          />
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5F5F5] shrink-0">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <PackageX className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-sm font-medium text-[#222] line-clamp-2 leading-5">
                              {item.productName}
                            </h3>
                            {item.productSku && (
                              <p className="text-xs text-gray-400 mt-1">SKU: {item.productSku}</p>
                            )}
                          </div>
                        </div>

                        <div className="w-28 text-center">
                          <span className="text-sm font-semibold text-[#FF6B35]">
                            {formatPrice(item.priceAtThatTime)}
                          </span>
                        </div>

                        <div className="w-36 flex justify-center">
                          <div className="flex items-center border border-[#E8E8E8] rounded-lg">
                            <button
                              onClick={() => handleDecrement(item)}
                              disabled={item.quantity <= 1}
                              className="px-3 py-1.5 text-[#FF6B35] hover:bg-[#F5F5F5] disabled:text-gray-300 disabled:hover:bg-transparent transition rounded-l-lg"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-10 text-center text-sm font-medium text-[#222] border-x border-[#E8E8E8] py-1.5">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleIncrement(item)}
                              disabled={item.quantity >= item.availableStock}
                              className="px-3 py-1.5 text-[#FF6B35] hover:bg-[#F5F5F5] disabled:text-gray-300 disabled:hover:bg-transparent transition rounded-r-lg"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="w-28 text-center">
                          <span className="text-sm font-bold text-[#FF6B35]">
                            {formatPrice(item.subTotal)}
                          </span>
                        </div>

                        <div className="w-16 text-center">
                          <button
                            onClick={() => handleRemove(item.cartItemId)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Mobile layout */}
                      <div className="md:hidden">
                        <div className="flex gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.cartItemId)}
                            onChange={() => toggleSelectItem(item.cartItemId)}
                            className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer shrink-0 mt-1"
                          />
                          <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#F5F5F5] shrink-0">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <PackageX className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-[#222] line-clamp-2 leading-5 mb-2">
                              {item.productName}
                            </h3>
                            <div className="text-sm font-semibold text-[#FF6B35] mb-2">
                              {formatPrice(item.priceAtThatTime)}
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center border border-[#E8E8E8] rounded-lg">
                                <button
                                  onClick={() => handleDecrement(item)}
                                  disabled={item.quantity <= 1}
                                  className="px-2.5 py-1 text-[#FF6B35] disabled:text-gray-300 transition"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-medium text-[#222] border-x border-[#E8E8E8] py-1">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleIncrement(item)}
                                  disabled={item.quantity >= item.availableStock}
                                  className="px-2.5 py-1 text-[#FF6B35] disabled:text-gray-300 transition"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => handleRemove(item.cartItemId)}
                                className="text-gray-400 hover:text-red-500 transition p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue shopping */}
              <div className="mt-4">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-[#FF6B35] hover:underline font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>

            {/* Right - Order Summary */}
            <div className="w-full lg:w-80 shrink-0">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="text-lg font-bold text-[#222] mb-4">Thanh Toán</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tạm tính ({selectedCount} sản phẩm)</span>
                    <span className="font-medium text-[#222]">{formatPrice(selectedTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phí vận chuyển</span>
                    <span className="font-medium text-green-600">Miễn phí</span>
                  </div>
                </div>

                <div className="border-t border-[#E8E8E8] pt-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-bold text-[#222]">Tổng cộng</span>
                    <span className="text-2xl font-bold text-[#FF6B35]">
                      {formatPrice(selectedTotal)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 text-right mt-1">(Đã bao gồm VAT nếu có)</p>
                </div>

                <button
                  disabled={selectedCount === 0}
                  onClick={() => {
                    localStorage.setItem("selected_cart_items", JSON.stringify([...selectedItems]));
                    router.push("/checkout");
                  }}
                  className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#E55A24] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition text-base"
                >
                  Đặt Hàng ({selectedCount})
                </button>

                {/* Trust badges */}
                <div className="mt-6 grid grid-cols-3 gap-2">
                  {[
                    { icon: "🚚", text: "Miễn phí ship" },
                    { icon: "🔄", text: "Đổi trả 7 ngày" },
                    { icon: "🛡️", text: "Bảo hành" },
                  ].map((badge, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-2 bg-[#F5F5F5] rounded-lg"
                    >
                      <span className="text-lg mb-1">{badge.icon}</span>
                      <span className="text-[10px] text-center text-gray-500 leading-tight">
                        {badge.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
