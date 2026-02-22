"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardHeaderRow, CardListRow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaAt,
  FaCalendar,
  FaChevronRight,
  FaClipboardCheck,
  FaPhoneSolid,
} from "@/lib/icons";
import { cn, formatJudgeDisplayName } from "@/lib/utils";
import { text } from "@/lib/config/theme";
import type {
  CrownScheduleItem,
  DutyCounselScheduleItem,
  JudgeScheduleItem,
} from "@/types";

function formatScheduleDate(value: string) {
  const parsed = parseDateKey(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return new Date(value);
  const [, y, m, d] = match.map(Number);
  return new Date(y, m - 1, d);
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(value: Date) {
  const next = new Date(value);
  const day = next.getDay();
  next.setDate(next.getDate() - day);
  next.setHours(0, 0, 0, 0);
  return next;
}

function formatWeekLabel(start: Date, end: Date) {
  const startLabel = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${startLabel} – ${endLabel}`;
}

function normalizeRoleLabel(item: CrownScheduleItem) {
  if (item.crown_role_label) return item.crown_role_label;
  if (!item.crown_role_code) return null;
  return item.crown_role_code.replace(/_/g, " ").toUpperCase();
}

interface ProvincialScheduleCardProps {
  crownSchedules: CrownScheduleItem[];
  judgeSchedules: JudgeScheduleItem[];
  dutyCounselSchedules: DutyCounselScheduleItem[];
  isLoading?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function ProvincialScheduleCard({
  crownSchedules,
  judgeSchedules,
  dutyCounselSchedules,
  isLoading = false,
  onCopy,
  isCopied,
}: ProvincialScheduleCardProps) {
  const hasCrownData = crownSchedules.length > 0;
  const hasJudgeData = judgeSchedules.length > 0;
  const hasDutyCounselData = dutyCounselSchedules.length > 0;
  const hasData = hasCrownData || hasJudgeData || hasDutyCounselData;
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [weekStart, setWeekStart] = useState<Date>(() =>
    startOfWeek(new Date()),
  );
  const availableDateKeys = useMemo(() => {
    const keys = new Set<string>();
    crownSchedules.forEach((entry) => keys.add(entry.schedule_date));
    judgeSchedules.forEach((entry) => keys.add(entry.schedule_date));
    dutyCounselSchedules.forEach((entry) => keys.add(entry.schedule_date));
    return Array.from(keys).sort();
  }, [crownSchedules, judgeSchedules, dutyCounselSchedules]);
  const availableDateKeySet = useMemo(
    () => new Set(availableDateKeys),
    [availableDateKeys],
  );

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (!selectedDate) return;
    setWeekStart(startOfWeek(selectedDate));
  }, [selectedDate]);

  const selectedDateKey = selectedDate ? toDateKey(selectedDate) : null;
  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const weekLabel = useMemo(() => {
    const end = addDays(weekStart, 6);
    return formatWeekLabel(weekStart, end);
  }, [weekStart]);

  const filteredCrowns = useMemo(() => {
    if (!selectedDateKey) return [];
    return crownSchedules.filter(
      (entry) => entry.schedule_date === selectedDateKey,
    );
  }, [crownSchedules, selectedDateKey]);
  const filteredJudges = useMemo(() => {
    if (!selectedDateKey) return [];
    return judgeSchedules.filter(
      (entry) => entry.schedule_date === selectedDateKey,
    );
  }, [judgeSchedules, selectedDateKey]);
  const filteredDutyCounsel = useMemo(() => {
    if (!selectedDateKey) return [];
    return dutyCounselSchedules.filter(
      (entry) => entry.schedule_date === selectedDateKey,
    );
  }, [dutyCounselSchedules, selectedDateKey]);

  const moveWeek = (direction: -1 | 1) => {
    if (availableDateKeys.length === 0) return;
    const nextStart = addDays(weekStart, direction * 7);
    setWeekStart(nextStart);
    const candidate = weekDates
      .map((date, index) => addDays(nextStart, index))
      .find((date) => availableDateKeySet.has(toDateKey(date)));
    if (candidate) {
      setSelectedDate(candidate);
    }
  };

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
        No crown, judge, or duty counsel schedules published yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Card
        variant="list"
        className="rounded-lg border border-border/60 overflow-hidden"
      >
        <CardHeaderRow className="border-b border-border/50">
          <div className={text.sectionHeader}>Schedule Date</div>
        </CardHeaderRow>
        <div className="flex items-center justify-between px-3 py-2.5">
          <div className={cn(text.sectionHeader, "text-muted-foreground")}>
            Date
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "h-9 px-3 text-xs font-mono uppercase tracking-wide justify-start gap-2",
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <FaCalendar className="w-3.5 h-3.5" />
                {selectedDate
                  ? formatScheduleDate(toDateKey(selectedDate))
                  : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-3">
              <div className="flex items-center justify-between mb-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveWeek(-1)}
                  disabled={availableDateKeys.length === 0}
                  className="h-8 w-8"
                >
                  <FaChevronRight className="w-4 h-4 rotate-180" />
                </Button>
                <div className="text-xs font-mono text-muted-foreground">
                  {weekLabel}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveWeek(1)}
                  disabled={availableDateKeys.length === 0}
                  className="h-8 w-8"
                >
                  <FaChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground mb-1">
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((label) => (
                  <div key={label} className="text-center">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {weekDates.map((date) => {
                  const key = toDateKey(date);
                  const isAvailable = availableDateKeySet.has(key);
                  const isSelected = selectedDateKey === key;
                  return (
                    <Button
                      key={key}
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (isAvailable) setSelectedDate(date);
                      }}
                      disabled={!isAvailable}
                      className={cn(
                        "h-9 w-9 text-xs font-medium",
                        isSelected &&
                          "bg-semantic-emerald/20 text-semantic-emerald",
                        !isAvailable && "text-muted-foreground/50",
                      )}
                    >
                      {date.getDate()}
                    </Button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </Card>

      {hasCrownData && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <CardHeaderRow className="border-b border-border/50">
            <div className={text.sectionHeader}>Crown Schedule</div>
          </CardHeaderRow>
          {filteredCrowns.length > 0 ? (
            filteredCrowns.map((entry) => {
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
            })
          ) : (
            <CardListRow className="flex items-center gap-3 px-4 py-2.5">
              <div className="text-xs text-muted-foreground">
                No Available Information
              </div>
            </CardListRow>
          )}
        </Card>
      )}

      {hasJudgeData && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <CardHeaderRow className="border-b border-border/50">
            <div className={text.sectionHeader}>Judge Schedule</div>
          </CardHeaderRow>
          {filteredJudges.length > 0 ? (
            filteredJudges.map((entry) => {
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
            })
          ) : (
            <CardListRow className="flex items-center gap-3 px-4 py-2.5">
              <div className="text-xs text-muted-foreground">
                No Available Information
              </div>
            </CardListRow>
          )}
        </Card>
      )}

      {hasDutyCounselData && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <CardHeaderRow className="border-b border-border/50">
            <div className={text.sectionHeader}>Out of Custody Duty Counsel</div>
          </CardHeaderRow>
          {filteredDutyCounsel.length > 0 ? (
            filteredDutyCounsel.map((entry) => {
            const email = entry.duty_counsel_email ?? null;
            const phone = entry.duty_counsel_phone ?? null;
            return (
              <CardListRow
                key={`oc-duty-${entry.id}`}
                interactive={false}
                className="flex items-stretch gap-0 p-0 bg-slate-950/70"
              >
                  <div className="flex-1 py-2 px-4 min-w-0">
                    <div className={text.roleLabel}>
                      Out of Custody Duty Counsel
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">
                      {entry.duty_counsel_name}
                    </div>
                    <div
                      className={cn(
                        text.monoValue,
                        "text-muted-foreground whitespace-nowrap",
                      )}
                    >
                      {formatScheduleDate(entry.schedule_date)}
                    </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 px-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (email && onCopy) {
                        onCopy(email, `oc-duty-email-${entry.id}`);
                      }
                    }}
                    disabled={!email || !onCopy}
                    className={cn(
                      "h-8 w-8 rounded-lg transition-colors",
                      email && onCopy
                        ? "bg-secondary/60 active:bg-secondary/80"
                        : "bg-secondary/30 text-muted-foreground/60",
                    )}
                    title="Copy email"
                  >
                    {isCopied?.(`oc-duty-email-${entry.id}`) ? (
                      <FaClipboardCheck className="w-4 h-4 text-semantic-green-text" />
                    ) : (
                      <FaAt className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (phone && onCopy) {
                        onCopy(phone, `oc-duty-phone-${entry.id}`);
                      }
                    }}
                    disabled={!phone || !onCopy}
                    className={cn(
                      "h-8 w-8 rounded-lg transition-colors",
                      phone && onCopy
                        ? "bg-secondary/60 active:bg-secondary/80"
                        : "bg-secondary/30 text-muted-foreground/60",
                    )}
                    title="Copy phone"
                  >
                    {isCopied?.(`oc-duty-phone-${entry.id}`) ? (
                      <FaClipboardCheck className="w-4 h-4 text-semantic-green-text" />
                    ) : (
                      <FaPhoneSolid className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardListRow>
            );
          })
          ) : (
            <CardListRow className="flex items-center gap-3 px-4 py-2.5">
              <div className="text-xs text-muted-foreground">
                No Available Information
              </div>
            </CardListRow>
          )}
        </Card>
      )}
    </div>
  );
}
