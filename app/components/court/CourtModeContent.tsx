"use client";

import { useRef, useCallback, useMemo } from "react";
import { FaAt, FaVideo } from "@/lib/icons";
import { Section, PillButton } from "../ui";
import { CircuitCourtAlert } from "./CircuitCourtAlert";
// import { TeamsList } from "../features/TeamsCard";
import { CourtFieldContacts } from "../features/ContactCard";
// import { getBailHubTag } from "@/lib/config/constants";
import type {
  CourtWithRegion,
  TeamsLink,
} from "@/types";

export type CourtAccordionSection = "contacts" | "teams" | null;
export type CourtViewMode = "provincial" | "supreme";

interface CourtModeNavProps {
  court: CourtWithRegion;
  viewMode: CourtViewMode;
  teamsLinks: TeamsLink[];
  expandedSection: CourtAccordionSection;
  onNavigateToSection: (section: CourtAccordionSection) => void;
}

export function CourtModeNav({
  court,
  viewMode,
  teamsLinks,
  expandedSection,
  onNavigateToSection,
}: CourtModeNavProps) {
  // Count contacts based on viewMode
  const contactCount = useMemo(() => {
    let count = 0;
    // Common contacts
    if (court.registry_email) count++;
    if (court.criminal_registry_email && court.criminal_registry_email !== court.registry_email) count++;
    if (court.registry_phone) count++;
    if (court.criminal_registry_phone && court.criminal_registry_phone !== court.registry_phone) count++;
    if (viewMode === 'provincial' && court.provincial_fax_filing) count++;
    if (court.crown_office_email) count++;
    if (court.crown_office_phone) count++;
    const interpreterContact = (court.contacts ?? []).find(
      (contact) => contact.contact_type === 'interpreter_request'
    );
    if (interpreterContact) {
      const isProvincial = interpreterContact.is_provincial ?? false;
      const isSupreme = interpreterContact.is_supreme ?? false;
      const visible = interpreterContact.is_appeals
        ? viewMode === 'supreme'
        : isProvincial && !isSupreme
          ? viewMode === 'provincial'
          : isSupreme && !isProvincial
            ? viewMode === 'supreme'
            : true;
      if (visible) {
        const emailsAll =
          interpreterContact.emails_all ??
          [
            ...(interpreterContact.email ? [interpreterContact.email] : []),
            ...((interpreterContact.emails as string[] | null) ?? []),
          ];
        const emailCount = new Set((emailsAll || []).filter(Boolean)).size;
        const phoneCount = [
          ...(interpreterContact.phone ? [interpreterContact.phone] : []),
          ...((interpreterContact.phones as string[] | null) ?? []),
        ].filter(Boolean).length;
        count += emailCount + phoneCount;
      }
    }
    const transcriptContact = (court.contacts ?? []).find(
      (contact) => contact.contact_type === 'transcript_request'
    );
    if (transcriptContact) {
      const isProvincial = transcriptContact.is_provincial ?? false;
      const isSupreme = transcriptContact.is_supreme ?? false;
      const visible = transcriptContact.is_appeals
        ? viewMode === 'supreme'
        : isProvincial && !isSupreme
          ? viewMode === 'provincial'
          : isSupreme && !isProvincial
            ? viewMode === 'supreme'
            : true;
      if (visible) {
        const emailsAll =
          transcriptContact.emails_all ??
          [
            ...(transcriptContact.email ? [transcriptContact.email] : []),
            ...((transcriptContact.emails as string[] | null) ?? []),
          ];
        const emailCount = new Set((emailsAll || []).filter(Boolean)).size;
        const phoneCount = [
          ...(transcriptContact.phone ? [transcriptContact.phone] : []),
          ...((transcriptContact.phones as string[] | null) ?? []),
        ].filter(Boolean).length;
        count += emailCount + phoneCount;
      }
    }
    // Provincial-specific
    if (viewMode === 'provincial') {
      if (court.jcm_email) count++;
      if (court.jcm_phone) count++;
    }
    // Supreme-specific
    if (viewMode === 'supreme') {
      if (court.supreme_scheduling_email) count++;
      if (court.supreme_scheduling_phone) count++;
      if (court.supreme_fax_filing) count++;
    }

    const handledTypes = new Set([
      'court_registry',
      'criminal_registry',
      'crown_general',
      'interpreter_request',
      'transcript_request',
      'jcm',
      'scheduling',
    ]);

    const extraContacts = (court.contacts ?? []).filter((contact) => {
      if (handledTypes.has(contact.contact_type)) return false;
      const isProvincial = contact.is_provincial ?? false;
      const isSupreme = contact.is_supreme ?? false;
      if (contact.is_appeals) return viewMode === 'supreme';
      if (isProvincial && !isSupreme) return viewMode === 'provincial';
      if (isSupreme && !isProvincial) return viewMode === 'supreme';
      return true;
    });

    for (const contact of extraContacts) {
      const emailsAll =
        contact.emails_all ??
        [
          ...(contact.email ? [contact.email] : []),
          ...((contact.emails as string[] | null) ?? []),
        ];
      const emailCount = new Set((emailsAll || []).filter(Boolean)).size;
      const phoneCount = [
        ...(contact.phone ? [contact.phone] : []),
        ...((contact.phones as string[] | null) ?? []),
      ].filter(Boolean).length;
      count += emailCount + phoneCount;
      if (viewMode === 'provincial' && contact.provincial_fax_filing) count++;
      if (viewMode === 'supreme' && contact.supreme_fax_filing) count++;
    }
    return count;
  }, [court, viewMode]);

  const navButtons = useMemo(
    () => [
      {
        key: "contacts",
        label: "Contacts",
        icon: <FaAt className="w-4 h-4" />,
        count: contactCount,
        show: contactCount > 0,
      },
      {
        key: "teams",
        label: "Teams",
        icon: <FaVideo className="w-4 h-4" />,
        count: teamsLinks.length,
        show: teamsLinks.length > 0,
      },
    ],
    [contactCount, teamsLinks.length],
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
  viewMode: CourtViewMode;
  teamsLinks: TeamsLink[];
  expandedSection: CourtAccordionSection;
  onExpandedSectionChange: (section: CourtAccordionSection) => void;
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
  onNavigateToCourt?: (courtId: number) => void;
}

export function CourtModeContent({
  court,
  viewMode,
  teamsLinks,
  expandedSection,
  onExpandedSectionChange,
  onCopy,
  isCopied,
  onNavigateToCourt,
}: CourtModeContentProps) {
  const contactsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);

  const toggleSection = useCallback(
    (section: CourtAccordionSection) => {
      onExpandedSectionChange(expandedSection === section ? null : section);
    },
    [expandedSection, onExpandedSectionChange],
  );

  // Count contacts for section header
  const contactCount = useMemo(() => {
    let count = 0;
    if (court.registry_email) count++;
    if (court.criminal_registry_email && court.criminal_registry_email !== court.registry_email) count++;
    if (court.registry_phone) count++;
    if (court.criminal_registry_phone && court.criminal_registry_phone !== court.registry_phone) count++;
    if (viewMode === 'provincial' && court.provincial_fax_filing) count++;
    if (court.crown_office_email) count++;
    if (court.crown_office_phone) count++;
    const interpreterContact = (court.contacts ?? []).find(
      (contact) => contact.contact_type === 'interpreter_request'
    );
    if (interpreterContact) {
      const isProvincial = interpreterContact.is_provincial ?? false;
      const isSupreme = interpreterContact.is_supreme ?? false;
      const visible = interpreterContact.is_appeals
        ? viewMode === 'supreme'
        : isProvincial && !isSupreme
          ? viewMode === 'provincial'
          : isSupreme && !isProvincial
            ? viewMode === 'supreme'
            : true;
      if (visible) {
        const emailsAll =
          interpreterContact.emails_all ??
          [
            ...(interpreterContact.email ? [interpreterContact.email] : []),
            ...((interpreterContact.emails as string[] | null) ?? []),
          ];
        const emailCount = new Set((emailsAll || []).filter(Boolean)).size;
        const phoneCount = [
          ...(interpreterContact.phone ? [interpreterContact.phone] : []),
          ...((interpreterContact.phones as string[] | null) ?? []),
        ].filter(Boolean).length;
        count += emailCount + phoneCount;
      }
    }
    const transcriptContact = (court.contacts ?? []).find(
      (contact) => contact.contact_type === 'transcript_request'
    );
    if (transcriptContact) {
      const isProvincial = transcriptContact.is_provincial ?? false;
      const isSupreme = transcriptContact.is_supreme ?? false;
      const visible = transcriptContact.is_appeals
        ? viewMode === 'supreme'
        : isProvincial && !isSupreme
          ? viewMode === 'provincial'
          : isSupreme && !isProvincial
            ? viewMode === 'supreme'
            : true;
      if (visible) {
        const emailsAll =
          transcriptContact.emails_all ??
          [
            ...(transcriptContact.email ? [transcriptContact.email] : []),
            ...((transcriptContact.emails as string[] | null) ?? []),
          ];
        const emailCount = new Set((emailsAll || []).filter(Boolean)).size;
        const phoneCount = [
          ...(transcriptContact.phone ? [transcriptContact.phone] : []),
          ...((transcriptContact.phones as string[] | null) ?? []),
        ].filter(Boolean).length;
        count += emailCount + phoneCount;
      }
    }
    if (viewMode === 'provincial') {
      if (court.jcm_email) count++;
      if (court.jcm_phone) count++;
    }
    if (viewMode === 'supreme') {
      if (court.supreme_scheduling_email) count++;
      if (court.supreme_scheduling_phone) count++;
      if (court.supreme_fax_filing) count++;
    }

    const handledTypes = new Set([
      'court_registry',
      'criminal_registry',
      'crown_general',
      'interpreter_request',
      'transcript_request',
      'jcm',
      'scheduling',
    ]);

    const extraContacts = (court.contacts ?? []).filter((contact) => {
      if (handledTypes.has(contact.contact_type)) return false;
      const isProvincial = contact.is_provincial ?? false;
      const isSupreme = contact.is_supreme ?? false;
      if (contact.is_appeals) return viewMode === 'supreme';
      if (isProvincial && !isSupreme) return viewMode === 'provincial';
      if (isSupreme && !isProvincial) return viewMode === 'supreme';
      return true;
    });

    for (const contact of extraContacts) {
      const emailsAll =
        contact.emails_all ??
        [
          ...(contact.email ? [contact.email] : []),
          ...((contact.emails as string[] | null) ?? []),
        ];
      const emailCount = new Set((emailsAll || []).filter(Boolean)).size;
      const phoneCount = [
        ...(contact.phone ? [contact.phone] : []),
        ...((contact.phones as string[] | null) ?? []),
      ].filter(Boolean).length;
      count += emailCount + phoneCount;
      if (viewMode === 'provincial' && contact.provincial_fax_filing) count++;
      if (viewMode === 'supreme' && contact.supreme_fax_filing) count++;
    }
    return count;
  }, [court, viewMode]);

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
      {contactCount > 0 && (
        <Section
          ref={contactsRef}
          color="blue"
          title="Contacts"
          count={contactCount}
          isExpanded={expandedSection === "contacts"}
          onToggle={() => toggleSection("contacts")}
        >
          <div className="p-3">
            <CourtFieldContacts
              court={court}
              viewMode={viewMode}
              onCopy={onCopy}
              isCopied={isCopied}
            />
          </div>
        </Section>
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
          count={teamsLinks.length}
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
