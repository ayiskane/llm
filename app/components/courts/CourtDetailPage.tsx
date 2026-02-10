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
  useBailHubDetails,
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
  const isVr9Hub =
    bailHubSummary?.id === 3 ||
    bailHubSummary?.name?.trim().toUpperCase() === "VR9";
  const vr9HubId = isVr9Hub ? 3 : Number.NaN;
  const {
    data: vr9Details,
    isLoading: vr9Loading,
    error: vr9Error,
  } = useBailHubDetails(vr9HubId);

  // Separate expanded section state for each mode
  const [courtActiveSection, setCourtActiveSection] =
    useState<CourtSection>("contacts");
  const [courtSectionsByMode, setCourtSectionsByMode] = useState<
    Partial<Record<CourtViewMode, CourtSection>>
  >({});
  const showSchedule = court.is_circuit || viewMode === "fnc";
  const scheduleEnabled = courtActiveSection === "schedule" && showSchedule;
  const { data: scheduleDates, isLoading: scheduleLoading } =
    useCourtScheduleDates(court.id, scheduleEnabled);
  const [bailExpandedSection, setBailExpandedSection] =
    useState<BailAccordionSection>("contacts");
  const isBailHubLocation = bailHubSummary?.court_id === court.id;
  const hasBailData = Boolean(bailHubSummary);
  const effectiveBailDetails = isVr9Hub ? vr9Details : bailDetails;
  const effectiveBailLoading = isVr9Hub ? vr9Loading : bailLoading;
  const effectiveBailError = isVr9Hub ? vr9Error : bailError;
  const bailHub = effectiveBailDetails?.bailHub ?? null;
  const bailTeams = effectiveBailDetails?.bailTeams ?? [];
  const bailContacts = effectiveBailDetails?.bailContacts ?? [];
  const cells = effectiveBailDetails?.cells ?? [];
  const courtroomSchedulesForBail =
    effectiveBailDetails?.courtroomSchedules ?? [];
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

  const allowedCourtSections = useMemo(() => {
    const sections: CourtSection[] = [];
    if (contacts.count > 0) sections.push("contacts");
    if (showSchedule) sections.push("schedule");
    if (teamsLinks.length > 0 && viewMode !== "fnc") sections.push("teams");
    return sections;
  }, [contacts.count, showSchedule, teamsLinks.length, viewMode]);

  useEffect(() => {
    if (isBailMode) return;
    const preferred =
      courtSectionsByMode[viewMode] ||
      (allowedCourtSections.includes("contacts") ? "contacts" : null);
    const next =
      preferred && allowedCourtSections.includes(preferred)
        ? preferred
        : allowedCourtSections[0] ?? null;
    if (next !== courtActiveSection) {
      setCourtActiveSection(next);
    }
  }, [
    allowedCourtSections,
    courtActiveSection,
    courtSectionsByMode,
    isBailMode,
    viewMode,
  ]);

  const handleCourtSectionChange = useCallback(
    (section: CourtSection) => {
      setCourtActiveSection(section);
      setCourtSectionsByMode((prev) => ({ ...prev, [viewMode]: section }));
    },
    [viewMode],
  );

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
          effectiveBailLoading ? (
            <div className="flex gap-2 px-3 py-2">
              <Skeleton className="h-8 flex-1 rounded-full" />
              <Skeleton className="h-8 flex-1 rounded-full" />
            </div>
          ) : bailHub ? (
            isBailHubLocation || isVr9Hub ? (
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
            viewMode={viewMode}
            activeSection={courtActiveSection}
            onNavigateToSection={handleCourtSectionChange}
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
          effectiveBailLoading ? (
            <div className="p-3 space-y-3">
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ) : effectiveBailError ? (
            <div className="p-3 text-sm text-destructive">
              {effectiveBailError}
            </div>
          ) : bailHub ? (
            <BailModeContent
              courtId={court.id}
              bailHub={bailHub}
              bailContacts={bailContacts}
              bailTeams={bailTeams}
              courtroomSchedules={courtroomSchedulesForBail}
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
