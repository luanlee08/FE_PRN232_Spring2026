"use client";

import { SidebarCategories } from "@/components/customer/sidebar-categories";
import { ProductReviews } from "@/components/customer/product-reviews";
import {
  Heart,
  ShoppingCart,
  Truck,
  RotateCcw,
  ShieldCheck,
  Tag,
  Package,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { CustomerProductService } from "@/services/customer_services/customer.product.service";
import { CustomerCartService } from "@/services/customer_services/customer.cart.service";
import { useAuth } from "@/lib/auth/auth-context";
import { ProductStorefront } from "@/types/products";
import { API_BASE } from "@/configs/api-configs";

const resolveImageUrl = (url?: string | null) => {
  if (!url) return "/placeholder.svg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url}`;
};

const toDisplayValue = (value?: string | null) =>
  value && value.trim() ? value : "Đang cập nhật";

const getStatusMeta = (
  status?: string | null,
  stockQuantity?: number,
  isOutOfStock?: boolean
) => {
  const normalized = status?.toLowerCase();
  const outOfStockByQuantity = typeof stockQuantity === "number" && stockQuantity <= 0;
  const isOut = Boolean(isOutOfStock) || normalized === "outofstock" || outOfStockByQuantity;

  if (normalized === "discontinued") {
    return {
      label: "Ngừng kinh doanh",
      className: "bg-gray-100 text-gray-700 border-gray-200",
    };
  }

  if (isOut) {
    return {
      label: "Hết hàng",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  return {
    label: "Còn hàng",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
};

const parseApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === "object" && error !== null) {
    const normalized = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    if (normalized.response?.data?.message) {
      return normalized.response.data.message;
    }

    if (normalized.message) {
      return normalized.message;
    }
  }

  return fallback;
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<ProductStorefront | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [existingCartQuantity, setExistingCartQuantity] = useState(0);

  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const data = await CustomerProductService.getById(id);
        setProduct(data);
      } catch (error) {
        console.error("Fetch product failed", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const galleryImages = useMemo(() => {
    if (!product) return [];

    const urls = [product.mainImageUrl, ...(product.secondaryImageUrls ?? [])].filter(
      (url): url is string => Boolean(url && url.trim())
    );

    return Array.from(new Set(urls));
  }, [product]);

  useEffect(() => {
    setSelectedImageUrl(galleryImages[0] ?? null);
  }, [galleryImages]);

  useEffect(() => {
    const loadCartQuantity = async () => {
      if (!isAuthenticated || !product?.id) {
        setExistingCartQuantity(0);
        return;
      }

      try {
        const cartResponse = await CustomerCartService.getCart();
        const existingItem = cartResponse.data?.items?.find(
          (item) => item.productId === Number(product.id)
        );
        setExistingCartQuantity(existingItem?.quantity ?? 0);
      } catch {
        setExistingCartQuantity(0);
      }
    };

    loadCartQuantity();
  }, [isAuthenticated, product?.id]);

  useEffect(() => {
    const stock = Math.max(0, product?.stockQuantity ?? 0);
    const max = Math.max(0, stock - existingCartQuantity);
    setQuantity((prev) => {
      if (max <= 0) return 0;
      return Math.min(Math.max(prev, 1), max);
    });
  }, [product?.stockQuantity, existingCartQuantity]);

  if (loading) {
    return <div className="p-10 text-center">Đang tải sản phẩm...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Không tìm thấy sản phẩm.</div>;
  }

  const isOutOfStock =
    product?.productStatus?.toLowerCase() === "outofstock" ||
    product?.productStatus?.toLowerCase() === "discontinued" ||
    Boolean(product?.isOutOfStock) ||
    (typeof product?.stockQuantity === "number" && product.stockQuantity <= 0);
  const stockQuantity = Math.max(0, product.stockQuantity || 0);
  const maxAddableQuantity = Math.max(0, stockQuantity - existingCartQuantity);
  const maxQuantity = maxAddableQuantity;
  const isCartLimitReached = maxAddableQuantity <= 0;
  const isActionDisabled = isOutOfStock || isCartLimitReached;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Vui long dang nhap de them vao gio hang");
      router.push("/login");
      return;
    }

    if (maxAddableQuantity <= 0) {
      toast.error("Ban da chon toi da so luong co the mua");
      return;
    }

    const clampedQuantity = Math.min(Math.max(quantity, 1), maxAddableQuantity);

    setAddingToCart(true);
    try {
      const res = await CustomerCartService.addToCart(Number(product!.id), clampedQuantity);
      if (res.status === 200 || res.status === 201) {
        toast.success("Da them vao gio hang");
        if (res.data) {
          localStorage.setItem("cart_count", String(res.data.items.length));
          const updatedItem = res.data.items.find((i) => i.productId === Number(product!.id));
          setExistingCartQuantity(updatedItem?.quantity ?? 0);
          window.dispatchEvent(new Event("cartUpdated"));
        }
      } else {
        toast.error(res.message || "Khong the them vao gio hang");
      }
    } catch (error) {
      toast.error(parseApiErrorMessage(error, "Co loi xay ra, vui long thu lai"));
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error("Vui long dang nhap de mua hang");
      router.push("/login");
      return;
    }

    if (maxAddableQuantity <= 0) {
      toast.error("Ban da chon toi da so luong co the mua");
      return;
    }

    const clampedQuantity = Math.min(Math.max(quantity, 1), maxAddableQuantity);

    setBuyingNow(true);
    try {
      const res = await CustomerCartService.addToCart(Number(product!.id), clampedQuantity);
      if (res.status === 200 || res.status === 201) {
        if (res.data) {
          localStorage.setItem("cart_count", String(res.data.items.length));
          const newItem = res.data.items.find((i) => i.productId === Number(product!.id));
          if (newItem) {
            setExistingCartQuantity(newItem.quantity);
            localStorage.setItem("selected_cart_items", JSON.stringify([newItem.cartItemId]));
          }
          window.dispatchEvent(new Event("cartUpdated"));
        }
        router.push("/checkout");
      } else {
        toast.error(res.message || "Khong the them vao gio hang");
        setBuyingNow(false);
      }
    } catch (error) {
      toast.error(parseApiErrorMessage(error, "Co loi xay ra, vui long thu lai"));
      setBuyingNow(false);
    }
  };

  const activeImage = selectedImageUrl ?? galleryImages[0] ?? null;
  const activeImageUrl = resolveImageUrl(activeImage);
  const statusMeta = getStatusMeta(
    product.productStatus,
    product.stockQuantity,
    product.isOutOfStock
  );

  const attributes = [
    { label: "Danh mục", value: product.categoryName },
    { label: "Thương hiệu", value: product.brandName },
    { label: "Giới tính", value: product.sexName },
    { label: "Chất liệu", value: product.materialName },
    { label: "Độ tuổi", value: product.ageRange },
    { label: "Xuất xứ", value: product.originName },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white">
      <div className="flex">
        <SidebarCategories />

        <div className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex flex-wrap items-center gap-2 text-sm mb-6 text-gray-500">
              <Link href="/" className="hover:text-[#FF6B35] transition">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium line-clamp-1">
                {product.productName}
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 mb-8">
              <section className="xl:col-span-2">
                <div className="rounded-2xl border border-orange-100 bg-white shadow-sm p-4 sm:p-5">
                  <div className="rounded-xl overflow-hidden bg-[#F7F7F7] mb-4">
                    <img
                      src={activeImageUrl}
                      alt={product.productName}
                      className="w-full h-[350px] sm:h-[420px] object-cover"
                    />
                  </div>

                  {galleryImages.length > 1 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {galleryImages.map((imageUrl, index) => {
                        const isActive =
                          (selectedImageUrl ?? galleryImages[0]) === imageUrl;

                        return (
                          <button
                            key={`${imageUrl}-${index}`}
                            type="button"
                            onClick={() => setSelectedImageUrl(imageUrl)}
                            className={`rounded-lg overflow-hidden border-2 transition ${
                              isActive
                                ? "border-[#FF6B35]"
                                : "border-transparent hover:border-orange-200"
                            }`}
                          >
                            <img
                              src={resolveImageUrl(imageUrl)}
                              alt={`${product.productName} - ảnh ${index + 1}`}
                              className="w-full h-20 object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>

              <section className="xl:col-span-3 space-y-5">
                <div className="rounded-2xl border border-orange-100 bg-white shadow-sm p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${statusMeta.className}`}
                    >
                      {statusMeta.label}
                    </span>
                    {product.sku ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full border border-gray-200 text-xs text-gray-600">
                        SKU: {product.sku}
                      </span>
                    ) : null}
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                    {product.productName}
                  </h1>

                  <div className="flex flex-wrap items-end gap-3 mb-5 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100">
                    <span className="text-3xl sm:text-4xl font-extrabold text-[#FF6B35]">
                      {product.price.toLocaleString("vi-VN")}đ
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      Tồn kho: {product.stockQuantity}
                    </span>
                  </div>

             
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-100 p-3">
                      <Truck className="w-5 h-5 text-[#FF6B35]" />
                      <span className="text-sm text-gray-700">Miễn phí vận chuyển</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-100 p-3">
                      <RotateCcw className="w-5 h-5 text-[#FF6B35]" />
                      <span className="text-sm text-gray-700">Đổi trả dễ dàng</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg bg-orange-50 border border-orange-100 p-3">
                      <ShieldCheck className="w-5 h-5 text-[#FF6B35]" />
                      <span className="text-sm text-gray-700">Bảo hành 12 tháng</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-6">
                    <label className="text-sm font-medium text-gray-800">So luong:</label>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        type="button"
                        disabled={isCartLimitReached}
                        onClick={() =>
                          setQuantity((prev) => {
                            if (maxQuantity <= 0) return 0;
                            return Math.max(1, prev - 1);
                          })
                        }
                        className="px-4 py-2 text-[#FF6B35] hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={maxQuantity > 0 ? 1 : 0}
                        max={Math.max(0, maxQuantity)}
                        disabled={isCartLimitReached}
                        value={quantity}
                        onChange={(e) => {
                          const parsed = parseInt(e.target.value, 10);
                          if (!Number.isFinite(parsed)) {
                            setQuantity(maxQuantity > 0 ? 1 : 0);
                            return;
                          }
                          if (maxQuantity <= 0) {
                            setQuantity(0);
                            return;
                          }
                          setQuantity(Math.min(maxQuantity, Math.max(1, parsed)));
                        }}
                        className="w-20 py-2 text-center border-0 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                      />
                      <button
                        type="button"
                        disabled={isCartLimitReached}
                        onClick={() =>
                          setQuantity((prev) => {
                            if (maxQuantity <= 0) return 0;
                            return Math.min(maxQuantity, Math.max(1, prev + 1));
                          })
                        }
                        className="px-4 py-2 text-[#FF6B35] hover:bg-orange-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Co the them toi da: {maxAddableQuantity}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => setIsWishlisted((prev) => !prev)}
                      className={`sm:flex-1 py-3 px-4 rounded-xl font-semibold transition flex items-center justify-center gap-2 border-2 ${
                        isWishlisted
                          ? "bg-[#FFE5E0] border-[#FF6B35] text-[#FF6B35]"
                          : "bg-white border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                      {isWishlisted ? "Đã yêu thích" : "Yêu thích"}
                    </button>

                    <button
                      type="button"
                      disabled={isActionDisabled || addingToCart}
                      onClick={handleAddToCart}
                      className="sm:flex-1 py-3 px-4 bg-white border-2 border-[#FF6B35] text-[#FF6B35] rounded-xl font-semibold hover:bg-orange-50 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {addingToCart ? "Đang thêm..." : "Thêm vào giỏ"}
                    </button>

                    <button
                      type="button"
                      disabled={isActionDisabled || buyingNow}
                      onClick={handleBuyNow}
                      className="sm:flex-1 py-3 px-4 bg-[#FF6B35] hover:bg-[#E55A24] text-white rounded-xl font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Sparkles className="w-5 h-5" />
                      {buyingNow ? "Đang xử lý..." : "Mua ngay"}
                    </button>
                  </div>
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-orange-100 bg-white shadow-sm p-5 sm:p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#FF6B35]" />
                Mô tả sản phẩm
              </h2>

              {product.descriptionHtml ? (
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
                />
              ) : (
                <p className="text-gray-500">Sản phẩm chưa có mô tả.</p>
              )}
            </section>

            <section className="rounded-2xl border border-orange-100 bg-white shadow-sm p-5 sm:p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Thông số sản phẩm</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {attributes.map((item) => (
                  <div
                    key={`spec-${item.label}`}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      {toDisplayValue(item.value)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="mt-8">
              <ProductReviews />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


