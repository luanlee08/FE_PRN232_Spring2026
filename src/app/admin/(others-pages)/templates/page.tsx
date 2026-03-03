import { Metadata } from "next";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import TemplateManagementUI from "@/components/admin/campaigns/TemplateManagementUI";

export const metadata: Metadata = {
  title: "Quản lý Template | Admin",
  description: "Quản lý template thông báo",
};

export default function TemplatesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Template thông báo" />
      <TemplateManagementUI />
    </div>
  );
}
