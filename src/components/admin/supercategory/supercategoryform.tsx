"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  AdminSuperCategoryService,
  SuperCategoryAdmin,
} from "@/services/admin_services/admin.supercategory.service";

interface Props {
  submitText?: string;
  initialData?: SuperCategoryAdmin | null;
  onSuccess?: () => void;
}

type FormErrors = {
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

export default function SuperCategoryForm({
  submitText = "Lưu Super Category",
  initialData,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.superCategoryName);
      setIsDeleted(initialData.isDeleted);
    } else {
      setName("");
      setIsDeleted(false);
    }

    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      nextErrors.name = "Tên super category không được để trống";
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      nextErrors.name =
        "Tên super category không được vượt quá 255 ký tự";
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

    try {
      if (initialData) {
        await AdminSuperCategoryService.update(
          initialData.superCategoryId,
          {
            superCategoryName: name.trim(),
            isDeleted,
          }
        );
      } else {
        await AdminSuperCategoryService.create({
          superCategoryName: name.trim(),
          isDeleted,
        });
      }

      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: getApiErrorMessage(
          error,
          "Không thể lưu super category, vui lòng thử lại"
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6 text-sm" onSubmit={handleSubmit}>
      <div>
        <label className="mb-1 block font-medium">
          Tên Super Category
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
          placeholder="Nhập tên super category"
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
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {errors.submit && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.submit}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t pt-4">
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
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {loading ? "Đang lưu..." : submitText}
        </button>
      </div>
    </form>
  );
}
