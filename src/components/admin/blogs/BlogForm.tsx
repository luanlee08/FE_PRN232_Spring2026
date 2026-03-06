"use client";

import { useEffect, useState } from "react";
import { blogService } from "@/services/admin_services/admin.blog.service";
import { BlogAdmin, BlogCategory } from "@/types/blog";
import { API_BASE } from "@/configs/api-configs";

interface Props {
  initialData?: BlogAdmin | null;
  submitText?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type FormErrors = {
  title?: string;
  content?: string;
  categoryId?: string;
  thumbnail?: string;
};

const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const parseApiErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const normalized = error as {
      message?: string;
      response?: {
        data?: {
          message?: string;
          data?: Record<string, string[]>;
        };
      };
    };

    const validationErrors = normalized.response?.data?.data;
    if (validationErrors && typeof validationErrors === "object") {
      const firstError = Object.values(validationErrors).find(
        (messages) => Array.isArray(messages) && messages.length > 0
      );
      if (firstError?.[0]) {
        return firstError[0];
      }
    }

    if (normalized.response?.data?.message) {
      return normalized.response.data.message;
    }

    if (normalized.message) {
      return normalized.message;
    }
  }

  return "Luu blog that bai";
};

export default function BlogForm({
  initialData,
  submitText = "Luu blog",
  onSuccess,
  onCancel,
}: Props) {
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [title, setTitle] = useState(initialData?.blogTitle ?? "");
  const [content, setContent] = useState(initialData?.blogContent ?? "");
  const [categoryId, setCategoryId] = useState<number | "">(initialData?.categoryId ?? "");
  const [isPublished, setIsPublished] = useState(initialData?.isPublished ?? false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isDeleted, setIsDeleted] = useState(initialData?.isDeleted ?? false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    initialData?.blogThumbnail ? `${API_BASE}${initialData.blogThumbnail}` : null
  );
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    blogService.getCategories().then((res) => {
      setCategories(res.data ?? []);
    });
  }, []);

  useEffect(() => {
    setTitle(initialData?.blogTitle ?? "");
    setContent(initialData?.blogContent ?? "");
    setCategoryId(initialData?.categoryId ?? "");
    setIsPublished(initialData?.isPublished ?? false);
    setIsFeatured(initialData?.isFeatured ?? false);
    setIsDeleted(initialData?.isDeleted ?? false);
    setThumbnail(null);
    setPreview(initialData?.blogThumbnail ? `${API_BASE}${initialData.blogThumbnail}` : null);
    setErrors({});
    setSubmitError("");
  }, [initialData]);

  const clearFieldError = (key: keyof FormErrors) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return "Anh chi ho tro JPG, PNG, WEBP hoac GIF";
    }

    if (file.size > MAX_THUMBNAIL_SIZE_BYTES) {
      return "Anh toi da 5MB";
    }

    return null;
  };

  const handleFileChange = (file: File) => {
    const imageError = validateImageFile(file);
    if (imageError) {
      setErrors((prev) => ({ ...prev, thumbnail: imageError }));
      return;
    }

    clearFieldError("thumbnail");
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateForm = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      nextErrors.title = "Vui long nhap tieu de";
    } else if (trimmedTitle.length > 255) {
      nextErrors.title = "Tieu de khong duoc vuot qua 255 ky tu";
    }

    if (!trimmedContent) {
      nextErrors.content = "Vui long nhap noi dung";
    }

    if (!categoryId || categoryId <= 0) {
      nextErrors.categoryId = "Vui long chon the loai";
    }

    if (!initialData && !thumbnail) {
      nextErrors.thumbnail = "Anh dai dien la bat buoc";
    }

    if (thumbnail) {
      const imageError = validateImageFile(thumbnail);
      if (imageError) {
        nextErrors.thumbnail = imageError;
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("BlogTitle", title.trim());
      formData.append("BlogContent", content.trim());
      formData.append("BlogCategoryId", String(categoryId));
      formData.append("IsPublished", String(isPublished));
      formData.append("IsFeatured", String(isFeatured));
      formData.append("IsDeleted", String(isDeleted));

      if (thumbnail) {
        formData.append("BlogThumbnail", thumbnail);
      }

      if (initialData) {
        await blogService.updateBlog(initialData.blogPostId, formData);
      } else {
        await blogService.createBlog(formData);
      }

      onSuccess?.();
    } catch (error) {
      console.error("Save blog error:", error);
      setSubmitError(parseApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (key: keyof FormErrors) =>
    `w-full rounded-lg border px-3 py-2 ${errors[key] ? "border-red-500" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600">
          {submitError}
        </div>
      )}

      <div>
        <label className="mb-1 block font-medium">Tieu de</label>
        <input
          value={title}
          onChange={(e) => {
            clearFieldError("title");
            setSubmitError("");
            setTitle(e.target.value);
          }}
          className={inputClass("title")}
          maxLength={255}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label className="mb-1 block font-medium">The loai</label>
        <select
          value={categoryId}
          onChange={(e) => {
            clearFieldError("categoryId");
            setSubmitError("");
            setCategoryId(e.target.value ? Number(e.target.value) : "");
          }}
          className={inputClass("categoryId")}
        >
          <option value="">-- Chon the loai --</option>
          {categories.map((c) => (
            <option key={c.blogCategoryId} value={c.blogCategoryId}>
              {c.blogCategoryName}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
      </div>

      <div>
        <label className="mb-1 block font-medium">Noi dung</label>
        <textarea
          rows={6}
          value={content}
          onChange={(e) => {
            clearFieldError("content");
            setSubmitError("");
            setContent(e.target.value);
          }}
          className={inputClass("content")}
        />
        {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content}</p>}
      </div>

      <div>
        <label className="mb-1 block font-medium">Anh dai dien</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setSubmitError("");
            if (!file) return;
            handleFileChange(file);
          }}
        />
        {errors.thumbnail && <p className="mt-1 text-xs text-red-500">{errors.thumbnail}</p>}

        {preview && <img src={preview} alt="Thumbnail preview" className="mt-3 h-24 w-24 rounded-lg border object-cover" />}
      </div>

      <div className="flex gap-8">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
          Xuat ban
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Noi bat
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!isDeleted}
            onChange={(e) => setIsDeleted(!e.target.checked)}
          />
          Hoat dong
        </label>
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">
          Huy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "Dang luu..." : submitText}
        </button>
      </div>
    </form>
  );
}
