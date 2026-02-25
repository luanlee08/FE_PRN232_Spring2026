'use client';

import { Header } from '@/components/customer/header';
import { SidebarCategories } from '@/components/customer/sidebar-categories';
import { Heart, ShoppingCart, Truck, RotateCcw, Shield } from 'lucide-react';
import { useState } from 'react';

export default function ProductDetailPage() {
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const product = {
    id: 1,
    name: 'Bộ Lego Xây Dựng 500 Chi Tiết - Sáng Tạo Vô Hạn',
    price: 299000,
    originalPrice: 499000,
    rating: 4.8,
    reviews: 1234,
    sold: 5600,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80',
      'https://images.unsplash.com/photo-1613904556901-b6c4d23c8d60?w=600&q=80',
    ],
    description: 'Bộ Lego xây dựng cao cấp với 500 chi tiết đa màu sắc. Phù hợp cho trẻ từ 6 tuổi trở lên. Giúp phát triển sáng tạo và kỹ năng xây dựng.',
    details: [
      'Số lượng chi tiết: 500',
      'Độ tuổi: 6+',
      'Chất liệu: Nhựa ABS an toàn',
      'Bao gồm: Hộp đựng, hướng dẫn lắp ráp',
      'Kích thước: 35cm x 25cm x 20cm'
    ],
    seller: {
      name: 'LorKingdom Official',
      rating: 4.9,
      followers: 125000
    }
  };

  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="flex">
        <SidebarCategories />

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-6xl mx-auto px-6 py-8">
            {/* Breadcrumb */}
            <div className="flex gap-2 text-sm mb-8 text-gray-600">
              {/* <a href="/" className="hover:text-[#FF6B35]">Trang chủ</a> */}
              <span>/</span>
              <a href="#" className="hover:text-[#FF6B35]">Lego & Xây Dựng</a>
              <span>/</span>
              <span className="text-[#222]">{product.name}</span>
            </div>

            {/* Product Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Images */}
              <div>
                <div className="bg-[#F5F5F5] rounded-lg overflow-hidden mb-4">
                  <img
                    src={product.images[selectedImage] || "/placeholder.svg"}
                    alt="Product"
                    className="w-full h-96 object-cover"
                  />
                </div>
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === idx ? 'border-[#FF6B35]' : 'border-[#E8E8E8]'
                        }`}
                    >
                      <img src={img || "/placeholder.svg"} alt="Thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div>
                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold text-[#222]">{product.rating}</span>
                  </div>
                  <span className="text-gray-600 text-sm">({product.reviews} đánh giá)</span>
                  <span className="text-gray-600 text-sm">|</span>
                  <span className="text-gray-600 text-sm">Đã bán {product.sold.toLocaleString('vi-VN')}</span>
                </div>

                {/* Name */}
                <h1 className="text-3xl font-bold text-[#222] mb-4">{product.name}</h1>

                {/* Price */}
                <div className="mb-6 p-4 bg-[#FFF5F0] rounded-lg">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-[#FF6B35]">
                      {product.price.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-xl text-gray-500 line-through">
                      {product.originalPrice.toLocaleString('vi-VN')}₫
                    </span>
                    <span className="text-lg font-bold text-[#FF6B35]">
                      -40%
                    </span>
                  </div>
                </div>

                {/* Seller */}
                <div className="mb-6 p-4 border border-[#E8E8E8] rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#222] font-medium">{product.seller.name}</span>
                    <a href="#" className="text-[#FF6B35] text-sm font-medium hover:underline">
                      Xem Shop
                    </a>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-gray-600">Đánh giá: </span>
                      <span className="font-semibold text-[#222]">{product.seller.rating}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Người theo dõi: </span>
                      <span className="font-semibold text-[#222]">{product.seller.followers.toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="flex flex-col items-center p-3 bg-[#F5F5F5] rounded-lg">
                    <Truck className="w-6 h-6 text-[#FF6B35] mb-2" />
                    <span className="text-xs text-center text-[#222]">Miễn phí vận chuyển</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#F5F5F5] rounded-lg">
                    <RotateCcw className="w-6 h-6 text-[#FF6B35] mb-2" />
                    <span className="text-xs text-center text-[#222]">Đổi trả dễ dàng</span>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-[#F5F5F5] rounded-lg">
                    <Shield className="w-6 h-6 text-[#FF6B35] mb-2" />
                    <span className="text-xs text-center text-[#222]">Bảo hành 12 tháng</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#222] mb-2">Số Lượng</label>
                  <div className="flex items-center border border-[#E8E8E8] rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-[#FF6B35] hover:bg-[#F5F5F5]"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 py-2 text-center border-0 outline-none"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-[#FF6B35] hover:bg-[#F5F5F5]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-6">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 border-2 ${isWishlisted
                        ? 'bg-[#FFE5E0] border-[#FF6B35] text-[#FF6B35]'
                        : 'bg-white border-[#FF6B35] text-[#FF6B35] hover:bg-[#FFF5F0]'
                      }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                    {isWishlisted ? 'Đã Thích' : 'Thích'}
                  </button>
                  <button className="flex-1 py-3 bg-white border-2 border-[#FF6B35] text-[#FF6B35] rounded-lg font-semibold hover:bg-[#FFF5F0] transition flex items-center justify-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Giỏ Hàng
                  </button>
                  <button className="flex-1 py-3 bg-[#FF6B35] hover:bg-[#E55A24] text-white rounded-lg font-semibold transition">
                    Mua Ngay
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Details */}
              <div className="lg:col-span-2">
                <div className="border border-[#E8E8E8] rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-[#222] mb-6">Thông Tin Chi Tiết</h2>
                  <div className="space-y-4">
                    {product.details.map((detail, idx) => (
                      <div key={idx} className="flex justify-between py-3 border-b border-[#E8E8E8] last:border-0">
                        <span className="text-gray-600">{detail.split(':')[0]}</span>
                        <span className="font-semibold text-[#222]">{detail.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 border border-[#E8E8E8] rounded-lg p-6">
                  <h3 className="text-xl font-bold text-[#222] mb-4">Mô Tả Sản Phẩm</h3>
                  <p className="text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              </div>

              {/* Related */}
              <div className="border border-[#E8E8E8] rounded-lg p-6 h-fit">
                <h3 className="font-bold text-[#222] mb-4">Sản Phẩm Liên Quan</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="p-3 bg-[#F5F5F5] rounded-lg hover:shadow-md transition cursor-pointer">
                      <div className="font-medium text-sm text-[#222] mb-1">Sản phẩm {item}</div>
                      <div className="text-[#FF6B35] font-bold text-sm">299.000₫</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-[#F5F5F5] mt-12 border-t border-[#E8E8E8]">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center text-gray-600 text-sm">
            <p>© 2024 LorKingdom. Bản quyền đã được bảo vệ.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
