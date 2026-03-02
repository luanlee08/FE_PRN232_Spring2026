"use client";

import { SidebarCategories } from "@/components/customer/sidebar-categories";
import { CarouselBanner } from "@/components/customer/carousel-banner";
import { BrandsMarquee } from "@/components/customer/brands-marquee";
import { ProductCard } from "@/components/customer/product-card";
import { LoadingScreen } from "@/components/customer/loading-screen";
import { Footer } from "@/components/customer/footer";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CustomerProductService }
  from "@/services/customer_services/customer.product.service";
import { API_BASE } from "@/configs/api-configs";

import { ProductStorefront }
  from "@/types/products";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<ProductStorefront[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user, logout } = useAuth();

  const router = useRouter();
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const result = await CustomerProductService.getProducts({
          page: page,
          pageSize: 8,
        });

        setProducts(result.items);
        setTotalPages(result.totalPages);
      } catch (err) {
        console.error("Fetch products failed", err);
      }
    };

    fetchProducts();
  }, [page]);
  // Bảo vệ trang - chỉ cho Customer vào
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
      {/* <Header /> */}

      {/* Banner */}
      <div className="pt-6 px-6">
        <CarouselBanner />
      </div>
      {/*       
      <BrandsMarquee /> */}

      <div className="flex max-w-7xl mx-auto gap-0 bg-[#F5F5F5] min-h-screen">
        {/* <SidebarCategories /> */}

        {/* Main Content */}
        <div className="flex-1 px-6 py-6">
          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#222] uppercase tracking-wider">
              Gợi Ý Hôm Nay
            </h2>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={
                  product.mainImageUrl
                    ? `${API_BASE}${product.mainImageUrl}`
                    : "/placeholder.svg"
                }
                name={product.productName}
                price={product.price}
              // sold={0}
              />
            ))}
          </div>

          {/* Load More */}
          {/* <div className="mt-8 text-center">
            <button className="px-12 py-3 bg-white border-2 border-[#FF6B35] text-[#FF6B35] font-medium rounded hover:bg-[#FFF5F0] transition">
              Xem Thêm Sản Phẩm
            </button>
          </div> */}
        </div>
      </div>
      <div className="mt-8 flex justify-center items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
          className={`px-4 py-2 border rounded ${page === 1
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
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
          className={`px-4 py-2 border rounded ${page === totalPages
              ? "bg-gray-200 cursor-not-allowed"
              : "bg-white hover:bg-gray-100"
            }`}
        >
          Sau →
        </button>
      </div>
      <Footer />
    </div>
  );
}
