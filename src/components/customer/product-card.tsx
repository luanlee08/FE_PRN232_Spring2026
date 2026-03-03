import { Play } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  id: number | string;
  image: string;
  name: string;
  price: number;
  rating?: number;
  hasVideo?: boolean;
}

export function ProductCard({
  id,
  image,
  name,
  price,
  rating = 4.5,
  hasVideo
}: ProductCardProps) {

  return (
    <Link href={`/products/${encodeURIComponent(String(id))}`} className="block">
      <div className="bg-white rounded-sm border border-[#E8E8E8] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer">

        <div className="relative bg-[#F5F5F5] aspect-square overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />

          {hasVideo && (
            <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-sm text-xs font-semibold flex items-center gap-1">
              <Play className="w-3 h-3" /> Video
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col">
          <h3 className="text-sm font-medium text-[#222] line-clamp-2 mb-2 h-9">
            {name}
          </h3>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">★</span>
            <span className="text-xs text-gray-600">{rating}</span>
          </div>

          <div className="mb-3">
            <span className="text-lg font-bold text-[#FF6B35]">
              {price.toLocaleString("vi-VN")}₫
            </span>
          </div>

        </div>
      </div>
    </Link>
  );
}
