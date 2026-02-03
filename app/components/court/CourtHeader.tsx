"use client";

import { FaLocationDot } from "@/lib/icons";
import { cn, getCourtDisplayName, openInMaps } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Court, CourtWithRegion } from "@/types";

interface CourtHeaderProps {
  court: Court | CourtWithRegion;
  collapsed?: boolean;
  className?: string;
}

/**
 * Mobile-first animated header with smooth height transition.
 * Uses CSS grid for smooth height animation (better than max-height hack).
 */
export function CourtHeader({
  court,
  collapsed = false,
  className,
}: CourtHeaderProps) {
  const displayName = getCourtDisplayName(court);

  const region =
    "region" in court && court.region
      ? court.region
      : court.region_code
        ? { code: court.region_code, name: court.region_name || "" }
        : null;

  return (
    <div className={cn("px-4 py-2", className)}>
      {/* Title row - always visible, changes size */}
      <div className="flex items-center gap-2">
        <h1
          className={cn(
            "font-semibold text-foreground uppercase tracking-wide flex-1 truncate text-left",
            "transition-all duration-300 ease-out",
            collapsed ? "text-sm" : "text-lg",
          )}
        >
          {displayName}
        </h1>

        {/* Tags - compact when collapsed */}
        <div
          className={cn(
            "flex items-center gap-1 shrink-0 transition-opacity duration-300",
            collapsed ? "opacity-100" : "opacity-0 hidden",
          )}
        >
          {court.has_provincial && <Badge variant="provincial">PC</Badge>}
          {court.has_supreme && <Badge variant="supreme">SC</Badge>}
          {court.is_circuit && <Badge variant="circuit">CIR</Badge>}
        </div>

        {/* Map button - only in collapsed */}
        {court.address && collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openInMaps(court.address)}
            className="h-8 w-8 bg-secondary/50 hover:bg-secondary/70 shrink-0"
          >
            <FaLocationDot className="w-4 h-4 text-primary" />
          </Button>
        )}
      </div>

      {/* Expandable content - uses grid for smooth height animation */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-out",
          collapsed
            ? "grid-rows-[0fr] opacity-0"
            : "grid-rows-[1fr] opacity-100",
        )}
      >
        <div className="overflow-hidden text-left">
          {/* Address - explicitly left aligned */}
          {court.address && (
            <Button
              variant="link"
              onClick={() => openInMaps(court.address)}
              className="h-auto p-0 justify-start gap-1 text-xs mt-1 text-muted-foreground hover:text-primary"
            >
              <FaLocationDot className="w-3 h-3 shrink-0" />
              <span className="text-left">{court.address}</span>
            </Button>
          )}

          {/* Region and tags row */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {region && (
              <Badge variant="region" className="gap-1">
                <span>{region.code}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{region.name}</span>
              </Badge>
            )}
            {court.has_provincial && <Badge variant="provincial">PROVINCIAL</Badge>}
            {court.has_supreme && <Badge variant="supreme">SUPREME</Badge>}
            {court.is_circuit && <Badge variant="circuit">CIRCUIT</Badge>}
          </div>
        </div>
      </div>
    </div>
  );
}
