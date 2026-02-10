import { createClient } from "./supabase";
import type { BugReport } from "@/types";

const supabase = createClient();

export type BugReportInsert = {
  kind: "bug" | "inaccurate_info" | "general_feedback" | "other";
  title?: string | null;
  details: string;
  url?: string | null;
  path?: string | null;
  page_title?: string | null;
};

export async function createBugReport(
  payload: BugReportInsert,
): Promise<BugReport> {
  const response = await fetch("/api/bug-reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error || "Failed to submit report.");
  }

  const data = await response.json();
  return data as BugReport;
}

export async function fetchBugReports(): Promise<BugReport[]> {
  const { data, error } = await supabase
    .from("bug_reports")
    .select(
      "id, created_at, kind, title, details, url, path, page_title, submitter_name, status, resolved_at, resolved_by",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as BugReport[];
}

export async function updateBugReportStatus(
  id: string,
  status: "fixed",
): Promise<BugReport> {
  const response = await fetch(`/api/bug-reports/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error || "Failed to update report.");
  }

  const data = await response.json();
  return data as BugReport;
}
