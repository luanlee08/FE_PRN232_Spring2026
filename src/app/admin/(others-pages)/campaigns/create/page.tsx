import { Metadata } from "next";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import CampaignForm from "@/components/admin/campaigns/CampaignForm";

export const metadata: Metadata = {
  title: "Tạo chiến dịch | Admin",
};

export default function CreateCampaignPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Tạo chiến dịch mới" />
      <CampaignForm mode="create" />
    </div>
  );
}
