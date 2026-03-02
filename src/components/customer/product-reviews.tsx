import { Star, ThumbsUp, MessageCircle, ThumbsDown } from "lucide-react";
import Image from "next/image";

const mockReviews = [
  {
    id: 1,
    user: { name: "Jane Cooper", avatar: "https://i.pravatar.cc/150?u=1" },
    time: "1 ngày trước",
    rating: 5,
    content:
      "Bàn phím tuyệt vời, chất lượng hoàn thiện tốt và cảm giác gõ rất đã. Đèn RGB sáng và có thể tùy chỉnh. Rất đáng tiền!",
    images: [
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80",
      "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200&q=80",
    ],
    likes: 12,
    dislikes: 0,
    adminReply: {
      time: "10 giờ trước",
      content:
        "Cảm ơn bạn đã tin tưởng và ủng hộ LorKingdom! Chúc bạn có những trải nghiệm tuyệt vời với sản phẩm nhé.",
    },
  },
  {
    id: 2,
    user: { name: "Cody Fisher", avatar: "https://i.pravatar.cc/150?u=2" },
    time: "3 ngày trước",
    rating: 4,
    content:
      "Sản phẩm tốt, giao hàng nhanh. Tuy nhiên hộp hơi móp một chút do vận chuyển. Bàn phím dùng ngon, switch êm.",
    images: [],
    likes: 5,
    dislikes: 1,
  },
  {
    id: 3,
    user: { name: "Kristin Watson", avatar: "https://i.pravatar.cc/150?u=3" },
    time: "4 ngày trước",
    rating: 5,
    content: "Đẹp xuất sắc! Setup góc làm việc cực kỳ hợp. Sẽ ủng hộ shop thêm các sản phẩm khác.",
    images: ["https://images.unsplash.com/photo-1600439614353-174ad0ee3b25?w=200&q=80"],
    likes: 24,
    dislikes: 4,
    adminReply: {
      time: "3 ngày trước",
      content:
        "Dạ LorKingdom cảm ơn đánh giá 5 sao của bạn ạ. Mong bạn sẽ tiếp tục ủng hộ shop trong tương lai!",
    },
  },
  {
    id: 4,
    user: { name: "Leslie Alexander", avatar: "https://i.pravatar.cc/150?u=4" },
    time: "1 tuần trước",
    rating: 1,
    content:
      "Giao hàng quá chậm, hộp nát bét. Nhắn tin cho shop không thấy trả lời. Trải nghiệm tệ.",
    images: [],
    likes: 2,
    dislikes: 10,
    adminReply: {
      time: "6 ngày trước",
      content:
        "Chào bạn, LorKingdom rất xin lỗi về sự cố vận chuyển này. Shop đã liên hệ qua tin nhắn để hỗ trợ đổi trả sản phẩm mới cho bạn ạ.",
    },
  },
  {
    id: 5,
    user: { name: "Jacob Jones", avatar: "https://i.pravatar.cc/150?u=5" },
    time: "1 tuần trước",
    rating: 4,
    content:
      "Bàn phím gõ êm, phù hợp cho cả chơi game và gõ văn bản. Đèn LED đẹp. Hơi ồn một chút nếu dùng trong văn phòng yên tĩnh.",
    images: [],
    likes: 8,
    dislikes: 2,
  },
  {
    id: 6,
    user: { name: "Floyd Miles", avatar: "https://i.pravatar.cc/150?u=6" },
    time: "2 tuần trước",
    rating: 5,
    content:
      "Tuyệt vời! Không có gì để chê. Đóng gói cẩn thận, giao hàng nhanh. Sẽ giới thiệu cho bạn bè.",
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80",
      "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=200&q=80",
      "https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80",
    ],
    likes: 45,
    dislikes: 3,
  },
];

