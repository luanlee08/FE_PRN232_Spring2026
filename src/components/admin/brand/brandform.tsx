"use client";

import { useState, useEffect } from "react";
import { BrandAdmin, AdminBrandService }
  from "@/services/admin_services/admin.brand.service";

interface Props {
  initialData?: BrandAdmin | null;
  onSuccess?: () => void;
}

export default function BrandForm({
  initialData,
  onSuccess,
}: Props) {
  const [name, setName] = useState(
    initialData?.brandName ?? ""
  );

  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const [categoryId, setCategoryId] = useState<number | "">(
    initialData?.categoryId ?? ""
  );

  const [isDeleted, setIsDeleted] = useState(
    initialData?.isDeleted ?? false
  );


  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (initialData) {
      await AdminBrandService.update(
        initialData.brandId,
        {
          brandName: name,
          description,
          isDeleted,
        }
      );
    } else {
      await AdminBrandService.create({
        brandName: name,
        description,
        isDeleted,
      });
    }

    onSuccess?.();
  };

  return (
    <div className="w-full p-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? "Chỉnh sửa Brand" : "Thêm Brand"}
      </h3>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">
            Tên Brand
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Nhập tên brand"
          />
        </div>

        {/* Buttons */}
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
            className="rounded-lg bg-indigo-500 px-4 py-2 text-white"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
}