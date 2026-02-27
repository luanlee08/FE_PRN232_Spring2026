"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { customerBlogService } from "@/services/customer_services/customer.blog.service";
import { BlogPublic, BlogCategory } from "@/types/blog";
import { API_BASE } from "@/configs/api-configs";
export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPublic[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogPublic[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 3;
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPublic[]>([]);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<number | undefined>();

  /* ================= FETCH BLOGS ================= */

  const fetchBlogs = async () => {
    setLoading(true);

    try {
      const result =
        await customerBlogService.getBlogs(
          page,
          pageSize,
          keyword,
          selectedCategoryId
        );

      setBlogs(result.data.items);
      setTotal(result.data.totalCount);
    } catch (err) {
      console.error("Fetch blog error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const result =
      await customerBlogService.getCategories();
    setCategories(result.data);
  };

  const fetchRecent = async () => {
    const result =
      await customerBlogService.getRecent(3);
    setRecentBlogs(result.data);
  };

  useEffect(() => {
    fetchBlogs();
  }, [page, keyword, selectedCategoryId]);

  useEffect(() => {
    fetchCategories();
    fetchRecent();
  }, []);
  useEffect(() => {
    const fetchFeatured = async () => {
      const result = await customerBlogService.getFeatured(3);
      setFeaturedBlogs(result.data);
    };

    fetchFeatured();
  }, []);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="bg-[#fafafa] min-h-screen">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ================= LEFT ================= */}
          <div className="lg:col-span-8 space-y-8">

            {loading && (
              <div className="text-center py-10">
                Đang tải...
              </div>
            )}

            {!loading && blogs.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Không có bài viết nào
              </div>
            )}

            {blogs.map((post) => (
              <article
                key={post.blogPostId}
                className="flex gap-6 bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="w-40 h-40 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={
                      post.blogThumbnail
                        ? post.blogThumbnail.startsWith("http")
                          ? post.blogThumbnail
                          : `${API_BASE}${post.blogThumbnail}`
                        : "/images/no-image.png"
                    }
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
                        {new Date(
                          post.createdAt
                        ).toLocaleDateString("vi-VN")}
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

                {Array.from({ length: totalPages }).map(
                  (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded border ${page === i + 1
                        ? "bg-orange-500 text-white"
                        : "bg-white hover:bg-orange-100"
                        }`}
                    >
                      {i + 1}
                    </button>
                  )
                )}

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
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
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
                    setSelectedCategoryId(undefined);
                    setPage(1);
                  }}
                  className="cursor-pointer hover:text-orange-500"
                >
                  Tất cả
                </li>

                {categories.map((cat) => (
                  <li
                    key={cat.blogCategoryId}
                    onClick={() => {
                      setSelectedCategoryId(
                        cat.blogCategoryId
                      );
                      setPage(1);
                    }}
                    className="cursor-pointer hover:text-orange-500"
                  >
                    {cat.blogCategoryName}
                  </li>
                ))}
              </ul>
            </div>

            {/* RECENT */}
            {/* <div className="bg-white p-6 rounded-xl shadow-sm">
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
                          src={
                            post.blogThumbnail
                              ? post.blogThumbnail.startsWith("http")
                                ? post.blogThumbnail
                                : `${API_BASE}${post.blogThumbnail}`
                              : "/images/no-image.png"
                          }
                          alt={post.blogTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold line-clamp-2 group-hover:text-orange-500">
                          {post.blogTitle}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            post.createdAt
                          ).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 border-b pb-2">
                ⭐ Bài viết nổi bật
              </h4>

              <ul className="space-y-4">
                {featuredBlogs.map((post) => (
                  <li key={post.blogPostId}>
                    <Link
                      href={`/blog/${post.blogPostId}`}
                      className="flex gap-4 group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden">
                        <img
                          src={
                            post.blogThumbnail
                              ? post.blogThumbnail.startsWith("http")
                                ? post.blogThumbnail
                                : `${API_BASE}${post.blogThumbnail}`
                              : "/images/no-image.png"
                          }
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