"use client";

import { Footer } from "@/components/customer/footer";
import {
  ArrowLeft,
  MapPin,
  Package,
  CreditCard,
  Tag,
  FileText,
  ShoppingBag,
  Wallet,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { CustomerCartService, CartDto } from "@/services/customer_services/customer.cart.service";
import { CustomerAddressService } from "@/services/customer_services/customer.address.service";
import { CustomerOrderService } from "@/services/customer_services/customer.order.service";
import { CustomerShippingService } from "@/services/customer_services/customer.shipping.service";
import { CustomerWalletService } from "@/services/customer_services/customer.wallet.service";
import { AddressResponse } from "@/types/address";
import {
  PaymentMethodDTO,
  ShippingMethod,
  CreateOrderRequest,
  ShippingMethodInfo,
} from "@/types/order";
import { API_BASE, API_ENDPOINTS } from "@/configs/api-configs";
import axiosInstance from "@/lib/api/axios";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  // State
  const [cart, setCart] = useState<CartDto | null>(null);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodDTO[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethodInfo[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod>("Standard");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [applyingVoucher, setApplyingVoucher] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingShipping, setIsLoadingShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<number[] | null>(null);

  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thanh toán");
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch shipping methods based on selected address
  const fetchShippingMethods = useCallback(
    async (addressId: number | null) => {
      // Clear methods if no address selected
      if (!addressId) {
        setShippingMethods([]);
        return;
      }

      try {
        setIsLoadingShipping(true);

        // Find selected address
        const selectedAddr = addresses.find((a) => a.addressId === addressId);
        if (!selectedAddr) {
          console.log("[Checkout] Address not found:", addressId);
          setShippingMethods([]);
          return;
        }

        // Calculate total weight (estimate 500g per item)
        const shippingItems = cart
          ? selectedCartItemIds
            ? cart.items.filter((i) => selectedCartItemIds.includes(i.cartItemId))
            : cart.items
          : [];
        const totalWeight =
          (shippingItems.reduce((sum, item) => sum + item.quantity, 0) || 1) * 500;
        const orderValue = shippingItems.reduce((s, i) => s + i.subTotal, 0);

        // Use district directly from address object
        const district = selectedAddr.district || "";

        const params = {
          city: selectedAddr.city,
          district: district || selectedAddr.city, // Fallback to city if no district
          ward: selectedAddr.ward || "",
          weight: totalWeight,
          orderValue: orderValue,
          districtId: selectedAddr.districtId,
          wardCode: selectedAddr.wardCode,
        };

        console.log("[Checkout] Fetching shipping with params:", params);
        console.log("[Checkout] Selected address:", selectedAddr);

        const shippingRes = await CustomerShippingService.getShippingMethods(params);

        if (shippingRes.status === 200 && shippingRes.data) {
          const methods = shippingRes.data.shippingMethods || [];
          console.log("[Checkout] ✅ Shipping methods loaded:", methods);
          setShippingMethods(methods);

          // Auto-select Standard or first available method
          const defaultMethod = methods.find((m) => m.type === "Standard") || methods[0];
          if (defaultMethod) {
            console.log(
              "[Checkout] Auto-selecting shipping:",
              defaultMethod.code,
              "type:",
              defaultMethod.type,
            );
            setSelectedShipping(defaultMethod.type as ShippingMethod);
          }
        } else {
          console.log("[Checkout] ⚠️ Unexpected response:", shippingRes);
          setShippingMethods([]);
          toast.error(shippingRes.message || "Không thể tải phí vận chuyển");
        }
      } catch (error: any) {
        console.error("[Checkout] ❌ Failed to fetch shipping methods:", error);
        setShippingMethods([]);

        // Handle specific error responses
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.status === 400) {
          toast.error("Vui lòng chọn địa chỉ giao hàng để tính phí vận chuyển");
        } else if (error.response?.status === 503) {
          toast.error("Dịch vụ tính phí vận chuyển tạm thời không khả dụng. Vui lòng thử lại sau.");
        } else {
          toast.error("Không thể tải phí vận chuyển. Vui lòng thử lại.");
        }
      } finally {
        setIsLoadingShipping(false);
      }
    },
    [addresses, cart, selectedCartItemIds],
  );

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch cart
      const cartRes = await CustomerCartService.getCart();
      if (cartRes.status === 200 && cartRes.data) {
        if (cartRes.data.items.length === 0) {
          toast.error("Giỏ hàng trống");
          router.push("/cart");
          return;
        }
        setCart(cartRes.data);
        const saved = localStorage.getItem("selected_cart_items");
        if (saved) {
          try {
            setSelectedCartItemIds(JSON.parse(saved));
          } catch {
            // ignore malformed data
          }
          localStorage.removeItem("selected_cart_items");
        }
      }

      // Fetch addresses
      const addressRes = await CustomerAddressService.getAll();
      if (addressRes.status === 200 && addressRes.data) {
        setAddresses(addressRes.data);
        // Auto-select default address
        const defaultAddr = addressRes.data.find((a) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.addressId);
        }
      }

      // Fetch payment methods
      const paymentRes = await CustomerOrderService.getPaymentMethods();
      if (paymentRes.status === 200 && paymentRes.data) {
        setPaymentMethods(paymentRes.data.paymentMethods || []);
      }

      // Fetch wallet balance for Wallet payment option
      try {
        setLoadingWallet(true);
        const walletRes = await CustomerWalletService.getWallet();
        if (walletRes.status === 200 && walletRes.data) {
          setWalletBalance(walletRes.data.balance);
        }
      } catch {
        // wallet may not exist yet
      } finally {
        setLoadingWallet(false);
      }

      // Note: Shipping methods will be fetched separately based on selected address
    } catch (error) {
      console.error("Failed to fetch checkout data:", error);
      toast.error("Không thể tải thông tin thanh toán");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Fetch shipping methods when address selection changes
  useEffect(() => {
    if (addresses.length > 0 && cart) {
      fetchShippingMethods(selectedAddressId);
    }
  }, [selectedAddressId, addresses, cart, fetchShippingMethods]);

  // Calculations
  const checkoutItems = cart
    ? selectedCartItemIds
      ? cart.items.filter((i) => selectedCartItemIds.includes(i.cartItemId))
      : cart.items
    : [];
  const subtotal = checkoutItems.reduce((s, i) => s + i.subTotal, 0);
  const shippingFee = shippingMethods.find((s) => s.type === selectedShipping)?.fee || 0;
  const discountAmount = appliedVoucher?.discountAmount || 0;
  const selectedPayment = paymentMethods.find((p) => p.code === selectedPaymentMethod);

  let transactionFee = 0;
  if (selectedPayment && selectedPayment.transactionFee > 0) {
    if (selectedPayment.transactionFeeType === "Percentage") {
      transactionFee =
        (subtotal + shippingFee - discountAmount) * (selectedPayment.transactionFee / 100);
    } else {
      transactionFee = selectedPayment.transactionFee;
    }
  }

  const totalAmount = subtotal + shippingFee - discountAmount + transactionFee;

  // Helpers
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return "/images/placeholder.png";
    if (imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE}${imageUrl}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Handlers
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    try {
      setApplyingVoucher(true);
      const res = await axiosInstance.get(API_ENDPOINTS.CUSTOMER_VOUCHER_VALIDATE, {
        params: { code: voucherCode.trim(), orderAmount: subtotal },
      });
      const data = res.data;
      if (data.status === 200 && data.data) {
        const v = data.data;
        setAppliedVoucher({
          voucherId: v.voucherId,
          code: v.voucherCode,
          discountAmount: v.discountAmount,
        });
        toast.success(`Áp dụng voucher thành công! Giảm ${formatCurrency(v.discountAmount)}`);
      } else {
        toast.error(data.message || "Mã voucher không hợp lệ");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Mã voucher không hợp lệ";
      toast.error(msg);
    } finally {
      setApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setVoucherCode("");
    setAppliedVoucher(null);
    toast.success("Đã xóa voucher");
  };

  const handlePlaceOrder = async () => {
    // Validation
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng");
      return;
    }

    if (shippingMethods.length === 0 || !selectedShipping) {
      toast.error("Vui lòng chờ tính phí vận chuyển hoặc chọn lại địa chỉ");
      return;
    }

    if (shippingFee === 0) {
      toast.error("Phí vận chuyển chưa được tính. Vui lòng thử lại.");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    // Wallet balance validation
    if (selectedPaymentMethod === "Wallet") {
      if (walletBalance === null || walletBalance < totalAmount) {
        toast.error(
          `Số dư ví không đủ. Cần ${formatCurrency(totalAmount)}, hiện có ${formatCurrency(walletBalance ?? 0)}. Vui lòng nạp thêm tiền.`,
        );
        return;
      }
    }

    // Check payment method limits
    if (selectedPayment) {
      if (totalAmount < selectedPayment.minAmount) {
        toast.error(
          `Số tiền tối thiểu cho ${selectedPayment.name} là ${formatCurrency(selectedPayment.minAmount)}`,
        );
        return;
      }
      if (totalAmount > selectedPayment.maxAmount) {
        toast.error(
          `Số tiền tối đa cho ${selectedPayment.name} là ${formatCurrency(selectedPayment.maxAmount)}`,
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // Get selected address info
      const selectedAddress = addresses.find((a) => a.addressId === selectedAddressId);
      const selectedShippingMethod = shippingMethods.find((m) => m.type === selectedShipping);

      const orderData: CreateOrderRequest = {
        addressId: selectedAddressId,
        paymentMethod: selectedPaymentMethod,
        shippingMethod: selectedShipping,
        shippingFee: selectedShippingMethod?.fee, // Use real GHN fee
        voucherId: appliedVoucher?.voucherId,
        note: orderNote.trim() || undefined,
        paidByWalletAmount: selectedPaymentMethod === "Wallet" ? totalAmount : 0,
        paidByExternalAmount:
          selectedPaymentMethod !== "Wallet" && selectedPaymentMethod !== "COD" ? totalAmount : 0,
        idempotencyKey: `${Date.now()}-${Math.random()}`,
        cartItemIds: checkoutItems.map((i) => i.cartItemId),
        // Include shipping info from selected address
        shippingName: selectedAddress?.recipientName || user?.accountName || "",
        shippingPhone: selectedAddress?.phoneNumber || user?.phoneNumber || "",
        shippingAddressLine: selectedAddress?.addressLine || "",
        shippingCity: selectedAddress?.city || "",
        shippingDistrict: selectedAddress?.district || "",
        shippingWard: selectedAddress?.ward || "",
        // GHN IDs — required for reliable shipping fee & order creation
        shippingProvinceId: selectedAddress?.provinceId,
        shippingDistrictId: selectedAddress?.districtId,
        shippingWardCode: selectedAddress?.wardCode,
      };

      console.log("Creating order with data:", orderData);

      const res = await CustomerOrderService.createOrder(orderData);

      if (res.status === 200 || res.status === 201) {
        const orderResponse = res.data;

        if (orderResponse?.paymentUrl) {
          // External payment - redirect to payment gateway
          toast.success("Chuyển đến cổng thanh toán...");
          window.location.href = orderResponse.paymentUrl;
        } else {
          // COD or Wallet - success
          toast.success("Đặt hàng thành công!");
          setTimeout(() => {
            router.push("/profile?tab=orders");
          }, 1000);
        }
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Không thể đặt hàng";
      toast.error(errorMsg);
      console.error("Order creation failed:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-64 bg-gray-300 rounded"></div>
                <div className="h-48 bg-gray-300 rounded"></div>
                <div className="h-48 bg-gray-300 rounded"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !cart) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/cart" className="text-[#222] hover:text-[#FF6B35] transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-[#222]">Thanh toán</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items Review */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#222] flex items-center gap-2">
                  <ShoppingBag size={20} />
                  Sản phẩm ({checkoutItems.length})
                </h2>
                <Link href="/cart" className="text-[#FF6B35] text-sm hover:underline">
                  Chỉnh sửa
                </Link>
              </div>
              <div className="space-y-3">
                {checkoutItems.map((item) => (
                  <div key={item.cartItemId} className="flex gap-3 pb-3 border-b last:border-b-0">
                    <img
                      src={getImageUrl(item.mainImageUrl)}
                      alt={item.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-[#222]">{item.productName}</h3>
                      <p className="text-xs text-gray-500">x{item.quantity}</p>
                      <p className="text-sm font-semibold text-[#FF6B35]">
                        {formatCurrency(item.subTotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#222] flex items-center gap-2 mb-4">
                <MapPin size={20} />
                Địa chỉ giao hàng
              </h2>

              {addresses.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Bạn chưa có địa chỉ giao hàng</p>
                  <Link
                    href="/profile/addresses"
                    className="inline-block bg-[#FF6B35] hover:bg-[#E55A24] text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Thêm địa chỉ
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.addressId}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedAddressId === address.addressId
                          ? "border-[#FF6B35] bg-[#FFF5F2]"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.addressId}
                        checked={selectedAddressId === address.addressId}
                        onChange={() => setSelectedAddressId(address.addressId)}
                        className="mt-1 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#222]">{address.addressLine}</span>
                          {address.isDefault && (
                            <span className="bg-[#FF6B35] text-white text-xs px-2 py-0.5 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.ward && `${address.ward}, `}
                          {address.district && `${address.district}, `}
                          {address.city}
                        </p>
                      </div>
                    </label>
                  ))}
                  <Link
                    href="/profile/addresses"
                    className="block text-center text-[#FF6B35] text-sm hover:underline pt-2"
                  >
                    Quản lý địa chỉ
                  </Link>
                </div>
              )}
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#222] flex items-center gap-2 mb-4">
                <Package size={20} />
                Phương thức vận chuyển
                {isLoadingShipping && (
                  <span className="text-sm text-gray-500 font-normal">
                    (Đang tính phí từ API...)
                  </span>
                )}
              </h2>
              {isLoadingShipping ? (
                <div className="text-center py-8">
                  <div className="inline-block w-8 h-8 border-3 border-[#FF6B35] border-t-transparent rounded-full animate-spin mb-2"></div>
                  <p className="text-gray-500 text-sm">
                    Đang tính phí vận chuyển thực tế từ GoShip/GHN...
                  </p>
                </div>
              ) : shippingMethods.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-gray-600 font-medium mb-1">
                    Chọn địa chỉ để tính phí vận chuyển
                  </p>
                  <p className="text-sm text-gray-500">
                    Phí sẽ được tính tự động từ Cần Thơ đến địa chỉ của bạn
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3 text-sm text-blue-700 flex items-center gap-2">
                    <span>💡</span>
                    <div>
                      Các mức giá <strong>GHN</strong> từ TPHCM đến địa chỉ của bạn
                    </div>
                  </div>
                  <div className="space-y-3">
                    {shippingMethods.map((method, index) => {
                      const cheapest = shippingMethods.reduce(
                        (min, m) => (m.fee < min.fee ? m : min),
                        shippingMethods[0],
                      );
                      const isCheapest = method.code === cheapest.code;

                      // Carrier badge colors
                      const carrierColor =
                        method.carrier === "GoShip"
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : method.carrier === "GHN"
                            ? "bg-green-100 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-700 border-gray-200";

                      return (
                        <label
                          key={method.code}
                          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                            selectedShipping === method.type
                              ? "border-[#FF6B35] bg-[#FFF5F2]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {isCheapest && (
                            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8C42] text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                              ⭐ RẺ NHẤT
                            </div>
                          )}
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={method.type}
                              checked={selectedShipping === method.type}
                              onChange={() => setSelectedShipping(method.type as ShippingMethod)}
                              className="text-[#FF6B35] focus:ring-[#FF6B35]"
                            />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-[#222]">{method.name}</p>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded border ${carrierColor} font-medium`}
                                >
                                  {method.carrier}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {method.estimatedDays}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{method.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-[#FF6B35] text-lg block">
                              {formatCurrency(method.fee)}
                            </span>
                            {isCheapest && method.fee < cheapest.fee + 10000 && (
                              <span className="text-xs text-gray-500">Tiết kiệm nhất</span>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-lg font-semibold text-[#222] flex items-center gap-2 mb-4">
                <CreditCard size={20} />
                Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isDisabled =
                    !method.isAvailable ||
                    totalAmount < method.minAmount ||
                    totalAmount > method.maxAmount;

                  const isWallet = method.code === "Wallet";
                  const walletInsufficient =
                    isWallet && walletBalance !== null && walletBalance < totalAmount;
                  const effectiveDisabled = isDisabled || walletInsufficient;

                  return (
                    <label
                      key={method.code}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg transition-all ${
                        effectiveDisabled
                          ? "opacity-50 cursor-not-allowed bg-gray-50"
                          : selectedPaymentMethod === method.code
                            ? "border-[#FF6B35] bg-[#FFF5F2] cursor-pointer"
                            : "border-gray-200 hover:border-gray-300 cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.code}
                        checked={selectedPaymentMethod === method.code}
                        onChange={() => !effectiveDisabled && setSelectedPaymentMethod(method.code)}
                        disabled={effectiveDisabled}
                        className="mt-1 text-[#FF6B35] focus:ring-[#FF6B35]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-[#222]">{method.name}</span>
                          {isWallet && (
                            <span className="ml-auto text-sm font-semibold text-gray-700">
                              {loadingWallet ? (
                                <span className="text-gray-400 text-xs">Đang tải...</span>
                              ) : walletBalance !== null ? (
                                <span
                                  className={
                                    walletInsufficient ? "text-red-500" : "text-emerald-600"
                                  }
                                >
                                  {formatCurrency(walletBalance)}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Chưa kích hoạt</span>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                        {isWallet && walletBalance !== null && (
                          <p className="text-xs text-gray-500 mt-0.5">Số dư hiện tại</p>
                        )}
                        {method.transactionFee > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Phí giao dịch:{" "}
                            {method.transactionFeeType === "Percentage"
                              ? `${method.transactionFee}%`
                              : formatCurrency(method.transactionFee)}
                          </p>
                        )}
                        {effectiveDisabled && (
                          <p className="text-xs text-red-600 mt-1">
                            {!method.isAvailable && "Không khả dụng"}
                            {totalAmount < method.minAmount &&
                              `Tối thiểu ${formatCurrency(method.minAmount)}`}
                            {totalAmount > method.maxAmount &&
                              `Tối đa ${formatCurrency(method.maxAmount)}`}
                            {walletInsufficient && (
                              <>
                                Số dư không đủ.{" "}
                                <a
                                  href="/profile?tab=wallet"
                                  className="underline hover:text-red-700"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  Nạp thêm tiền
                                </a>
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-[#222] mb-4">Tóm tắt đơn hàng</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[#222]">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#222]">
                  <span>Phí vận chuyển</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {transactionFee > 0 && (
                  <div className="flex justify-between text-[#222]">
                    <span>Phí giao dịch</span>
                    <span>{formatCurrency(transactionFee)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#222]">
                  <span>Tổng cộng</span>
                  <span className="text-[#FF6B35]">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || !selectedAddressId || !selectedPaymentMethod}
                className="w-full bg-[#FF6B35] hover:bg-[#E55A24] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Đang xử lý..." : "Đặt hàng"}
              </button>

              {/* Voucher */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#222] flex items-center gap-2 mb-4">
                  <Tag size={20} />
                  Mã giảm giá
                </h2>
                {!appliedVoucher ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã voucher"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35]"
                    />
                    <button
                      onClick={handleApplyVoucher}
                      disabled={applyingVoucher}
                      className="bg-[#FF6B35] hover:bg-[#E55A24] disabled:opacity-60 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      {applyingVoucher ? "..." : "Áp dụng"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="font-medium text-green-700">Mã: {appliedVoucher.code}</p>
                      {appliedVoucher.discountAmount > 0 && (
                        <p className="text-sm text-green-600">
                          Giảm {formatCurrency(appliedVoucher.discountAmount)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
              {/* Order Note */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-lg font-semibold text-[#222] flex items-center gap-2 mb-4">
                  <FileText size={20} />
                  Ghi chú đơn hàng
                </h2>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Ghi chú thêm cho đơn hàng..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B35] resize-none"
                />
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đặt hàng, bạn đồng ý với Điều khoản sử dụng của chúng tôi
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
