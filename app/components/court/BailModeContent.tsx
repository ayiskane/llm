"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  FaAt,
  FaVideo,
  FaClock,
  FaCopy,
  FaClipboardCheck,
  FaEye,
  FaEyeSlash,
  FaCommentDots,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { card, text, toggle, iconSize, getScheduleLabelClass } from "@/lib/config/theme";
import { Section, PillButton } from "../ui";
import { TeamsList } from "../features/TeamsCard";
import { CONTACT_ROLES } from "@/lib/config/constants";
import { useTruncationDetection } from "@/lib/hooks";
import type { BailCourt, BailContact, TeamsLink } from "@/types";

export type BailAccordionSection = "schedule" | "contacts" | "teams" | null;

// =============================================================================
// SCHEDULE ROW
// =============================================================================

interface ScheduleRowProps {
  label: string;
  value: string;
  color?: "amber" | "sky";
}

function ScheduleRow({ label, value, color }: ScheduleRowProps) {
  return (
    <div className={card.flexRow}>
      <span
        className={getScheduleLabelClass(color)}
        style={{ letterSpacing: "1px" }}
      >
        {label}
      </span>
      <span className={text.monoValue}>{value}</span>
    </div>
  );
}

// =============================================================================
// SCHEDULE LIST
// =============================================================================

