"use client";

import { useEffect, useState } from "react";
import { blogService } from "@/services/admin_services/admin.blog.service";
import { BlogAdmin, BlogCategory } from "@/types/blog";

interface Props {
  initialData?: BlogAdmin | null;
  submitText?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function BlogForm({
  initialData,
  submitText = "Lưu blog",
  onSuccess,
  onCancel,
}: Props) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.blogTitle ?? "");
  const [content, setContent] = useState(initialData?.blogContent ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(
    initialData?.categoryId ?? ""
  );
  const [isPublished, setIsPublished] = useState(
    initialData?.isPublished ?? false
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData?.isFeatured ?? false
  );
  const [isDeleted, setIsDeleted] = useState(
    initialData?.isDeleted ?? false
  );
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.blogThumbnail ?? null
  );

  // LOAD CATEGORIES
  useEffect(() => {
    blogService.getCategories().then((res) => {
      setCategories(res.data ?? []);
    });
  }, []);

  const handleFileChange = (file: File) => {
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !categoryId) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("blogTitle", title);
      formData.append("blogContent", content);
      formData.append("categoryId", String(categoryId));
      formData.append("isPublished", String(isPublished));
      formData.append("isFeatured", String(isFeatured));
      formData.append("isDeleted", String(isDeleted));

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (initialData) {
        await blogService.updateBlog(
          initialData.blogPostId,
          formData
        );
      } else {
        await blogService.createBlog(formData);
      }

      onSuccess?.();
    } catch (err) {
      console.error("Save blog error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-sm"
    >
      {/* TITLE */}
      <div>
        <label className="mb-1 block font-medium">
          Tiêu đề
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* CATEGORY */}
      <div>
        <label className="mb-1 block font-medium">
          Thể loại
        </label>
        <select
          value={categoryId}
          onChange={(e) =>
            setCategoryId(Number(e.target.value))
          }
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="">-- Chọn thể loại --</option>
          {categories.map((c) => (
            <option
              key={c.blogCategoryId}
              value={c.blogCategoryId}
            >
              {c.blogCategoryName}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      <div>
        <label className="mb-1 block font-medium">
          Nội dung
        </label>
        <textarea
          rows={6}
          value={content}
          onChange={(e) =>
            setContent(e.target.value)
          }
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* THUMBNAIL */}
      <div>
        <label className="mb-1 block font-medium">
          Ảnh đại diện
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            e.target.files &&
            handleFileChange(e.target.files[0])
          }
        />

        {preview && (
          <img
            src={preview}
            className="mt-3 h-24 w-24 rounded-lg object-cover border"
          />
        )}
      </div>

      {/* OPTIONS */}
      <div className="flex gap-8">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) =>
              setIsPublished(e.target.checked)
            }
          />
          Xuất bản
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) =>
              setIsFeatured(e.target.checked)
            }
          />
          Nổi bật
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDeleted}
            onChange={(e) =>
              setIsDeleted(e.target.checked)
            }
          />
          Hoạt động
        </label>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : submitText}
        </button>
      </div>
    </form>
  );
}