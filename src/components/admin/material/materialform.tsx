"use client";

import { useState } from "react";
import {
  MaterialAdmin,
  AdminMaterialService,
} from "@/services/admin_services/admin.material.service";

interface Props {
  initialData?: MaterialAdmin | null;
  onSuccess?: () => void;
}

export default function MaterialForm({
  initialData,
  onSuccess,
}: Props) {
  const [name, setName] = useState(
    initialData?.materialName ?? ""
  );

  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const [isDeleted, setIsDeleted] = useState(
    initialData?.isDeleted ?? false
  );

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Vui lòng nhập tên");
      return;
    }

    if (initialData) {
      await AdminMaterialService.update(
        initialData.materialId,
        {
          materialName: name,
          description,
          isDeleted,
        }
      );
    } else {
      await AdminMaterialService.create({
        materialName: name,
        description,
        isDeleted,
      });
    }

    onSuccess?.();
  };

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? "Chỉnh sửa" : "Thêm mới"}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="block mb-1 font-medium">
            Tên chất liệu
          </label>
          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

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