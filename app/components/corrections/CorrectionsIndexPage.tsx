"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  AlphabetIndexPage,
  IndexListItem,
  RegionBadge,
} from "@/app/components/ui";
import { Badge } from "@/components/ui/badge";
import { useCorrectionals } from "@/lib/hooks";
import type { CorrectionalCentre } from "@/types";

const CentreListItem = memo(function CentreListItem({
  centre,
  onSelect,
}: {
  centre: CorrectionalCentre;
  onSelect: (centreId: number) => void;
}) {
  const typeName = (centre.type_name ?? "").trim().toLowerCase();
  const isFederal = typeName === "federal";
  const isProvincial = typeName === "provincial";
  const isYouth = typeName === "youth";
  const handleClick = useCallback(
    () => onSelect(centre.id),
    [centre.id, onSelect],
  );
  return (
    <IndexListItem title={centre.name} onClick={handleClick}>
        <RegionBadge
          regionId={centre.region_id}
          regionCode={centre.region_code}
          regionName={centre.region_name}
        />
        {isFederal && <Badge variant="federal">Federal</Badge>}
        {isProvincial && <Badge variant="provincial">Provincial</Badge>}
        {isYouth && <Badge variant="circuit">Youth</Badge>}
        {!isFederal && !isProvincial && !isYouth && (
          <Badge variant="courtroomType">Other</Badge>
        )}
        {centre.short_name && (
          <Badge variant="courtroomType">{centre.short_name}</Badge>
        )}
    </IndexListItem>
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
          <p className="text-muted-foreground text-center">
            No centres available.
          </p>
        </div>
      }
    />
  );
}
