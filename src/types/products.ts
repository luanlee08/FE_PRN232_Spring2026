// src/types/products.ts
export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  status: "ACTIVE" | "INACTIVE";

  categoryId?: number;
  brandId?: number;

  material?: string;
  origin?: string;
  gender?: string;
  age?: string;

  isFeatured?: boolean;
}
