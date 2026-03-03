"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import CampaignForm from "@/components/admin/campaigns/CampaignForm";
import { getCampaignById } from "@/services/admin_services/admin.campaign.service";
import type { CampaignDto } from "@/types/campaign";

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getCampaignById(Number(id))
      .then(r => setCampaign(r.data))
      .catch(() => setError("Không thể tải dữ liệu chiến dịch"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Chỉnh sửa chiến dịch" />
      {loading ? (
        <div className="py-10 text-center text-sm text-gray-400">Đang tải...</div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : campaign ? (
        <CampaignForm mode="edit" initial={campaign} />
      ) : null}
    </div>
  );
}
