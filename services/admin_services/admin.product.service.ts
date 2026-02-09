// services/admin_services/admin.product.service.ts

import { API_BASE, API_ENDPOINTS } from "../../configs/api-configs";

/* ================= BACKEND DTO ================= */

interface ProductAdminResponse {
  id: number;
  sku: string;
  productName: string;
  price: number;
  productStatus: "Available" | "Unavailable";
  createdAt: string;
  updatedAt: string | null;
  categoryName: string;
  brandName: string;

  // 🔥 ẢNH TỪ BACKEND
  mainImageUrl?: string | null;
  secondaryImageUrls?: string[];
}

/* ================= FRONTEND DTO ================= */

export interface ProductAdmin {
  id: number;
  sku: string;
  name: string;
  price: number;
  status: number; // 1 = Available | 0 = Unavailable
  createdAt: string;
  updatedAt: string | null;
  categoryName: string;
  brandName: string;

  imageUrl?: string;           // MAIN IMAGE
  secondaryImages?: string[];  // IMAGE GALLERY
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

/* ================= SERVICE ================= */

export const AdminProductService = {
  async getAll(
    query: ProductQuery
  ): Promise<PagedResponse<ProductAdmin>> {
    const params = new URLSearchParams({
      page: query.page.toString(),
      pageSize: query.pageSize.toString(),
    });

    if (query.keyword) {
      params.append("keyword", query.keyword);
    }

    const res = await fetch(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}?${params.toString()}`,
      { credentials: "include" }
    );

    if (!res.ok) {
      throw new Error("Fetch products failed");
    }

    const json: PagedResponse<ProductAdminResponse> =
      await res.json();

    /* ================= MAP DTO ================= */
    return {
      ...json,
      data: {
        ...json.data,
        items: json.data.items.map((p) => ({
          id: p.id,
          sku: p.sku,

          // 🔥 FIX KHÔNG HIỆN TÊN
          name: p.productName,

          price: p.price,
          status: p.productStatus === "Available" ? 1 : 0,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          categoryName: p.categoryName,
          brandName: p.brandName,

          // 🔥 FIX KHÔNG HIỆN ẢNH
          imageUrl: p.mainImageUrl
            ? `${API_BASE}${p.mainImageUrl}`
            : undefined,

          secondaryImages: p.secondaryImageUrls?.map(
            (url) => `${API_BASE}${url}`
          ),
        })),
      },
    };
  },
};
