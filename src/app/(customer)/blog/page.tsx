"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

/* ================= MOCK DATA ================= */

const MOCK_CATEGORIES = [
  { blogCategoryId: 1, blogCategoryName: "Chăm sóc da" },
  { blogCategoryId: 2, blogCategoryName: "Review sản phẩm" },
  { blogCategoryId: 3, blogCategoryName: "Hướng dẫn" },
];

const MOCK_BLOGS = [
  {
    blogPostId: 1,
    blogTitle: "5 cách chăm sóc da mùa hè",
    blogExcerpt: "Mùa hè là thời điểm da dễ bị tổn thương bởi ánh nắng...",
    blogThumbnail:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6",
    blogCategory: "Chăm sóc da",
    categoryId: 1,
    authorEmail: "admin@glowpurea.vn",
    createdAt: "2026-02-15",
  },
  {
    blogPostId: 2,
    blogTitle: "Top 3 kem dưỡng ẩm tốt nhất 2026",
    blogExcerpt: "Dưỡng ẩm là bước quan trọng trong skincare routine...",
    blogThumbnail:
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
    blogCategory: "Review sản phẩm",
    categoryId: 2,
    authorEmail: "editor@glowpurea.vn",
    createdAt: "2026-02-12",
  },
  {
    blogPostId: 3,
    blogTitle: "Routine skincare cơ bản",
    blogExcerpt: "Nếu bạn mới bắt đầu skincare thì đây là hướng dẫn...",
    blogThumbnail: null,
    blogCategory: "Hướng dẫn",
    categoryId: 3,
    authorEmail: "support@glowpurea.vn",
    createdAt: "2026-02-10",
  },
  {
    blogPostId: 4,
    blogTitle: "Serum Vitamin C có thực sự hiệu quả?",
    blogExcerpt: "Vitamin C giúp sáng da và chống oxy hóa...",
    blogThumbnail:
      "https://images.unsplash.com/photo-1585238342028-4c43e43b5c10",
    blogCategory: "Review sản phẩm",
    categoryId: 2,
    authorEmail: "admin@glowpurea.vn",
    createdAt: "2026-02-08",
  },
  {
    blogPostId: 5,
    blogTitle: "Cách chọn toner phù hợp",
    blogExcerpt: "Không phải toner nào cũng giống nhau...",
    blogThumbnail:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908",
    blogCategory: "Chăm sóc da",
    categoryId: 1,
    authorEmail: "editor@glowpurea.vn",
    createdAt: "2026-02-05",
  },
];

/* ===== BLOG NỔI BẬT (HARD CODE) ===== */

const FEATURED_BLOGS = [
  {
    id: 101,
    title: "Bí quyết da sáng mịn tự nhiên",
    thumbnail:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9",
    createdAt: "2026-02-01",
  },
  {
    id: 102,
    title: "Xu hướng skincare 2026",
    thumbnail:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348",
    createdAt: "2026-01-28",
  },
];

/* ================= COMPONENT ================= */

export default function BlogPage() {
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | null>(null);

  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [page, setPage] = useState(1);
  const pageSize = 3;

  /* ================= FILTER ================= */

  const filteredBlogs = useMemo(() => {
    let data = MOCK_BLOGS;

    if (selectedCategoryId) {
      data = data.filter(
        (b) => b.categoryId === selectedCategoryId
      );
    }

    if (keyword) {
      data = data.filter((b) =>
        b.blogTitle.toLowerCase().includes(keyword.toLowerCase())
      );
    }

    return data;
  }, [selectedCategoryId, keyword]);

  const totalPages = Math.ceil(filteredBlogs.length / pageSize);

  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, page]);

  const recentBlogs = MOCK_BLOGS.slice(0, 3);

  /* ================= UI ================= */

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ================= LEFT ================= */}
          <div className="lg:col-span-8 space-y-8">

            {paginatedBlogs.map((post) => (
              <article
                key={post.blogPostId}
                className="flex gap-6 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={post.blogThumbnail || "/images/no-image.png"}
                    alt={post.blogTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <span className="inline-block mb-2 text-xs font-semibold px-3 py-1 rounded-full bg-orange-100 text-orange-600">
                      {post.blogCategory}
                    </span>

                    <h3 className="text-xl font-bold text-gray-900 hover:text-orange-500">
                      {post.blogTitle}
                    </h3>

                    <p className="text-gray-500 mt-2 line-clamp-2">
                      {post.blogExcerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div className="flex gap-4">
                      <span>{post.authorEmail}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.blogPostId}`}
                      className="text-orange-500 font-medium hover:underline"
                    >
                      Đọc tiếp →
                    </Link>
                  </div>
                </div>
              </article>
            ))}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-2 border rounded disabled:opacity-40"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded border ${
                      page === i + 1
                        ? "bg-orange-500 text-white"
                        : "bg-white hover:bg-orange-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-2 border rounded disabled:opacity-40"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {/* ================= RIGHT ================= */}
          <aside className="lg:col-span-4 space-y-6">

            {/* SEARCH */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Nhập từ khóa..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setKeyword(searchInput);
                      setPage(1);
                    }
                  }}
                  className="flex-1 border rounded-l-lg px-4 py-2"
                />
                <button
                  onClick={() => {
                    setKeyword(searchInput);
                    setPage(1);
                  }}
                  className="bg-orange-500 text-white px-4 rounded-r-lg"
                >
                  🔍
                </button>
              </div>
            </div>

            {/* CATEGORY */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 border-b pb-2">
                Chuyên mục
              </h4>

              <ul className="space-y-3 text-sm">
                <li
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setPage(1);
                  }}
                  className={`cursor-pointer hover:text-orange-500 ${
                    selectedCategoryId === null
                      ? "text-orange-500 font-semibold"
                      : ""
                  }`}
                >
                  Tất cả
                </li>

                {MOCK_CATEGORIES.map((cat) => (
                  <li
                    key={cat.blogCategoryId}
                    onClick={() => {
                      setSelectedCategoryId(cat.blogCategoryId);
                      setPage(1);
                    }}
                    className={`cursor-pointer hover:text-orange-500 ${
                      selectedCategoryId === cat.blogCategoryId
                        ? "text-orange-500 font-semibold"
                        : ""
                    }`}
                  >
                    {cat.blogCategoryName}
                  </li>
                ))}
              </ul>
            </div>

            {/* BLOG NỔI BẬT */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 border-b pb-2">
                ⭐ Blog nổi bật
              </h4>

              <ul className="space-y-4">
                {FEATURED_BLOGS.map((item) => (
                  <li key={item.id}>
                    <div className="flex gap-3">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold line-clamp-2">
                          {item.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {item.createdAt}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* RECENT */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 border-b pb-2">
                Bài viết gần đây
              </h4>

              <ul className="space-y-4">
                {recentBlogs.map((post) => (
                  <li key={post.blogPostId}>
                    <Link
                      href={`/blog/${post.blogPostId}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={post.blogThumbnail || "/images/no-image.png"}
                          alt={post.blogTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold line-clamp-2 group-hover:text-orange-500">
                          {post.blogTitle}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </section>
    </main>
  );
}
