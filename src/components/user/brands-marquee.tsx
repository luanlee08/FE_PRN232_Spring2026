'use client';

export function BrandsMarquee() {
  const brands = [
    '🎮 Lego',
    '🚗 Hot Wheels',
    '🧸 Barbie',
    '🎯 Nerf',
    '🎪 LEGO Friends',
    '🤖 Transformers',
    '🦸 Marvel',
    '💥 Fisher Price',
    '🎨 Playdoh',
    '🧩 Rubiks Cube',
    '🎭 Mattel',
    '🚀 Hasbro',
  ];

  // Duplicate brands for seamless looping
  const allBrands = [...brands, ...brands];

  return (
    <div className="w-full bg-[#F5F5F5] py-8 overflow-hidden border-t border-b border-gray-200">
      <div className="relative w-full">
        <div className="flex gap-8 animate-[marquee_20s_linear_infinite]">
          {allBrands.map((brand, index) => (
            <div
              key={index}
              className="whitespace-nowrap text-sm font-semibold text-[#222] flex items-center gap-2 px-4"
            >
              {brand}
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
