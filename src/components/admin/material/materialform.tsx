"use client";

interface Props {
  submitText?: string;
}

export default function MaterialForm({
  submitText = "Lưu Material",
}: Props) {
  return (
    <form className="space-y-5 text-sm">
      <div>
        <label className="mb-1 block font-medium">
          Tên Material
        </label>
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Nhập tên material"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">
          Mô tả
        </label>
        <textarea
          rows={3}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Mô tả material..."
        />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" />
        Hoạt động
      </label>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" className="rounded-lg border px-4 py-2">
          Hủy
        </button>

        <button
          type="submit"
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}
