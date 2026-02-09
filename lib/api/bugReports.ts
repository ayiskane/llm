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
  const { data, error } = await supabase
    .from("bug_reports")
    .insert(payload)
    .select(
      "id, created_at, kind, title, details, url, path, page_title, status, resolved_at, resolved_by",
    )
    .single();

  if (error) throw new Error(error.message);
  return data as BugReport;
}

export async function fetchBugReports(): Promise<BugReport[]> {
  const { data, error } = await supabase
    .from("bug_reports")
    .select(
      "id, created_at, kind, title, details, url, path, page_title, status, resolved_at, resolved_by",
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []) as BugReport[];
}
