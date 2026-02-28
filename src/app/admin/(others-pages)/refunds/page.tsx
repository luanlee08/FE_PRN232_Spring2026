import RefundManagementUI from "@/components/admin/refund/refundmanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Hoàn Tiền | Admin",
  description: "Quản lý các yêu cầu hoàn tiền từ khách hàng",
};

export default function RefundsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Hoàn Tiền" />
      <RefundManagementUI />
    </div>
  );
}
