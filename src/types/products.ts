// src/types/products.ts
export interface ProductFormData {
  id?: number;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: "Available" | "OutOfStock" | "Discontinued";


  categoryId?: number;
  brandId?: number;


  ageId?: number;
  materialId?: number;
  originId?: number;
  sexId?: number;




}
export interface CreateProductPayload extends ProductFormData {
  mainImage?: File | null;
  subImages?: File[];
}
export interface ProductStorefront {
  id: number | string;
  sku?: string | null;
  productName: string;
  mainImageUrl?: string | null;
  secondaryImageUrls?: string[];
  price: number;
  stockQuantity: number;
  productStatus?: "Available" | "OutOfStock" | "Discontinued" | string | null;
  isOutOfStock?: boolean;
  categoryName?: string | null;
  brandName?: string | null;
  sexName?: string | null;
  materialName?: string | null;
  ageRange?: string | null;
  originName?: string | null;
  descriptionHtml?: string | null;
}


export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}
