"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBugReports } from "@/lib/hooks";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { updateBugReportStatus } from "@/lib/api/bugReports";
import type { BugReport } from "@/types";

const KIND_LABELS: Record<string, string> = {
  bug: "Bug",
  inaccurate_info: "Incorrect Info",
  general_feedback: "Feedback",
  other: "Other",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  in_progress: "bg-blue-500/15 text-blue-300 border border-blue-500/30",
  fixed: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  wontfix: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
};

function formatStatus(status: string) {
  return status.replace("_", " ").toUpperCase();
}

function formatPage(path?: string | null, url?: string | null) {
  if (path) return path;
  if (url) return url;
  return "—";
}

export default function BugReportsPage() {
  const { data, isLoading, error } = useBugReports();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [canManage, setCanManage] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedKindLabel = useMemo(() => {
    if (!selectedReport) return "";
    return KIND_LABELS[selectedReport.kind] ?? selectedReport.kind;
  }, [selectedReport]);

  const openReport = (report: BugReport) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  useEffect(() => {
    let isMounted = true;
    fetch("/api/bug-reports/access")
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!isMounted) return;
        setCanManage(Boolean(payload?.canManage));
      })
      .catch(() => {
        if (!isMounted) return;
        setCanManage(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkFixed = async (reportId: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await updateBugReportStatus(reportId, "fixed");
      queryClient.setQueryData<BugReport[]>(["bugReports"], (prev) =>
        (prev ?? []).map((item) => (item.id === updated.id ? updated : item)),
      );
      setSelectedReport(updated);
    } catch {
      // ignore for now
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">Bug Reports</h1>
        <p className="text-xs text-muted-foreground">
          Public list of submitted issues.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No reports yet.
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[90px]">Type</TableHead>
                <TableHead className="w-full">Issue</TableHead>
                <TableHead className="w-[90px] text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((report) => {
                const issueText = report.title?.trim() || report.details.trim();
                return (
                  <TableRow
                    key={report.id}
                    className="text-xs cursor-pointer"
                    onClick={() => openReport(report)}
                  >
                    <TableCell className="whitespace-nowrap align-top">
                      <Badge
                        variant="region"
                        className="text-[9px] tracking-wider uppercase"
                      >
                        {KIND_LABELS[report.kind] ?? report.kind}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-0 truncate align-top">
                      {issueText}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Badge
                        variant="region"
                        className={cn(
                          "text-[9px] tracking-wider uppercase",
                          STATUS_STYLES[report.status] || "border-border/50",
                        )}
                      >
                        {formatStatus(report.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report details</DialogTitle>
            <DialogDescription>
              {selectedReport
                ? `${selectedKindLabel} • ${selectedReport.status.replace("_", " ")}`
                : "Report details"}
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-[90px_1fr] gap-x-3 gap-y-1">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Type
                </span>
                <span>{selectedKindLabel}</span>

                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Status
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="region"
                    className={cn(
                      "w-fit text-[9px] tracking-wider uppercase",
                      STATUS_STYLES[selectedReport.status] || "border-border/50",
                    )}
                  >
                    {formatStatus(selectedReport.status)}
                  </Badge>
                  {canManage && selectedReport.status === "open" && (
                    <button
                      type="button"
                      onClick={() => handleMarkFixed(selectedReport.id)}
                      disabled={isUpdating}
                      className={cn(
                        "text-[10px] uppercase tracking-wider text-emerald-300",
                        "hover:underline disabled:opacity-50",
                      )}
                    >
                      Mark fixed
                    </button>
                  )}
                </div>

                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Submitted
                </span>
                <span>
                  {new Date(selectedReport.created_at).toLocaleString()}
                </span>

                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Submitted by
                </span>
                <span>{selectedReport.submitter_name?.trim() || "—"}</span>

                <span className="text-xs uppercase tracking-widest text-muted-foreground">
                  Location
                </span>
                <span>
                  {selectedReport.path ? (
                    <Link
                      href={selectedReport.path}
                      className="text-indigo-300 hover:underline"
                    >
                      {selectedReport.path}
                    </Link>
                  ) : (
                    formatPage(selectedReport.path, selectedReport.url)
                  )}
                </span>

                {selectedReport.page_title && (
                  <>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Page title
                    </span>
                    <span>{selectedReport.page_title}</span>
                  </>
                )}

                {selectedReport.title && (
                  <>
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Issue
                    </span>
                    <span>{selectedReport.title}</span>
                  </>
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Details
                </div>
                <div className="whitespace-pre-wrap text-foreground/90">
                  {selectedReport.details}
                </div>
              </div>

              {selectedReport.url && (
                <div className="space-y-1">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    URL
                  </div>
                  <Link
                    href={selectedReport.url}
                    className="text-indigo-300 hover:underline break-all"
                  >
                    {selectedReport.url}
                  </Link>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
