import RevenueStatisticsUI from "@/components/admin/statistics/RevenueStatisticsUI";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thống kê Doanh thu | Admin",
  description: "Thống kê doanh thu và đơn hàng",
};

export default function RevenueStatisticsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Thống kê Doanh thu" />
      <RevenueStatisticsUI />
    </div>
  );
}
