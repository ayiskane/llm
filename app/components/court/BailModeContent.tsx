"use client";

import { useMemo, useState } from "react";
import {
  FaAt,
  FaClipboardCheck,
  FaCommentDots,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaPhoneSolid,
  FaVideo,
} from "@/lib/icons";
import { cn, formatPhone, makeCall } from "@/lib/utils";
import { Card, CardListItem, CardListRow } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PillButton } from "../ui";
import { TeamsCard } from "../features/TeamsCard";
import { CellList } from "../features/CellCard";
import { iconSize, text, toggle } from "@/lib/config/theme";
import type {
  BailContact,
  BailHub,
  CourtroomSchedule,
  SheriffCell,
  TeamsLink,
} from "@/types";
import { isVBTriageLink } from "@/lib/config/constants";

export type BailAccordionSection = "contacts" | "teams" | null;

// =============================================================================
// BAIL CONTACTS
// =============================================================================

interface BailContactsStackProps {
  bailHub: BailHub;
  bailContacts: BailContact[];
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

function getBailContactPriority(contact: BailContact): number {
  switch (contact.contact_type) {
    case "jcm_bail":
      return 0;
    case "crown_bail":
      return 1;
    case "crown_remand":
      return 2;
    case "crown_525":
      return 3;
    default:
      return 4;
  }
}

function BailContactsStack({
  bailHub,
  bailContacts,
  onCopy,
  isCopied,
}: BailContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const contactEmails = useMemo(() => {
    const items: { label: string; email: string; id: string }[] = [];

    const sortedContacts = [...bailContacts]
      .filter((contact) => Boolean(contact.email))
      .sort((a, b) => {
        const priority = getBailContactPriority(a) - getBailContactPriority(b);
        if (priority !== 0) return priority;
        return (a.label ?? "").localeCompare(b.label ?? "");
      });

    sortedContacts.forEach((contact) => {
      if (!contact.email) return;
      items.push({
        label: contact.label ?? "Bail Contact",
        email: contact.email,
        id: `bail-contact-${contact.id}`,
      });
    });

    if (bailHub.sheriff_coordinator_email) {
      items.push({
        label: "Sheriff Coordinator",
        email: bailHub.sheriff_coordinator_email,
        id: "bail-sheriff-email",
      });
    }

    return items;
  }, [bailHub, bailContacts]);

  const contactPhones = useMemo(() => {
    const items: { label: string; phone: string; id: string }[] = [];
    const sortedContacts = [...bailContacts]
      .filter((contact) => Boolean(contact.phone))
      .sort((a, b) => {
        const priority = getBailContactPriority(a) - getBailContactPriority(b);
        if (priority !== 0) return priority;
        return (a.label ?? "").localeCompare(b.label ?? "");
      });

    sortedContacts.forEach((contact) => {
      if (!contact.phone) return;
      items.push({
        label: contact.label ?? "Bail Contact",
        phone: contact.phone,
        id: `bail-contact-phone-${contact.id}`,
      });
    });

    if (bailHub.sheriff_coordinator_phone) {
      items.push({
        label: "Sheriff Coordinator",
        phone: bailHub.sheriff_coordinator_phone,
        id: "bail-sheriff-phone",
      });
    }
    return items;
  }, [bailHub, bailContacts]);

  const hasContacts = contactEmails.length > 0 || contactPhones.length > 0;

  if (!hasContacts) return null;
  const showToggle = contactEmails.length > 0;

  return (
    <div className="space-y-3">
      {(contactEmails.length > 0 || contactPhones.length > 0) && (
        <Card
          variant="list"
          className="rounded-lg border border-border/60 overflow-hidden"
        >
          <div className="flex min-h-12 items-center justify-between bg-linear-to-r from-semantic-amber-bg via-card to-card px-3 py-2.5 border-b border-border/50">
            <div className={text.sectionHeader}>Bail Contacts</div>
            {showToggle && (
              <Button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowFull((prev) => !prev);
                }}
                variant="ghost"
                size="sm"
                className={cn(
                  toggle.base,
                  showFull ? toggle.active : toggle.inactive,
                  "h-auto px-2 py-1 text-xs hover:bg-transparent",
                )}
              >
                {showFull ? (
                  <FaEyeSlash className={iconSize.xs} />
                ) : (
                  <FaEye className={iconSize.xs} />
                )}
                <span>{showFull ? "Truncate" : "Show full"}</span>
              </Button>
            )}
          </div>

          {contactEmails.map((contact) => {
            const isFieldCopied = isCopied(contact.id);
            return (
              <CardListItem
                key={contact.id}
                onClick={() => onCopy(contact.email, contact.id)}
                variant="outlined"
                className={cn(
                  "flex items-stretch cursor-pointer group transition-colors p-0 overflow-hidden",
                  isFieldCopied && "bg-semantic-green-bg",
                )}
              >
                <div className="w-1 shrink-0 bg-semantic-amber" />
                <div className="flex-1 py-2 px-3 min-w-0">
                  <div className={text.roleLabel}>{contact.label}</div>
                  <div
                    className={cn(
                      text.monoValue,
                      showFull ? "break-all whitespace-normal" : "truncate",
                    )}
                  >
                    {contact.email}
                  </div>
                </div>
                <div className="flex items-center px-2">
                  {isFieldCopied ? (
                    <FaClipboardCheck
                      className={cn(iconSize.md, "text-semantic-green-text")}
                    />
                  ) : (
                    <FaCopy
                      className={cn(
                        iconSize.md,
                        "text-muted-foreground group-hover:text-foreground transition-colors",
                      )}
                    />
                  )}
                </div>
              </CardListItem>
            );
          })}

          {contactPhones.map((contact) => {
            const displayPhone = formatPhone(contact.phone);
            const isFieldCopied = isCopied(contact.id);
            return (
              <CardListRow
                key={contact.id}
                variant="outlined"
                className="flex items-center gap-3 px-4 py-2.5"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-semantic-amber-bg">
                  <FaPhoneSolid
                    className={cn(iconSize.md, "text-semantic-amber-text")}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={text.roleLabel}>{contact.label}</div>
                  <div className={cn(text.monoValue, "text-foreground")}>
                    {displayPhone}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onCopy(contact.phone, contact.id)}
                    className="h-8 w-8 rounded-lg bg-secondary/60 hover:bg-secondary/70"
                  >
                    {isFieldCopied ? (
                      <FaClipboardCheck
                        className={cn(iconSize.md, "text-semantic-green-text")}
                      />
                    ) : (
                      <FaCopy
                        className={cn(iconSize.md, "text-muted-foreground")}
                      />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => makeCall(contact.phone)}
                    className="h-8 w-8 rounded-lg bg-semantic-green-bg hover:bg-semantic-green-bg/70"
                  >
                    <FaPhoneSolid
                      className={cn(iconSize.md, "text-semantic-green-text")}
                    />
                  </Button>
                </div>
              </CardListRow>
            );
          })}
        </Card>
      )}

