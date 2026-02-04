"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
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

  // Dynamic class for main content margin based on sidebar state
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // return (
  //   <div className="min-h-screen xl:flex dark:bg-gray-900">
  //     {/* Sidebar and Backdrop */}
  //     <AppSidebar />
  //     <Backdrop />
  //     {/* Main Content Area */}
  //     <div
  //       className={`flex-1 transition-all  duration-300 ease-in-out ${mainContentMargin}`}
  //     >
  //       {/* Header */}
  //       <AppHeader />
  //       {/* Page Content */}
  //       <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">{children}</div>
  //     </div>
  //   </div>
  // );
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
