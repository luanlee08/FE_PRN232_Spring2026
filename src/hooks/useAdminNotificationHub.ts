"use client";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "@/configs/api-configs";
import { notificationKeys } from "./useNotification";

/**
 * Connects admin/staff to the notification SignalR hub.
 * Joins the admin role group (role-1) and invalidates the
 * React Query notification cache whenever a new push arrives.
 *
 * Usage: call once in the admin layout.
 */
export function useAdminNotificationHub(roleId: number = 1) {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/notifications`, {
        accessTokenFactory: () => Cookies.get("accessToken") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on("notificationReceived", () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    });

    conn.onreconnected(() => {
      conn.invoke("JoinRoleGroup", roleId.toString()).catch(() => {});
      setIsConnected(true);
    });

    conn.onclose(() => setIsConnected(false));

    conn
      .start()
      .then(() => {
        setIsConnected(true);
        return conn.invoke("JoinRoleGroup", roleId.toString());
      })
      .catch(() => setIsConnected(false));

    return () => {
      conn.invoke("LeaveUserGroup", roleId.toString()).catch(() => {});
      conn.stop().catch(() => {});
      setIsConnected(false);
    };
  }, [roleId, queryClient]);

  return { isConnected };
}
