import OrderManagementUI from "@/components/admin/order/ordermanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn hàng | Admin",
  description: "Quản lý đơn hàng",
};

export default function OrdersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Đơn Hàng" />
      <OrderManagementUI />
    </div>
  );
}
