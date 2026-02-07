"use client";

import { FaLocationDot } from "@/lib/icons";
import { cn, getCourtDisplayName, openInMaps } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Court, CourtWithRegion } from "@/types";

export type CourtViewMode = "provincial" | "fnc" | "supreme"; // | "bail";

interface CourtHeaderProps {
  court: Court | CourtWithRegion;
  collapsed?: boolean;
  className?: string;
  viewMode?: CourtViewMode;
  onViewModeChange?: (mode: CourtViewMode) => void;
  // hasBailHub?: boolean;
}

export function CourtHeader({
  court,
  collapsed = false,
  className,
  viewMode,
  onViewModeChange,
  // hasBailHub = false,
}: CourtHeaderProps) {
  const displayName = getCourtDisplayName(court);
  const fncAddress =
    'fnc_address' in court ? court.fnc_address ?? null : null;
  const formattedAddress = court.address ?? null;
  const addressForView =
    viewMode === 'fnc' &&
    fncAddress &&
    fncAddress.trim().toLowerCase() !== (formattedAddress ?? '').trim().toLowerCase()
      ? fncAddress
      : formattedAddress;

  const region =
    "region" in court && court.region
      ? court.region
      : court.region_code
        ? { code: court.region_code, name: court.region_name || "" }
        : null;

  const hasProvincial = court.has_provincial;
  const hasSupreme = court.has_supreme;
  const hasFnc = court.is_fnc;
  const availableModes = [hasProvincial, hasFnc, hasSupreme].filter(Boolean);
  const showTabs = availableModes.length > 1;

  return (
    <div className={cn("px-4 py-2", className)}>
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

        {addressForView && collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => openInMaps(addressForView)}
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
          {addressForView && (
            <Button
              variant="link"
              onClick={() => openInMaps(addressForView)}
              className="h-auto p-0 justify-start gap-1 text-xs mt-1 text-muted-foreground hover:text-primary"
            >
              <FaLocationDot className="w-3 h-3 shrink-0" />
              <span className="text-left">{addressForView}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Three-tab system: Provincial | Supreme | Bail */}
      {showTabs && viewMode && onViewModeChange && (
        <div className="mt-2">
          <Tabs
            value={viewMode}
            onValueChange={(v) => onViewModeChange(v as CourtViewMode)}
          >
            <TabsList className="w-full h-8">
              {hasProvincial && (
                <TabsTrigger
                  value="provincial"
                  className={cn(
                    "flex-1 text-[10px] gap-1 tracking-widest",
                    viewMode === "provincial" &&
                      "data-[state=active]:bg-semantic-emerald/20 data-[state=active]:text-semantic-emerald",
                  )}
                >
                  PROVINCIAL
                </TabsTrigger>
              )}
              {hasFnc && (
                <TabsTrigger
                  value="fnc"
                  className={cn(
                    "flex-1 text-[10px] gap-1 tracking-widest",
                    viewMode === "fnc" &&
                      "data-[state=active]:bg-semantic-sky/20 data-[state=active]:text-semantic-sky",
                  )}
                >
                  FNC
                </TabsTrigger>
              )}
              {hasSupreme && (
                <TabsTrigger
                  value="supreme"
                  className={cn(
                    "flex-1 text-[10px] gap-1 tracking-widest",
                    viewMode === "supreme" &&
                      "data-[state=active]:bg-semantic-purple/20 data-[state=active]:text-semantic-purple",
                  )}
                >
                  SUPREME
                </TabsTrigger>
              )}
              {/* {hasBail && (
                <TabsTrigger
                  value="bail"
                  className={cn(
                    "flex-1 text-[10px] gap-1 tracking-widest",
                    viewMode === "bail" &&
                      "data-[state=active]:bg-semantic-amber/20 data-[state=active]:text-semantic-amber",
                  )}
                >
                  BAIL
                </TabsTrigger>
              )} */}
            </TabsList>
          </Tabs>
        </div>
      )}
    </div>
  );
}
