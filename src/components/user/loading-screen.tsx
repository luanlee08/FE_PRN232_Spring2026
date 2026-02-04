'use client';

import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1200);

    // Progress bar animation - faster speed
    const intervals: NodeJS.Timeout[] = [];
    for (let i = 0; i <= 100; i++) {
      intervals.push(
        setTimeout(() => {
          setProgress(i);
        }, i * 10)
      );
    }

    return () => {
      clearTimeout(timer);
      intervals.forEach(interval => clearTimeout(interval));
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#FF6B35] to-[#E55A24] flex items-center justify-center z-[100]">
      {/* Animated Content */}
      <div className="text-center">
        {/* Crown Logo - Static */}
        <div className="mb-8">
          <span className="text-8xl inline-block">👑</span>
        </div>

        {/* Brand Name */}
        <h1 className="text-5xl font-bold text-white mb-12 tracking-wider">LorKingdom</h1>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden mb-4">
            <div
              className="h-full bg-white rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/80 text-sm tracking-widest">{progress}%</p>
        </div>

        {/* Text */}
        <p className="text-white/70 mt-6 text-sm tracking-widest">Vào Vương Quốc Đồ Chơi...</p>
      </div>
    </div>
  );
}
