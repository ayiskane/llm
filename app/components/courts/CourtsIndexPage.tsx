"use client";

import { memo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaLocationDot } from "@/lib/icons";
import {
  AlphabetIndexPage,
  IndexListItem,
  RegionBadge,
} from "@/app/components/ui";
import { Badge } from "@/components/ui/badge";
import { useCourts } from "@/lib/hooks/useCourts";
import { getCourtDisplayName } from "@/lib/utils";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const CourtListItem = memo(function CourtListItem({
  court,
  onSelect,
}: {
  court: any;
  onSelect: (courtId: number) => void;
}) {
  const displayName = getCourtDisplayName(court);
  const handleClick = useCallback(
    () => onSelect(court.id),
    [court.id, onSelect],
  );
  return (
    <IndexListItem title={displayName} onClick={handleClick}>
        <RegionBadge
          regionId={court.region_id}
          regionCode={court.region_code}
          regionName={court.region_name}
        />
        {court.has_provincial && <Badge variant="provincial">PC</Badge>}
        {court.has_supreme && <Badge variant="supreme">SC</Badge>}
        {court.is_circuit && <Badge variant="circuit">Circuit</Badge>}
    </IndexListItem>
  );
});

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CourtsIndexPage() {
  const router = useRouter();
  const { courts, isLoading, error } = useCourts();

  const handleCourtClick = useCallback(
    (courtId: number) => router.push(`/court/${courtId}`),
    [router],
  );
  const renderCourtItem = useCallback(
    (court: any) => <CourtListItem court={court} onSelect={handleCourtClick} />,
    [handleCourtClick],
  );

  return (
    <AlphabetIndexPage
      title="BC Court Index"
      items={courts}
      getItemKey={(court) => court.id}
      getItemLabel={getCourtDisplayName}
      renderItem={renderCourtItem}
      isLoading={isLoading}
      error={error}
      errorTitle="Failed to load courts"
      countLabel={(count) => `${count} ${count === 1 ? "court" : "courts"}`}
      emptyContent={
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <FaLocationDot className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground text-center">
            No courts available.
          </p>
        </div>
      }
    />
  );
}
