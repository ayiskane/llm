"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FaMagnifyingGlass,
  FaXmark,
  FaLocationDot,
  FaSliders,
} from "@/lib/icons";
import { AlphabetNav } from "@/app/components/ui";
import { Card, CardListItem, CardListItemTitle, CardListItemDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { REGIONS } from "@/lib/config/constants";
import { useCourts, type CourtIndexItem } from "@/lib/hooks/useCourts";
import { getCourtDisplayName } from "@/lib/utils";

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/** Pre-computed lookup map for region codes */
const REGION_CODE_MAP = Object.fromEntries(
  REGIONS.map((r) => [r.id, r.code])
) as Record<number, string>;

/** Get region code by ID from pre-computed map */
function getRegionCode(regionId: number | null | undefined): string {
  if (!regionId) return "R?";
  return REGION_CODE_MAP[regionId] || "R?";
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}

function groupCourtsByLetter(courts: CourtIndexItem[]): GroupedCourts[] {
  const grouped = courts.reduce(
    (acc, court) => {
      const firstChar = court.name.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : "#";
      (acc[letter] ??= []).push(court);
      return acc;
    },
    {} as Record<string, CourtIndexItem[]>,
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)))
    .map(([letter, courts]) => ({ letter, courts }));
}

// =============================================================================
// TYPES
// =============================================================================

interface GroupedCourts {
  letter: string;
  courts: CourtIndexItem[];
}
type CourtTypeFilter = "all" | "staffed" | "circuit";
type CourtLevelFilter = "all" | "pc" | "sc";
interface Filters {
  region: number;
  courtType: CourtTypeFilter;
  courtLevel: CourtLevelFilter;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SearchBar({
  value,
  onChange,
  onClear,
  onFilterClick,
  hasActiveFilters,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Input
          type="text"
          variant="search"
          size="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search courts..."
          className="pl-11 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <FaXmark className="w-4 h-4" />
          </Button>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onFilterClick}
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
    </div>
  );
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
          onValueChange={(value) => onFilterChange({ ...filters, courtType: value as CourtTypeFilter })}
          className="flex-1"
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="all" className="flex-1 text-xs px-2.5 py-1">All</TabsTrigger>
            <TabsTrigger value="staffed" className="flex-1 text-xs px-2.5 py-1">Staffed</TabsTrigger>
            <TabsTrigger value="circuit" className="flex-1 text-xs px-2.5 py-1">Circuit</TabsTrigger>
          </TabsList>
        </Tabs>
        <Tabs
          value={filters.courtLevel}
          onValueChange={(value) => onFilterChange({ ...filters, courtLevel: value as CourtLevelFilter })}
          className="flex-1"
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="all" className="flex-1 text-xs px-2.5 py-1">All</TabsTrigger>
            <TabsTrigger value="pc" className="flex-1 text-xs px-2.5 py-1">PC</TabsTrigger>
            <TabsTrigger value="sc" className="flex-1 text-xs px-2.5 py-1">SC</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Region */}
      <Tabs
        value={String(filters.region)}
        onValueChange={(value) => onFilterChange({ ...filters, region: Number(value) })}
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

function CourtListItems({
  letter,
  courts,
  onCourtClick,
}: {
  letter: string;
  courts: CourtIndexItem[];
  onCourtClick: (id: number) => void;
}) {
  return (
    <div id={`section-${letter}`} data-letter={letter}>
      <div className="sticky top-0 z-10 px-4 py-2 bg-background border-b border-border">
        <span className="text-sm font-bold text-primary">{letter}</span>
      </div>

      <Card variant="list">
        {courts.map((court) => (
          <CardListItem key={court.id} onClick={() => onCourtClick(court.id)}>
            <CardListItemTitle>
              {getCourtDisplayName(court)}
            </CardListItemTitle>
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
        ))}
      </Card>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CourtsIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    region: Number(searchParams.get("region")) || 0,
    courtType: (searchParams.get("type") as CourtTypeFilter) || "all",
    courtLevel: (searchParams.get("level") as CourtLevelFilter) || "all",
  });
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250);
  const { courts, isLoading, error } = useCourts();

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.region !== 0) params.set("region", String(filters.region));
    if (filters.courtType !== "all") params.set("type", filters.courtType);
    if (filters.courtLevel !== "all") params.set("level", filters.courtLevel);
    if (debouncedSearchQuery) params.set("q", debouncedSearchQuery);
    router.replace(params.toString() ? `?${params.toString()}` : "/", {
      scroll: false,
    });
  }, [filters, debouncedSearchQuery, router]);

  const hasActiveFilters =
    filters.region !== 0 ||
    filters.courtType !== "all" ||
    filters.courtLevel !== "all";
  const clearAllFilters = useCallback(() => {
    setFilters({ region: 0, courtType: "all", courtLevel: "all" });
    setSearchQuery("");
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
    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          getCourtDisplayName(c).toLowerCase().includes(q) ||
          c.region_name.toLowerCase().includes(q),
      );
    }
    return result;
  }, [courts, filters, debouncedSearchQuery]);

  const groupedCourts = useMemo(
    () => groupCourtsByLetter(filteredCourts),
    [filteredCourts],
  );
  const availableLetters = useMemo(
    () => groupedCourts.map((g) => g.letter),
    [groupedCourts],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableLetters.length === 0) return;

    const handleScroll = () => {
      const sections = container.querySelectorAll("[data-letter]");
      let currentLetter: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top <= containerRect.top + 50) {
          currentLetter = section.getAttribute("data-letter");
        }
      });

      setActiveLetter(currentLetter || availableLetters[0]);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [availableLetters]);

  const handleLetterChange = useCallback((letter: string) => {
    const section = document.getElementById(`section-${letter}`);
    if (section) {
      section.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  const handleCourtClick = useCallback(
    (courtId: number) => router.push(`/court/${courtId}`),
    [router],
  );

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header skeleton */}
        <div className="shrink-0 bg-background border-b border-border">
          <div className="px-4 pt-4 pb-2">
            <Skeleton className="h-7 w-40" />
          </div>
          <div className="px-4 pb-3 flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
        {/* List skeleton */}
        <div className="flex-1 px-4 py-2 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="py-3 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-2">Failed to load courts</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="shrink-0 bg-background border-b border-border">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-foreground">BC Court Index</h1>
        </div>
        <div className="px-4 pb-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            onFilterClick={() => setIsFilterOpen(true)}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Filter Sheet */}
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
            <Button
              onClick={() => setIsFilterOpen(false)}
              className="flex-1"
            >
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-h-0 relative">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {groupedCourts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaLocationDot className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center">
                {searchQuery
                  ? `No courts found for "${searchQuery}"`
                  : "No courts match your search criteria."}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    clearAllFilters();
                  }}
                  className="mt-4 text-sm"
                >
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <>
              {groupedCourts.map((group) => (
                <CourtListItems
                  key={group.letter}
                  letter={group.letter}
                  courts={group.courts}
                  onCourtClick={handleCourtClick}
                />
              ))}
              <div className="py-4 text-center">
                <span className="text-xs text-muted-foreground">
                  {filteredCourts.length}{" "}
                  {filteredCourts.length === 1 ? "court" : "courts"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* AlphabetNav - positioned absolute within relative container */}
        {!searchQuery && availableLetters.length > 1 && (
          <AlphabetNav
            availableLetters={availableLetters}
            activeLetter={activeLetter}
            onLetterChange={handleLetterChange}
          />
        )}
      </div>
    </div>
  );
}
