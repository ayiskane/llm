"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { FaCircleExclamation, FaFlag } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { Input, inputVariants } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createBugReport } from "@/lib/api/bugReports";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REPORT_TYPES = [
  { value: "bug", label: "Bug" },
  { value: "inaccurate_info", label: "Incorrect information" },
  { value: "general_feedback", label: "General feedback" },
  { value: "other", label: "Other" },
] as const;

export function ReportBugButton() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<
    "bug" | "inaccurate_info" | "general_feedback" | "other"
  >("bug");
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pageLabel = useMemo(
    () => (pathname ? `${pathname}` : "Unknown page"),
    [pathname],
  );
  const isFeedbackLayout = kind === "general_feedback" || kind === "other";

  const requiresIssue = kind === "bug" || kind === "inaccurate_info";
  const requiresDetails = !requiresIssue;

  const handleSubmit = async () => {
    const issueText = title.trim();
    const detailsText = details.trim();

    if (requiresIssue && !issueText) {
      toast.error("Please add the issue.");
      return;
    }
    if (requiresDetails && !detailsText) {
      toast.error("Please add the details.");
      return;
    }
    setSubmitting(true);
    try {
      const url = window.location.href;
      const path = window.location.pathname;
      const pageTitle = document.title;
      await createBugReport({
        kind,
        title: requiresIssue ? issueText : null,
        details: detailsText,
        url,
        path,
        page_title: pageTitle || null,
      });
      toast.success("Report submitted. Thank you!");
      setTitle("");
      setDetails("");
      setKind("bug");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["bugReports"] });
    } catch {
      toast.error("Could not submit report. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="sm"
            className="shadow-lg rounded-full px-4"
          >
            <FaFlag className="w-4 h-4" />
            Report a bug
          </Button>
        </DialogTrigger>
        <DialogContent className="p-5 sm:p-6 rounded-2xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-[12px] uppercase tracking-[0.28em]">
              Report a bug
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground">
              Quick report · Court details page
            </DialogDescription>
            <Link
              href="/bug-reports"
              className="text-[11px] text-indigo-300 hover:underline"
            >
              View submitted reports
            </Link>
          </DialogHeader>

          <fieldset className="space-y-3 pt-2" disabled={submitting}>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Type
                </label>
                <Select
                  value={kind}
                  onValueChange={(value) => {
                    const nextValue = value as typeof kind;
                    setKind(nextValue);
                    if (
                      nextValue === "general_feedback" ||
                      nextValue === "other"
                    ) {
                      setTitle("");
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Location
                </label>
                <div
                  className={cn(
                    "h-9 flex items-center rounded-md border border-input",
                    "bg-background/60 px-3 text-[11px] font-mono text-foreground/80",
                    "select-text cursor-default",
                  )}
                >
                  {pageLabel}
                </div>
              </div>
            </div>

            {!isFeedbackLayout && (
              <>
                {requiresIssue && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Issue
                    </label>
                    <Input
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="Short summary"
                      required
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Details {requiresDetails ? "" : "(optional)"}
                  </label>
                  <textarea
                    value={details}
                    onChange={(event) => setDetails(event.target.value)}
                    placeholder="Describe what happened or what is incorrect."
                    className={cn(
                      inputVariants({ variant: "default", size: "default" }),
                      "min-h-28 resize-y py-2 text-sm",
                    )}
                    required={requiresDetails}
                  />
                </div>
              </>
            )}

            {isFeedbackLayout && (
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Details
                </label>
                <textarea
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Share your feedback."
                  className={cn(
                    inputVariants({ variant: "default", size: "default" }),
                    "min-h-28 resize-y py-2 text-sm",
                  )}
                  required
                />
              </div>
            )}
          </fieldset>

          <DialogFooter className="mt-4 flex flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="rounded-full px-5 text-[11px] uppercase tracking-[0.2em]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full px-6 text-[11px] uppercase tracking-[0.2em]"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
