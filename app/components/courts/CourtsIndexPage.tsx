"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaLocationDot, FaSliders } from "@/lib/icons";
import { AlphabetIndexPage } from "@/app/components/ui";
import {
  CardListItem,
  CardListItemTitle,
  CardListItemDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { REGIONS } from "@/lib/config/constants";
import { useCourts } from "@/lib/hooks/useCourts";
import { getCourtDisplayName } from "@/lib/utils";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Pre-computed lookup map for region codes */
const REGION_CODE_MAP = Object.fromEntries(
  REGIONS.map((r) => [r.id, r.code]),
) as Record<number, string>;

/** Get region code by ID from pre-computed map */
function getRegionCode(regionId: number | null | undefined): string {
  if (!regionId) return "R?";
  return REGION_CODE_MAP[regionId] || "R?";
}

type CourtTypeFilter = "all" | "staffed" | "circuit";
type CourtLevelFilter = "all" | "pc" | "sc";
interface Filters {
  region: number;
  courtType: CourtTypeFilter;
  courtLevel: CourtLevelFilter;
}

function FilterModalContent({
  filters,
  onFilterChange,
}: {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}) {
  return (
    <div className="space-y-4">
      {/* Court Type & Level */}
      <div className="flex gap-2">
        <Tabs
          value={filters.courtType}
          onValueChange={(value) =>
            onFilterChange({ ...filters, courtType: value as CourtTypeFilter })
          }
          className="flex-1"
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="all" className="flex-1 text-xs px-2.5 py-1">
              All
            </TabsTrigger>
            <TabsTrigger value="staffed" className="flex-1 text-xs px-2.5 py-1">
              Staffed
            </TabsTrigger>
            <TabsTrigger value="circuit" className="flex-1 text-xs px-2.5 py-1">
              Circuit
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={filters.courtLevel}
          onValueChange={(value) =>
            onFilterChange({
              ...filters,
              courtLevel: value as CourtLevelFilter,
            })
          }
          className="flex-1"
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="all" className="flex-1 text-xs px-2.5 py-1">
              All
            </TabsTrigger>
            <TabsTrigger value="pc" className="flex-1 text-xs px-2.5 py-1">
              PC
            </TabsTrigger>
            <TabsTrigger value="sc" className="flex-1 text-xs px-2.5 py-1">
              SC
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Region */}
      <Tabs
        value={String(filters.region)}
        onValueChange={(value) =>
          onFilterChange({ ...filters, region: Number(value) })
        }
      >
        <TabsList className="h-8 w-full">
          {REGIONS.map((region) => (
            <TabsTrigger
              key={region.id}
              value={String(region.id)}
              className="flex-1 text-xs px-1.5 py-1"
            >
              {region.id === 0 ? "All" : region.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CourtsIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFilterEnabled = false;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    region: Number(searchParams.get("region")) || 0,
    courtType: (searchParams.get("type") as CourtTypeFilter) || "all",
    courtLevel: (searchParams.get("level") as CourtLevelFilter) || "all",
  });
  const { courts, isLoading, error } = useCourts();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.region !== 0) params.set("region", String(filters.region));
    if (filters.courtType !== "all") params.set("type", filters.courtType);
    if (filters.courtLevel !== "all") params.set("level", filters.courtLevel);
    router.replace(params.toString() ? `?${params.toString()}` : "/", {
      scroll: false,
    });
  }, [filters, router]);

  const hasActiveFilters =
    filters.region !== 0 ||
    filters.courtType !== "all" ||
    filters.courtLevel !== "all";
  const clearAllFilters = useCallback(() => {
    setFilters({ region: 0, courtType: "all", courtLevel: "all" });
  }, []);

  const filteredCourts = useMemo(() => {
    let result = courts;
    if (filters.region !== 0)
      result = result.filter((c) => c.region_id === filters.region);
    if (filters.courtType === "staffed")
      result = result.filter((c) => !c.is_circuit);
    else if (filters.courtType === "circuit")
      result = result.filter((c) => c.is_circuit);
    if (filters.courtLevel === "pc")
      result = result.filter((c) => c.has_provincial);
    else if (filters.courtLevel === "sc")
      result = result.filter((c) => c.has_supreme);
    return result;
  }, [courts, filters]);

  const handleCourtClick = useCallback(
    (courtId: number) => router.push(`/court/${courtId}`),
    [router],
  );

  return (
    <>
      <AlphabetIndexPage
        title="BC Court Index"
        items={filteredCourts}
        getItemKey={(court) => court.id}
        getItemLabel={getCourtDisplayName}
        renderItem={(court) => (
          <CardListItem onClick={() => handleCourtClick(court.id)}>
            <CardListItemTitle>{getCourtDisplayName(court)}</CardListItemTitle>
            <CardListItemDescription>
              <Badge variant="region" className="gap-1">
                <span>{getRegionCode(court.region_id)}</span>
                <span className="text-muted-foreground/50">|</span>
                <span>{court.region_name}</span>
              </Badge>
              {court.has_provincial && <Badge variant="provincial">PC</Badge>}
              {court.has_supreme && <Badge variant="supreme">SC</Badge>}
              {court.is_circuit && <Badge variant="circuit">Circuit</Badge>}
            </CardListItemDescription>
          </CardListItem>
        )}
        isLoading={isLoading}
        error={error}
        errorTitle="Failed to load courts"
        countLabel={(count) =>
          `${count} ${count === 1 ? "court" : "courts"}`
        }
        emptyContent={
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <FaLocationDot className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-center">
              No courts match your filters.
            </p>
            {hasActiveFilters && (
              <Button
                variant="link"
                onClick={clearAllFilters}
                className="mt-4 text-sm"
              >
                Clear Filters
              </Button>
            )}
          </div>
        }
        headerAction={
          isFilterEnabled ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className={`relative w-10 h-10 rounded-xl border ${
                hasActiveFilters
                  ? "bg-primary/20 border-primary/50 text-primary"
                  : "bg-secondary/50 border-border text-muted-foreground"
              }`}
            >
              <FaSliders className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full" />
              )}
            </Button>
          ) : null
        }
      />

      <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle>Filter Courts</SheetTitle>
          </SheetHeader>
          <FilterModalContent filters={filters} onFilterChange={setFilters} />
          <SheetFooter className="pt-4 flex-row gap-3">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="flex-1 border border-border"
              >
                Reset
              </Button>
            )}
            <Button onClick={() => setIsFilterOpen(false)} className="flex-1">
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
