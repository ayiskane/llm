"use client";

import { cn } from "@/lib/utils";

export type DateLegendItem = {
  id: string;
  label: string;
  sample?: string;
  className?: string;
  sampleClassName?: string;
  labelClassName?: string;
};

interface DateLegendProps {
  items: DateLegendItem[];
  className?: string;
  itemClassName?: string;
}

export function DateLegend({ items, className, itemClassName }: DateLegendProps) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {items.map((item) => (
        <div key={item.id} className={cn("flex items-center gap-2", itemClassName)}>
          <span
            className={cn(
              "inline-flex h-7 w-7 items-center justify-center rounded-md text-[11px] font-medium",
              item.className
            )}
          >
            <span className={cn(item.sampleClassName)}>{item.sample ?? "15"}</span>
          </span>
          <span className={cn("text-[11px] text-muted-foreground", item.labelClassName)}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
