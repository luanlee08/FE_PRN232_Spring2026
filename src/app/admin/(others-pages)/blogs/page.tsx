import BlogManagementUI from "@/components/admin/blogs/BlogM";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Admin",
  description: "Quản lý blog",
};

export default function BlogPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Blog" />
      <BlogManagementUI />
    </div>
  );
}
