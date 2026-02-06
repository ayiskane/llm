"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FaArrowLeft } from "@/lib/icons";
import { StickyHeader } from "../layouts/StickyHeader";
import { CourtHeader, type CourtViewMode } from "./CourtHeader";
import {
  CourtModeNav,
  CourtModeContent,
  type CourtAccordionSection,
} from "./CourtModeContent";
// import {
//   BailModeNav,
//   BailModeContent,
//   type BailAccordionSection,
// } from "./BailModeContent";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import type { CourtDetails } from "@/types";

interface CourtDetailPageProps {
  courtDetails: CourtDetails;
  onBack?: () => void;
  onNavigateToCourt?: (courtId: number) => void;
  // onNavigateToBailHub?: (bailHubId: number, fromName: string) => void;
}

export function CourtDetailPage({
  courtDetails,
  onBack,
  onNavigateToCourt,
  // onNavigateToBailHub,
}: CourtDetailPageProps) {
  const {
    court,
    teamsLinks,
    // bailHub,
    // bailTeams,
    // bailContacts,
  } = courtDetails;

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<CourtViewMode>(() => {
    if (court.has_provincial) return "provincial";
    if (court.has_supreme) return "supreme";
    return "provincial";
  });
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Separate expanded section state for each mode
  const [courtExpandedSection, setCourtExpandedSection] =
    useState<CourtAccordionSection>("contacts");
  // const [bailExpandedSection, setBailExpandedSection] =
  //   useState<BailAccordionSection>("contacts");
  // const isBailMode = viewMode === "bail";
  // const isBailHubLocation = bailHub?.court_id === court.id;
  const allowedModes = useMemo(() => {
    const modes: CourtViewMode[] = [];
    if (court.has_provincial) modes.push("provincial");
    if (court.has_supreme) modes.push("supreme");
    return modes;
  }, [court.has_provincial, court.has_supreme]);

  useEffect(() => {
    if (allowedModes.length === 0) return;
    if (!allowedModes.includes(viewMode)) {
      setViewMode(allowedModes[0]);
    }
  }, [allowedModes, viewMode]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;
      const wasCollapsed = isHeaderCollapsed;

      if (!wasCollapsed && scrollTop > 80) {
        setIsHeaderCollapsed(true);
      } else if (wasCollapsed && scrollTop < 30) {
        setIsHeaderCollapsed(false);
      }
    },
    [isHeaderCollapsed],
  );

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        {/* Back button row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-1 text-muted-foreground hover:text-foreground shrink-0"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Court info section with tabs */}
        <CourtHeader
          court={court}
          collapsed={isHeaderCollapsed}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          // hasBailHub={isBailHubLocation}
        />

        {/* Mode-specific nav pills */}
        <CourtModeNav
          court={court}
          viewMode={viewMode as "provincial" | "supreme"}
          teamsLinks={teamsLinks}
          expandedSection={courtExpandedSection}
          onNavigateToSection={setCourtExpandedSection}
        />
      </StickyHeader>

      {/* Scrollable content - mode-specific */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        <CourtModeContent
          court={court}
          viewMode={viewMode as "provincial" | "supreme"}
          teamsLinks={teamsLinks}
          expandedSection={courtExpandedSection}
          onExpandedSectionChange={setCourtExpandedSection}
          onCopy={copyToClipboard}
          isCopied={isCopied}
          onNavigateToCourt={onNavigateToCourt}
        />
      </div>
    </div>
  );
}
