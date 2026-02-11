import CategoryManagementUI from "@/components/admin/category/categorymanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Category | Admin",
  description: "Quản lý Category",
};

export default function CategoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Category" />
      <CategoryManagementUI />
    </div>
  );
}
