"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardHeaderRow, CardListRow } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FaAt,
  FaCalendar,
  FaChevronDown,
  FaChevronRight,
  FaClipboardCheck,
  FaPhoneSolid,
} from "@/lib/icons";
import { cn, formatJudgeDisplayName, makeCall } from "@/lib/utils";
import { text } from "@/lib/config/theme";
import type {
  BailCrownScheduleItem,
  BailJudgeScheduleItem,
  DutyCounselScheduleItem,
  TeamsLink,
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

function normalizeRoleLabel(code?: string | null, label?: string | null) {
  if (label) return label;
  if (!code) return null;
  return code.replace(/_/g, " ").toUpperCase();
}

function formatDutyCounselRole(role?: string | null) {
  if (!role) return null;
  const normalized = role.trim().toUpperCase();
  if (normalized === "IC" || normalized === "IN CUSTODY") return "IC";
  if (normalized === "OC" || normalized === "OUT OF CUSTODY") return "OC";
  return normalized;
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

function formatCourtroomLabel(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/\bcr\b/i.test(trimmed)) return trimmed;
  if (/courtroom/i.test(trimmed)) {
    return trimmed.replace(/courtroom/gi, "CR").replace(/\s+/g, " ").trim();
  }
  if (/^\d+$/.test(trimmed)) return `CR ${trimmed}`;
  return trimmed;
}

function formatHubCourtroomLabel(
  hubLabel: string | null,
  courtroomLabel: string | null,
) {
  if (hubLabel && courtroomLabel) {
    return `${hubLabel} · ${courtroomLabel}`;
  }
  return hubLabel ?? courtroomLabel ?? null;
}

function formatWeekendHubLabel(label: string | null) {
  if (!label) return null;
  if (/region justice centre/i.test(label)) {
    return label.replace(/region\s+justice\s+centre/i, "Justice Centre");
  }
  return label;
}

function formatCrownRoleLabel(label: string) {
  const trimmed = label.trim();
  return trimmed || "Bail Crown";
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

const ROLE_ORDER = [
  "ic",
  "remand",
  "bail_float",
  "bail_acc",
  "revoii",
  "ic_ipv",
  "ipv",
  "night",
  "warrants",
  "bail_general",
];

const ROLE_LABELS: Record<string, string> = {
  ic: "I/C",
  remand: "Remand",
  bail_float: "Bail Float",
  bail_acc: "Bail ACC",
  revoii: "ReVOII",
  ic_ipv: "I/C IPV",
  ipv: "IPV",
  night: "Night",
  warrants: "Warrants",
  bail_general: "Bail Crown",
};

const BAIL_COURTROOM_TYPE_ID = 6;

interface BailScheduleCardProps {
  crownSchedules: BailCrownScheduleItem[];
  judgeSchedules: BailJudgeScheduleItem[];
  dutyCounselSchedules: DutyCounselScheduleItem[];
  isLoading?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
  bailHubName?: string | null;
  regionJusticeCentreName?: string | null;
  bailTeams?: TeamsLink[];
}

export function BailScheduleCard({
  crownSchedules,
  judgeSchedules,
  dutyCounselSchedules,
  isLoading = false,
  onCopy,
  isCopied,
  bailHubName,
  regionJusticeCentreName,
  bailTeams,
}: BailScheduleCardProps) {
  const hasCrown = crownSchedules.length > 0;
  const hasJudges = judgeSchedules.length > 0;
  const hasDutyCounsel = dutyCounselSchedules.length > 0;
  const hasData = hasCrown || hasJudges || hasDutyCounsel;
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    undefined,
  );
  const [isCrownOpen, setIsCrownOpen] = useState(true);
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
    if (selectedDate && availableDateKeySet.has(toDateKey(selectedDate))) {
      return;
    }
    if (availableDateKeys.length === 0) {
      setSelectedDate(undefined);
      return;
    }
    const todayKey = toDateKey(new Date());
    const nextKey = availableDateKeySet.has(todayKey)
      ? todayKey
      : availableDateKeys[0];
    const nextDate = parseDateKey(nextKey);
    setSelectedDate(nextDate);
  }, [availableDateKeys, availableDateKeySet, selectedDate]);

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
  const filteredJudges = useMemo(() => {
    if (!selectedDateKey) return [];
    return judgeSchedules.filter(
      (entry) => entry.schedule_date === selectedDateKey,
    );
  }, [judgeSchedules, selectedDateKey]);
  const filteredCrowns = useMemo(() => {
    if (!selectedDateKey) return [];
    return crownSchedules.filter(
      (entry) => entry.schedule_date === selectedDateKey,
    );
  }, [crownSchedules, selectedDateKey]);
  const filteredDutyCounsel = useMemo(() => {
    if (!selectedDateKey) return [];
    return dutyCounselSchedules.filter(
      (entry) => entry.schedule_date === selectedDateKey,
    );
  }, [dutyCounselSchedules, selectedDateKey]);

  const groupedCrowns = useMemo(() => {
    const groups = new Map<string, BailCrownScheduleItem[]>();
    filteredCrowns.forEach((entry) => {
      const key = entry.crown_role_code ?? "other";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(entry);
    });
    const orderedKeys = [
      ...ROLE_ORDER.filter((key) => groups.has(key)),
      ...Array.from(groups.keys()).filter((key) => !ROLE_ORDER.includes(key)),
    ];
    return orderedKeys.map((key) => ({
      key,
      label:
        groups
          .get(key)
          ?.map((entry) => entry.crown_role_label?.trim())
          .find((value) => value) ??
        ROLE_LABELS[key] ??
        normalizeRoleLabel(key, null) ??
        "Other",
      items: groups.get(key) ?? [],
    }));
  }, [filteredCrowns]);

  const bailCourtroomLabel = useMemo(() => {
    if (!bailTeams || bailTeams.length === 0) return null;
    const direct = bailTeams.find(
      (link) => link.courtroom_type_id === BAIL_COURTROOM_TYPE_ID
    );
    if (direct) {
      const label =
        direct.courtroom ??
        direct.type_name ??
        direct.courtroom_type_name ??
        null;
      return formatCourtroomLabel(label);
    }
    const match = bailTeams.find((link) => {
      const typeName = (link.type_name ?? "").toLowerCase();
      const courtroomType = (link.courtroom_type_name ?? "").toLowerCase();
      const courtroomTypeFull = (link.courtroom_type_full_name ?? "").toLowerCase();
      return (
        typeName.includes("bail") ||
        courtroomType.includes("bail") ||
        courtroomTypeFull.includes("bail")
      );
    });
    if (!match) return null;
    const label =
      match.courtroom ?? match.type_name ?? match.courtroom_type_name ?? null;
    return formatCourtroomLabel(label);
  }, [bailTeams]);

  const headerBadgeLabel = useMemo(() => {
    if (!selectedDate) {
      return formatHubCourtroomLabel(
        bailHubName ?? null,
        bailCourtroomLabel,
      );
    }
    const day = selectedDate.getDay();
    const isWeekend = day === 0 || day === 6;
    if (isWeekend) {
      return (
        formatWeekendHubLabel(regionJusticeCentreName ?? null) ??
        formatWeekendHubLabel(bailHubName ?? null)
      );
    }
    return formatHubCourtroomLabel(
      bailHubName ?? null,
      bailCourtroomLabel,
    );
  }, [selectedDate, bailCourtroomLabel, bailHubName, regionJusticeCentreName]);

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
        No bail schedules published yet.
      </div>
    );
  }

  return (
    <Card
      variant="list"
      className="rounded-lg border border-border/60 overflow-hidden"
    >
      <CardHeaderRow
        variant="bail"
        className="border-b border-border/50 justify-between gap-2"
      >
        <div className={text.sectionHeader}>Bail Schedule</div>
        {headerBadgeLabel?.trim() && (
          <Badge variant="courtroomType">{headerBadgeLabel.trim()}</Badge>
        )}
      </CardHeaderRow>

      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
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
                      isSelected && "bg-semantic-amber-bg text-semantic-amber-text",
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

      <div className="border-b border-border/50">
        {selectedDateKey && filteredJudges.length > 0 ? (
          <CardListRow
            interactive={false}
            className="flex items-start gap-3 px-3 py-2.5"
          >
            <div
              className={cn(
                text.sectionHeader,
                "w-24 shrink-0 text-muted-foreground",
              )}
            >
              Judge
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate text-right">
                {filteredJudges
                  .map((entry) => formatJudgeDisplayName(entry.judge_name))
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          </CardListRow>
        ) : (
          <CardListRow
            interactive={false}
            className="flex items-start gap-3 px-3 py-2.5"
          >
            <div
              className={cn(
                text.sectionHeader,
                "w-24 shrink-0 text-muted-foreground",
              )}
            >
              Judge
            </div>
            <div className="text-xs text-muted-foreground text-right flex-1">
              No Available Information
            </div>
          </CardListRow>
        )}
      </div>

      <div className="border-b border-border/50">
        <button
          type="button"
          onClick={() => setIsCrownOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        >
          <span className={cn(text.sectionHeader, "text-muted-foreground")}>
            Bail Crowns
          </span>
          <FaChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform",
              isCrownOpen && "rotate-180",
            )}
          />
        </button>
        <div
          className={cn(
            "overflow-hidden transition-[max-height] duration-300",
            isCrownOpen ? "max-h-96" : "max-h-0",
          )}
        >
          {selectedDateKey && groupedCrowns.length > 0 ? (
            <div className="max-h-72 overflow-y-auto overscroll-contain">
              <div className="space-y-0 divide-y divide-border/30">
                {groupedCrowns.flatMap((group) =>
                  group.items.map((entry) => (
                    <CardListRow
                      key={`bail-crown-${entry.id}`}
                      interactive={false}
                      className="flex items-stretch gap-0 p-0 bg-slate-950/70"
                    >
                      <div className="flex-1 py-2 px-4 min-w-0">
                        <div className={text.roleLabel}>
                          {(() => {
                            const baseLabel = formatCrownRoleLabel(
                              entry.crown_role_label ?? group.label,
                            );
                            const badgeLabel = entry.badge_label?.trim();
                            return badgeLabel
                              ? `${baseLabel} (${badgeLabel})`
                              : baseLabel;
                          })()}
                        </div>
                        <div className="text-sm font-medium text-foreground truncate">
                          {entry.crown_name}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (entry.crown_email) {
                              onCopy?.(
                                entry.crown_email,
                                `bail-crown-email-${entry.id}`,
                              );
                            }
                          }}
                          disabled={!entry.crown_email}
                          className={cn(
                            "h-8 w-8 rounded-lg transition-colors",
                            entry.crown_email
                              ? "bg-secondary/60 active:bg-secondary/80"
                              : "bg-secondary/30 text-muted-foreground/60",
                          )}
                          title="Copy email"
                        >
                          {isCopied?.(`bail-crown-email-${entry.id}`) ? (
                            <FaClipboardCheck className="w-4 h-4 text-semantic-green-text" />
                          ) : (
                            <FaAt className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (entry.crown_phone) {
                              onCopy?.(
                                entry.crown_phone,
                                `bail-crown-phone-${entry.id}`,
                              );
                            }
                          }}
                          disabled={!entry.crown_phone}
                          className={cn(
                            "h-8 w-8 rounded-lg transition-colors",
                            entry.crown_phone
                              ? "bg-secondary/60 active:bg-secondary/80"
                              : "bg-secondary/30 text-muted-foreground/60",
                          )}
                          title="Copy phone"
                        >
                          {isCopied?.(`bail-crown-phone-${entry.id}`) ? (
                            <FaClipboardCheck className="w-4 h-4 text-semantic-green-text" />
                          ) : (
                            <FaPhoneSolid className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </CardListRow>
                  )),
                )}
              </div>
            </div>
          ) : (
          <div className="px-4 pb-3 text-xs text-muted-foreground text-right">
            No Available Information
          </div>
          )}
        </div>
      </div>

      <div>
        {selectedDateKey && filteredDutyCounsel.length > 0 ? (
          <CardListRow className="flex items-start gap-3 px-3 py-2.5">
            <div
              className={cn(
                text.sectionHeader,
                "w-24 shrink-0 text-muted-foreground",
              )}
            >
              Duty Counsel
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              {filteredDutyCounsel.map((entry) => {
                const roleLabel = formatDutyCounselRole(entry.role);
                const amBadge = entry.is_am ? "AM" : null;
                const pmBadge = entry.is_pm ? "PM" : null;
                const email = entry.duty_counsel_email ?? null;
                const phone = entry.duty_counsel_phone ?? null;
                return (
                  <div
                    key={`bail-dc-${entry.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {roleLabel
                          ? `${roleLabel} Duty Counsel`
                          : "Duty Counsel"}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {entry.duty_counsel_name}
                      </div>
                      {(amBadge || pmBadge) && (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {amBadge && (
                            <Badge variant="courtroomType">{amBadge}</Badge>
                          )}
                          {pmBadge && (
                            <Badge variant="courtroomType">{pmBadge}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (email) window.open(`mailto:${email}`, "_self");
                        }}
                        disabled={!email}
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          email
                            ? "bg-secondary/60 hover:bg-secondary/70"
                            : "bg-secondary/30 text-muted-foreground/60",
                        )}
                        title="Email"
                      >
                        <FaAt className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (phone) makeCall(phone);
                        }}
                        disabled={!phone}
                        className={cn(
                          "h-8 w-8 rounded-lg",
                          phone
                            ? "bg-semantic-green-bg hover:bg-semantic-green-bg/70"
                            : "bg-secondary/30 text-muted-foreground/60",
                        )}
                        title="Call"
                      >
                        <FaPhoneSolid className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardListRow>
        ) : (
          <CardListRow className="flex items-center gap-3 px-3 py-2.5">
            <div
              className={cn(
                text.sectionHeader,
                "w-24 shrink-0 text-muted-foreground",
              )}
            >
              Duty Counsel
            </div>
            <div className="text-xs text-muted-foreground text-right flex-1">
              No Available Information
            </div>
          </CardListRow>
        )}
      </div>
    </Card>
  );
}
