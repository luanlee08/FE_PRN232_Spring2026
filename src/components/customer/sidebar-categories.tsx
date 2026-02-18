'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const categories = [
  {
    id: 1,
    name: 'Lego & Xây Dựng',
    subcategories: ['Bộ Lego cơ bản', 'Lego nâng cao', 'Các khối xây dựng', 'Lego chuyên đề']
  },
  {
    id: 2,
    name: 'Xe Đua & Mô Hình',
    subcategories: ['Xe tải', 'Xe cuộc đua', 'Máy bay', 'Robot biến hình']
  },
  {
    id: 3,
    name: 'Búp Bê & Mô Hình Nhân Vật',
    subcategories: ['Búp bê công chúa', 'Mô hình nhân vật', 'Tượng hành động', 'Búp bê luyện tập']
  },
  {
    id: 4,
    name: 'Trò Chơi Board & Xúc Xắc',
    subcategories: ['Board game', 'Trò chơi xúc xắc', 'Trò chơi thẻ', 'Domino']
  },
  {
    id: 5,
    name: 'Đồ Chơi Ngoài Trời',
    subcategories: ['Công viên trượt', 'Xe đạp', 'Xe scooter', 'Trượt patin']
  },
  {
    id: 6,
    name: 'Đồ Chơi Điện Tử & Robot',
    subcategories: ['Robot lập trình', 'Drone mini', 'Robot trí tuệ nhân tạo', 'Ô tô điều khiển']
  },
  {
    id: 7,
    name: 'Nghệ Thuật & Thủ Công',
    subcategories: ['Bộ tô màu', 'Đất nặn sáng tạo', 'Hạt cườm', 'Khắc gỗ']
  },
  {
    id: 8,
    name: 'Đồ Chơi Nước & Cát',
    subcategories: ['Bộ chơi cát', 'Đồ bơi', 'Phao bơi', 'Bè nước']
  },
  {
    id: 9,
    name: 'Hóa Trang & Trang Phục',
    subcategories: ['Trang phục siêu anh hùng', 'Mặt nạ cosplay', 'Cánh giả', 'Cặp tai']
  },
  {
    id: 10,
    name: 'Nhạc Cụ Trẻ Em',
    subcategories: ['Đàn ghi ta', 'Trống', 'Keyboard mini', 'Kalimba']
  }
];

export function SidebarCategories() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <aside className="w-64 bg-white border-r border-[#E8E8E8] h-full sticky top-32">
      <div className="p-5">
        <h3 className="text-sm font-bold text-[#222] mb-4 px-3 uppercase tracking-wide text-[#FF6B35]">Danh Mục</h3>
        
        <nav className="space-y-1">
          {categories.map((category) => (
            <div key={category.id}>
              <button
                onClick={() => setExpanded(expanded === category.id ? null : category.id)}
                className={`w-full flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition ${
                  expanded === category.id
                    ? 'bg-[#FFF5F0] text-[#FF6B35] border-l-4 border-[#FF6B35]'
                    : 'text-[#222] hover:bg-[#F5F5F5] border-l-4 border-transparent'
                }`}
              >
                <span>{category.name}</span>
                <ChevronRight 
                  className={`w-4 h-4 transition-transform ${expanded === category.id ? 'rotate-90 text-[#FF6B35]' : 'text-gray-400'}`}
                />
              </button>
              
              {expanded === category.id && (
                <div className="bg-[#FAFAFA] border-l border-[#FF6B35]/30 ml-2">
                  {category.subcategories.map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      className="block px-6 py-2.5 text-xs text-gray-600 hover:text-[#FF6B35] hover:bg-white/50 transition rounded-r"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
