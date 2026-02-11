import MaterialManagementUI from "@/components/admin/material/materialmanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Material | Admin",
  description: "Quản lý Material",
};

export default function MaterialPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Material" />
      <MaterialManagementUI />
    </div>
  );
}
