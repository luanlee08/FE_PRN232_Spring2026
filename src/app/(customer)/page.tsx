"use client";

import { CarouselBanner } from "@/components/customer/carousel-banner";
import { ProductCard } from "@/components/customer/product-card";
import { LoadingScreen } from "@/components/customer/loading-screen";
import { Footer } from "@/components/customer/footer";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { CustomerProductService } from "@/services/customer_services/customer.product.service";
import { API_BASE } from "@/configs/api-configs";
import { ProductStorefront } from "@/types/products";

function HomeContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductStorefront[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const keyword = (searchParams.get("keyword") ?? "").trim();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await CustomerProductService.getProducts({
          page,
          pageSize: 8,
          keyword: keyword || undefined,
        });

        setProducts(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Fetch products failed", err);
      }
    };

    fetchProducts();
  }, [page, keyword]);

  useEffect(() => {
    if (user && user.roleName !== "Customer") {
      toast.error("Tài khoản này không có quyền truy cập trang người dùng");
      logout();
      router.push("/login");
    }
  }, [user, logout, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="px-6 pt-6">
        <CarouselBanner />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl gap-0 bg-[#F5F5F5]">
        <div className="flex-1 px-6 py-6">
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#222]">
              {keyword ? `Kết quả tìm kiếm: "${keyword}"` : "Gợi ý hôm nay"}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={
                  product.mainImageUrl ? `${API_BASE}${product.mainImageUrl}` : "/placeholder.svg"
                }
                name={product.productName}
                price={product.price}
              />
            ))}
          </div>

          {products.length === 0 && (
            <div className="mt-8 rounded-md bg-white p-4 text-center text-gray-500">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className={`rounded border px-4 py-2 ${
            page === 1 ? "cursor-not-allowed bg-gray-200" : "bg-white hover:bg-gray-100"
          }`}
        >
          ← Trước
        </button>

        <span className="font-medium">
          Trang {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className={`rounded border px-4 py-2 ${
            page === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-white hover:bg-gray-100"
          }`}
        >
          Sau →
        </button>
      </div>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}
