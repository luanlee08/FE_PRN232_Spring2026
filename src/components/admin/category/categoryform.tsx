"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  AdminCategoryService,
  CategoryAdmin,
} from "@/services/admin_services/admin.category.service";
import {
  AdminSuperCategoryService,
  SuperCategoryAdmin,
} from "@/services/admin_services/admin.supercategory.service";

interface Props {
  submitText?: string;
  initialData?: CategoryAdmin | null;
  onSuccess?: () => void;
}

type FormErrors = {
  superCategoryId?: string;
  name?: string;
  submit?: string;
};

const NAME_MAX_LENGTH = 255;

const getApiErrorMessage = (
  error: unknown,
  fallback: string
) => {
  if (error instanceof AxiosError) {
    const apiMessage = (
      error.response?.data as { message?: string } | undefined
    )?.message;
    return apiMessage || fallback;
  }

  return fallback;
};

export default function CategoryForm({
  submitText = "Lưu Category",
  initialData,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [superCategoryId, setSuperCategoryId] = useState<number | "">("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [superCategories, setSuperCategories] = useState<
    SuperCategoryAdmin[]
  >([]);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchSuperCategories = async () => {
      try {
        const data = await AdminSuperCategoryService.getActive();
        setSuperCategories(data || []);
      } catch (error) {
        setErrors({
          submit: getApiErrorMessage(
            error,
            "Không thể tải danh sách Super Category"
          ),
        });
      }
    };

    fetchSuperCategories();
  }, []);

  useEffect(() => {
    if (initialData) {
      setName(initialData.categoryName);
      setDescription(initialData.description || "");
      setSuperCategoryId(initialData.superCategoryId);
      setIsDeleted(initialData.isDeleted);
    } else {
      setName("");
      setDescription("");
      setSuperCategoryId("");
      setIsDeleted(false);
    }

    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();

    if (!superCategoryId || Number(superCategoryId) <= 0) {
      nextErrors.superCategoryId = "Super category không hợp lệ";
    }

    if (!trimmedName) {
      nextErrors.name = "Tên danh mục không được để trống";
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      nextErrors.name =
        "Tên danh mục không được vượt quá 255 ký tự";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    const trimmedDescription = description.trim();

    try {
      if (initialData) {
        await AdminCategoryService.update(initialData.categoryId, {
          categoryName: name.trim(),
          description: trimmedDescription || undefined,
          superCategoryId: Number(superCategoryId),
          isDeleted,
        });
      } else {
        await AdminCategoryService.create({
          categoryName: name.trim(),
          description: trimmedDescription || undefined,
          superCategoryId: Number(superCategoryId),
          isDeleted,
        });
      }

      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: getApiErrorMessage(
          error,
          "Không thể lưu category, vui lòng thử lại"
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block font-medium">
          Super Category
        </label>
        <select
          value={superCategoryId}
          onChange={(e) => {
            setSuperCategoryId(
              e.target.value ? Number(e.target.value) : ""
            );
            setErrors((prev) => ({
              ...prev,
              superCategoryId: undefined,
              submit: undefined,
            }));
          }}
          className={`w-full rounded-lg border px-3 py-2 ${
            errors.superCategoryId
              ? "border-red-500"
              : "border-gray-300"
          }`}
        >
          <option value="">
            -- Chọn Super Category --
          </option>
          {superCategories.map((item) => (
            <option
              key={item.superCategoryId}
              value={item.superCategoryId}
            >
              {item.superCategoryName}
            </option>
          ))}
        </select>
        {errors.superCategoryId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.superCategoryId}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Tên Category
        </label>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrors((prev) => ({
              ...prev,
              name: undefined,
              submit: undefined,
            }));
          }}
          placeholder="Nhập tên category"
          className={`w-full rounded-lg border px-3 py-2 ${
            errors.name ? "border-red-500" : "border-gray-300"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Mô tả
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả category..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Trạng thái
        </label>

        <select
          value={isDeleted ? "inactive" : "active"}
          onChange={(e) =>
            setIsDeleted(e.target.value === "inactive")
          }
          className="w-full rounded-lg border border-gray-300 px-3 py-2"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">
            Không hoạt động
          </option>
        </select>
      </div>

      {errors.submit && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.submit}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t pt-6">
        <button
          type="button"
          onClick={onSuccess}
          className="rounded-lg border px-4 py-2 text-gray-600 hover:bg-gray-100"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : submitText}
        </button>
      </div>
    </form>
  );
}
