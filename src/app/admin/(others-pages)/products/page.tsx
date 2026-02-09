import ProductManagementUI from "@/components/admin/products/ProductManagement";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products | Admin",
  description: "Quản lý sản phẩm",
};

export default function ProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sản phẩm" />
      <ProductManagementUI />
    </div>
  );
}
