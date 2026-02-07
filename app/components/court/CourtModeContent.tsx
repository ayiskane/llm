"use client";

import { useMemo } from "react";
import { FaAt, FaCalendar, FaVideo } from "@/lib/icons";
import { PillButton } from "../ui";
import { CircuitCourtAlert } from "./CircuitCourtAlert";
// import { TeamsList } from "../features/TeamsCard";
import { CourtFieldContacts } from "../features/ContactCard";
import { ScheduleCard } from "../features/ScheduleCard";
import type { ContactEmailGroup, ContactPhoneItem } from "@/lib/hooks";
// import { getBailHubTag } from "@/lib/config/constants";
import type {
  CourtWithRegion,
  CourtScheduleDate,
  TeamsLink,
} from "@/types";

export type CourtAccordionSection = "contacts" | "schedule" | "teams" | null;
export type CourtViewMode = "provincial" | "supreme";

interface CourtModeNavProps {
  teamsLinks: TeamsLink[];
  expandedSection: CourtAccordionSection;
  onNavigateToSection: (section: CourtAccordionSection) => void;
  contactCount: number;
  showSchedule: boolean;
}

export function CourtModeNav({
  teamsLinks,
  expandedSection,
  onNavigateToSection,
  contactCount,
  showSchedule,
}: CourtModeNavProps) {
  const navButtons = useMemo(
    () => [
      {
        key: "contacts",
        label: "Contacts",
        icon: <FaAt className="w-4 h-4" />,
        show: contactCount > 0,
      },
      {
        key: "schedule",
        label: "Schedule",
        icon: <FaCalendar className="w-4 h-4" />,
        show: showSchedule,
      },
      {
        key: "teams",
        label: "Teams",
        icon: <FaVideo className="w-4 h-4" />,
        show: teamsLinks.length > 0,
      },
    ],
    [contactCount, showSchedule, teamsLinks.length],
  );

  return (
    <div className="flex gap-1.5 px-3 py-2 border-t border-border/30">
      {navButtons
        .filter((btn) => btn.show)
        .map((btn) => (
          <PillButton
            className="flex-1 justify-center"
            key={btn.key}
            isActive={expandedSection === btn.key}
            onClick={() => onNavigateToSection(btn.key as CourtAccordionSection)}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </PillButton>
        ))}
    </div>
  );
}

interface CourtModeContentProps {
  court: CourtWithRegion;
  teamsLinks: TeamsLink[];
  contactEmailGroups: ContactEmailGroup[];
  contactPhones: ContactPhoneItem[];
  contactCount: number;
  scheduleDates: CourtScheduleDate[];
  expandedSection: CourtAccordionSection;
  onExpandedSectionChange: (section: CourtAccordionSection) => void;
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
  onNavigateToCourt?: (courtId: number) => void;
}

export function CourtModeContent({
  court,
  teamsLinks,
  contactEmailGroups,
  contactPhones,
  contactCount,
  scheduleDates,
  expandedSection,
  onExpandedSectionChange,
  onCopy,
  isCopied,
  onNavigateToCourt,
}: CourtModeContentProps) {
  const showContacts = expandedSection === "contacts";
  const showSchedule = expandedSection === "schedule";
  return (
    <div className="p-3 space-y-2.5 pb-20">
      {/* Circuit court alert */}
      {court.is_circuit && court.parent_court && (
        <CircuitCourtAlert
          hubCourtName={court.parent_court.name}
          hubCourtId={court.parent_court.id}
          onNavigateToHub={onNavigateToCourt}
        />
      )}

      {/* Contacts section */}
      {showContacts && contactCount > 0 && (
        <div className="p-3">
          <CourtFieldContacts
            emailGroups={contactEmailGroups}
            phones={contactPhones}
            onCopy={onCopy}
            isCopied={isCopied}
          />
        </div>
      )}

      {/* Schedule section */}
      {showSchedule && court.is_circuit && (
        <div className="p-3">
          <ScheduleCard dates={scheduleDates} />
        </div>
      )}

      {/* Bail Hub Link - only show if court uses a bail hub but is NOT the bail hub location */}
      {/* {bailHub && onNavigateToBailHub && bailHub.court_id !== court.id && (
        <button
          onClick={() =>
            onNavigateToBailHub(bailHub.id, `${court.name} Law Courts`)
          }
          className={cn(
            "w-full rounded-xl overflow-hidden",
            "bg-secondary/40 border border-semantic-amber/30",
            "hover:bg-secondary/60 hover:border-semantic-amber/50",
            "active:bg-secondary/50",
            "transition-all duration-200",
          )}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-lg bg-semantic-amber/15 flex items-center justify-center shrink-0">
              <FaBuildingColumns className="w-5 h-5 text-semantic-amber" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-foreground">
                Virtual Bail
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {getBailHubTag(bailHub.name)} • Tap for contacts
              </div>
            </div>
            <FaChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </button>
      )} */}

      {/* Teams section
      {teamsLinks.length > 0 && (
        <Section
          ref={teamsRef}
          color="indigo"
          title="MS Teams Links"
          isExpanded={expandedSection === "teams"}
          onToggle={() => toggleSection("teams")}
        >
          <div className="p-3">
            <TeamsList links={teamsLinks} onCopy={onCopy} isCopied={isCopied} />
          </div>
        </Section>
      )} */}

      {/* Access code */}
      {/* {court.access_code && (
        <div
          onClick={() => onCopy(court.access_code!, "access-code")}
          className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
            Court Access Code
          </div>
          <div className="text-sm font-mono text-foreground">
            {court.access_code}
          </div>
        </div>
      )} */}
    </div>
  );
}