    </div>
  );
}

// =============================================================================
// SHERIFF COORDINATOR CHAT
// =============================================================================

function SheriffCoordinatorChatButton({
  teamsChat,
}: {
  teamsChat?: string | null;
}) {
  if (!teamsChat) return null;

  const handleTeamsClick = () => {
    window.open(
      `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(
        teamsChat,
      )}`,
      "_blank",
    );
  };

  return (
    <Button
      variant="join"
      onClick={handleTeamsClick}
      className="w-full justify-center gap-2"
    >
      <FaCommentDots className={iconSize.sm} />
      Chat with Sheriff Coordinator
    </Button>
  );
}

// =============================================================================
// BAIL MODE NAV
// =============================================================================

interface BailModeNavProps {
  bailTeams: TeamsLink[];
  courtTeams: TeamsLink[];
  expandedSection: BailAccordionSection;
  onNavigateToSection: (section: BailAccordionSection) => void;
}

export function BailModeNav({
  bailTeams,
  courtTeams,
  expandedSection,
  onNavigateToSection,
}: BailModeNavProps) {
  const hasTeams =
    bailTeams.length > 0 ||
    courtTeams.some((link) =>
      isVBTriageLink(link.courtroom || link.type_name || ""),
    );

  const navButtons = useMemo(
    () => [
      {
        key: "contacts",
        label: "Contacts",
        icon: <FaAt className="w-4 h-4" />,
        show: true,
      },
      {
        key: "teams",
        label: "Teams",
        icon: <FaVideo className="w-4 h-4" />,
        show: hasTeams,
      },
    ],
    [hasTeams],
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
            onClick={() => onNavigateToSection(btn.key as BailAccordionSection)}
          >
            {btn.icon}
            <span>{btn.label}</span>
          </PillButton>
        ))}
    </div>
  );
}

// =============================================================================
// BAIL MODE CONTENT
// =============================================================================

interface BailModeContentProps {
  bailHub: BailHub;
  bailContacts: BailContact[];
  bailTeams: TeamsLink[];
  courtTeams: TeamsLink[];
  courtroomSchedules: CourtroomSchedule[];
  cells: SheriffCell[];
  expandedSection: BailAccordionSection;
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

export function BailModeContent({
  bailHub,
  bailContacts,
  bailTeams,
  courtTeams,
  courtroomSchedules,
  cells,
  expandedSection,
  onCopy,
  isCopied,
}: BailModeContentProps) {
  const showContacts = expandedSection === "contacts";
  const showTeams = expandedSection === "teams";
  const bailTeamsWithTriage = useMemo(() => {
    const vbTriageLinks = courtTeams.filter((link) =>
      isVBTriageLink(link.courtroom || link.type_name || ""),
    );
    const combined = [...vbTriageLinks, ...bailTeams];
    const seen = new Set<number | string>();
    return combined.filter((link, idx) => {
      const key = link.id ?? `idx-${idx}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [bailTeams, courtTeams]);

  return (
    <div className="p-3 space-y-2.5 pb-20">
      {showContacts && (
        <div className="p-3">
          <BailContactsStack
            bailHub={bailHub}
            bailContacts={bailContacts}
            onCopy={onCopy}
            isCopied={isCopied}
          />
          {cells.length > 0 && (
            <Card
              variant="list"
              className="mt-4 rounded-lg border border-border/60 overflow-hidden"
            >
              <div className="flex min-h-12 items-center bg-linear-to-r from-semantic-amber-bg via-card to-card px-3 py-2.5 border-b border-border/50">
                <div className={text.sectionHeader}>SHERIFF CELLS</div>
              </div>
              <CellList cells={cells} variant="list" />
            </Card>
          )}
        </div>
      )}

      {showTeams && bailTeamsWithTriage.length > 0 && (
        <div className="p-3 space-y-3">
          <SheriffCoordinatorChatButton
            teamsChat={bailHub.sheriff_coordinator_teams_chat}
          />
          <TeamsCard
            links={bailTeamsWithTriage}
            schedules={courtroomSchedules}
            filterVBTriage={false}
            pinVBTriage
            onCopy={onCopy}
            isCopied={isCopied}
          />
        </div>
      )}
    </div>
  );
}
