"use client";

import AccountManagementUI from "@/components/admin/accounts/AccountManagement";
import PageBreadcrumb from "@/components/admin/common/PageBreadCrumb";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.roleName !== "Admin") {
      toast.error("Chỉ Admin mới có quyền truy cập trang này");
      router.push("/admin/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!user || user.roleName !== "Admin") {
    return null;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="Quản lý tài khoản" />
      <AccountManagementUI />
    </div>
  );
}
