import ProductStatisticsUI from "@/components/admin/statistics/ProductStatisticsUI";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thống kê Sản phẩm | Admin",
  description: "Thống kê sản phẩm, tồn kho và phân tích bán hàng",
};

export default function ProductStatisticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Thống kê Sản phẩm" />
      <ProductStatisticsUI />
    </div>
  );
}
