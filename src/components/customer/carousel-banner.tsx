'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: number;
  image: string;
  title: string;
  highlight: string;
}

const slides: BannerSlide[] = [
  {
    id: 1,
    image: '/banner-1.jpg',
    title: 'SALE SIÊU KHUYẾN MẠI ĐỒ CHƠI',
    highlight: 'Giảm tới 70%'
  },
  {
    id: 2,
    image: '/banner-2.png',
    title: 'KHÁM PHÁ LEGO VÀ XÂY DỰNG',
    highlight: 'Mua 2 Tặng 1'
  },
  {
    id: 3,
    image: '/banner-3.png',
    title: 'ĐỒ CHƠI NGOÀI TRỜI - VƯỢT ĐẤT',
    highlight: 'Miễn Phí Vận Chuyển'
  }
];

export function CarouselBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[currentSlide];

  return (
    <div className="relative w-full h-96 bg-gray-200 overflow-hidden rounded-lg mx-4">
      {/* Slides */}
      {slides.map((s, index) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Background Image */}
          <img
            src={s.image || "/placeholder.svg"}
            alt={s.title}
            className="w-full h-full object-cover"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-balance drop-shadow-lg">{s.title}</h2>
            <div className="bg-[#FF6B35] text-white px-6 py-3 rounded-lg font-bold text-2xl mb-6 shadow-lg">
              {s.highlight}
            </div>
            <button className="bg-white text-[#FF6B35] px-8 py-3 rounded-lg font-bold hover:shadow-lg transition transform hover:scale-105">
              Mua Ngay
            </button>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#FF6B35] p-2 rounded-full shadow-lg transition z-10"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-[#FF6B35] p-2 rounded-full shadow-lg transition z-10"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
