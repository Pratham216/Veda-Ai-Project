"use client";

import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/store/useAuthStore";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (_socket) return _socket;
  const token = useAuthStore.getState().token ?? "";
  _socket = io(API_BASE, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true,
    auth: token ? { token } : undefined,
  });
  return _socket;
}

export function resetSocket() {
  if (_socket) {
    _socket.disconnect();
    _socket = null;
  }
}

export type AssignmentStatusEvent = {
  id: string;
  status: "queued" | "generating" | "ready" | "failed";
  progress?: number;
  error?: string;
  full?: unknown;
};

export function subscribeAssignment(
  id: string,
  onEvent: (e: AssignmentStatusEvent) => void,
): () => void {
  const s = getSocket();
  const handler = (data: AssignmentStatusEvent) => {
    if (data?.id === id) onEvent(data);
  };
  const onConnect = () => s.emit("subscribe", id);
  if (s.connected) onConnect();
  else s.on("connect", onConnect);
  s.on("status", handler);
  return () => {
    s.off("status", handler);
    s.off("connect", onConnect);
    s.emit("unsubscribe", id);
  };
}
