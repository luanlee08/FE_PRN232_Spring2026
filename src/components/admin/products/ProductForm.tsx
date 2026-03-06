"use client";

import { useEffect, useState } from "react";
import { LookupItem } from "@/services/admin_services/admin.lookup.service";
import { AdminProductService } from "@/services/admin_services/admin.product.service";
import { CreateProductPayload, ProductFormData } from "@/types/products";

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

type FormErrorKey = keyof ProductFormData | "mainImage" | "subImages";
type ProductFormErrors = Partial<Record<FormErrorKey, string>>;

const MAX_SECONDARY_IMAGES = 6;
const MIN_SECONDARY_IMAGES = 4;
const MAX_IMAGE_SIZE_MB = 10;
const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const MAX_PRICE = 99_999_999;
const MAX_QUANTITY = 99_999_999;
const PRODUCT_NAME_REGEX = /^[\p{L}\p{N}\s]+$/u;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const buildInitialForm = (product?: ProductFormData | null): ProductFormData => ({
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
  mainImageUrl: product?.mainImageUrl,
  secondaryImageUrls: product?.secondaryImageUrls ?? [],
});

const validateImageFile = (file: File): string | null => {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return "Anh phai co dinh dang JPG, PNG, WEBP hoac GIF";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `Moi anh toi da ${MAX_IMAGE_SIZE_MB}MB`;
  }

  return null;
};

const parseApiErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const normalized = error as {
      message?: string;
      response?: { data?: { message?: string } };
    };

    if (normalized.response?.data?.message) {
      return normalized.response.data.message;
    }

    if (normalized.message) {
      return normalized.message;
    }
  }

  return "Thao tac that bai";
};

