"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { customerBlogService } from "@/services/customer_services/customer.blog.service";
import { BlogPublic } from "@/types/blog";
import { API_BASE } from "@/configs/api-configs";
type Reaction = {
  like: number;
  love: number;
  wow: number;
};

type Comment = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
};

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPublic[]>([]);
  const [blog, setBlog] = useState<BlogPublic | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPublic[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== LOCAL UI STATE =====
  const [reactions, setReactions] = useState<Reaction>({
    like: 0,
    love: 0,
    wow: 0,
  });

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  /* ================= FETCH DETAIL ================= */

  useEffect(() => {
    if (!slug) return;

    const fetchDetail = async () => {
      try {
        setLoading(true);

        const result =
          await customerBlogService.getBlogDetail(
            Number(slug)
          );

        setBlog(result.data);
      } catch (err) {
        console.error("Fetch detail error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [slug]);

  /* ================= FETCH RECENT ================= */
  useEffect(() => {
    const fetchFeatured = async () => {
      const result = await customerBlogService.getFeatured(3);
      setFeaturedBlogs(result.data);
    };

    fetchFeatured();
  }, []);
  useEffect(() => {
    const fetchRecent = async () => {
      const result =
        await customerBlogService.getRecent(5);
      setRecentBlogs(result.data);
    };

    fetchRecent();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Đang tải...
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        Không tìm thấy bài viết
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa]">

      {/* ===== BREADCRUMB ===== */}
      <div className="max-w-7xl mx-auto px-4 py-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-orange-500">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link href="/blog" className="hover:text-orange-500">
          Blog
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">
          {blog.blogTitle}
        </span>
      </div>

      {/* ===== CONTENT ===== */}
      <section className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* MAIN */}
          <div className="lg:col-span-8">
            <article className="bg-white rounded-xl shadow-sm p-8 space-y-6">

              <span className="inline-block bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm">
                {blog.blogCategory}
              </span>

              <h1 className="text-3xl font-bold text-gray-900">
                {blog.blogTitle}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm text-gray-500 border-b pb-4">
                <span>👤 {blog.authorEmail}</span>
                <span>
                  📅{" "}
                  {new Date(
                    blog.createdAt
                  ).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {blog.blogThumbnail && (
                <img
                  src={
                    blog.blogThumbnail.startsWith("http")
                      ? blog.blogThumbnail
                      : `${API_BASE}${blog.blogThumbnail}`
                  }
                  alt={blog.blogTitle}
                  className="w-full rounded-xl object-cover max-h-[420px]"
                />
              )}

              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: blog.blogContent,
                }}
              />

              {/* ===== REACTIONS (LOCAL UI ONLY) ===== */}
              <div className="border-t pt-8 mt-8">
                <h3 className="font-semibold mb-4 text-lg">
                  Bạn cảm thấy bài viết này thế nào?
                </h3>

                <div className="flex gap-4">
                  {[
                    { key: "like", icon: "👍" },
                    { key: "love", icon: "❤️" },
                    { key: "wow", icon: "😮" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() =>
                        setReactions((prev) => ({
                          ...prev,
                          [item.key]:
                            prev[
                            item.key as keyof Reaction
                            ] + 1,
                        }))
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-orange-100 transition text-sm"
                    >
                      {item.icon}
                      {
                        reactions[
                        item.key as keyof Reaction
                        ]
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== COMMENTS (LOCAL DEMO) ===== */}
              <div className="border-t pt-10 mt-10">
                <h3 className="font-semibold mb-6 text-lg">
                  Bình luận ({comments.length})
                </h3>

                <div className="space-y-4 mb-6">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex gap-4 bg-gray-50 p-4 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700">
                        {c.author.charAt(0)}
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          {c.author} •{" "}
                          {new Date(
                            c.createdAt
                          ).toLocaleDateString("vi-VN")}
                        </div>
                        <p className="text-sm text-gray-700">
                          {c.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Viết bình luận của bạn..."
                    value={newComment}
                    onChange={(e) =>
                      setNewComment(e.target.value)
                    }
                    className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />

                  <button
                    onClick={() => {
                      if (!newComment.trim())
                        return;

                      setComments((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          author: "Bạn",
                          content: newComment,
                          createdAt:
                            new Date().toISOString(),
                        },
                      ]);

                      setNewComment("");
                    }}
                    className="bg-orange-500 text-white px-6 rounded-lg text-sm hover:bg-orange-600 transition"
                  >
                    Gửi
                  </button>
                </div>
              </div>

            </article>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">

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
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold mb-4">
                🕒 Bài viết gần đây
              </h3>

              <ul className="space-y-4">
                {recentBlogs.map((item) => (
                  <li key={item.blogPostId}>
                    <Link
                      href={`/blog/${item.blogPostId}`}
                      className="block hover:text-orange-500"
                    >
                      <p className="text-sm font-medium line-clamp-2">
                        {item.blogTitle}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(
                          item.createdAt
                        ).toLocaleDateString("vi-VN")}
                      </span>
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