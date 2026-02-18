"use client";


import { useEffect, useState } from "react";
import { ProductFormData } from "@/types/products";
import { LookupItem } from "@/services/admin_services/admin.lookup.service";
import { AdminProductService } from "@/services/admin_services/admin.product.service";
import { CreateProductPayload } from "@/types/products";


interface ProductFormProps {
  submitText?: string;
  product?: ProductFormData | null;


  categories: LookupItem[];
  brands: LookupItem[];
  materials: LookupItem[];
  origins: LookupItem[];
  ages: LookupItem[];
  sexes: LookupItem[];


  onSuccess?: () => void;
  onCancel?: () => void;
}




export default function ProductForm({
  submitText = "Lưu sản phẩm",
  product,
  categories,
  brands,
  materials,
  origins,
  ages,
  sexes,
  onSuccess,
  onCancel,
}: ProductFormProps) {


  /* ================= STATE ================= */
  const [form, setForm] = useState<ProductFormData>(() => ({
    id: product?.id,
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? 0,
    quantity: product?.quantity ?? 0,
    status: product?.status ?? "Available",
    categoryId: product?.categoryId,
    brandId: product?.brandId,
    materialId: product?.materialId,
    originId: product?.originId,
    sexId: product?.sexId,
    ageId: product?.ageId,
  }));






  const [mainImage, setMainImage] = useState<File | null>(null);
  const [subImages, setSubImages] = useState<File[]>([]);


  /* ================= EDIT MODE ================= */
  useEffect(() => {
    if (!product) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(product);
  }, [product]);


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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    try {
      const payload: CreateProductPayload = {
        ...form,
        mainImage,
        subImages,
      };


      if (product && product.id) {
        await AdminProductService.update(product.id, payload);
      } else {
        await AdminProductService.create(payload);
      }


      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert("Thao tác thất bại");
    }
  };




  /* ================= UI ================= */
  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 text-sm max-h-[75vh] overflow-y-auto pr-2"
    >


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
                e.target.value as "Available" | "OutOfStock" | "Discontinued"
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="Available">Đang bán</option>
            <option value="OutOfStock">Hết hàng</option>
            <option value="Discontinued">Ngừng kinh doanh</option>


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
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
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
            <option value="">-- Chọn thương hiệu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>


        </div>


        <div>
          <label className="mb-1 block font-medium">Chất liệu</label>
          <select
            value={form.materialId ?? ""}
            onChange={(e) =>
              updateField(
                "materialId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn chất liệu --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>


            ))}
          </select>


        </div>


        <div>
          <label className="mb-1 block font-medium">Xuất xứ</label>
          <select
            value={form.originId ?? ""}
            onChange={(e) =>
              updateField(
                "originId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn xuất xứ --</option>
            {origins.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>


        </div>


        <div>
          <label className="mb-1 block font-medium">Giới tính</label>
          <select
            value={form.sexId ?? ""}
            onChange={(e) =>
              updateField(
                "sexId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }


            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn giới tính --</option>
            {sexes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>


            ))}
          </select>


        </div>


        <div>
          <label className="mb-1 block font-medium">Độ tuổi</label>
          <select
            value={form.ageId ?? ""}
            onChange={(e) =>
              updateField(
                "ageId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }


            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">-- Chọn độ tuổi --</option>
            {ages.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>


            ))}
          </select>


        </div>
      </div>


      {/* ================= IMAGES ================= */}
      <div>
        <label className="mb-2 block font-medium">Ảnh sản phẩm</label>


        {/* MAIN IMAGE */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setMainImage(e.target.files?.[0] ?? null)
          }
        />


        {mainImage && (
          <div className="mt-3">
            <img
              src={URL.createObjectURL(mainImage)}
              alt="Preview"
              className="h-24 w-24 rounded object-cover border"
            />
          </div>
        )}


        {/* SUB IMAGES */}
        <input
          type="file"
          accept="image/*"
          multiple
          className="mt-2"
          onChange={(e) =>
            setSubImages(Array.from(e.target.files ?? []))
          }
        />


        {subImages.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {subImages.map((file, index) => (
              <img
                key={index}
                src={URL.createObjectURL(file)}
                alt="Sub Preview"
                className="h-20 w-20 rounded object-cover border"
              />
            ))}
          </div>
        )}


      </div>




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





