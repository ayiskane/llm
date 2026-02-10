"use client";

import { useMemo } from "react";
import { FaAt, FaCalendar, FaVideo } from "@/lib/icons";
import { PillButton } from "../ui";
import { CircuitCourtAlert } from "./CircuitCourtAlert";
import { TeamsCard } from "../features/TeamsCard";
import { CourtFieldContacts } from "../features/ContactCard";
import { ScheduleCard } from "../features/ScheduleCard";
import type { ContactEmailGroup, ContactPhoneItem } from "@/lib/hooks";
import type {
  CourtWithRegion,
  CourtScheduleDate,
  CourtroomSchedule,
  TeamsLink,
} from "@/types";

export type CourtSection = "contacts" | "schedule" | "teams" | null;
export type CourtViewMode = "provincial" | "supreme" | "fnc";

interface CourtModeNavProps {
  teamsLinks: TeamsLink[];
  activeSection: CourtSection;
  onNavigateToSection: (section: CourtSection) => void;
  contactCount: number;
  showSchedule: boolean;
}

export function CourtModeNav({
  teamsLinks,
  activeSection,
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
            isActive={activeSection === btn.key}
            onClick={() => onNavigateToSection(btn.key as CourtSection)}
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
  viewMode: CourtViewMode;
  teamsLinks: TeamsLink[];
  courtroomSchedules: CourtroomSchedule[];
  contactEmailGroups: ContactEmailGroup[];
  contactPhones: ContactPhoneItem[];
  contactCount: number;
  scheduleDates: CourtScheduleDate[];
  scheduleLoading?: boolean;
  activeSection: CourtSection;
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
  onNavigateToCourt?: (courtId: number) => void;
}

export function CourtModeContent({
  court,
  viewMode,
  teamsLinks,
  courtroomSchedules,
  contactEmailGroups,
  contactPhones,
  contactCount,
  scheduleDates,
  scheduleLoading,
  activeSection,
  onCopy,
  isCopied,
  onNavigateToCourt,
}: CourtModeContentProps) {
  const showContacts = activeSection === "contacts";
  const showSchedule = activeSection === "schedule";
  const showTeams = activeSection === "teams";
  const scheduleDatesForMode = useMemo(() => {
    if (court.is_circuit) return scheduleDates;
    if (viewMode !== "fnc") return [];
    const tagged = scheduleDates.filter((date) =>
      (date.schedule_type ?? "").toLowerCase().includes("fnc"),
    );
    return tagged.length > 0 ? tagged : scheduleDates;
  }, [court.is_circuit, scheduleDates, viewMode]);
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
      {showSchedule && (court.is_circuit || viewMode === "fnc") && (
        <div className="p-3">
          <ScheduleCard
            dates={scheduleDatesForMode}
            isLoading={scheduleLoading}
          />
        </div>
      )}

      {/* Teams section */}
      {showTeams && teamsLinks.length > 0 && (
        <div className="p-3">
          <TeamsCard
            links={teamsLinks}
            schedules={courtroomSchedules}
            prioritizeJcm
            onCopy={onCopy}
            isCopied={isCopied}
          />
        </div>
      )}

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
