import BrandManagementUI from "@/components/admin/brand/brandmanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Brand | Admin",
  description: "Quản lý Brand",
};

export default function BrandPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Brand" />
      <BrandManagementUI />
    </div>
  );
}
