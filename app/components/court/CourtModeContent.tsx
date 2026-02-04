"use client";

import { useRef, useCallback, useMemo } from "react";
import {
  FaAt,
  FaUserPoliceTie,
  FaVideo,
  FaBuildingColumns,
  FaChevronRight,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Section, PillButton } from "../ui";
import { CircuitCourtAlert } from "./CircuitCourtAlert";
import { TeamsList } from "../features/TeamsCard";
import {
  CourtContactsStack,
  CrownContactsStack,
} from "../features/ContactCard";
import { CellList } from "../features/CellCard";
import { JcmFxdScheduleCard } from "../features/JcmFxdCard";
import { getBailHubTag } from "@/lib/config/constants";
import type {
  CourtWithRegion,
  ContactWithRole,
  ShellCell,
  TeamsLink,
  BailCourt,
  JcmFxdSchedule,
} from "@/types";

export type CourtAccordionSection = "contacts" | "cells" | "teams" | null;

interface CourtModeNavProps {
  contacts: ContactWithRole[];
  cells: ShellCell[];
  teamsLinks: TeamsLink[];
  expandedSection: CourtAccordionSection;
  onNavigateToSection: (section: CourtAccordionSection) => void;
}

export function CourtModeNav({
  contacts,
  cells,
  teamsLinks,
  expandedSection,
  onNavigateToSection,
}: CourtModeNavProps) {
  const navButtons = useMemo(
    () => [
      {
        key: "contacts",
        label: "Contacts",
        icon: <FaAt className="w-4 h-4" />,
        count: contacts.length,
        show: contacts.length > 0,
      },
      {
        key: "cells",
        label: "Cells",
        icon: <FaUserPoliceTie className="w-4 h-4" />,
        count: cells.length,
        show: cells.length > 0,
      },
      {
        key: "teams",
        label: "Teams",
        icon: <FaVideo className="w-4 h-4" />,
        count: teamsLinks.length,
        show: teamsLinks.length > 0,
      },
    ],
    [contacts.length, cells.length, teamsLinks.length],
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
            <span
              className={
                expandedSection === btn.key
                  ? "text-foreground/70"
                  : "text-muted-foreground"
              }
            >
              {btn.count}
            </span>
          </PillButton>
        ))}
    </div>
  );
}

interface CourtModeContentProps {
  court: CourtWithRegion;
  contacts: ContactWithRole[];
  cells: ShellCell[];
  teamsLinks: TeamsLink[];
  bailCourt: BailCourt | null;
  jcmFxdSchedule: JcmFxdSchedule | null;
  expandedSection: CourtAccordionSection;
  onExpandedSectionChange: (section: CourtAccordionSection) => void;
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
  onNavigateToCourt?: (courtId: number) => void;
  onNavigateToBailHub?: (bailCourtId: number, fromName: string) => void;
}

export function CourtModeContent({
  court,
  contacts,
  cells,
  teamsLinks,
  bailCourt,
  jcmFxdSchedule,
  expandedSection,
  onExpandedSectionChange,
  onCopy,
  isCopied,
  onNavigateToCourt,
  onNavigateToBailHub,
}: CourtModeContentProps) {
  const contactsRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);

  const toggleSection = useCallback(
    (section: CourtAccordionSection) => {
      onExpandedSectionChange(expandedSection === section ? null : section);
    },
    [expandedSection, onExpandedSectionChange],
  );

  return (
    <div className="p-3 space-y-2.5 pb-20">
      {/* Circuit court alert */}
      {court.is_circuit && court.contact_hub_name && (
        <CircuitCourtAlert
          hubCourtName={court.contact_hub_name}
          hubCourtId={court.contact_hub_id}
          onNavigateToHub={onNavigateToCourt}
        />
      )}

      {/* Contacts section */}
      {contacts.length > 0 && (
        <Section
          ref={contactsRef}
          color="blue"
          title="Contacts"
          count={contacts.length}
          isExpanded={expandedSection === "contacts"}
          onToggle={() => toggleSection("contacts")}
        >
          <div className="p-3 space-y-3">
            <CourtContactsStack
              contacts={contacts}
              onCopy={onCopy}
              isCopied={isCopied}
            />
            <CrownContactsStack
              contacts={contacts}
              onCopy={onCopy}
              isCopied={isCopied}
            />
          </div>
        </Section>
      )}

      {/* Cells section */}
      {cells.length > 0 && (
        <Section
          ref={cellsRef}
          color="blue"
          title="Sheriff Cells"
          count={cells.length}
          isExpanded={expandedSection === "cells"}
          onToggle={() => toggleSection("cells")}
        >
          <div className="p-3">
            <CellList cells={cells} />
          </div>
        </Section>
      )}

      {/* Bail Hub Link - only show if court uses a bail hub but is NOT the bail hub location */}
      {bailCourt && onNavigateToBailHub && bailCourt.court_id !== court.id && (
        <button
          onClick={() =>
            onNavigateToBailHub(bailCourt.id, `${court.name} Law Courts`)
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
                {getBailHubTag(bailCourt.name)} • Tap for schedule & contacts
              </div>
            </div>
            <FaChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
          </div>
        </button>
      )}

      {/* Teams section */}
      {teamsLinks.length > 0 && (
        <Section
          ref={teamsRef}
          color="indigo"
          title="MS Teams Links"
          count={teamsLinks.length}
          isExpanded={expandedSection === "teams"}
          onToggle={() => toggleSection("teams")}
        >
          <div className="p-3">
            <TeamsList links={teamsLinks} onCopy={onCopy} isCopied={isCopied} />
            {jcmFxdSchedule && (
              <div className="mt-3">
                <JcmFxdScheduleCard schedule={jcmFxdSchedule} />
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Access code */}
      {court.access_code && (
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
      )}
    </div>
  );
}
