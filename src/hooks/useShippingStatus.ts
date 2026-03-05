"use client";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import Cookies from "js-cookie";
import { API_BASE } from "@/configs/api-configs";

export interface LiveShippingUpdate {
  orderId: number;
  ghnStatus: string;
  displayText: string;
  source: string;
  occurredAt: string;
}

export function useShippingStatus(orderId: number | null): {
  liveStatus: LiveShippingUpdate | null;
  connected: boolean;
} {
  const [liveStatus, setLiveStatus] = useState<LiveShippingUpdate | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/shipping`, {
        accessTokenFactory: () => Cookies.get("accessToken") ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    conn.on("shippingStatusUpdated", (data: LiveShippingUpdate) => {
      if (data.orderId === orderId) setLiveStatus(data);
    });

    conn.onreconnected(() => {
      conn.invoke("JoinOrderGroup", orderId.toString()).catch(() => {});
      setConnected(true);
    });

    conn.onclose(() => setConnected(false));

    conn
      .start()
      .then(() => {
        setConnected(true);
        return conn.invoke("JoinOrderGroup", orderId.toString());
      })
      .catch(() => setConnected(false));

    return () => {
      conn.invoke("LeaveOrderGroup", orderId.toString()).catch(() => {});
      conn.stop().catch(() => {});
      setConnected(false);
    };
  }, [orderId]);

  return { liveStatus, connected };
}
