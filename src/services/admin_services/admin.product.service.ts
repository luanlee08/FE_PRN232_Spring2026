// services/admin_services/admin.product.service.ts

import axiosInstance from "@/lib/api/axios";
import { API_BASE, API_ENDPOINTS } from "@/configs/api-configs";
import { CreateProductPayload } from "@/types/products";

const toRelativeImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("/")) return url;

  try {
    return new URL(url).pathname;
  } catch {
    return url.replace(API_BASE, "");
  }
};

/* ================= BACKEND DTO ================= */

interface ProductAdminResponse {
  id: number;
  sku: string;
  productName: string;
  price: number;
  stockQuantity: number;
  quantity?: number;
  descriptionHtml?: string | null;
  description?: string | null;
  productStatus: "Available" | "OutOfStock" | "Discontinued";
  createdAt: string;
  updatedAt: string | null;
  categoryName: string;
  brandName: string;
  categoryId?: number;
  brandId?: number;
  materialId?: number;
  originId?: number;
  sexId?: number;
  ageId?: number;
  mainImageUrl?: string | null;
  secondaryImageUrls?: string[];
}

/* ================= FRONTEND DTO ================= */

export interface ProductAdmin {
  id: number;
  sku: string;
  name: string;
  price: number;
  quantity: number;       // thêm
  description?: string;   // thêm
  status: "Available" | "OutOfStock" | "Discontinued";
  createdAt: string;
  updatedAt: string | null;
  categoryName: string;
  brandName: string;
  categoryId?: number;
  brandId?: number;
  materialId?: number;
  originId?: number;
  sexId?: number;
  ageId?: number;
  age?: string;
  imageUrl?: string;
  secondaryImages?: string[];
}

/* ================= QUERY ================= */

export interface ProductQuery {
  page: number;
  pageSize: number;
  keyword?: string;
}

interface PagedResponse<T> {
  status: number;
  data: {
    items: T[];
    totalItems: number;
    totalPages: number;
    page: number;
  };
}

const mapProductAdmin = (p: ProductAdminResponse): ProductAdmin => ({
  id: p.id,
  sku: p.sku,
  name: p.productName,
  price: p.price,
  quantity: p.stockQuantity ?? p.quantity ?? 0,
  description: p.descriptionHtml ?? p.description ?? undefined,
  status: p.productStatus,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
  categoryName: p.categoryName,
  brandName: p.brandName,
  categoryId: p.categoryId,
  brandId: p.brandId,
  materialId: p.materialId,
  originId: p.originId,
  sexId: p.sexId,
  ageId: p.ageId,
  imageUrl: p.mainImageUrl
    ? `${API_BASE}${p.mainImageUrl}`
    : undefined,
  secondaryImages: p.secondaryImageUrls?.map(
    (url) => `${API_BASE}${url}`
  ),
});

/* ================= SERVICE ================= */

export const AdminProductService = {
  async getById(id: number) {
    const res = await axiosInstance.get<{ data: ProductAdminResponse }>(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`
    );
    return mapProductAdmin(res.data.data);
  },

  async getAll(
    query: ProductQuery
  ): Promise<PagedResponse<ProductAdmin>> {
    const res = await axiosInstance.get<PagedResponse<ProductAdminResponse>>(
      API_ENDPOINTS.ADMIN_PRODUCTS,
      { params: query }
    );

    const json = res.data;

    return {
      ...json,
      data: {
        ...json.data,
        items: json.data.items.map(mapProductAdmin),
      },
    };
  },

  async create(form: CreateProductPayload) {
    const formData = new FormData();

    formData.append("ProductName", form.name);
    formData.append("DescriptionHtml", form.description ?? "");
    formData.append("Price", form.price.toString());
    formData.append("StockQuantity", form.quantity.toString());
    formData.append("ProductStatus", form.status);

    if (form.categoryId)
      formData.append("CategoryId", form.categoryId.toString());

    if (form.brandId)
      formData.append("BrandId", form.brandId.toString());

    if (form.materialId)
      formData.append("MaterialId", form.materialId.toString());

    if (form.originId)
      formData.append("OriginId", form.originId.toString());

    if (form.sexId)
      formData.append("SexId", form.sexId.toString());

    if (form.ageId)
      formData.append("AgeId", form.ageId.toString());

    if (form.mainImage)
      formData.append("MainImage", form.mainImage);

    if (form.subImages?.length) {
      form.subImages.forEach((file) => {
        formData.append("SecondaryImages", file);
      });
    }

    const res = await axiosInstance.post(
      API_ENDPOINTS.ADMIN_PRODUCTS,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },

  async update(id: number, form: CreateProductPayload) {
    const formData = new FormData();

    formData.append("ProductName", form.name);
    formData.append("DescriptionHtml", form.description ?? "");
    formData.append("Price", form.price.toString());
    formData.append("StockQuantity", form.quantity.toString());
    formData.append("ProductStatus", form.status);

    if (form.categoryId)
      formData.append("CategoryId", form.categoryId.toString());

    if (form.brandId)
      formData.append("BrandId", form.brandId.toString());

    if (form.materialId)
      formData.append("MaterialId", form.materialId.toString());

    if (form.originId)
      formData.append("OriginId", form.originId.toString());

    if (form.sexId)
      formData.append("SexId", form.sexId.toString());

    if (form.ageId)
      formData.append("AgeId", form.ageId.toString());

    if (form.mainImage)
      formData.append("NewMainImage", form.mainImage);

    if (form.subImages?.length) {
      form.subImages.forEach((file) => {
        formData.append("NewSecondaryImages", file);
      });
    }

    if (form.keepSecondaryUrls?.length) {
      form.keepSecondaryUrls
        .map(toRelativeImageUrl)
        .filter((url) => !!url)
        .forEach((url) => {
          formData.append("KeepSecondaryUrls", url);
        });
    }

    const res = await axiosInstance.put(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data;
  },
};

