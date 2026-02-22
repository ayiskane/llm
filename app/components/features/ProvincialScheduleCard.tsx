"use client";

import { Card, CardHeaderRow, CardListRow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatJudgeDisplayName } from "@/lib/utils";
import { text } from "@/lib/config/theme";
import type { CrownScheduleItem, JudgeScheduleItem } from "@/types";

function formatScheduleDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function normalizeRoleLabel(item: CrownScheduleItem) {
  if (item.crown_role_label) return item.crown_role_label;
  if (!item.crown_role_code) return null;
  return item.crown_role_code.replace(/_/g, " ").toUpperCase();
}

interface ProvincialScheduleCardProps {
  crownSchedules: CrownScheduleItem[];
  judgeSchedules: JudgeScheduleItem[];
  isLoading?: boolean;
}

export function ProvincialScheduleCard({
  crownSchedules,
  judgeSchedules,
  isLoading = false,
}: ProvincialScheduleCardProps) {
  const hasCrown = crownSchedules.length > 0;
  const hasJudges = judgeSchedules.length > 0;
  const hasData = hasCrown || hasJudges;

  if (isLoading && !hasData) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="px-3 py-3 text-xs text-muted-foreground">
        No crown or judge schedules published yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasCrown && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <CardHeaderRow className="border-b border-border/50">
            <div className={text.sectionHeader}>Crown Schedule</div>
          </CardHeaderRow>
          {crownSchedules.map((entry) => {
            const roleLabel = normalizeRoleLabel(entry);
            const courtroomLabel =
              entry.courtroom != null ? `CR ${entry.courtroom}` : null;
            return (
              <CardListRow
                key={`crown-${entry.id}`}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {entry.crown_name}
                  </div>
                  {(roleLabel || courtroomLabel) && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {roleLabel && (
                        <Badge variant="courtroomType">{roleLabel}</Badge>
                      )}
                      {courtroomLabel && (
                        <Badge variant="courtroomType">{courtroomLabel}</Badge>
                      )}
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    text.monoValue,
                    "text-muted-foreground whitespace-nowrap",
                  )}
                >
                  {formatScheduleDate(entry.schedule_date)}
                </div>
              </CardListRow>
            );
          })}
        </Card>
      )}

      {hasJudges && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <CardHeaderRow className="border-b border-border/50">
            <div className={text.sectionHeader}>Judge Schedule</div>
          </CardHeaderRow>
          {judgeSchedules.map((entry) => {
            const hubLabel = entry.bail_hub_name?.trim() || null;
            return (
              <CardListRow
                key={`judge-${entry.id}`}
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {formatJudgeDisplayName(entry.judge_name)}
                  </div>
                  {hubLabel && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      <Badge variant="courtroomType">{hubLabel}</Badge>
                    </div>
                  )}
                </div>
                <div
                  className={cn(
                    text.monoValue,
                    "text-muted-foreground whitespace-nowrap",
                  )}
                >
                  {formatScheduleDate(entry.schedule_date)}
                </div>
              </CardListRow>
            );
          })}
        </Card>
      )}
    </div>
  );
}
