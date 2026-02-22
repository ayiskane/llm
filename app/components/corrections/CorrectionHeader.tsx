"use client";

import { FaLocationDot } from "@/lib/icons";
import { cn, openInMaps } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CorrectionalCentre } from "@/types";

interface CorrectionHeaderProps {
  centre: CorrectionalCentre;
  collapsed?: boolean;
  className?: string;
}

export function CorrectionHeader({
  centre,
  collapsed = false,
  className,
}: CorrectionHeaderProps) {
  const address = centre.address ?? null;

  return (
    <div className={cn("px-4 py-2", className)}>
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <h1
              className={cn(
                "font-semibold text-foreground uppercase tracking-wide text-left whitespace-nowrap",
                "transition-all duration-300 ease-out",
                collapsed ? "text-sm" : "text-lg",
              )}
            >
              {centre.name}
            </h1>
            {!collapsed && centre.short_name && (
              <Badge variant="courtroomType" className="shrink-0">
                {centre.short_name}
              </Badge>
            )}
          </div>
        </div>

        {collapsed && centre.short_name && (
          <Badge variant="courtroomType" className="shrink-0">
            {centre.short_name}
          </Badge>
        )}

        {address && collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openInMaps(address)}
            className="h-8 w-8 bg-secondary/50 hover:bg-secondary/70 shrink-0"
          >
            <FaLocationDot className="w-4 h-4 text-primary" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          collapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden text-left">
          {address && (
            <Button
              variant="link"
              onClick={() => openInMaps(address)}
              className="h-auto p-0 justify-start gap-1 text-xs mt-1 text-muted-foreground hover:text-primary"
            >
              <FaLocationDot className="w-3 h-3 shrink-0" />
              <span className="text-left">{address}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
