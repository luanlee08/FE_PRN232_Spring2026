import ReviewManagementUI from "@/components/admin/review/ReviewManagementUI";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Review | Admin",
  description: "Quản lý review sản phẩm",
};

export default function ReviewsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Review Sản Phẩm" />
      <ReviewManagementUI />
    </div>
  );
}