export default function ProductForm({
  submitText = "Luu san pham",
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
  const [form, setForm] = useState<ProductFormData>(() => buildInitialForm(product));
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [subImages, setSubImages] = useState<File[]>([]);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mainImagePreviewUrl, setMainImagePreviewUrl] = useState<string | null>(
    product?.mainImageUrl ?? null
  );
  const [subImagePreviewUrls, setSubImagePreviewUrls] = useState<string[]>(
    product?.secondaryImageUrls ?? []
  );

  useEffect(() => {
    return () => {
      if (mainImagePreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(mainImagePreviewUrl);
      }

      subImagePreviewUrls.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [mainImagePreviewUrl, subImagePreviewUrls]);

  useEffect(() => {
    setForm(buildInitialForm(product));
    setMainImage(null);
    setSubImages([]);
    setErrors({});
    setSubmitError("");
    setMainImagePreviewUrl(product?.mainImageUrl ?? null);
    setSubImagePreviewUrls(product?.secondaryImageUrls ?? []);
  }, [product]);

  const clearFieldError = (key: FormErrorKey) => {
    setErrors((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    clearFieldError(key);
    setSubmitError("");

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSubmitError("");

    if (!file) {
      setMainImage(null);
      setMainImagePreviewUrl(form.mainImageUrl ?? null);
      clearFieldError("mainImage");
      return;
    }

    const imageError = validateImageFile(file);
    if (imageError) {
      setErrors((prev) => ({
        ...prev,
        mainImage: imageError,
      }));
      return;
    }

    clearFieldError("mainImage");
    setMainImage(file);
    setMainImagePreviewUrl(URL.createObjectURL(file));
  };

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setSubmitError("");

    if (!files.length) {
      const existingCount = form.secondaryImageUrls?.length ?? 0;
      setSubImages([]);
      setSubImagePreviewUrls(form.secondaryImageUrls ?? []);

      if (existingCount < MIN_SECONDARY_IMAGES) {
        setErrors((prev) => ({
          ...prev,
          subImages: `Can toi thieu ${MIN_SECONDARY_IMAGES} anh phu`,
        }));
      } else {
        clearFieldError("subImages");
      }
      return;
    }

    const currentSecondaryCount = form.secondaryImageUrls?.length ?? 0;
    const totalSecondaryCount = files.length + currentSecondaryCount;

    if (totalSecondaryCount > MAX_SECONDARY_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        subImages: `Tong so anh phu toi da ${MAX_SECONDARY_IMAGES} anh`,
      }));
      return;
    }

    const firstInvalidImage = files.find((fileItem) => !!validateImageFile(fileItem));
    if (firstInvalidImage) {
      const imageError = validateImageFile(firstInvalidImage) ?? "Anh khong hop le";
      setErrors((prev) => ({
        ...prev,
        subImages: imageError,
      }));
      return;
    }

    if (totalSecondaryCount < MIN_SECONDARY_IMAGES) {
      setErrors((prev) => ({
        ...prev,
        subImages: `Can toi thieu ${MIN_SECONDARY_IMAGES} anh phu`,
      }));
    } else {
      clearFieldError("subImages");
    }

    setSubImages(files);
    setSubImagePreviewUrls(files.map((fileItem) => URL.createObjectURL(fileItem)));
  };

  const validateForm = (): boolean => {
    const nextErrors: ProductFormErrors = {};
    const trimmedName = form.name.trim();

    if (!trimmedName) {
      nextErrors.name = "Vui long nhap ten san pham";
    } else if (trimmedName.length > 255) {
      nextErrors.name = "Ten san pham khong duoc vuot qua 255 ky tu";
    } else if (!PRODUCT_NAME_REGEX.test(trimmedName)) {
      nextErrors.name = "Ten san pham khong duoc chua ky tu dac biet";
    }

    if (!form.description?.trim()) {
      nextErrors.description = "Vui long nhap mo ta san pham";
    }

    if (!Number.isFinite(form.price) || form.price <= 0) {
      nextErrors.price = "Gia phai lon hon 0";
    } else if (form.price > MAX_PRICE) {
      nextErrors.price = `Gia khong duoc vuot qua ${MAX_PRICE}`;
    }

    if (!Number.isInteger(form.quantity) || form.quantity < 0) {
      nextErrors.quantity = "So luong phai la so nguyen khong am";
    } else if (form.quantity > MAX_QUANTITY) {
      nextErrors.quantity = `So luong khong duoc vuot qua ${MAX_QUANTITY}`;
    }

    if (!form.categoryId || form.categoryId <= 0) {
      nextErrors.categoryId = "Vui long chon danh muc";
    }

    if (!form.brandId || form.brandId <= 0) {
      nextErrors.brandId = "Vui long chon thuong hieu";
    }

    if (!form.materialId || form.materialId <= 0) {
      nextErrors.materialId = "Vui long chon chat lieu";
    }

    if (!form.originId || form.originId <= 0) {
      nextErrors.originId = "Vui long chon xuat xu";
    }

    if (!form.sexId || form.sexId <= 0) {
      nextErrors.sexId = "Vui long chon gioi tinh";
    }

    if (!form.ageId || form.ageId <= 0) {
      nextErrors.ageId = "Vui long chon do tuoi";
    }

    if (!product?.id && !mainImage && !form.mainImageUrl) {
      nextErrors.mainImage = "Anh chinh la bat buoc khi tao moi";
    }

    if (mainImage) {
      const mainImageError = validateImageFile(mainImage);
      if (mainImageError) {
        nextErrors.mainImage = mainImageError;
      }
    }

    const totalSecondaryCount = (form.secondaryImageUrls?.length ?? 0) + subImages.length;

    if (totalSecondaryCount < MIN_SECONDARY_IMAGES) {
      nextErrors.subImages = `Can toi thieu ${MIN_SECONDARY_IMAGES} anh phu`;
    } else if (totalSecondaryCount > MAX_SECONDARY_IMAGES) {
      nextErrors.subImages = `Tong so anh phu toi da ${MAX_SECONDARY_IMAGES} anh`;
    }

    if (subImages.length > 0) {
      if (totalSecondaryCount > MAX_SECONDARY_IMAGES) {
        nextErrors.subImages = `Tong so anh phu toi da ${MAX_SECONDARY_IMAGES} anh`;
      }

      const firstInvalidImage = subImages.find((fileItem) => !!validateImageFile(fileItem));
      if (firstInvalidImage) {
        nextErrors.subImages = validateImageFile(firstInvalidImage) ?? "Anh phu khong hop le";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateProductPayload = {
        ...form,
        name: form.name.trim(),
        description: form.description?.trim(),
        mainImage,
        subImages,
        keepSecondaryUrls: form.secondaryImageUrls ?? [],
      };

      if (product?.id) {
        await AdminProductService.update(product.id, payload);
      } else {
        await AdminProductService.create(payload);
      }

      onSuccess?.();
    } catch (error) {
      console.error(error);
      setSubmitError(parseApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (key: FormErrorKey) =>
    `w-full rounded-lg border px-3 py-2 ${errors[key] ? "border-red-500" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 text-sm">
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-600">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium">Ten san pham</label>
          <input
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="Nhap ten san pham"
            className={inputClass("name")}
            maxLength={255}
          />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium">Mo ta</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Mo ta chi tiet san pham..."
          className={inputClass("description")}
        />
        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block font-medium">Gia</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => updateField("price", Number(e.target.value))}
            className={inputClass("price")}
            min={0}
            step="0.01"
            max={MAX_PRICE}
          />
          {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">So luong</label>
          <input
            type="number"
            value={form.quantity}
            onChange={(e) => updateField("quantity", Number(e.target.value))}
            className={inputClass("quantity")}
            min={0}
            step={1}
            max={MAX_QUANTITY}
          />
          {errors.quantity && <p className="mt-1 text-xs text-red-500">{errors.quantity}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">Trang thai</label>
          <select
            value={form.status}
            onChange={(e) =>
              updateField(
                "status",
                e.target.value as "Available" | "OutOfStock" | "Discontinued"
              )
            }
            className={inputClass("status")}
          >
            <option value="Available">Dang ban</option>
            <option value="OutOfStock">Het hang</option>
            <option value="Discontinued">Ngung kinh doanh</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block font-medium">Danh muc</label>
          <select
            value={form.categoryId ?? ""}
            onChange={(e) =>
              updateField("categoryId", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass("categoryId")}
          >
            <option value="">-- Chon danh muc --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">Thuong hieu</label>
          <select
            value={form.brandId ?? ""}
            onChange={(e) =>
              updateField("brandId", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass("brandId")}
          >
            <option value="">-- Chon thuong hieu --</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.brandId && <p className="mt-1 text-xs text-red-500">{errors.brandId}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">Chat lieu</label>
          <select
            value={form.materialId ?? ""}
            onChange={(e) =>
              updateField("materialId", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass("materialId")}
          >
            <option value="">-- Chon chat lieu --</option>
            {materials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {errors.materialId && <p className="mt-1 text-xs text-red-500">{errors.materialId}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">Xuat xu</label>
          <select
            value={form.originId ?? ""}
            onChange={(e) =>
              updateField("originId", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass("originId")}
          >
            <option value="">-- Chon xuat xu --</option>
            {origins.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
          {errors.originId && <p className="mt-1 text-xs text-red-500">{errors.originId}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">Gioi tinh</label>
          <select
            value={form.sexId ?? ""}
            onChange={(e) =>
              updateField("sexId", e.target.value ? Number(e.target.value) : undefined)
            }
            className={inputClass("sexId")}
          >
            <option value="">-- Chon gioi tinh --</option>
            {sexes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.sexId && <p className="mt-1 text-xs text-red-500">{errors.sexId}</p>}
        </div>

        <div>
          <label className="mb-1 block font-medium">Do tuoi</label>
          <select
            value={form.ageId ?? ""}
            onChange={(e) => updateField("ageId", e.target.value ? Number(e.target.value) : undefined)}
            className={inputClass("ageId")}
          >
            <option value="">-- Chon do tuoi --</option>
            {ages.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {errors.ageId && <p className="mt-1 text-xs text-red-500">{errors.ageId}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block font-medium">Anh san pham</label>

        <div>
          <p className="mb-1 text-xs text-gray-500">Anh chinh</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleMainImageChange}
          />
          {errors.mainImage && <p className="mt-1 text-xs text-red-500">{errors.mainImage}</p>}
        </div>

        {mainImagePreviewUrl && (
          <div className="mt-3">
            <img
              src={mainImagePreviewUrl}
              alt="Main preview"
              className="h-24 w-24 rounded border object-cover"
            />
          </div>
        )}

        <div className="mt-3">
          <p className="mb-1 text-xs text-gray-500">
            Anh phu (tu {MIN_SECONDARY_IMAGES} den {MAX_SECONDARY_IMAGES} anh, moi anh toi da{" "}
            {MAX_IMAGE_SIZE_MB}MB)
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="mt-2"
            onChange={handleSubImagesChange}
          />
          {errors.subImages && <p className="mt-1 text-xs text-red-500">{errors.subImages}</p>}
        </div>

        {subImagePreviewUrls.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {subImagePreviewUrls.map((url, index) => (
              <img
                key={`${url}-${index}`}
                src={url}
                alt="Sub preview"
                className="h-20 w-20 rounded border object-cover"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2">
          Huy
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600 disabled:opacity-50"
        >
          {isSubmitting ? "Dang luu..." : submitText}
        </button>
      </div>
    </form>
  );
}
