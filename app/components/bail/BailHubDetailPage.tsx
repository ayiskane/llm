'use client';

import { useState, useRef, useCallback } from 'react';
import { FaArrowLeft, FaAt, FaVideo, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaCommentDots, FaBuilding } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, toggle, iconSize } from '@/lib/config/theme';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton } from '../ui';
import { TeamsList } from '@/app/components/features/TeamsCard';
import { CONTACT_ROLES } from '@/lib/config/constants';
import { useCopyToClipboard, useTruncationDetection } from '@/lib/hooks';
import type { BailHubDetails, BailContact } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

type AccordionSection = 'contacts' | 'teams' | 'courts' | null;

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5', 6: 'FED' };

// =============================================================================
// BAIL HUB HEADER
// =============================================================================

interface BailHubHeaderProps {
  bailHub: BailHubDetails['bailHub'];
  region: BailHubDetails['region'];
  collapsed: boolean;
}

function BailHubHeader({ bailHub, region, collapsed }: BailHubHeaderProps) {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2">
        <h1
          className={cn(
            'font-semibold text-white uppercase tracking-wide flex-1 truncate text-left',
            'transition-all duration-300 ease-out',
            collapsed ? 'text-sm' : 'text-lg'
          )}
        >
          {bailHub.name}
        </h1>

        {/* Collapsed: show compact region tag */}
        {region && collapsed && (
          <span className="px-1.5 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest shrink-0">
            <span>{REGION_CODE[region.id] || region.code}</span>
          </span>
        )}
      </div>

      <div className={cn(
        'grid transition-all duration-300 ease-out',
        collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
      )}>
        <div className="overflow-hidden text-left">
          {/* Region tag */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {region && (
              <span className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                <span>{REGION_CODE[region.id] || region.code}</span>
                <span className="text-slate-600">|</span>
                <span>{region.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// BAIL CONTACTS STACK
// =============================================================================

interface BailContactsStackProps {
  bailHub: BailHubDetails['bailHub'];
  bailContacts: BailContact[];
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

function BailContactsStack({ bailHub, bailContacts, onCopy, isCopied }: BailContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  // Build contacts list from both bail hub direct fields and entity_contacts
  const contactsList: { label: string; email: string; id: string }[] = [];

  // Sheriff coordinator from bail_hubs table
  if (bailHub.sheriff_coordinator_email) {
    contactsList.push({
      label: 'Sheriff Coordinator',
      email: bailHub.sheriff_coordinator_email,
      id: 'sheriff-hub',
    });
  }

  // Crown from entity_contacts
  const crown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN);
  if (crown?.email) {
    contactsList.push({ label: 'Bail Crown', email: crown.email, id: `crown-${crown.id}` });
  }

  // Federal Crown from entity_contacts
  const fedCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN);
  if (fedCrown?.email) {
    contactsList.push({ label: 'Federal Crown', email: fedCrown.email, id: `fed-crown-${fedCrown.id}` });
  }

  const handleTeamsClick = () => {
    if (bailHub.sheriff_coordinator_teams_chat) {
      window.open(`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(bailHub.sheriff_coordinator_teams_chat)}`, '_blank');
    }
  };

  if (contactsList.length === 0 && !bailHub.sheriff_coordinator_teams_chat) return null;

  return (
    <div className="space-y-2">
      {/* Toggle button */}
      {contactsList.length > 0 && (!showFull ? hasTruncation : true) && (
        <div className="flex justify-end px-1">
          <button
            onClick={(e) => { e.stopPropagation(); setShowFull(!showFull); }}
            className={cn(toggle.base, showFull ? toggle.active : toggle.inactive)}
          >
            {showFull ? <FaEyeSlash className={iconSize.xs} /> : <FaEye className={iconSize.xs} />}
            <span>{showFull ? 'Truncate' : 'Show full'}</span>
          </button>
        </div>
      )}

      {/* Contact rows */}
      {contactsList.length > 0 && (
        <div className={card.divided}>
          {contactsList.map((contact) => {
            const isFieldCopied = isCopied(contact.id);
            return (
              <div
                key={contact.id}
                onClick={() => onCopy(contact.email, contact.id)}
                className={cn(
                  "flex items-stretch cursor-pointer group transition-colors",
                  isFieldCopied ? "bg-emerald-500/10" : "hover:bg-slate-800/50"
                )}
              >
                <div className="w-1 flex-shrink-0 bg-amber-400" />
                <div className="flex-1 py-2 px-3 min-w-0">
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider">{contact.label}</div>
                  <div
                    ref={!showFull ? registerRef : undefined}
                    className={cn(
                      "text-[11px] text-slate-300 font-mono",
                      showFull ? 'break-all whitespace-normal' : 'truncate'
                    )}
                  >
                    {contact.email}
                  </div>
                </div>
                <div className="flex items-center px-2">
                  {isFieldCopied ? (
                    <FaClipboardCheck className={cn(iconSize.sm, 'text-emerald-400')} />
                  ) : (
                    <FaCopy className={cn(iconSize.sm, 'text-slate-600 group-hover:text-slate-400 transition-colors')} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Teams Chat Button */}
      {bailHub.sheriff_coordinator_teams_chat && (
        <button
          onClick={handleTeamsClick}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md",
            "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700",
            "text-white text-sm font-medium shadow-sm",
            "transition-colors duration-150"
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
// LINKED COURTS LIST
// =============================================================================

interface LinkedCourtsListProps {
  courts: { id: number; name: string }[];
  onCourtClick: (courtId: number) => void;
}

function LinkedCourtsList({ courts, onCourtClick }: LinkedCourtsListProps) {
  if (courts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className={card.divided}>
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => onCourtClick(court.id)}
            className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-slate-800/50 transition-colors text-left"
          >
            <FaBuilding className={cn(iconSize.md, 'text-slate-500 flex-shrink-0')} />
            <span className="text-sm text-slate-200">{court.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface BailHubDetailPageProps {
  details: BailHubDetails;
  onBack: () => void;
  onNavigateToCourt: (courtId: number) => void;
  referrerName?: string | null;
}

export function BailHubDetailPage({ details, onBack, onNavigateToCourt, referrerName }: BailHubDetailPageProps) {
  const { bailHub, region, bailTeams, bailContacts, linkedCourts } = details;

  const [expandedSection, setExpandedSection] = useState<AccordionSection>('contacts');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  const scrollRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);
  const courtsRef = useRef<HTMLDivElement>(null);

  const backLabel = referrerName ? `Back to ${referrerName}` : 'Back to Bail Hubs';

  // Count contacts (including sheriff coordinator from bail hub)
  const contactsCount = bailContacts.length + (bailHub.sheriff_coordinator_email ? 1 : 0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    if (!isHeaderCollapsed && scrollTop > 80) {
      setIsHeaderCollapsed(true);
    } else if (isHeaderCollapsed && scrollTop < 30) {
      setIsHeaderCollapsed(false);
    }
  }, [isHeaderCollapsed]);

  const navigateToSection = useCallback((section: AccordionSection) => {
    setExpandedSection(section);
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      contacts: contactsRef, teams: teamsRef, courts: courtsRef,
    };
    const ref = section ? refs[section] : null;
    if (ref?.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }, []);

  const toggleSection = useCallback((section: AccordionSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  const navButtons = [
    { key: 'contacts', label: 'Contacts', icon: <FaAt className={iconSize.md} />, count: contactsCount, show: contactsCount > 0 || bailHub.sheriff_coordinator_teams_chat },
    { key: 'teams', label: 'Teams', icon: <FaVideo className={iconSize.md} />, count: bailTeams.length, show: bailTeams.length > 0 },
    { key: 'courts', label: 'Courts', icon: <FaBuilding className={iconSize.md} />, count: linkedCourts.length, show: linkedCourts.length > 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className={iconSize.md} />
            <span className="text-sm">{backLabel}</span>
          </button>
        </div>

        <BailHubHeader bailHub={bailHub} region={region} collapsed={isHeaderCollapsed} />

        <div className="flex gap-1.5 px-3 py-2 border-t border-slate-700/30">
          {navButtons.filter(btn => btn.show).map((btn) => (
            <PillButton
              className="flex-1 justify-center"
              key={btn.key}
              isActive={expandedSection === btn.key}
              onClick={() => navigateToSection(btn.key as AccordionSection)}
            >
              {btn.icon}
              <span>{btn.label}</span>
              {btn.count !== undefined && (
                <span className={expandedSection === btn.key ? 'text-white/70' : 'text-slate-500'}>
                  {btn.count}
                </span>
              )}
            </PillButton>
          ))}
        </div>
      </StickyHeader>

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth" onScroll={handleScroll}>
        <div className="p-3 space-y-2.5 pb-20">
          {/* Contacts section */}
          {(contactsCount > 0 || bailHub.sheriff_coordinator_teams_chat) && (
            <Section
              ref={contactsRef}
              color="amber"
              title="Bail Contacts"
              count={contactsCount}
              isExpanded={expandedSection === 'contacts'}
              onToggle={() => toggleSection('contacts')}
            >
              <div className="p-3">
                <BailContactsStack
                  bailHub={bailHub}
                  bailContacts={bailContacts}
                  onCopy={copyToClipboard}
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
              isExpanded={expandedSection === 'teams'}
              onToggle={() => toggleSection('teams')}
            >
              <div className="p-3">
                <TeamsList links={bailTeams} filterVBTriage={false} onCopy={copyToClipboard} isCopied={isCopied} />
              </div>
            </Section>
          )}

          {/* Courts section */}
          {linkedCourts.length > 0 && (
            <Section
              ref={courtsRef}
              color="blue"
              title="Courts Using This Hub"
              count={linkedCourts.length}
              isExpanded={expandedSection === 'courts'}
              onToggle={() => toggleSection('courts')}
            >
              <div className="p-3">
                <LinkedCourtsList courts={linkedCourts} onCourtClick={onNavigateToCourt} />
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
