"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { customerBlogService } from "@/services/customer_services/customer.blog.service";
import { BlogPublic, ReviewBlog } from "@/types/blog";
import { customerBlogReviewService }
  from "@/services/customer_services/customer.blogReview.service";
import { API_BASE } from "@/configs/api-configs";
import { customerBlogReactionService } from "@/services/customer_services/customer.blogReaction.service";
import { AxiosError } from "axios";
type Comment = {
  id: number;
  author: string;
  content: string;
  createdAt: string;
};


type BlogReactionSummary = {
  likeCount: number;
  dislikeCount: number;
  userReaction?: "Like" | "Dislike" | null;
};


export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogPublic[]>([]);
  const [blog, setBlog] = useState<BlogPublic | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactionSummary, setReactionSummary] =
    useState<BlogReactionSummary | null>(null);
  // ===== LOCAL UI STATE =====

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const [reviews, setReviews] = useState<ReviewBlog[]>([]);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  const loadReviews = async (blogId: number) => {
    try {
      const result =
        await customerBlogReviewService.getByBlog(blogId);

      setReviews(result.data);
    } catch (err) {
      console.error("Load reviews error:", err);
    }
  };


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




  useEffect(() => {
    if (!slug) return;

    loadReviews(Number(slug));
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
        Äang táº£i...
      </main>
    );
  }

  if (!blog) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-600">
        KhÃ´ng tÃ¬m tháº¥y bÃ i viáº¿t
      </main>
    );
  }

  const handleCreateReview = async () => {
    const trimmedReview = newReview.trim();

    if (!trimmedReview) {
      setReviewError("Vui lòng nhập nội dung đánh giá");
      return;
    }

    if (trimmedReview.length < 1) {
      setReviewError("Đánh giá phải có ít nhất 1 ký tự");
      return;
    }

    if (trimmedReview.length > 500) {
      setReviewError("Đánh giá không được vượt quá 500 ký tự");
      return;
    }

    if (rating < 1 || rating > 5) {
      setReviewError("Số sao đánh giá không hợp lệ");
      return;
    }

    setReviewError("");

    try {
      setSubmitting(true);

      const res = await customerBlogReviewService.create(
        blog!.blogPostId,
        trimmedReview,
        rating
      );

      if (res.status !== 201) {
        setReviewError(res.message || "Không thể gửi đánh giá");
        return;
      }

      setNewReview("");
      setRating(5);
      setReviewError("");

      await loadReviews(blog!.blogPostId);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          setReviewError("Vui lòng đăng nhập để đánh giá");
          return;
        }

        const apiMessage = (
          err.response?.data as { message?: string } | undefined
        )?.message;
        setReviewError(apiMessage || "Có lỗi xảy ra");
        return;
      }

      console.error("Create review error:", err);
      setReviewError("Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReact = async (
    reviewBlogId: number,
    type: "Like" | "Dislike"
  ) => {
    try {
      await customerBlogReactionService.react(reviewBlogId, type);

      await loadReviews(blog!.blogPostId);

    } catch (err) {
      console.error(err);
    }
  };

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
                {/* <span>Tác giả {blog.authorEmail}</span> */}
                <span>
                  {" "}
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



              {/* ===== REVIEWS FROM DATABASE ===== */}
              <div className="border-t pt-10 mt-10">
                <h3 className="font-semibold mb-6 text-lg">
                  Đánh giá của khách hàng ({reviews.length})
                </h3>

                {/* LIST REVIEW */}
                <div className="space-y-4 mb-6">
                  {reviews.length === 0 && (
                    <p className="text-sm text-gray-500">
                     Chưa có đánh giá.
                    </p>
                  )}

                  {reviews.map((r) => (
                    <div
                      key={r.reviewBlogId}
                      className="flex gap-4 bg-gray-50 p-4 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center font-bold text-orange-700">
                        {r.customerName?.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1">

                        {/* ===== REVIEW HEADER ===== */}
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                          <span>
                            {r.customerName}{" "}
                            {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>

                        {/* ===== REVIEW CONTENT ===== */}
                        <p className="text-sm text-gray-700 mb-2">
                          {r.comment}
                        </p>

                        {/* ===== REACTION (NGAY DÆ¯á»šI REVIEW) ===== */}
                        <div className="flex gap-4 text-sm mb-3">
                          <button
                            onClick={() => handleReact(r.reviewBlogId, "Like")}
                            className={`flex items-center gap-1 ${r.userReaction === "Like"
                                ? "text-blue-600 font-semibold"
                                : "text-gray-500 hover:text-blue-600"
                              }`}
                          >
                            👍 {r.likeCount}
                          </button>

                          <button
                            onClick={() => handleReact(r.reviewBlogId, "Dislike")}
                            className={`flex items-center gap-1 ${r.userReaction === "Dislike"
                                ? "text-red-600 font-semibold"
                                : "text-gray-500 hover:text-red-600"
                              }`}
                          >
                            👎 {r.dislikeCount}
                          </button>
                        </div>

                        {/* ===== REPLIES (SAU REACTION) ===== */}
                        {r.replies && r.replies.length > 0 && (
                          <div className="space-y-2 border-l-2 border-orange-200 pl-4">
                            {r.replies.map((reply) => (
                              <div
                                key={reply.replyBlogId}
                                className="bg-white p-3 rounded-lg shadow-sm"
                              >
                                <div className="text-xs text-gray-500 mb-1">
                                  <span className="font-semibold text-orange-600">
                                    {reply.accountName}
                                  </span>{" "}
                                  {" "}
                                  {new Date(reply.createdAt).toLocaleDateString("vi-VN")}
                                </div>

                                <p className="text-sm text-gray-700">
                                  {reply.content}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                      </div>
                    </div>
                  ))}
                </div>

                {/* ADD REVIEW */}
                <div className="space-y-3">
                  <textarea
                    placeholder="Viết đánh giá của bạn..."
                    value={newReview}
                    onChange={(e) => {
                      setNewReview(e.target.value);
                      if (reviewError) setReviewError("");
                    }}
                    maxLength={500}
                    className={`w-full border rounded-lg px-4 py-2 text-sm ${reviewError ? "border-red-500" : "border-gray-300"}`}
                  />

                  <div className="flex justify-between items-center">
                    {reviewError && (
                    <p className="text-sm text-red-600">{reviewError}</p>
                  )}

                  {/* <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="border rounded px-3 py-1 text-sm"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n}>
                          {n} sao
                        </option>
                      ))}
                    </select> */}

                    <button
                      onClick={handleCreateReview}
                      disabled={submitting}
                      className="bg-orange-500 text-white px-6 py-2 rounded-lg text-sm hover:bg-orange-600 disabled:opacity-50"
                    >
                      {submitting ? "Gửi đánh giá" : "Gửi đánh giá"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h4 className="font-bold mb-4 border-b pb-2">
                đánh giá
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
              Đánh giá blog 
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

