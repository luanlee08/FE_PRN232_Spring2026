"use client";

import { useEffect, useState } from "react";
import { ProductFormData } from "@/types/products";

interface ProductFormProps {
  submitText?: string;
  product?: ProductFormData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({
  submitText = "Lưu sản phẩm",
  product,
  onSuccess,
  onCancel,
}: ProductFormProps) {
  /* ================= STATE ================= */
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    status: "ACTIVE",
    categoryId: undefined,
    brandId: undefined,
    material: "",
    origin: "",
    gender: "",
    age: "",
    isFeatured: false,
  });

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [subImages, setSubImages] = useState<File[]>([]);

  // /* ================= EDIT MODE ================= */
  // useEffect(() => {
  //   if (!product) return;
  //   setForm(product);
  // }, [product]);

  /* ================= HANDLERS ================= */
  const updateField = <K extends keyof ProductFormData>(
    key: K,
    value: ProductFormData[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      mainImage,
      subImages,
    };

    console.log("SUBMIT PRODUCT:", payload);

    // TODO: gọi API create / update ở đây

    onSuccess?.();
  };

  /* ================= UI ================= */
  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm">
      {/* ================= BASIC INFO ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block font-medium">Tên sản phẩm</label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Nhập tên sản phẩm"
            className="w-full rounded-lg border px-3 py-2"
            required
          />
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div>
        <label className="mb-1 block font-medium">Mô tả</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) =>
            updateField("description", e.target.value)
          }
          placeholder="Mô tả chi tiết sản phẩm..."
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      {/* ================= PRICE & QUANTITY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block font-medium">Giá</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) =>
              updateField("price", Number(e.target.value))
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Số lượng</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) =>
              updateField("quantity", Number(e.target.value))
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Trạng thái</label>
          <select
            value={form.status}
            onChange={(e) =>
              updateField(
                "status",
                e.target.value as "ACTIVE" | "INACTIVE"
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Ngừng bán</option>
          </select>
        </div>
      </div>

      {/* ================= ATTRIBUTES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block font-medium">Danh mục</label>
          <select
            value={form.categoryId ?? ""}
            onChange={(e) =>
              updateField(
                "categoryId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn danh mục --</option>
            <option value="1">Son môi</option>
            <option value="2">Mỹ phẩm thiên nhiên</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Thương hiệu</label>
          <select
            value={form.brandId ?? ""}
            onChange={(e) =>
              updateField(
                "brandId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn brand --</option>
            <option value="1">Glowpurea</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Chất liệu</label>
          <input
            value={form.material}
            onChange={(e) =>
              updateField("material", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Xuất xứ</label>
          <input
            value={form.origin}
            onChange={(e) =>
              updateField("origin", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Giới tính</label>
          <select
            value={form.gender}
            onChange={(e) =>
              updateField("gender", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn --</option>
            <option value="NAM">Nam</option>
            <option value="NU">Nữ</option>
            <option value="UNISEX">Unisex</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block font-medium">Độ tuổi</label>
          <select
            value={form.age}
            onChange={(e) =>
              updateField("age", e.target.value)
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn --</option>
            <option value="TRE_EM">Trẻ em</option>
            <option value="NGUOI_LON">Người lớn</option>
          </select>
        </div>
      </div>

      {/* ================= IMAGES ================= */}
      <div>
        <label className="mb-2 block font-medium">Ảnh sản phẩm</label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setMainImage(e.target.files?.[0] ?? null)
          }
        />

        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-2"
          onChange={(e) =>
            setSubImages(Array.from(e.target.files ?? []))
          }
        />
      </div>

      {/* ================= OPTIONS ================= */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.isFeatured}
          onChange={(e) =>
            updateField("isFeatured", e.target.checked)
          }
        />
        Nổi bật
      </label>

      {/* ================= ACTIONS ================= */}
      <div className="flex justify-end gap-3 border-t pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2"
        >
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
