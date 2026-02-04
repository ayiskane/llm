"use client";

import { useState, useRef, useCallback } from "react";
import { FaArrowLeft, FaMagnifyingGlass, FaXmark } from "@/lib/icons";
import { StickyHeader } from "../layouts/StickyHeader";
import { CourtHeader, type CourtViewMode } from "./CourtHeader";
import {
  CourtModeNav,
  CourtModeContent,
  type CourtAccordionSection,
} from "./CourtModeContent";
import {
  BailModeNav,
  BailModeContent,
  type BailAccordionSection,
} from "./BailModeContent";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CourtDetails } from "@/types";

interface CourtDetailPageProps {
  courtDetails: CourtDetails;
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onNavigateToCourt?: (courtId: number) => void;
  onNavigateToBailHub?: (bailCourtId: number, fromName: string) => void;
}

export function CourtDetailPage({
  courtDetails,
  onBack,
  onSearch,
  onNavigateToCourt,
  onNavigateToBailHub,
}: CourtDetailPageProps) {
  const {
    court,
    contacts,
    cells,
    teamsLinks,
    bailCourt,
    bailTeams,
    bailContacts,
    jcmFxdSchedule,
  } = courtDetails;

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<CourtViewMode>("provincial");
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  // Separate expanded section state for each mode
  const [courtExpandedSection, setCourtExpandedSection] =
    useState<CourtAccordionSection>("contacts");
  const [bailExpandedSection, setBailExpandedSection] =
    useState<BailAccordionSection>("schedule");

  // Determine if we're in bail mode
  const isBailMode = viewMode === "bail";

  // Check if this court IS a bail hub location (not just uses one)
  // A court is a bail hub if bailCourt.court_id matches the current court's id
  const isBailHubLocation = bailCourt?.court_id === court.id;

  // TODO: Filter data by court level when database field is added
  // For now, show all data regardless of selected tab (provincial/supreme)
  const filteredContacts = contacts;
  const filteredCells = cells;
  const filteredTeamsLinks = teamsLinks;

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

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        {/* Back button + Search bar row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-1 text-muted-foreground hover:text-foreground shrink-0"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Button>

          <div className="relative flex-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="text"
              variant="search"
              size="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
              placeholder="Search courts, contacts, cells..."
              className="pl-10 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <FaXmark className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Court info section with tabs */}
        <CourtHeader
          court={court}
          collapsed={isHeaderCollapsed}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          hasBailHub={isBailHubLocation}
        />

        {/* Mode-specific nav pills */}
        {isBailMode && bailCourt ? (
          <BailModeNav
            bailCourt={bailCourt}
            bailContacts={bailContacts}
            bailTeams={bailTeams}
            expandedSection={bailExpandedSection}
            onNavigateToSection={setBailExpandedSection}
          />
        ) : (
          <CourtModeNav
            contacts={filteredContacts}
            cells={filteredCells}
            teamsLinks={filteredTeamsLinks}
            expandedSection={courtExpandedSection}
            onNavigateToSection={setCourtExpandedSection}
          />
        )}
      </StickyHeader>

      {/* Scrollable content - mode-specific */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {isBailMode && bailCourt ? (
          <BailModeContent
            bailCourt={bailCourt}
            bailContacts={bailContacts}
            bailTeams={bailTeams}
            expandedSection={bailExpandedSection}
            onExpandedSectionChange={setBailExpandedSection}
            onCopy={copyToClipboard}
            isCopied={isCopied}
          />
        ) : (
          <CourtModeContent
            court={court}
            contacts={filteredContacts}
            cells={filteredCells}
            teamsLinks={filteredTeamsLinks}
            bailCourt={bailCourt}
            jcmFxdSchedule={jcmFxdSchedule}
            expandedSection={courtExpandedSection}
            onExpandedSectionChange={setCourtExpandedSection}
            onCopy={copyToClipboard}
            isCopied={isCopied}
            onNavigateToCourt={onNavigateToCourt}
            onNavigateToBailHub={onNavigateToBailHub}
          />
        )}
      </div>
    </div>
  );
}