export function ProductReviews() {
  return (
    <div className="mt-12 border border-[#E8E8E8] rounded-xl p-8 bg-white">
      <h3 className="text-2xl font-bold text-[#222] mb-8">Đánh giá & Nhận xét</h3>

      {/* Top Section: Stats */}
      <div className="flex flex-col md:flex-row justify-center mb-8 gap-4">
        {/* Left: Average */}
        <div className="flex flex-col justify-center items-center md:items-start min-w-50">
          <div className="text-5xl font-bold text-[#222] mb-2">4.8</div>
          <div className="flex text-[#00B578] mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-current" />
            ))}
          </div>
          <div className="text-gray-500">1,234 Đánh giá</div>
        </div>

        {/* Right: Bars */}
        <div className="flex-1 space-y-2 max-w-xl">
          {[
            { stars: 5, percent: 85 },
            { stars: 4, percent: 60 },
            { stars: 3, percent: 15 },
            { stars: 2, percent: 25 },
            { stars: 1, percent: 40 },
          ].map((bar) => (
            <div key={bar.stars} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-10 text-base font-medium text-gray-600">
                {bar.stars} <Star className="w-4 h-4 fill-[#F5A623] text-[#F5A623]" />
              </div>
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5A623] rounded-full"
                  style={{ width: `${bar.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <hr className="border-[#E8E8E8] mb-8" />

      {/* Middle Section: Filters
      <div className="flex flex-wrap gap-3 mb-8">
        <button className="px-6 py-2 bg-[#FFF5F0] text-[#FF6B35] border border-[#FF6B35] rounded-lg font-medium transition">
          Tất cả
        </button>
        <button className="px-6 py-2 bg-white border border-[#E8E8E8] text-gray-600 rounded-lg hover:bg-gray-50 transition">
          5 Sao (1.1k)
        </button>
        <button className="px-6 py-2 bg-white border border-[#E8E8E8] text-gray-600 rounded-lg hover:bg-gray-50 transition">
          4 Sao (100)
        </button>
        <button className="px-6 py-2 bg-white border border-[#E8E8E8] text-gray-600 rounded-lg hover:bg-gray-50 transition">
          3 Sao (20)
        </button>
        <button className="px-6 py-2 bg-white border border-[#E8E8E8] text-gray-600 rounded-lg hover:bg-gray-50 transition">
          2 Sao (5)
        </button>
        <button className="px-6 py-2 bg-white border border-[#E8E8E8] text-gray-600 rounded-lg hover:bg-gray-50 transition">
          1 Sao (9)
        </button>
        <button className="px-6 py-2 bg-white border border-[#E8E8E8] text-gray-600 rounded-lg hover:bg-gray-50 transition">
          Có hình ảnh (450)
        </button>
      </div> */}

      {/* Bottom Section: Review List */}
      <div className="space-y-8">
        {mockReviews.map((review) => (
          <div
            key={review.id}
            className="flex gap-4 pb-8 border-b border-[#E8E8E8] last:border-0 last:pb-0"
          >
            <Image
              src={review.user.avatar}
              alt={review.user.name}
              width={48} // ~ w-12
              height={48} // ~ h-12
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
            <div className="flex-1">
              <div className="font-semibold text-[#222]">{review.user.name}</div>
              <div className="flex items-center gap-3 mt-1 mb-3">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? "fill-[#00B578] text-[#00B578]" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-400">{review.time}</span>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4">{review.content}</p>

              {/* Images Gallery */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-3 mb-4">
                  {review.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition"
                    >
                      <Image
                        src={img}
                        alt="Review attachment"
                        width={96} // ~ w-24 (24 * 4 = 96px)
                        height={96} // ~ h-24
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-5 text-sm text-gray-500 mb-4">
                <button className="flex items-center gap-1.5 hover:text-[#FF6B35] transition">
                  <ThumbsUp className="w-4 h-4" /> Hữu ích ({review.likes})
                </button>
                <button className="flex items-center gap-1.5 hover:text-[#FF6B35] transition">
                  <ThumbsDown className="w-4 h-4" /> Không hữu ích ({review.dislikes})
                </button>
              </div>

              {/* Admin Reply */}
              {review.adminReply && (
                <div className="bg-orange-25 p-4 rounded-lg border border-orange-200 mt-2 relative">
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-orange-25 border-t border-l border-orange-200 transform rotate-45"></div>
                  <div className="flex items-center gap-2 mb-2 relative z-10">
                    <span className="font-semibold text-[#222]">Phản hồi từ LorKingdom</span>
                    <span className="text-xs text-gray-400">• {review.adminReply.time}</span>
                  </div>
                  <p className="text-gray-600 text-sm relative z-10">{review.adminReply.content}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
