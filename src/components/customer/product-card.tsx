import { Heart, Play } from 'lucide-react';

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  sold: number;
  rating?: number;
  badge?: string;
  badgeColor?: string;
  hasVideo?: boolean;
}

export function ProductCard({
  image,
  name,
  price,
  originalPrice,
  discount,
  sold,
  rating = 4.5,
  badge,
  badgeColor,
  hasVideo
}: ProductCardProps) {
  const discountPercent = discount || (originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0);

  return (
    <div className="bg-white rounded-sm border border-[#E8E8E8] hover:shadow-md transition overflow-hidden group">
      {/* Image Container */}
      <div className="relative bg-[#F5F5F5] aspect-square overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        
        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2 bg-[#EE4D2D] text-white px-1.5 py-1 rounded-sm text-xs font-bold">
            -{discountPercent}%
          </div>
        )}

        {/* Video Badge */}
        {hasVideo && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-sm text-xs font-semibold flex items-center gap-1">
            <Play className="w-3 h-3" /> Video
          </div>
        )}

        {/* Favorite Button */}
        <button className="absolute top-2 left-2 bg-white/80 hover:bg-white rounded-full p-1.5 transition opacity-0 group-hover:opacity-100">
          <Heart className="w-4 h-4 text-[#EE4D2D]" />
        </button>

      </div>

      {/* Content */}
      <div className="p-3 flex flex-col h-full">
        {/* Name */}
        <h3 className="text-sm font-medium text-[#222] line-clamp-2 mb-2 h-9">
          {name}
        </h3>

        {/* Rating & Sold */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-0.5">
            <span className="text-yellow-400">★</span>
            <span className="text-xs text-gray-600">{rating}</span>
          </div>
          <span className="text-xs text-gray-500">|</span>
          <span className="text-xs text-gray-500">Đã bán {sold}</span>
        </div>

        {/* Price Section */}
        <div className="space-y-2 flex-grow">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#FF6B35]">
              {price.toLocaleString('vi-VN')}₫
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-2">
          <button className="flex-1 bg-white border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FFF5F0] text-xs font-medium py-1.5 rounded transition">
            Giỏ hàng
          </button>
          <button className="flex-1 bg-[#FF6B35] hover:bg-[#E55A24] text-white text-xs font-medium py-1.5 rounded transition">
            Mua ngay
          </button>
        </div>
      </div>
    </div>
  );
}
