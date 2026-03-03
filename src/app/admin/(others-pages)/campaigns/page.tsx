import { Metadata } from "next";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import CampaignManagementUI from "@/components/admin/campaigns/CampaignManagementUI";

export const metadata: Metadata = {
  title: "Chiến dịch thông báo | Admin",
  description: "Quản lý chiến dịch gửi thông báo",
};

export default function CampaignsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý Chiến dịch" />
      <CampaignManagementUI />
    </div>
  );
}
