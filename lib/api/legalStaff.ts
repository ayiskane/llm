"use client";

export type LegalStaffStatus = "active" | "pending" | "expired";

export interface LegalStaffMember {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  firm_name: string | null;
  status: LegalStaffStatus;
  pin_expires_at: string | null;
  is_verified: boolean;
}

export async function fetchLegalStaff(): Promise<{
  canManage: boolean;
  staff: LegalStaffMember[];
}> {
  const res = await fetch("/api/legal-staff");
  if (!res.ok) {
    throw new Error("Failed to load legal staff");
  }
  return res.json();
}

export async function revokeLegalStaff(staffId: string): Promise<{
  canManage: boolean;
  staff: LegalStaffMember[];
}> {
  const res = await fetch("/api/legal-staff", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ staffId }),
  });
  if (!res.ok) {
    throw new Error("Failed to revoke staff");
  }
  return res.json();
}
