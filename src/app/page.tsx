'use client';

import { Header } from '@/components/user/header';
import { SidebarCategories } from '@/components/user/sidebar-categories';
import { CarouselBanner } from '@/components/user/carousel-banner';
import { BrandsMarquee } from '@/components/user/brands-marquee';
import { ProductCard } from '@/components/user/product-card';
import { LoadingScreen } from '@/components/user/loading-screen';
import { Footer } from '@/components/user/footer';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const PRODUCTS = [
  {
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=300&q=80',
    name: 'Gấu Bông Gối Ôm Ngủ Dễ Thương Siêu Mềm',
    price: 45000,
    originalPrice: 90000,
    sold: 2500,
    badge: 'Yêu thích',
    badgeColor: 'bg-orange-400'
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
    name: 'Bộ Lego 500 Chi Tiết Xây Dựng Sáng Tạo',
    price: 84599,
    originalPrice: 98000,
    sold: 3100,
    badge: 'Rẻ Vô Địch',
    badgeColor: 'bg-red-500'
  },
  {
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&q=80',
    name: 'Xe Điều Khiển Từ Xa 4WD Địa Hình Cực Mạnh',
    price: 74000,
    originalPrice: 98000,
    sold: 20000,
    discount: 25
  },
  {
    image: 'https://images.unsplash.com/photo-1606665503444-ab4bc9017371?w=300&q=80',
    name: 'Mua 1 Tặng 1 Robot Khoa Học Lập Trình',
    price: 159000,
    originalPrice: 299000,
    sold: 1000,
    badge: 'Mua 1 Tặng 1',
    badgeColor: 'bg-purple-500',
    hasVideo: true
  },
  {
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&q=80',
    name: 'Hộp 120 Bút Vẽ Acrylic Nhiều Màu Sắc',
    price: 50997,
    originalPrice: 85000,
    sold: 5000,
    badge: 'Giảm 30k',
    badgeColor: 'bg-green-500'
  },
  {
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=300&q=80',
    name: 'Búp Bê Công Chúa Tương Tác Thông Minh',
    price: 65000,
    originalPrice: 130000,
    sold: 47,
    discount: 50
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
    name: 'Loa Bluetooth Hình Thú Không Dây Xinh Xắn',
    price: 69000,
    originalPrice: 99000,
    sold: 10000,
    badge: 'Giảm 30k',
    badgeColor: 'bg-yellow-500'
  },
  {
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&q=80',
    name: 'Trượt Patin LED Phát Sáng An Toàn',
    price: 159000,
    originalPrice: 299000,
    sold: 3200,
    discount: 47
  },
  {
    image: 'https://images.unsplash.com/photo-1606665503444-ab4bc9017371?w=300&q=80',
    name: 'Bộ Tô Màu 360 Chi Tiết Sáng Tạo Nghệ Thuật',
    price: 109760,
    originalPrice: 200000,
    sold: 4,
    badge: 'Rẻ Vô Địch',
    badgeColor: 'bg-red-600'
  },
  {
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1cab83?w=300&q=80',
    name: 'Trò Chơi Board Game Gia Đình Vui Nhộn',
    price: 32999,
    originalPrice: 65000,
    sold: 20000,
    badge: 'Mua 1 Tặng 1',
    badgeColor: 'bg-indigo-500'
  },
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
    name: 'Xe Đạp Trẻ Em Kiểu Dáng Hiện Đại',
    price: 49000,
    originalPrice: 99000,
    sold: 20000,
    discount: 11
  },
  {
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=300&q=80',
    name: 'Mô Hình Tàu Vũ Trụ Khoa Học Sáng Tạo',
    price: 49999,
    originalPrice: 99000,
    sold: 10000,
    discount: 28
  }
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [displayedProducts] = useState(PRODUCTS);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Bảo vệ trang - chỉ cho Customer vào
  useEffect(() => {
    if (user && user.roleName !== 'Customer') {
      toast.error('Tài khoản này không có quyền truy cập trang người dùng');
      logout();
      router.push('/login');
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
      <Header />

      {/* Banner */}
      <div className="pt-6 px-6">
        <CarouselBanner />
      </div>
      
      <BrandsMarquee />

      <div className="flex max-w-7xl mx-auto gap-0 bg-[#F5F5F5] min-h-screen">
        <SidebarCategories />

        {/* Main Content */}
        <div className="flex-1 px-6 py-6">
          {/* Section Title */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-[#222] uppercase tracking-wider">
              Gợi Ý Hôm Nay
            </h2>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {displayedProducts.map((product, index) => (
              <ProductCard
                key={index}
                image={product.image}
                name={product.name}
                price={product.price}
                originalPrice={product.originalPrice}
                discount={product.discount}
                sold={product.sold}
                badge={product.badge}
                badgeColor={product.badgeColor}
                hasVideo={product.hasVideo}
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

      <Footer />
    </div>
  );
}
