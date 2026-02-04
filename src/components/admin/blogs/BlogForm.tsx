"use client";

interface BlogFormProps {
  submitText?: string;
}

export default function BlogForm({
  submitText = "Lưu blog",
}: BlogFormProps) {
  return (
    <form className="space-y-6 text-sm">
      {/* ================= TITLE ================= */}
      <div>
        <label className="mb-1 block font-medium">Tiêu đề</label>
        <input
          placeholder="Nhập tiêu đề blog"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* ================= CATEGORY ================= */}
      <div>
        <label className="mb-1 block font-medium">Thể loại</label>
        <select className="w-full rounded-lg border px-3 py-2">
          <option>-- Chọn thể loại --</option>
          <option>Tin tức</option>
          <option>Hướng dẫn</option>
          <option>Sự kiện</option>
        </select>
      </div>

      {/* ================= CONTENT ================= */}
      <div>
        <label className="mb-1 block font-medium">Nội dung</label>
        <textarea
          rows={6}
          placeholder="Nhập nội dung blog..."
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* ================= THUMBNAIL ================= */}
      <div>
        <label className="mb-1 block font-medium">Ảnh đại diện</label>
        <input type="file" accept="image/*" />

        {/* PREVIEW MOCK */}
        <div className="mt-3 h-24 w-24 rounded-lg border bg-gray-100 flex items-center justify-center text-xs text-gray-400">
          Preview
        </div>
      </div>

      {/* ================= OPTIONS ================= */}
      <div className="flex gap-8">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Xuất bản
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Nổi bật
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Hoạt động
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
