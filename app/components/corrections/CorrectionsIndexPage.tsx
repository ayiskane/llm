"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaBuildingShield } from "@/lib/icons";
import { AlphabetNav } from "@/app/components/ui";
import {
  Card,
  CardListItem,
  CardListItemTitle,
  CardListItemDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
    variant: isFederal ? "federal" : isProvincial ? "provincial" : "courtroomType",
  } as const;
}

// =============================================================================
// TYPES & HELPERS
// =============================================================================

function groupByLetter(centres: CorrectionalCentre[]) {
  const grouped = centres.reduce(
    (acc, c) => {
      const letter = /[A-Z]/.test(c.name[0]) ? c.name[0].toUpperCase() : "#";
      (acc[letter] ??= []).push(c);
      return acc;
    },
    {} as Record<string, CorrectionalCentre[]>,
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)))
    .map(([letter, centres]) => ({ letter, centres }));
}

function CentreListItem({
  centre,
  onClick,
}: {
  centre: CorrectionalCentre;
  onClick: () => void;
}) {
  const region = getRegionInfo(centre);
  const typeInfo = getTypeInfo(centre);
  return (
    <CardListItem onClick={onClick}>
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
}

function LetterSection({
  letter,
  centres,
  onCentreClick,
}: {
  letter: string;
  centres: CorrectionalCentre[];
  onCentreClick: (id: number) => void;
}) {
  return (
    <div id={`section-${letter}`} data-letter={letter}>
      <div className="sticky top-0 z-10 px-4 py-2 bg-background border-b border-border">
        <span className="text-sm font-bold text-primary">{letter}</span>
      </div>
      <Card variant="list">
        {centres.map((c) => (
          <CentreListItem
            key={c.id}
            centre={c}
            onClick={() => onCentreClick(c.id)}
          />
        ))}
      </Card>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CorrectionsIndexPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { centres, isLoading, error } = useCorrectionals();
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const handleCentreClick = useCallback(
    (centreId: number) => router.push(`/corrections/${centreId}`),
    [router],
  );

  const groupedCentres = useMemo(
    () => groupByLetter(centres),
    [centres],
  );
  const availableLetters = useMemo(
    () => groupedCentres.map((g) => g.letter),
    [groupedCentres],
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

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="shrink-0 bg-background border-b border-border">
          <div className="px-4 pt-4 pb-2">
            <Skeleton className="h-7 w-48" />
          </div>
        </div>
        <div className="flex-1 px-4 py-2 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="py-3 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
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
          <p className="text-destructive mb-2">Failed to load centres</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="shrink-0 bg-background border-b border-border">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-foreground">
            BC Corrections Index
          </h1>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {groupedCentres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaBuildingShield className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center">
                No centres available.
              </p>
            </div>
          ) : (
            <>
              {groupedCentres.map((group) => (
                <LetterSection
                  key={group.letter}
                  letter={group.letter}
                  centres={group.centres}
                  onCentreClick={handleCentreClick}
                />
              ))}
              <div className="py-4 text-center">
                <span className="text-xs text-muted-foreground">
                  {centres.length} {centres.length === 1 ? "centre" : "centres"}
                </span>
              </div>
            </>
          )}
        </div>

        {availableLetters.length > 1 && (
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
