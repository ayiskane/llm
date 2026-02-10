"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  FaMicrosoftTeams,
  FaCopy,
  FaClipboardCheck,
  FaChevronDown,
  FaSliders,
} from "@/lib/icons";
import { Card, CardListRow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { text, iconSize, toggle } from "@/lib/config/theme";
import { joinTeamsMeeting } from "@/lib/utils";
import { isVBTriageLink } from "@/lib/config/constants";
import { Badge } from "@/components/ui/badge";
import type { CourtroomSchedule, TeamsLink } from "@/types";

// ============================================================================
// HELPERS
// ============================================================================

function formatCourtroom(value: string | null | undefined): string {
  const cleaned = value?.replace(/\s+/g, " ").trim();
  return cleaned && cleaned.length > 0 ? cleaned : "—";
}

function buildDialInText(link: TeamsLink): string {
  const lines: string[] = [];
  if (link.courtroom) lines.push(formatCourtroom(link.courtroom));
  if (link.phone_number) lines.push(link.phone_number);
  if (link.toll_free_number) lines.push(link.toll_free_number);
  if (link.conference_id) lines.push(`Conference ID: ${link.conference_id}`);
  return lines.join("\n");
}

function splitTimesText(value?: string | null): string[] {
  if (!value) return [];
  return value
    .replace(/\s+/g, " ")
    .split(/\s+and\s+|;\s*|,\s*/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function normalizeCourtroom(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

const DAY_ORDER = [
  { key: "mon", label: "MON" },
  { key: "tue", label: "TUE" },
  { key: "wed", label: "WED" },
  { key: "thu", label: "THU" },
  { key: "fri", label: "FRI" },
];

const JCM_TYPE_ID = 10;
const SURREY_COURT_ID = 76;

// ============================================================================
// TEAMS CARD COMPONENT
// ============================================================================

interface TeamsCardProps {
  links: TeamsLink[];
  schedules: CourtroomSchedule[];
  filterVBTriage?: boolean;
  pinVBTriage?: boolean;
  prioritizeJcm?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsCard({
  links,
  schedules,
  filterVBTriage = true,
  pinVBTriage = false,
  prioritizeJcm = false,
  onCopy,
  isCopied,
}: TeamsCardProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [openTypePopover, setOpenTypePopover] = useState<string | null>(null);

  useEffect(() => {
    if (!openTypePopover) return;
    const timeoutId = window.setTimeout(() => {
      setOpenTypePopover(null);
    }, 1500);
    return () => window.clearTimeout(timeoutId);
  }, [openTypePopover]);

  const filteredLinks = useMemo(() => {
    const result = filterVBTriage
      ? links.filter(
          (link) => !isVBTriageLink(link.courtroom || link.type_name || ""),
        )
      : links;

    const extractNumber = (name: string): number => {
      const match = name.match(/\d+/);
      return match ? parseInt(match[0], 10) : Infinity;
    };

    return [...result].sort((a, b) => {
      const aName = a.courtroom || a.type_name || "";
      const bName = b.courtroom || b.type_name || "";

      if (pinVBTriage) {
        const aIsTriage = isVBTriageLink(aName);
        const bIsTriage = isVBTriageLink(bName);
        if (aIsTriage && !bIsTriage) return -1;
        if (!aIsTriage && bIsTriage) return 1;
      }

      if (prioritizeJcm) {
        const aIsJcm = a.courtroom_type_id === JCM_TYPE_ID;
        const bIsJcm = b.courtroom_type_id === JCM_TYPE_ID;
        const aIsJcmFxd = aIsJcm && /FXD/i.test(aName);
        const bIsJcmFxd = bIsJcm && /FXD/i.test(bName);
        if (aIsJcmFxd && !bIsJcmFxd) return -1;
        if (!aIsJcmFxd && bIsJcmFxd) return 1;
        if (aIsJcm && !bIsJcm) return -1;
        if (!aIsJcm && bIsJcm) return 1;
      }

      return extractNumber(aName) - extractNumber(bName);
    });
  }, [links, filterVBTriage, pinVBTriage, prioritizeJcm]);

  const typeOptions = useMemo(() => {
    const map = new Map<number, string>();
    filteredLinks.forEach((link) => {
      if (!link.courtroom_type_id) return;
      const label = link.courtroom_type_name?.trim() || "";
      if (!label) return;
      map.set(link.courtroom_type_id, label);
    });
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredLinks]);

  const displayLinks = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    return filteredLinks.filter((link) => {
      const courtroomLabel = formatCourtroom(link.courtroom);
      const typeLabel = link.courtroom_type_name?.trim() || "";

      if (
        selectedType !== "all" &&
        String(link.courtroom_type_id ?? "") !== selectedType
      ) {
        return false;
      }
      if (!query) return true;
      return (
        courtroomLabel.toLowerCase().includes(query) ||
        typeLabel.toLowerCase().includes(query)
      );
    });
  }, [filteredLinks, searchValue, selectedType]);

  const scheduleBucketsByCourtroom = useMemo(() => {
    const map = new Map<
      string,
      {
        all: CourtroomSchedule[];
        regular: CourtroomSchedule[];
        youth: CourtroomSchedule[];
      }
    >();
    schedules.forEach((schedule) => {
      const key = normalizeCourtroom(schedule.courtroom);
      if (!key) return;
      if (!map.has(key)) {
        map.set(key, { all: [], regular: [], youth: [] });
      }
      const bucket = map.get(key)!;
      bucket.all.push(schedule);
      if (schedule.is_youth) {
        bucket.youth.push(schedule);
      } else {
        bucket.regular.push(schedule);
      }
    });
    return map;
  }, [schedules]);

  const jcmBuckets = useMemo(() => {
    const all = schedules.filter((schedule) =>
      (schedule.courtroom_type ?? []).includes(JCM_TYPE_ID),
    );
    return {
      all,
      regular: all.filter((schedule) => !schedule.is_youth),
      youth: all.filter((schedule) => schedule.is_youth),
    };
  }, [schedules]);

  if (filteredLinks.length === 0) return null;
  const hasFilters =
    searchValue.trim().length > 0 || selectedType !== "all";

  return (
    <Card
      variant="list"
      className="rounded-lg border border-border/60 overflow-hidden"
    >
      <div className="flex min-h-12 items-center justify-between gap-3 bg-linear-to-r from-semantic-blue-bg via-card to-card px-3 py-2.5 border-b border-border/50">
        <div className={text.sectionHeader}>MS Teams Links</div>
        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                toggle.base,
                isFilterOpen ? toggle.active : toggle.inactive,
                "h-auto px-2 py-1 text-xs hover:bg-transparent",
              )}
            >
              <FaSliders className={iconSize.xs} />
              Filter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filter Teams Links</DialogTitle>
              <DialogDescription>
                Filter by courtroom or type.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Search
                </label>
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search courtrooms or types"
                  variant="search"
                  size="search"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Type
                </label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {typeOptions.map((type) => (
                      <SelectItem key={type.id} value={String(type.id)}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              {hasFilters && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchValue("");
                    setSelectedType("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
              <Button onClick={() => setIsFilterOpen(false)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {displayLinks.length === 0 ? (
        <div className="px-3 py-3 text-xs text-muted-foreground">
          No teams links match these filters.
        </div>
      ) : (
        displayLinks.map((link, index) => {
          const rowId = `teams-${link.id ?? index}`;
          const typeLabel =
            link.courtroom_type_id && link.courtroom_type_name
              ? link.courtroom_type_name.trim()
              : "";
          const typeDescription = link.courtroom_type_full_name?.trim() || "";
          // Tag source: courtroom_type_name (e.g., ASC/FXD) comes from teams_links.courtroom_type_id -> courtroom_types.name.
          const courtroomLabel = formatCourtroom(link.courtroom);
          const surreyJcmMatch =
            link.court_id === SURREY_COURT_ID
              ? courtroomLabel.match(/^JCM FXD\s*\(([^)]+)\)\s*$/i)
              : null;
          const surreyJcmSuffix = surreyJcmMatch
            ? `(${surreyJcmMatch[1]})`
            : null;
          // JCM links are identified by courtroom_type_id = 10.
          const isJcmLink = link.courtroom_type_id === JCM_TYPE_ID;
          const scheduleBucket =
            isJcmLink && jcmBuckets.all.length > 0
              ? jcmBuckets
              : (scheduleBucketsByCourtroom.get(
                  normalizeCourtroom(link.courtroom),
                ) ?? { all: [], regular: [], youth: [] });
          const linkTypeId = link.courtroom_type_id ?? null;
          const filterByType = (entries: CourtroomSchedule[]) => {
            if (!linkTypeId) return entries;
            const matches = entries.filter((schedule) =>
              (schedule.courtroom_type ?? []).includes(linkTypeId),
            );
            return matches.length > 0 ? matches : entries;
          };
          const scheduleEntries = filterByType(scheduleBucket.all);
          const regularSchedules = filterByType(scheduleBucket.regular);
          const youthSchedules = filterByType(scheduleBucket.youth);
          const hasSchedule = scheduleEntries.length > 0;
          const scheduleCount = scheduleEntries.length;
          const hasDialIn =
            Boolean(link.phone_number) ||
            Boolean(link.toll_free_number) ||
            Boolean(link.conference_id);
          const dialInText = hasDialIn ? buildDialInText(link) : "";
          const isOpen = openRows[rowId] ?? false;
          const toggleOpen = () => {
            if (!hasSchedule) return;
            setOpenRows((prev) => ({ ...prev, [rowId]: !isOpen }));
          };
          const showTypePopover = Boolean(typeDescription);
          const popoverId = `${rowId}-type`;
          const isTypePopoverOpen = openTypePopover === popoverId;

          return (
            <Fragment key={rowId}>
              <CardListRow
                variant="outlined"
                interactive={hasSchedule}
                role={hasSchedule ? "button" : undefined}
                tabIndex={hasSchedule ? 0 : undefined}
                onClick={toggleOpen}
                onKeyDown={(event) => {
                  if (!hasSchedule) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggleOpen();
                  }
                }}
                className={cn(
                  "flex flex-col p-0 rounded-none first:rounded-t-none last:rounded-b-none",
                  hasSchedule ? "cursor-pointer" : "cursor-default",
                )}
              >
                <div className="flex items-center px-4 py-2.5 gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    {surreyJcmMatch ? (
                      <div className="text-sm font-medium text-foreground leading-tight">
                        <div>JCM FXD</div>
                        <div className="text-[10px] text-muted-foreground/70">
                          {surreyJcmSuffix}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {courtroomLabel}
                      </span>
                    )}
                    {typeLabel && showTypePopover ? (
                      <Popover
                        open={isTypePopoverOpen}
                        onOpenChange={(open) =>
                          setOpenTypePopover(open ? popoverId : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenTypePopover(popoverId);
                            }}
                            onKeyDown={(event) => {
                              event.stopPropagation();
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                setOpenTypePopover(popoverId);
                              }
                            }}
                          >
                            <Badge
                              variant="courtroomType"
                              className="cursor-pointer"
                            >
                              {typeLabel}
                            </Badge>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          side="bottom"
                          sideOffset={6}
                          className="w-auto max-w-55 px-2 py-1 text-[10px]"
                        >
                          <span className="text-foreground/90">
                            {typeDescription}
                          </span>
                        </PopoverContent>
                      </Popover>
                    ) : typeLabel ? (
                      <Badge variant="courtroomType">{typeLabel}</Badge>
                    ) : null}
                    {hasSchedule && (
                      <span className="text-[10px] text-muted-foreground/60 whitespace-nowrap truncate max-w-27.5">
                        {scheduleCount} Schedule
                        {scheduleCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    {hasSchedule && (
                      <FaChevronDown
                        className={cn(
                          "h-3 w-3 text-muted-foreground/60 transition-transform",
                          isOpen && "rotate-180",
                        )}
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (hasDialIn) onCopy?.(dialInText, rowId);
                      }}
                      disabled={!hasDialIn}
                      className={cn(
                        "h-8 w-8 rounded-lg transition-colors",
                        hasDialIn
                          ? "bg-secondary/60 hover:bg-secondary/70 active:bg-secondary/80"
                          : "bg-secondary/30 text-muted-foreground/60",
                      )}
                      title="Copy to clipboard"
                    >
                      {isCopied?.(rowId) ? (
                        <FaClipboardCheck
                          className={cn(
                            iconSize.md,
                            "text-semantic-green-text",
                          )}
                        />
                      ) : (
                        <FaCopy
                          className={cn(iconSize.md, "text-muted-foreground")}
                        />
                      )}
                    </Button>
                    {link.url ? (
                      <Button
                        variant="join"
                        size="sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          joinTeamsMeeting(link.url);
                        }}
                      >
                        <FaMicrosoftTeams className="w-3.5 h-3.5" />
                        Join
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </div>
                </div>

                {hasSchedule && (
                  <>
                    <div
                      className={cn(
                        "overflow-hidden transition-[max-height] duration-300",
                        isOpen ? "max-h-96" : "max-h-0",
                      )}
                    >
                      <div className="bg-slate-950/70 border-t border-border/30">
                        <div className="py-2 px-4 space-y-0">
                          {[...regularSchedules, ...youthSchedules].map(
                            (schedule, scheduleIndex) => {
                              const isYouth = schedule.is_youth;
                              const timeLines = splitTimesText(
                                schedule.times_text,
                              );
                              const daysText = schedule.days_text?.trim();
                              const weekdaySet = new Set(
                                (schedule.weekdays ?? []).map((day) =>
                                  day.toLowerCase(),
                                ),
                              );
                              return (
                                <div
                                  key={`schedule-${rowId}-${schedule.id}`}
                                  className={cn(
                                    "flex items-start justify-between gap-3 py-1.5 text-xs text-muted-foreground min-w-0",
                                    scheduleIndex > 0 &&
                                      "border-t border-border/30",
                                  )}
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1 items-center">
                                      <span
                                        className={cn(
                                          "text-[12px] font-mono font-semibold uppercase tracking-widest",
                                          isYouth
                                            ? "text-semantic-sky-text"
                                            : "text-muted-foreground",
                                        )}
                                      >
                                        {isYouth ? "Youth" : "Schedule"}
                                      </span>
                                      <div className="flex flex-wrap items-center gap-1">
                                        {DAY_ORDER.map((day) => {
                                          const isActive = weekdaySet.has(
                                            day.key,
                                          );
                                          return (
                                            <Badge
                                              key={`${schedule.id}-${day.key}`}
                                              variant={
                                                isActive
                                                  ? "weekday_active"
                                                  : "weekday"
                                              }
                                            >
                                              {day.label}
                                            </Badge>
                                          );
                                        })}
                                      </div>
                                      {daysText && (
                                        <span className="col-start-2 text-[10px] text-foreground/70">
                                          {daysText}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {timeLines.length > 0 && (
                                    <div className="text-[12px] text-foreground/80 text-right font-mono whitespace-nowrap leading-tight shrink-0">
                                      {timeLines.map((line, lineIndex) => (
                                        <div
                                          key={`${schedule.id}-time-${lineIndex}`}
                                        >
                                          {line}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardListRow>
            </Fragment>
          );
        })
      )}
    </Card>
  );
}
