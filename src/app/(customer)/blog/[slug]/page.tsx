"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState, useMemo } from "react";
import { MOCK_REACTIONS, MOCK_COMMENTS } from "../mock-data";

/* ================= TYPES ================= */

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

/* ================= MOCK BLOG DATA ================= */

const MOCK_BLOGS = [
  {
    blogPostId: 1,
    blogTitle: "5 cách chăm sóc da mùa hè hiệu quả",
    blogContent: `
      <p>Mùa hè là thời điểm da dễ bị tổn thương bởi ánh nắng mặt trời.</p>
      <h2>1. Sử dụng kem chống nắng</h2>
      <p>Luôn sử dụng kem chống nắng SPF 50+ trước khi ra ngoài.</p>
      <h2>2. Uống đủ nước</h2>
      <p>Ít nhất 2 lít nước mỗi ngày để giữ ẩm cho da.</p>
      <p><strong>Chăm sóc da đúng cách</strong> sẽ giúp bạn tự tin hơn mỗi ngày.</p>
    `,
    blogThumbnail:
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6",
    blogCategory: "Chăm sóc da",
    authorEmail: "admin@glowpurea.vn",
    createdAt: "2026-02-15",
  },
  {
    blogPostId: 2,
    blogTitle: "Top 3 sản phẩm dưỡng ẩm tốt nhất 2026",
    blogContent: `
      <p>Dưỡng ẩm là bước quan trọng trong skincare.</p>
      <ul>
        <li>Kem dưỡng chứa HA</li>
        <li>Serum Vitamin B5</li>
        <li>Mặt nạ ngủ</li>
      </ul>
    `,
    blogThumbnail:
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
    blogCategory: "Review sản phẩm",
    authorEmail: "editor@glowpurea.vn",
    createdAt: "2026-02-10",
  },
  {
    blogPostId: 3,
    blogTitle: "Routine skincare cơ bản cho người mới",
    blogContent: `
      <p>Nếu bạn mới bắt đầu skincare, hãy làm theo các bước sau:</p>
      <ol>
        <li>Tẩy trang</li>
        <li>Rửa mặt</li>
        <li>Toner</li>
        <li>Serum</li>
        <li>Kem dưỡng</li>
      </ol>
    `,
    blogThumbnail: null,
    blogCategory: "Hướng dẫn",
    authorEmail: "support@glowpurea.vn",
    createdAt: "2026-02-05",
  },
];

/* ================= COMPONENT ================= */

export default function BlogDetailPage() {

  const { slug } = useParams<{ slug: string }>();

  const postId = Number(slug);

  // const [comments, setComments] = useState(
  //   MOCK_COMMENTS?.[postId] || []
  // );

  /* ===== FIND BLOG ===== */
  const blog = useMemo(() => {
    return MOCK_BLOGS.find(
      (b) => b.blogPostId === postId
    );
  }, [postId]);

  const recentBlogs = MOCK_BLOGS.slice(0, 5);

  /* ===== STATES ===== */
  const [reactions, setReactions] = useState<Reaction>(
    MOCK_REACTIONS?.[postId] || { like: 0, love: 0, wow: 0 }
  );

  const [comments, setComments] = useState<Comment[]>(
    MOCK_COMMENTS?.[postId] || []
  );

  const [newComment, setNewComment] = useState("");

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
                <span>📅 {blog.createdAt}</span>
              </div>

              {blog.blogThumbnail && (
                <img
                  src={blog.blogThumbnail}
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

              {/* ===== REACTIONS ===== */}
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
                            prev[item.key as keyof Reaction] + 1,
                        }))
                      }
                      className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 hover:bg-orange-100 transition text-sm"
                    >
                      {item.icon}
                      {reactions[item.key as keyof Reaction]}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== COMMENTS ===== */}
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
                          {new Date(c.createdAt).toLocaleDateString("vi-VN")}
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
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />

                  <button
                    onClick={() => {
                      if (!newComment.trim()) return;

                      setComments((prev) => [
                        ...prev,
                        {
                          id: Date.now(),
                          author: "Bạn",
                          content: newComment,
                          createdAt: new Date().toISOString(),
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
                        {item.createdAt}
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
