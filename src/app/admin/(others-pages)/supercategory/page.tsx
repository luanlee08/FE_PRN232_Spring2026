import SuperCategoryManagementUI
  from "@/components/admin/supercategory/supercategorymanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Super Category | Admin",
  description: "Quản lý Super Category",
};

export default function SuperCategoryPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Super Category" />
      <SuperCategoryManagementUI />
    </div>
  );
}
