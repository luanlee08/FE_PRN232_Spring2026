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





