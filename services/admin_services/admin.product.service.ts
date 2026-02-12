// services/admin_services/admin.product.service.ts


import { API_BASE, API_ENDPOINTS } from "../../configs/api-configs";
import { CreateProductPayload } from "@/types/products";


/* ================= BACKEND DTO ================= */


interface ProductAdminResponse {
  id: number;
  sku: string;
  productName: string;
  price: number;
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
  async getById(id: number) {
    const res = await fetch(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`,
      { credentials: "include" }
    );


    if (!res.ok) {
      throw new Error("Fetch product failed");
    }


    const json = await res.json();
    return json.data;
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


    if (form.subImages)
      form.subImages.forEach(file =>
        formData.append("NewSecondaryImages", file)
      );


    const res = await fetch(
      `${API_ENDPOINTS.ADMIN_PRODUCTS}/${id}`,
      {
        method: "PUT",
        body: formData,
        credentials: "include",
      }
    );


    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText);
    }


    return res.json();
  },


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
        })),
      },
    };
  },


  async create(form: CreateProductPayload): Promise<unknown> {
    const formData = new FormData();


    formData.append("ProductName", form.name);
    formData.append("Description", form.description ?? "");
    formData.append("Price", form.price.toString());
    formData.append("Quantity", form.quantity.toString());
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


    // MAIN IMAGE
    if (form.mainImage) {
      formData.append("MainImage", form.mainImage);
    }


    // SUB IMAGES
    if (form.subImages && form.subImages.length > 0) {
      form.subImages.forEach((file: File) => {
        formData.append("SecondaryImages", file);
      });
    }


    const res = await fetch(API_ENDPOINTS.ADMIN_PRODUCTS, {
      method: "POST",
      body: formData,
      credentials: "include",
    });


    if (!res.ok) {
      const errorText = await res.text();
      console.error("SERVER ERROR:", errorText);
      throw new Error(errorText || "Create product failed");
    }




    return res.json();
  },


};





