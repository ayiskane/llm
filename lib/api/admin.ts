"use client";

export type AdminStatus = "online" | "offline";

export interface AdminStatusResponse {
  status: AdminStatus;
  canManage: boolean;
}

export async function fetchAdminStatus(): Promise<AdminStatusResponse> {
  const res = await fetch("/api/admin/status");
  if (!res.ok) {
    throw new Error("Failed to load admin status");
  }
  return res.json();
}

export async function toggleAdminStatus(): Promise<AdminStatusResponse> {
  const res = await fetch("/api/admin/status", { method: "PATCH" });
  if (!res.ok) {
    throw new Error("Failed to update admin status");
  }
  return res.json();
}
