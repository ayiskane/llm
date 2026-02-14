"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlphabetIndexPage } from "@/app/components/ui";
import {
  CardListItem,
  CardListItemTitle,
  CardListItemDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REGIONS } from "@/lib/config/constants";
import { useCorrectionals } from "@/lib/hooks";
import type { CorrectionalCentre } from "@/types";

// =============================================================================
// CONSTANTS
// =============================================================================

const CENTRE_TYPE = {
  PROVINCIAL: 1,
  FEDERAL: 2,
} as const;

const REGION_CODE_MAP = Object.fromEntries(
  REGIONS.map((region) => [region.id, region.code]),
) as Record<number, string>;

const REGION_NAME_MAP = Object.fromEntries(
  REGIONS.map((region) => [region.id, region.name]),
) as Record<number, string>;

function getRegionInfo(centre: CorrectionalCentre) {
  const regionId = centre.region_id ?? 0;
  return {
    code: centre.region_code ?? REGION_CODE_MAP[regionId] ?? "R?",
    name: centre.region_name ?? REGION_NAME_MAP[regionId] ?? "Unknown",
  };
}

function getTypeInfo(centre: CorrectionalCentre) {
  const isFederal = centre.type_id === CENTRE_TYPE.FEDERAL;
  const isProvincial = centre.type_id === CENTRE_TYPE.PROVINCIAL;
  const label =
    centre.type_name?.trim() ||
    (isFederal ? "Federal" : isProvincial ? "Provincial" : "Other");

  return {
    label,
    variant: isFederal ? "supreme" : isProvincial ? "provincial" : "courtroomType",
  } as const;
}

const CentreListItem = memo(function CentreListItem({
  centre,
  onSelect,
}: {
  centre: CorrectionalCentre;
  onSelect: (centreId: number) => void;
}) {
  const region = getRegionInfo(centre);
  const typeInfo = getTypeInfo(centre);
  const handleClick = useCallback(
    () => onSelect(centre.id),
    [centre.id, onSelect],
  );
  return (
    <CardListItem onClick={handleClick}>
      <CardListItemTitle>{centre.name}</CardListItemTitle>
      <CardListItemDescription>
        <Badge variant="region" className="gap-1">
          <span>{region.code}</span>
          <span className="text-muted-foreground/50">|</span>
          <span>{region.name}</span>
        </Badge>
        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
        {centre.short_name && (
          <Badge variant="courtroomType">{centre.short_name}</Badge>
        )}
      </CardListItemDescription>
    </CardListItem>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CorrectionsIndexPage() {
  const router = useRouter();
  const { centres, isLoading, error } = useCorrectionals();

  const handleCentreClick = useCallback(
    (centreId: number) => router.push(`/corrections/${centreId}`),
    [router],
  );
  const renderCentreItem = useCallback(
    (centre: CorrectionalCentre) => (
      <CentreListItem centre={centre} onSelect={handleCentreClick} />
    ),
    [handleCentreClick],
  );

  return (
    <AlphabetIndexPage
      title="BC Corrections Index"
      items={centres}
      getItemKey={(centre) => centre.id}
      getItemLabel={(centre) => centre.name}
      renderItem={renderCentreItem}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load centres"
      countLabel={(count) =>
        `${count} ${count === 1 ? "centre" : "centres"}`
      }
      emptyContent={
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <FaBuildingShield className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-center">
            No centres available.
          </p>
        </div>
      }
    />
  );
}
