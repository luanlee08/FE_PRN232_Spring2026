"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/lib/auth/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import toast from "react-hot-toast";
import React from "react";
// import "flatpickr/dist/flatpickr.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </SidebarProvider>
    </ThemeProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Bảo vệ admin routes - chỉ cho Staff/Warehouse/Admin vào
  useEffect(() => {
    // Cho phép truy cập trang login mà không cần auth
    if (pathname === '/admin/login') {
      return;
    }

    // Chờ AuthContext load xong trước khi check auth
    if (isLoading) {
      return;
    }

    // Kiểm tra đã đăng nhập chưa
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Kiểm tra role
    const allowedRoles = ['Staff', 'Warehouse', 'Admin'];
    if (user && !allowedRoles.includes(user.roleName)) {
      toast.error('Tài khoản này không có quyền truy cập hệ thống quản trị');
      logout();
      router.push('/admin/login');
    }
  }, [user, isAuthenticated, isLoading, pathname, router, logout]);

  // Nếu là trang login thì hiển thị luôn không cần layout admin
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu chưa auth thì không render gì (sẽ redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex overflow-x-hidden">
      <AppSidebar />
      <Backdrop />

      <div
        className={`flex-1 overflow-x-hidden transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <AppHeader />

        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
