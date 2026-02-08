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

const WEEKDAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
};

function formatWeekday(value: string): string {
  const key = value.toLowerCase();
  return WEEKDAY_LABELS[key] ?? value;
}

function formatNthWeek(value: number): string {
  if (value % 100 >= 11 && value % 100 <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

function normalizeCourtroom(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function isJcmFxdLabel(value: string): boolean {
  const upper = value.toUpperCase();
  return upper.includes("JCM") && upper.includes("FXD");
}

const IAR_TYPE_ID = 2;

// ============================================================================
// TEAMS CARD COMPONENT
// ============================================================================

interface TeamsCardProps {
  links: TeamsLink[];
  schedules: CourtroomSchedule[];
  filterVBTriage?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsCard({
  links,
  schedules,
  filterVBTriage = true,
  onCopy,
  isCopied,
}: TeamsCardProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedCourtroom, setSelectedCourtroom] = useState("all");
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

      const aIsJcmFxd = isJcmFxdLabel(aName);
      const bIsJcmFxd = isJcmFxdLabel(bName);
      if (aIsJcmFxd && !bIsJcmFxd) return -1;
      if (!aIsJcmFxd && bIsJcmFxd) return 1;

      return extractNumber(aName) - extractNumber(bName);
    });
  }, [links, filterVBTriage]);

  const courtroomOptions = useMemo(() => {
    const set = new Set<string>();
    filteredLinks.forEach((link) => {
      const label = formatCourtroom(link.courtroom);
      if (label && label !== "—") set.add(label);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [filteredLinks]);

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

      if (selectedCourtroom !== "all" && courtroomLabel !== selectedCourtroom) {
        return false;
      }
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
  }, [filteredLinks, searchValue, selectedCourtroom, selectedType]);

  const schedulesByCourtroom = useMemo(() => {
    const map = new Map<string, CourtroomSchedule[]>();
    schedules.forEach((schedule) => {
      const key = normalizeCourtroom(schedule.courtroom);
      if (!key) return;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(schedule);
    });
    return map;
  }, [schedules]);

  if (filteredLinks.length === 0) return null;
  const hasFilters =
    searchValue.trim().length > 0 ||
    selectedCourtroom !== "all" ||
    selectedType !== "all";

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
                    setSelectedCourtroom("all");
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
          const courtroomLabel = formatCourtroom(link.courtroom);
          const isJcmFxdLink = isJcmFxdLabel(
            link.courtroom || link.type_name || "",
          );
          const iarSchedules = isJcmFxdLink
            ? schedules.filter((schedule) =>
                (schedule.courtroom_type ?? []).includes(IAR_TYPE_ID),
              )
            : [];
          const scheduleEntries =
            iarSchedules.length > 0
              ? iarSchedules
              : (schedulesByCourtroom.get(normalizeCourtroom(link.courtroom)) ??
                []);
          const regularSchedules = scheduleEntries.filter(
            (schedule) => !schedule.is_youth,
          );
          const youthSchedules = scheduleEntries.filter(
            (schedule) => schedule.is_youth,
          );
          const hasSchedule = scheduleEntries.length > 0;
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
                  "flex flex-col gap-2 px-4 py-2.5 rounded-none first:rounded-t-none last:rounded-b-none",
                  hasSchedule ? "cursor-pointer" : "cursor-default",
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex min-w-35 items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      {courtroomLabel}
                    </span>
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
                          className="w-auto max-w-[220px] px-2 py-1 text-[10px]"
                        >
                          <span className="text-foreground/90">
                            {typeDescription}
                          </span>
                        </PopoverContent>
                      </Popover>
                    ) : typeLabel ? (
                      <Badge variant="courtroomType">{typeLabel}</Badge>
                    ) : null}
                  </div>

                  <div className="ml-auto flex items-center gap-2">
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
                    <div className="separator-fade" />
                    <details
                      className="group w-full"
                      open={isOpen}
                      onToggle={(event) => {
                        const nextOpen = event.currentTarget.open;
                        setOpenRows((prev) => ({ ...prev, [rowId]: nextOpen }));
                      }}
                    >
                      <summary
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          toggleOpen();
                        }}
                        className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer list-none"
                      >
                        <span className="font-semibold uppercase tracking-[0.2em] text-[10px]">
                          View Schedule
                        </span>
                        <FaChevronDown className="ml-auto h-3 w-3 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="mt-2 space-y-2">
                        {regularSchedules.map((schedule) => (
                          <div
                            key={`schedule-${rowId}-${schedule.id}`}
                            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span className="font-semibold uppercase tracking-[0.2em] text-[10px]">
                              SCHEDULE
                            </span>
                            {(schedule.weekdays ?? []).map((day) => (
                              <span
                                key={`${schedule.id}-${day}`}
                                className="rounded-md border border-border/60 bg-secondary/40 px-2 py-1 text-[10px] font-mono text-foreground"
                              >
                                {formatWeekday(day)}
                              </span>
                            ))}
                            {(schedule.nth_week ?? []).map((week) => (
                              <span
                                key={`${schedule.id}-nth-${week}`}
                                className="rounded-md border border-border/60 bg-secondary/40 px-2 py-1 text-[10px] font-mono text-foreground"
                              >
                                {formatNthWeek(week)}
                              </span>
                            ))}
                            {schedule.times_text && (
                              <span className="text-xs text-foreground">
                                {schedule.times_text}
                              </span>
                            )}
                          </div>
                        ))}
                        {youthSchedules.map((schedule) => (
                          <div
                            key={`youth-${rowId}-${schedule.id}`}
                            className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                          >
                            <span className="font-semibold uppercase tracking-[0.2em] text-[10px]">
                              YOUTH
                            </span>
                            {(schedule.weekdays ?? []).map((day) => (
                              <span
                                key={`${schedule.id}-y-${day}`}
                                className="rounded-md border border-border/60 bg-secondary/40 px-2 py-1 text-[10px] font-mono text-foreground"
                              >
                                {formatWeekday(day)}
                              </span>
                            ))}
                            {(schedule.nth_week ?? []).map((week) => (
                              <span
                                key={`${schedule.id}-y-nth-${week}`}
                                className="rounded-md border border-border/60 bg-secondary/40 px-2 py-1 text-[10px] font-mono text-foreground"
                              >
                                {formatNthWeek(week)}
                              </span>
                            ))}
                            {schedule.times_text && (
                              <span className="text-xs text-foreground">
                                {schedule.times_text}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
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
