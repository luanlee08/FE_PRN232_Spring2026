"use client";
import RevenueStatisticsUI from "@/components/admin/statistics/RevenueStatisticsUI";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RevenueStatisticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.roleName !== "Admin") {
      router.replace("/admin/");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.roleName !== "Admin") return null;

  return (
    <div>
      <PageBreadcrumb pageTitle="Thống kê Doanh thu" />
      <RevenueStatisticsUI />
    </div>
  );
}
