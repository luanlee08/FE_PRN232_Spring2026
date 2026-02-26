"use client";
import { API_BASE } from "@/configs/api-configs";
import { Pencil } from "lucide-react";
import { BlogAdmin } from "@/types/blog";

interface Props {
  blogs: BlogAdmin[];
  loading?: boolean;
  onEdit?: (item: BlogAdmin) => void;
}

export default function BlogTable({
  blogs,
  loading,
  onEdit,
}: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1400px] text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="w-16">ID</th>
            <th className="w-60">Tiêu đề</th>
            <th className="w-[360px]">Nội dung</th>
            <th className="w-20">Ảnh</th>
            <th className="w-32">Thể loại</th>
            <th className="w-32">Trạng thái</th>
            <th className="w-24">Nổi bật</th>
            <th className="w-28">Hoạt động</th>
            <th className="w-28">Ngày tạo</th>
            <th className="w-20 text-right pr-4">Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {/* ===== LOADING ===== */}
          {loading && (
            <tr>
              <td colSpan={10} className="py-8 text-center text-gray-500">
                Đang tải dữ liệu...
              </td>
            </tr>
          )}

          {/* ===== EMPTY ===== */}
          {!loading && blogs.length === 0 && (
            <tr>
              <td colSpan={10} className="py-8 text-center text-gray-500">
                Không có blog nào
              </td>
            </tr>
          )}

          {/* ===== DATA ===== */}
          {!loading &&
            blogs.map((blog) => (
              <tr
                key={blog.blogPostId}
                className="border-b hover:bg-gray-50"
              >
                <td>{blog.blogPostId}</td>

                <td className="font-medium">
                  {blog.blogTitle}
                </td>

                <td className="max-w-[400px] truncate text-gray-600">
                  {blog.blogContent}
                </td>

                <td>
                  {blog.blogThumbnail ? (
                    <img
                      src={`${API_BASE}${blog.blogThumbnail}`}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-gray-200" />
                  )}
                </td>

                <td>{blog.blogCategory}</td>

                {/* PUBLISHED */}
                <td>
                  {blog.isPublished ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      Đã xuất bản
                    </span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      Bản nháp
                    </span>
                  )}
                </td>

                {/* FEATURED */}
                <td
                  className={
                    blog.isFeatured
                      ? "text-amber-600"
                      : "text-gray-400"
                  }
                >
                  {blog.isFeatured ? "Nổi bật" : "Không"}
                </td>

                {/* ACTIVE */}
                <td>
                  {blog.isDeleted ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                      Hoạt động
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                      Đã xoá
                    </span>
                  )}
                </td>

                <td>
                  {new Date(blog.createdAt).toLocaleDateString()}
                </td>

                <td className="pr-4 text-right">
                  <button
                    onClick={() => onEdit?.(blog)}
                    className="text-indigo-500 hover:text-indigo-700"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}