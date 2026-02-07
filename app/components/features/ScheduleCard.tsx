"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
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
import { FaCalendar } from "@/lib/icons";
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
}

export function ScheduleCard({
  title = "Sitting Dates",
  dates,
  emptyLabel = "No sitting dates published yet.",
}: ScheduleCardProps) {
  const today = useMemo(() => {
    const current = new Date();
    current.setHours(0, 0, 0, 0);
    return current;
  }, []);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date());
  const groups = useMemo(() => groupScheduleDates(dates), [dates]);
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
  const pastSittingDates = useMemo(
    () => sittingDates.filter((date) => date.getTime() < today.getTime()),
    [sittingDates, today],
  );
  const upcomingSittingDates = useMemo(
    () => sittingDates.filter((date) => date.getTime() >= today.getTime()),
    [sittingDates, today],
  );
  const sittingDateKeys = useMemo(
    () => new Set(sittingDates.map((date) => toDateKey(date))),
    [sittingDates],
  );
  const nextSittingDate = useMemo<Date | null>(() => {
    let next: Date | null = null;
    sittingDates.forEach((date) => {
      if (date.getTime() < today.getTime()) return;
      if (!next || date.getTime() < next.getTime()) {
        next = date;
      }
    });
    return next;
  }, [sittingDates, today]);
  const nextSittingKey =
    nextSittingDate === null
      ? null
      : `${nextSittingDate.getFullYear()}-${nextSittingDate.getMonth()}`;
  const hasDates = groups.length > 0;
  const isCurrentMonth =
    visibleMonth.getFullYear() === today.getFullYear() &&
    visibleMonth.getMonth() === today.getMonth();
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

      {hasDates ? (
        <Tabs defaultValue="calendar" className="p-3 pt-2">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 px-3 py-1 text-sm"
              onClick={() => setVisibleMonth(new Date())}
              disabled={isCurrentMonth}
            >
              Current month
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
                <Calendar
                  mode="single"
                  navLayout="around"
                  showOutsideDays={false}
                  onSelect={() => undefined}
                  month={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  className="w-fit"
                  classNames={{
                    months:
                      "flex w-fit flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "grid w-fit grid-cols-[auto_1fr_auto] gap-y-4",
                    month_grid: "col-span-3 row-start-2 w-fit border-separate border-spacing-1",
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
                  disabled={(date) => !sittingDateKeys.has(toDateKey(date))}
                />
              </div>
              </div>
            </div>
            <DateLegend className="mt-3" items={legendItems} />
          </TabsContent>

          <TabsContent value="list">
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead className="w-35">Month</TableHead>
                    <TableHead>Dates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => {
                    const [year] = group.key.split("-");
                    const isNextRow = nextSittingKey === group.key;
                    return (
                      <TableRow
                        key={group.key}
                        className={cn(
                          isNextRow && "bg-semantic-blue-bg hover:bg-semantic-blue-bg",
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
                                  isNextRow && "border-accent-foreground/60",
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
