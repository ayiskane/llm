"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DateLegend,
  type DateLegendItem,
} from "@/app/components/features/DateLegend";
import { FaCalendar, FaChevronRight } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { text } from "@/lib/config/theme";
import type { CourtScheduleDate } from "@/types";

type ScheduleMonthGroup = {
  key: string;
  label: string;
  items: {
    id: number;
    display: string;
  }[];
};

function formatDayRange(start: Date, end?: Date | null) {
  const startDay = start.getDate();
  if (!end || isNaN(end.getTime())) return `${startDay}`;

  const sameDay = start.toDateString() === end.toDateString();
  if (sameDay) return `${startDay}`;

  const sameMonth =
    start.getMonth() === end.getMonth() &&
    start.getFullYear() === end.getFullYear();
  if (sameMonth) {
    return `${startDay}-${end.getDate()}`;
  }

  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  return `${startMonth} ${startDay}-${endMonth} ${end.getDate()}`;
}

function parseDate(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  return new Date(Number(y), Number(m) - 1, Number(d));
}

function expandDateRange(start: Date, end?: Date | null): Date[] {
  if (!end || isNaN(end.getTime())) return [start];
  if (end < start) return [start];
  const dates: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    dates.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function getNthWeekdayOfMonth(
  year: number,
  monthIndex: number,
  weekday: number,
  nth: number,
): Date {
  const first = new Date(year, monthIndex, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  const day = 1 + offset + (nth - 1) * 7;
  return new Date(year, monthIndex, day);
}

function getVictoriaDay(year: number): Date {
  const date = new Date(year, 4, 24);
  while (date.getDay() !== 1) {
    date.setDate(date.getDate() - 1);
  }
  return date;
}

function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function getCanadianHolidayDates(year: number): Date[] {
  const holidays: Date[] = [];
  holidays.push(new Date(year, 0, 1)); // New Year's Day
  holidays.push(getNthWeekdayOfMonth(year, 1, 1, 3)); // Family Day (BC)
  const easter = getEasterSunday(year);
  const goodFriday = new Date(easter);
  goodFriday.setDate(easter.getDate() - 2);
  holidays.push(goodFriday);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  holidays.push(easterMonday);
  holidays.push(getVictoriaDay(year));
  holidays.push(new Date(year, 6, 1)); // Canada Day
  holidays.push(getNthWeekdayOfMonth(year, 7, 1, 1)); // BC Day
  holidays.push(getNthWeekdayOfMonth(year, 8, 1, 1)); // Labour Day
  holidays.push(new Date(year, 8, 30)); // National Day for Truth and Reconciliation
  holidays.push(getNthWeekdayOfMonth(year, 9, 1, 2)); // Thanksgiving
  holidays.push(new Date(year, 10, 11)); // Remembrance Day
  holidays.push(new Date(year, 11, 25)); // Christmas Day
  holidays.push(new Date(year, 11, 26)); // Boxing Day

  const observed = [
    new Date(year, 0, 1),
    new Date(year, 6, 1),
    new Date(year, 8, 30),
    new Date(year, 10, 11),
    new Date(year, 11, 25),
    new Date(year, 11, 26),
  ];
  observed.forEach((date) => {
    const day = date.getDay();
    if (day === 0) {
      const monday = new Date(date);
      monday.setDate(date.getDate() + 1);
      holidays.push(monday);
    } else if (day === 6) {
      const monday = new Date(date);
      monday.setDate(date.getDate() + 2);
      holidays.push(monday);
    }
  });

  return holidays;
}

function buildMonthlyGroups(dates: CourtScheduleDate[]): ScheduleMonthGroup[] {
  if (!dates.length) return [];
  const groups = groupScheduleDates(dates);
  const groupMap = new Map<string, ScheduleMonthGroup>(
    groups.map((group) => [group.key, group]),
  );
  let minDate: Date | null = null;
  let maxDate: Date | null = null;
  dates.forEach((date) => {
    const start = parseDate(date.date_start);
    const end = date.date_end ? parseDate(date.date_end) : null;
    if (start && (!minDate || start < minDate)) minDate = start;
    if (start && (!maxDate || start > maxDate)) maxDate = start;
    if (end && (!minDate || end < minDate)) minDate = end;
    if (end && (!maxDate || end > maxDate)) maxDate = end;
  });
  if (!minDate || !maxDate) return groups;

  const minValue: Date = minDate;
  const maxValue: Date = maxDate;
  const cursor = new Date(minValue.getFullYear(), minValue.getMonth(), 1);
  const last = new Date(maxValue.getFullYear(), maxValue.getMonth(), 1);
  while (cursor <= last) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, {
        key,
        label: cursor.toLocaleDateString("en-US", { month: "long" }),
        items: [],
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Array.from(groupMap.values()).sort((a, b) => {
    const [aYear, aMonth] = a.key.split("-").map(Number);
    const [bYear, bMonth] = b.key.split("-").map(Number);
    if (aYear !== bYear) return aYear - bYear;
    return aMonth - bMonth;
  });
}

function groupScheduleDates(dates: CourtScheduleDate[]): ScheduleMonthGroup[] {
  const sorted = [...dates].sort((a, b) => {
    const aDate = parseDate(a.date_start)?.getTime() ?? 0;
    const bDate = parseDate(b.date_start)?.getTime() ?? 0;
    return aDate - bDate;
  });

  const groups = new Map<string, ScheduleMonthGroup>();
  sorted.forEach((date) => {
    const start = parseDate(date.date_start);
    if (!start) return;
    const end = date.date_end ? parseDate(date.date_end) : null;
    const key = `${start.getFullYear()}-${start.getMonth()}`;
    const label = start.toLocaleDateString("en-US", { month: "long" });
    const display = formatDayRange(start, end);

    if (!groups.has(key)) {
      groups.set(key, { key, label, items: [] });
    }

    groups.get(key)!.items.push({
      id: date.id,
      display,
    });
  });

  return Array.from(groups.values());
}

interface ScheduleCardProps {
  title?: string;
  dates: CourtScheduleDate[];
  emptyLabel?: string;
  isLoading?: boolean;
}

export function ScheduleCard({
  title = "Sitting Dates",
  dates,
  emptyLabel = "No sitting dates published yet.",
  isLoading = false,
}: ScheduleCardProps) {
  const today = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);
  const pastSectionRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<"calendar" | "list">("calendar");
  const [showPast, setShowPast] = useState(false);
  const hasUserNavigatedRef = useRef(false);
  const sittingDates = useMemo(() => {
    const allDates: Date[] = [];
    dates.forEach((date) => {
      const start = parseDate(date.date_start);
      if (!start) return;
      const end = date.date_end ? parseDate(date.date_end) : null;
      allDates.push(...expandDateRange(start, end));
    });
    return allDates;
  }, [dates]);
  const holidayLookup = useMemo(() => {
    const years = new Set<number>([today.getFullYear()]);
    sittingDates.forEach((date) => years.add(date.getFullYear()));
    const lookup = new Set<string>();
    years.forEach((year) => {
      getCanadianHolidayDates(year).forEach((date) => {
        lookup.add(toDateKey(date));
      });
    });
    return lookup;
  }, [sittingDates, today]);
  const calendarSittingDates = useMemo(
    () =>
      sittingDates.filter(
        (date) => !isWeekend(date) && !holidayLookup.has(toDateKey(date)),
      ),
    [sittingDates, holidayLookup],
  );
  const { upcomingDates, pastDates } = useMemo(() => {
    const upcoming: CourtScheduleDate[] = [];
    const past: CourtScheduleDate[] = [];
    dates.forEach((date) => {
      const start = parseDate(date.date_start);
      if (!start) return;
      const end = date.date_end ? parseDate(date.date_end) : null;
      const compare = end ?? start;
      if (compare.getTime() < today.getTime()) {
        past.push(date);
      } else {
        upcoming.push(date);
      }
    });
    return { upcomingDates: upcoming, pastDates: past };
  }, [dates, today]);
  const upcomingGroups = useMemo(
    () => buildMonthlyGroups(upcomingDates),
    [upcomingDates],
  );
  const pastGroups = useMemo(() => buildMonthlyGroups(pastDates), [pastDates]);
  const upcomingDisplayGroups = useMemo(
    () => upcomingGroups.filter((group) => group.items.length > 0),
    [upcomingGroups],
  );
  const pastDisplayGroups = useMemo(
    () => pastGroups.filter((group) => group.items.length > 0),
    [pastGroups],
  );
  const pastSittingDates = useMemo(
    () =>
      calendarSittingDates.filter((date) => date.getTime() < today.getTime()),
    [calendarSittingDates, today],
  );
  const upcomingSittingDates = useMemo(
    () =>
      calendarSittingDates.filter((date) => date.getTime() >= today.getTime()),
    [calendarSittingDates, today],
  );
  const calendarSittingDateKeys = useMemo(
    () => new Set(calendarSittingDates.map((date) => toDateKey(date))),
    [calendarSittingDates],
  );
  const nextSittingDate = useMemo<Date | null>(() => {
    let next: Date | null = null;
    calendarSittingDates.forEach((date) => {
      if (date.getTime() < today.getTime()) return;
      if (!next || date.getTime() < next.getTime()) {
        next = date;
      }
    });
    return next;
  }, [calendarSittingDates, today]);
  const [visibleMonth, setVisibleMonth] = useState(
    () => nextSittingDate ?? today,
  );
  useEffect(() => {
    if (hasUserNavigatedRef.current || !nextSittingDate) return;
    setVisibleMonth(nextSittingDate);
  }, [nextSittingDate]);
  const nextSittingKey =
    nextSittingDate === null
      ? null
      : `${nextSittingDate.getFullYear()}-${nextSittingDate.getMonth()}`;
  const hasDates = dates.length > 0;
  const showLoading = isLoading && !hasDates;
  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();
  const monthLabel = useMemo(
    () =>
      visibleMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [visibleMonth],
  );
  const hasMonthSittingDates = useMemo(
    () =>
      calendarSittingDates.some(
        (date) =>
          date.getFullYear() === visibleMonth.getFullYear() &&
          date.getMonth() === visibleMonth.getMonth(),
      ),
    [calendarSittingDates, visibleMonth],
  );
  const legendItems: DateLegendItem[] = [
    {
      id: "today",
      label: "Today",
      className:
        "border border-dashed border-muted-foreground/60 text-foreground",
    },
    {
      id: "past",
      label: "Past sitting date",
      className: "bg-muted/40 text-muted-foreground",
    },
    {
      id: "upcoming",
      label: "Upcoming sitting date",
      className: "bg-semantic-blue-bg text-semantic-blue-text font-semibold",
    },
    {
      id: "unscheduled",
      label: "Non-sitting date",
      className: "text-muted-foreground/70",
      sampleClassName: "line-through",
    },
  ];

  return (
    <Card
      variant="list"
      className="rounded-lg border border-border/60 overflow-hidden"
    >
      <div className="flex min-h-12 items-center gap-3 bg-linear-to-r from-semantic-blue-bg via-card to-card px-3 py-2.5 border-b border-border/50">
        <div>
          <div className={text.sectionHeader}>{title}</div>
        </div>
      </div>

      {showLoading ? (
        <div className="px-3 py-3">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-32 rounded-md" />
              <Skeleton className="h-9 w-40 rounded-md" />
            </div>
            <Skeleton className="h-[320px] w-full rounded-lg" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-36 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
        </div>
      ) : hasDates ? (
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab((value as "calendar" | "list") || "calendar")
          }
          className="p-3 pt-2"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 py-1 text-sm"
              onClick={() => {
                if (activeTab === "calendar") {
                  hasUserNavigatedRef.current = true;
                  setVisibleMonth(new Date());
                } else {
                  setShowPast(true);
                  requestAnimationFrame(() => {
                    pastSectionRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  });
                }
              }}
              disabled={activeTab === "calendar" ? isCurrentMonth : false}
            >
              {activeTab === "calendar"
                ? "Current month"
                : "See Past Sitting Dates"}
            </Button>
            <TabsList className="justify-start bg-secondary/40">
              <TabsTrigger value="calendar" className="gap-2">
                <FaCalendar className="w-4 h-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calendar">
            <div className="overflow-x-auto">
              <div className="flex justify-center">
                <div className="inline-flex w-fit max-w-full rounded-lg border border-border/60 bg-card/50">
                  {hasMonthSittingDates ? (
                    <Calendar
                      mode="single"
                      navLayout="around"
                      showOutsideDays={false}
                      onSelect={() => undefined}
                      month={visibleMonth}
                      onMonthChange={(month) => {
                        hasUserNavigatedRef.current = true;
                        setVisibleMonth(month);
                      }}
                      className="w-fit"
                      classNames={{
                        months:
                          "flex w-fit flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                        month: "grid w-fit grid-cols-[auto_1fr_auto] gap-y-4",
                        month_grid:
                          "col-span-3 row-start-2 w-fit border-separate border-spacing-1",
                      }}
                      modifiers={{
                        sittingUpcoming: upcomingSittingDates,
                        sittingPast: pastSittingDates,
                      }}
                      modifiersClassNames={{
                        sittingUpcoming:
                          "[&>button]:bg-semantic-blue-bg [&>button]:text-semantic-blue-text [&>button]:rounded-lg [&>button]:font-semibold",
                        sittingPast:
                          "[&>button]:bg-muted/40 [&>button]:text-muted-foreground [&>button]:rounded-lg",
                        today:
                          "[&>button]:border [&>button]:border-dashed [&>button]:border-muted-foreground/60 [&>button]:rounded-lg",
                        disabled:
                          "[&>button]:line-through [&>button]:text-muted-foreground/70 opacity-100",
                      }}
                      disabled={(date) =>
                        !calendarSittingDateKeys.has(toDateKey(date))
                      }
                    />
                  ) : (
                    <div className="min-w-[18rem]">
                      <div className="grid grid-cols-[auto_1fr_auto] items-center px-3 py-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            hasUserNavigatedRef.current = true;
                            setVisibleMonth(
                              (prev) =>
                                new Date(
                                  prev.getFullYear(),
                                  prev.getMonth() - 1,
                                  1,
                                ),
                            );
                          }}
                        >
                          <FaChevronRight className="h-4 w-4 rotate-180" />
                        </Button>
                        <div className="text-sm font-medium text-foreground text-center">
                          {monthLabel}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            hasUserNavigatedRef.current = true;
                            setVisibleMonth(
                              (prev) =>
                                new Date(
                                  prev.getFullYear(),
                                  prev.getMonth() + 1,
                                  1,
                                ),
                            );
                          }}
                        >
                          <FaChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="px-3 pb-4 text-center text-sm font-medium text-muted-foreground">
                        No Sitting Dates
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DateLegend className="mt-3" items={legendItems} />
          </TabsContent>

          <TabsContent value="list">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Upcoming Sitting Dates
            </div>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              {upcomingDisplayGroups.length ? (
                <Table>
                  <TableHeader className="bg-secondary/30">
                    <TableRow>
                      <TableHead className="w-35">Month</TableHead>
                      <TableHead>Dates</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingDisplayGroups.map((group) => {
                      const [year] = group.key.split("-");
                      const isNextRow = nextSittingKey === group.key;
                      return (
                        <TableRow
                          key={group.key}
                          className={cn(
                            isNextRow &&
                              "bg-semantic-blue-bg hover:bg-semantic-blue-bg",
                          )}
                        >
                          <TableCell className="align-top">
                            <div className="text-xs text-muted-foreground font-mono">
                              {year}
                            </div>
                            <div className="text-sm text-foreground">
                              {group.label}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              {group.items.map((item) => (
                                <span
                                  key={item.id}
                                  className={cn(
                                    "rounded-md border border-border/60 bg-secondary/40 px-2 py-1 text-xs font-mono",
                                    "text-foreground",
                                    isNextRow && "border-semantic-blue-text/60",
                                  )}
                                >
                                  {item.display}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="px-3 py-3 text-xs text-muted-foreground">
                  No upcoming sitting dates.
                </div>
              )}
            </div>
            <div ref={pastSectionRef} className="mt-4">
              <details
                open={showPast}
                onToggle={(event) => {
                  const element = event.currentTarget;
                  setShowPast(element.open);
                }}
                className="rounded-lg border border-border/60 bg-card/30"
              >
                <summary className="cursor-pointer list-none px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                  Past Sitting Dates
                </summary>
                <div className="border-t border-border/60">
                  {pastDisplayGroups.length ? (
                    <Table>
                      <TableBody>
                        {pastDisplayGroups.map((group) => {
                          const [year] = group.key.split("-");
                          return (
                            <TableRow key={group.key}>
                              <TableCell className="align-top px-3 py-2">
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  {year}
                                </div>
                                <div className="text-xs text-foreground">
                                  {group.label}
                                </div>
                              </TableCell>
                              <TableCell className="px-3 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {group.items.map((item) => (
                                    <span
                                      key={item.id}
                                      className={cn(
                                        "rounded-md border border-border/60 bg-secondary/40 px-1.5 py-0.5 text-[11px] font-mono",
                                        "text-foreground",
                                      )}
                                    >
                                      {item.display}
                                    </span>
                                  ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="px-3 py-3 text-xs text-muted-foreground">
                      No past sitting dates.
                    </div>
                  )}
                </div>
              </details>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="px-3 py-3 text-xs text-muted-foreground">
          {emptyLabel}
        </div>
      )}
    </Card>
  );
}
