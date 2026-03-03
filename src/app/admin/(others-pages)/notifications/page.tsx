import type { Metadata } from "next";
import NotificationsPageUI from "@/components/admin/notifications/NotificationsPageUI";

export const metadata: Metadata = {
  title: "Quản lý thông báo | Admin",
};

export default function NotificationsPage() {
  return <NotificationsPageUI />;
}
