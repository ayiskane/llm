"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { FaArrowLeft } from "@/lib/icons";
import { StickyHeader } from "../layouts/StickyHeader";
import { CourtHeader, type CourtViewMode } from "./CourtHeader";
import {
  CourtModeNav,
  CourtModeContent,
  type CourtSection,
} from "./CourtModeContent";
import {
  BailModeNav,
  BailModeContent,
  type BailAccordionSection,
} from "./BailModeContent";
import {
  useBailDetails,
  useCourtScheduleDates,
  useCourtSections,
} from "@/lib/hooks";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { CourtDetails } from "@/types";

interface CourtDetailPageProps {
  courtDetails: CourtDetails;
  onBack?: () => void;
  onNavigateToCourt?: (courtId: number) => void;
}

export function CourtDetailPage({
  courtDetails,
  onBack,
  onNavigateToCourt,
}: CourtDetailPageProps) {
  const {
    court,
    teamsLinks,
    courtroomSchedules,
    bailHub: bailHubSummary,
  } = courtDetails;

  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<CourtViewMode>(() => {
    if (court.has_provincial) return "provincial";
    if (court.is_fnc && !court.is_circuit) return "fnc";
    if (court.has_supreme) return "supreme";
    return "provincial";
  });
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { contacts } = useCourtSections(court, viewMode);
  const isBailMode = viewMode === "bail";
  const {
    data: bailDetails,
    isLoading: bailLoading,
    error: bailError,
  } = useBailDetails(court, isBailMode);

  // Separate expanded section state for each mode
  const [courtActiveSection, setCourtActiveSection] =
    useState<CourtSection>("contacts");
  const showSchedule = court.is_circuit || viewMode === "fnc";
  const scheduleEnabled = courtActiveSection === "schedule" && showSchedule;
  const { data: scheduleDates, isLoading: scheduleLoading } =
    useCourtScheduleDates(court.id, scheduleEnabled);
  const [bailExpandedSection, setBailExpandedSection] =
    useState<BailAccordionSection>("contacts");
  const isBailHubLocation = bailHubSummary?.court_id === court.id;
  const hasBailData = Boolean(bailHubSummary);
  const bailHub = bailDetails?.bailHub ?? null;
  const bailTeams = bailDetails?.bailTeams ?? [];
  const bailContacts = bailDetails?.bailContacts ?? [];
  const cells = bailDetails?.cells ?? [];
  const allowedModes = useMemo(() => {
    const modes: CourtViewMode[] = [];
    if (court.has_provincial) modes.push("provincial");
    if (court.is_fnc && !court.is_circuit) modes.push("fnc");
    if (court.has_supreme) modes.push("supreme");
    if (hasBailData) modes.push("bail");
    return modes;
  }, [
    court.has_provincial,
    court.has_supreme,
    court.is_fnc,
    court.is_circuit,
    hasBailData,
  ]);

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
          hasBailHub={hasBailData || Boolean(isBailHubLocation)}
        />

        {/* Mode-specific nav pills */}
        {isBailMode ? (
          bailLoading ? (
            <div className="flex gap-2 px-3 py-2">
              <Skeleton className="h-8 flex-1 rounded-full" />
              <Skeleton className="h-8 flex-1 rounded-full" />
            </div>
          ) : bailHub ? (
            isBailHubLocation ? (
              <BailModeNav
                bailTeams={bailTeams}
                expandedSection={bailExpandedSection}
                onNavigateToSection={setBailExpandedSection}
              />
            ) : null
          ) : null
        ) : (
          <CourtModeNav
            contactCount={contacts.count}
            teamsLinks={teamsLinks}
            showSchedule={showSchedule}
            activeSection={courtActiveSection}
            onNavigateToSection={setCourtActiveSection}
          />
        )}
      </StickyHeader>

      {/* Scrollable content - mode-specific */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        {isBailMode ? (
          bailLoading ? (
            <div className="p-3 space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : bailError ? (
            <div className="p-3 text-sm text-destructive">{bailError}</div>
          ) : bailHub ? (
            <BailModeContent
              courtId={court.id}
              bailHub={bailHub}
              bailContacts={bailContacts}
              bailTeams={bailTeams}
              courtroomSchedules={courtroomSchedules}
              cells={cells}
              expandedSection={bailExpandedSection}
              onCopy={copyToClipboard}
              isCopied={isCopied}
              onNavigateToCourt={onNavigateToCourt}
            />
          ) : null
        ) : (
          <CourtModeContent
            court={court}
            viewMode={viewMode}
            teamsLinks={teamsLinks}
            courtroomSchedules={courtroomSchedules}
            contactEmailGroups={contacts.emailGroups}
            contactPhones={contacts.phones}
            contactCount={contacts.count}
            scheduleDates={scheduleDates}
            scheduleLoading={scheduleLoading}
            activeSection={courtActiveSection}
            onCopy={copyToClipboard}
            isCopied={isCopied}
            onNavigateToCourt={onNavigateToCourt}
          />
        )}
      </div>
    </div>
  );
}
