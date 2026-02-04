import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">👑</span>
              <h3 className="text-xl font-bold text-white">LorKingdom</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Vương quốc đồ chơi hàng đầu tại Việt Nam với hàng ngàn sản phẩm chất lượng cao.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#FF6B35] flex-shrink-0 mt-1" />
                <div className="text-sm">
                  <p className="font-medium text-white">Trụ sở chính</p>
                  <p className="text-gray-400">123 Đường Trần Hưng Đạo, Q.1, TP.HCM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-white">Hotline</p>
                  <p className="text-gray-400">1800 2092</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#FF6B35] flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-white">Email</p>
                  <p className="text-gray-400">support@lorkingdom.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="font-bold text-white mb-4">Về LorKingdom</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Giới Thiệu</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Lịch Sử</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Tuyển Dụng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Press</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Liên Hệ</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white mb-4">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Trung Tâm Trợ Giúp</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Hướng Dẫn Mua Hàng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Chính Sách Đổi Trả</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Chính Sách Bảo Mật</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Điều Khoản Dịch Vụ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">FAQ</a></li>
            </ul>
          </div>

          {/* Seller */}
          <div>
            <h4 className="font-bold text-white mb-4">Bán Hàng Trên LK</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Trở Thành Người Bán</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Quy Tắc & Nội Quy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Hướng Dẫn Bán Hàng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Công Cụ Bán Hàng</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Hóa Đơn Điện Tử</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#FF6B35] transition">Phí Dịch Vụ</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-bold text-white mb-4">Kết Nối Với Chúng Tôi</h4>
            <p className="text-sm text-gray-400 mb-4">Theo dõi chúng tôi trên các nền tảng xã hội</p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white rounded-full flex items-center justify-center transition">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white rounded-full flex items-center justify-center transition">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white rounded-full flex items-center justify-center transition">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-[#FF6B35]/20 hover:bg-[#FF6B35] text-[#FF6B35] hover:text-white rounded-full flex items-center justify-center transition">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* Download Apps */}
            <div className="mt-6">
              <p className="text-sm font-medium text-white mb-3">Tải Ứng Dụng</p>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition border border-gray-700">
                  App Store
                </button>
                <button className="w-full px-3 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 transition border border-gray-700">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-8"></div>

        {/* Payment Methods */}
        <div className="mb-8">
          <h4 className="font-bold text-white mb-4">Phương Thức Thanh Toán</h4>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['Visa', 'Mastercard', 'Paypal', 'Bank Transfer', 'Momo', 'ZaloPay'].map((method) => (
              <div key={method} className="px-3 py-2 bg-gray-800 rounded text-center text-sm text-gray-300 hover:bg-[#FF6B35]/20 transition cursor-pointer">
                {method}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-bold text-white mb-2">Chứng Nhận</h4>
              <div className="text-sm text-gray-400">
                <p>Công ty TNHH Vương Quốc Đồ Chơi</p>
                <p>Mã số thuế: 0123456789</p>
                <p>Giấy phép kinh doanh được cấp bởi Sở KHĐT TP.HCM</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">Cam Kết</h4>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>✓ Sản phẩm chính hãng 100%</li>
                <li>✓ Bảo hành chính hãng</li>
                <li>✓ Giao hàng nhanh chóng</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-sm text-gray-400 mb-2">
              © 2024 LorKingdom. Bản quyền được bảo vệ
            </p>
            <p className="text-xs text-gray-500">
              Địa chỉ: 123 Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh | Điện thoại: 1800 2092 | Email: support@lorkingdom.com
            </p>
            <p className="text-xs text-gray-500 mt-3">
              LorKingdom - Nơi em bé tìm thấy niềm vui
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
