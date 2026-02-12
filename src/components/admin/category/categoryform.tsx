"use client";

import { useState, useEffect } from "react";
import {
  AdminCategoryService,
  CategoryAdmin,
} from "../../../../services/admin_services/admin.category.service";
import {
  AdminSuperCategoryService,
  SuperCategoryAdmin,
} from "../../../../services/admin_services/admin.supercategory.service";

interface Props {
  submitText?: string;
  initialData?: CategoryAdmin | null;
  onSuccess?: () => void;
}

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

  // Load super categories
  useEffect(() => {
    const fetchSuperCategories = async () => {
      const data = await AdminSuperCategoryService.getActive();
      setSuperCategories(data);
    };
    fetchSuperCategories();
  }, []);

  // Bind edit data
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
  }, [initialData]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!name.trim() || !superCategoryId) {
      alert("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      if (initialData) {
        await AdminCategoryService.update(initialData.categoryId, {
          categoryName: name.trim(),
          description,
          superCategoryId: Number(superCategoryId),
          isDeleted,
        });
      } else {
        await AdminCategoryService.create({
          categoryName: name.trim(),
          description,
          superCategoryId: Number(superCategoryId),
          isDeleted,
        });
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 text-sm" onSubmit={handleSubmit}>
      {/* Super Category */}
      <div>
        <label className="mb-1 block font-medium">
          Super Category
        </label>
        <select
          value={superCategoryId}
          onChange={(e) =>
            setSuperCategoryId(
              e.target.value ? Number(e.target.value) : ""
            )
          }
          className="w-full rounded-lg border px-3 py-2"
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
      </div>

      {/* Name */}
      <div>
        <label className="mb-1 block font-medium">
          Tên Category
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên category"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1 block font-medium">
          Mô tả
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Mô tả category..."
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-1 block font-medium">
          Trạng thái
        </label>

        <select
          value={isDeleted ? "inactive" : "active"}
          onChange={(e) =>
            setIsDeleted(e.target.value === "inactive")
          }
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="active">Hoạt động</option>
          <option value="inactive">
            Không hoạt động
          </option>
        </select>
      </div>

      {/* Buttons */}
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