function ScheduleList({ bailCourt }: { bailCourt: BailCourt }) {
  const scheduleItems = [
    {
      label: "Triage",
      value: [bailCourt.triage_time_am, bailCourt.triage_time_pm]
        .filter(Boolean)
        .join(" / "),
      color: undefined,
    },
    {
      label: "Court",
      value: [bailCourt.court_start_am, bailCourt.court_start_pm]
        .filter(Boolean)
        .join(" / "),
      color: undefined,
    },
    { label: "Cutoff", value: bailCourt.cutoff_new_arrests, color: undefined },
    {
      label: "Youth",
      value:
        bailCourt.youth_custody_day && bailCourt.youth_custody_time
          ? `${bailCourt.youth_custody_day} ${bailCourt.youth_custody_time}`
          : null,
      color: "sky" as const,
    },
  ].filter((item) => item.value);

  if (scheduleItems.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className={card.divided}>
        {scheduleItems.map((item) => (
          <ScheduleRow
            key={item.label}
            label={item.label}
            value={item.value!}
            color={item.color}
          />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// BAIL CONTACTS STACK
// =============================================================================

interface BailContactsStackProps {
  bailContacts: BailContact[];
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

function BailContactsStack({
  bailContacts,
  onCopy,
  isCopied,
}: BailContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  const sheriffCoord = bailContacts.find(
    (bc) => bc.role_id === CONTACT_ROLES.SHERIFF_VB_COORDINATOR,
  );
  const sheriffTeamsChat = sheriffCoord?.teams_chat || null;

  const contactsList = useMemo(() => {
    const result: { label: string; email: string; id: string }[] = [];

    if (sheriffCoord?.email) {
      result.push({
        label: "Sheriff Coordinator",
        email: sheriffCoord.email,
        id: `sheriff-${sheriffCoord.id}`,
      });
    }

    const crown = bailContacts.find(
      (bc) => bc.role_id === CONTACT_ROLES.CROWN,
    );
    if (crown?.email) {
      result.push({
        label: "Bail Crown",
        email: crown.email,
        id: `crown-${crown.id}`,
      });
    }

    const fedCrown = bailContacts.find(
      (bc) => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN,
    );
    if (fedCrown?.email) {
      result.push({
        label: "Federal Crown",
        email: fedCrown.email,
        id: `fed-crown-${fedCrown.id}`,
      });
    }

    return result;
  }, [bailContacts, sheriffCoord]);

  const handleTeamsClick = () => {
    if (sheriffTeamsChat) {
      window.open(
        `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(sheriffTeamsChat)}`,
        "_blank",
      );
    }
  };

  if (contactsList.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Toggle button */}
      {(!showFull ? hasTruncation : true) && (
        <div className="flex justify-end px-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowFull(!showFull);
            }}
            className={cn(toggle.base, showFull ? toggle.active : toggle.inactive)}
          >
            {showFull ? (
              <FaEyeSlash className={iconSize.xs} />
            ) : (
              <FaEye className={iconSize.xs} />
            )}
            <span>{showFull ? "Truncate" : "Show full"}</span>
          </button>
        </div>
      )}

      {/* Contact rows */}
      <div className={card.divided}>
        {contactsList.map((contact) => {
          const isFieldCopied = isCopied(contact.id);
          return (
            <div
              key={contact.id}
              onClick={() => onCopy(contact.email, contact.id)}
              className={cn(
                "flex items-stretch cursor-pointer group transition-colors",
                isFieldCopied ? "bg-emerald-500/10" : "hover:bg-slate-800/50",
              )}
            >
              <div className="w-1 shrink-0 bg-semantic-amber" />
              <div className="flex-1 py-2 px-3 min-w-0">
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider">
                  {contact.label}
                </div>
                <div
                  ref={!showFull ? registerRef : undefined}
                  className={cn(
                    "text-[11px] text-foreground/80 font-mono",
                    showFull ? "break-all whitespace-normal" : "truncate",
                  )}
                >
                  {contact.email}
                </div>
              </div>
              <div className="flex items-center px-2">
                {isFieldCopied ? (
                  <FaClipboardCheck className={cn(iconSize.sm, "text-emerald-400")} />
                ) : (
                  <FaCopy
                    className={cn(
                      iconSize.sm,
                      "text-muted-foreground group-hover:text-foreground/70 transition-colors",
                    )}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teams Chat Button */}
      {sheriffTeamsChat && (
        <button
          onClick={handleTeamsClick}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md",
            "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700",
            "text-white text-sm font-medium shadow-sm",
            "transition-colors duration-150",
          )}
        >
          <FaCommentDots className={iconSize.md} />
          <span>Chat with Sheriff Coordinator</span>
        </button>
      )}
    </div>
  );
}

// =============================================================================
// BAIL MODE NAV
// =============================================================================

interface BailModeNavProps {
  bailCourt: BailCourt;
  bailContacts: BailContact[];
  bailTeams: TeamsLink[];
  expandedSection: BailAccordionSection;
  onNavigateToSection: (section: BailAccordionSection) => void;
}

export function BailModeNav({
  bailCourt,
  bailContacts,
  bailTeams,
  expandedSection,
  onNavigateToSection,
}: BailModeNavProps) {
  const hasSchedule =
    bailCourt.triage_time_am ||
    bailCourt.triage_time_pm ||
    bailCourt.court_start_am ||
    bailCourt.cutoff_new_arrests ||
    (bailCourt.youth_custody_day && bailCourt.youth_custody_time);

  const navButtons = useMemo(
    () => [
      {
        key: "schedule",
        label: "Schedule",
        icon: <FaClock className="w-4 h-4" />,
        show: hasSchedule,
      },
      {
        key: "contacts",
        label: "Contacts",
        icon: <FaAt className="w-4 h-4" />,
        count: bailContacts.length,
        show: bailContacts.length > 0,
      },
      {
        key: "teams",
        label: "Teams",
        icon: <FaVideo className="w-4 h-4" />,
        count: bailTeams.length,
        show: bailTeams.length > 0,
      },
    ],
    [hasSchedule, bailContacts.length, bailTeams.length],
  );

  return (
    <div className="flex gap-1.5 px-3 py-2 border-t border-semantic-amber/30">
      {navButtons
        .filter((btn) => btn.show)
        .map((btn) => (
          <PillButton
            className="flex-1 justify-center"
            key={btn.key}
            isActive={expandedSection === btn.key}
            onClick={() => onNavigateToSection(btn.key as BailAccordionSection)}
          >
            {btn.icon}
            <span>{btn.label}</span>
            {btn.count !== undefined && (
              <span
                className={
                  expandedSection === btn.key
                    ? "text-foreground/70"
                    : "text-muted-foreground"
                }
              >
                {btn.count}
              </span>
            )}
          </PillButton>
        ))}
    </div>
  );
}

// =============================================================================
// BAIL MODE CONTENT
// =============================================================================

interface BailModeContentProps {
  bailCourt: BailCourt;
  bailContacts: BailContact[];
  bailTeams: TeamsLink[];
  expandedSection: BailAccordionSection;
  onExpandedSectionChange: (section: BailAccordionSection) => void;
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

export function BailModeContent({
  bailCourt,
  bailContacts,
  bailTeams,
  expandedSection,
  onExpandedSectionChange,
  onCopy,
  isCopied,
}: BailModeContentProps) {
  const scheduleRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);

  const hasSchedule =
    bailCourt.triage_time_am ||
    bailCourt.triage_time_pm ||
    bailCourt.court_start_am ||
    bailCourt.cutoff_new_arrests ||
    (bailCourt.youth_custody_day && bailCourt.youth_custody_time);

  const toggleSection = useCallback(
    (section: BailAccordionSection) => {
      onExpandedSectionChange(expandedSection === section ? null : section);
    },
    [expandedSection, onExpandedSectionChange],
  );

  return (
    <div className="p-3 space-y-2.5 pb-20">
      {/* Schedule section */}
      {hasSchedule && (
        <Section
          ref={scheduleRef}
          color="amber"
          title="Schedule"
          isExpanded={expandedSection === "schedule"}
          onToggle={() => toggleSection("schedule")}
        >
          <div className="p-3">
            <ScheduleList bailCourt={bailCourt} />
          </div>
        </Section>
      )}

      {/* Contacts section */}
      {bailContacts.length > 0 && (
        <Section
          ref={contactsRef}
          color="amber"
          title="Bail Contacts"
          count={bailContacts.length}
          isExpanded={expandedSection === "contacts"}
          onToggle={() => toggleSection("contacts")}
        >
          <div className="p-3">
            <BailContactsStack
              bailContacts={bailContacts}
              onCopy={onCopy}
              isCopied={isCopied}
            />
          </div>
        </Section>
      )}

      {/* Teams section */}
      {bailTeams.length > 0 && (
        <Section
          ref={teamsRef}
          color="indigo"
          title="MS Teams Links"
          count={bailTeams.length}
          isExpanded={expandedSection === "teams"}
          onToggle={() => toggleSection("teams")}
        >
          <div className="p-3">
            <TeamsList
              links={bailTeams}
              filterVBTriage={false}
              onCopy={onCopy}
              isCopied={isCopied}
            />
          </div>
        </Section>
      )}
    </div>
  );
}
