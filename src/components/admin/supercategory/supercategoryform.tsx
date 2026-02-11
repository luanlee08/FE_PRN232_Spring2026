"use client";

interface SuperCategoryFormProps {
  submitText?: string;
}

export default function SuperCategoryForm({
  submitText = "Lưu Super Category",
}: SuperCategoryFormProps) {
  return (
    <form className="space-y-6 text-sm">
      {/* ================= NAME ================= */}
      <div>
        <label className="mb-1 block font-medium">Tên Super Category</label>
        <input
          placeholder="Nhập tên super category"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* ================= SLUG ================= */}
      <div>
        <label className="mb-1 block font-medium">Slug</label>
        <input
          placeholder="super-category-slug"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div>
        <label className="mb-1 block font-medium">Mô tả</label>
        <textarea
          rows={4}
          placeholder="Mô tả cho super category..."
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* ================= STATUS ================= */}
      <div className="flex gap-8">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Hoạt động
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Nổi bật
        </label>
      </div>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          className="rounded-lg border px-4 py-2"
        >
          Hủy
        </button>

        <button
          type="button"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}
