import ReviewBlogManagementUI from "@/components/admin/reviews-blog/ReviewBlogManagementUI";

import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review Blog | Admin",
};

export default function ReviewBlogPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Review Blog" />
      <ReviewBlogManagementUI />
    </div>
  );
}