import VoucherManagementUI from "@/components/admin/voucher/vouchermanagementui";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voucher | Admin",
  description: "Quản lý Voucher",
};

export default function VoucherPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Voucher" />
      <VoucherManagementUI />
    </div>
  );
}
