import { Metadata } from "next";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import CampaignDetailUI from "@/components/admin/campaigns/CampaignDetailUI";

export const metadata: Metadata = {
  title: "Chi tiết chiến dịch | Admin",
};

export default function CampaignDetailPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Chi tiết & Phân tích" />
      <CampaignDetailUI />
    </div>
  );
}
