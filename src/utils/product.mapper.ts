import { ProductAdmin } from "@/services/admin_services/admin.product.service";
import { ProductFormData } from "@/types/products";


export const mapAdminToFormData = (
  p: ProductAdmin
): ProductFormData => ({
  id: p.id,
  name: p.name,
  description: p.description ?? "",
  price: p.price,
  quantity: p.quantity ?? 0,
  status: p.status,
  categoryId: p.categoryId,
  brandId: p.brandId,
  ageId: p.ageId,
  materialId: p.materialId,
  originId: p.originId,
  sexId: p.sexId,
});





