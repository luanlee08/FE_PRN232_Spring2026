"use client";

import { useState, useEffect  } from "react";
import { AdminSuperCategoryService } from "../../../../services/admin_services/admin.supercategory.service";
import { SuperCategoryAdmin } from "../../../../services/admin_services/admin.supercategory.service";

interface Props {
  submitText?: string;
   initialData?: SuperCategoryAdmin | null;
  onSuccess?: () => void;
}

export default function SuperCategoryForm({
  submitText = "Lưu Super Category",
  initialData,
  onSuccess
}: Props)
 {

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.superCategoryName);
    } else {
      setName("");
    }
  }, [initialData]);
const handleSubmit = async (
  e: React.FormEvent<HTMLFormElement>
) => {
  e.preventDefault();

  if (!name.trim()) {
    alert("Tên không được để trống");
    return;
  }

  setLoading(true);
  try {

  if (initialData) {
    // UPDATE
    await AdminSuperCategoryService.update(
      initialData.superCategoryId,
      {
        superCategoryName: name.trim(),
        isDeleted: initialData.isDeleted,
      }
    );
  } else {
    // CREATE
    await AdminSuperCategoryService.create({
      superCategoryName: name.trim(),
    });
  }

  onSuccess?.();

} catch (err) {
  console.error(err);
}
finally {
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
          onChange={(e) => setName(e.target.value)}
          placeholder="Nhập tên super category"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
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
