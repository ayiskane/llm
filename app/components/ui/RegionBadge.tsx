"use client";

import { Badge } from "@/components/ui/badge";
import { REGIONS } from "@/lib/config/constants";

/** Pre-computed lookup map for region codes */
const REGION_CODE_MAP = Object.fromEntries(
  REGIONS.map((region) => [region.id, region.code]),
) as Record<number, string>;

function getRegionCode(
  regionId: number | null | undefined,
  regionCode?: string | null,
) {
  if (regionCode) return regionCode;
  if (!regionId) return "R?";
  return REGION_CODE_MAP[regionId] || "R?";
}

interface RegionBadgeProps {
  regionId?: number | null;
  regionCode?: string | null;
  regionName?: string | null;
  className?: string;
}

export function RegionBadge({
  regionId,
  regionCode,
  regionName,
  className,
}: RegionBadgeProps) {
  const code = getRegionCode(regionId, regionCode);
  const name = regionName ?? "Unknown";
  const classes = className ? `gap-1 ${className}` : "gap-1";

  return (
    <Badge variant="region" className={classes}>
      <span>{code}</span>
      <span className="text-muted-foreground/50">|</span>
      <span>{name}</span>
    </Badge>
  );
}
