"use client";

import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  MaterialAdmin,
  AdminMaterialService,
} from "@/services/admin_services/admin.material.service";

interface Props {
  initialData?: MaterialAdmin | null;
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

export default function MaterialForm({
  initialData,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    setName(initialData?.materialName ?? "");
    setDescription(initialData?.description ?? "");
    setIsDeleted(initialData?.isDeleted ?? false);
    setErrors({});
  }, [initialData]);

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    const trimmedName = name.trim();

    if (!trimmedName) {
      nextErrors.name = "Tên chất liệu không được để trống";
    } else if (trimmedName.length > NAME_MAX_LENGTH) {
      nextErrors.name =
        "Tên chất liệu không được vượt quá 255 ký tự";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors((prev) => ({ ...prev, submit: undefined }));

    try {
      if (initialData) {
        await AdminMaterialService.update(
          initialData.materialId,
          {
            materialName: name.trim(),
            description: description.trim() || undefined,
            isDeleted,
          }
        );
      } else {
        await AdminMaterialService.create({
          materialName: name.trim(),
          description: description.trim() || undefined,
          isDeleted,
        });
      }

      onSuccess?.();
    } catch (error) {
      setErrors({
        submit: getApiErrorMessage(
          error,
          "Không thể lưu chất liệu, vui lòng thử lại"
        ),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h3 className="mb-4 text-lg font-semibold">
        {initialData ? "Chỉnh sửa" : "Thêm mới"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block font-medium">
            Tên chất liệu
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
            className={`w-full rounded-lg border px-3 py-2 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nhập tên chất liệu"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">
              {errors.name}
            </p>
          )}
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
            className="rounded-lg border px-4 py-2"
          >
            Hủy
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-white disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </form>
    </div>
  );
}
