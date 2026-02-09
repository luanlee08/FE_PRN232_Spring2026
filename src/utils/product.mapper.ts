import { ProductAdmin } from "../../services/admin_services/admin.product.service";
import { ProductFormData } from "@/types/products";

export const mapAdminToFormData = (
  p: ProductAdmin
): ProductFormData => ({
  name: p.name,
  description: "",              // list API không có
  price: p.price,
  quantity: 0,                  // default
  status: p.status === 1 ? "ACTIVE" : "INACTIVE",

  categoryId: undefined,
  brandId: undefined,
  isFeatured: false,
});
