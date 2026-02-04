'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { FaArrowLeft, FaAt, FaVideo, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaCommentDots, FaBuilding, FaClock } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, toggle, iconSize, getScheduleLabelClass } from '@/lib/config/theme';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton, Toast } from '../ui';
import { TeamsList } from '@/app/components/features/TeamsCard';
import { CONTACT_ROLES } from '@/lib/config/constants';
import { useCopyToClipboard, useTruncationDetection } from '@/lib/hooks';
import type { BailHubDetails, BailContact } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

type AccordionSection = 'schedule' | 'contacts' | 'teams' | 'courts' | null;

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5', 6: 'FED' };

// =============================================================================
// BAIL HUB HEADER
// =============================================================================

interface BailHubHeaderProps {
  bailCourt: BailHubDetails['bailCourt'];
  region: BailHubDetails['region'];
  collapsed: boolean;
}

function BailHubHeader({ bailCourt, region, collapsed }: BailHubHeaderProps) {
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
          {bailCourt.name}
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
          {/* Region tag - matches CourtHeader exactly (no colored dot) */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {region && (
              <span className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                <span>{REGION_CODE[region.id] || region.code}</span>
                <span className="text-slate-600">|</span>
                <span>{region.name}</span>
              </span>
            )}
          </div>
          {bailCourt.notes && (
            <p className="text-xs text-slate-500 mt-1">{bailCourt.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SCHEDULE ROW
// =============================================================================

interface ScheduleRowProps {
  label: string;
  value: string;
  color?: 'amber' | 'sky';
}

function ScheduleRow({ label, value, color }: ScheduleRowProps) {
  return (
    <div className={card.flexRow}>
      <span className={getScheduleLabelClass(color)} style={{ letterSpacing: '1px' }}>
        {label}
      </span>
      <span className={text.monoValue}>{value}</span>
    </div>
  );
}

// =============================================================================
// SCHEDULE LIST - Matches BailSchedule pattern from BailCard
// =============================================================================

function ScheduleList({ bailCourt }: { bailCourt: BailHubDetails['bailCourt'] }) {
  const scheduleItems = [
    { label: 'Triage', value: [bailCourt.triage_time_am, bailCourt.triage_time_pm].filter(Boolean).join(' / '), color: undefined },
    { label: 'Court', value: [bailCourt.court_start_am, bailCourt.court_start_pm].filter(Boolean).join(' / '), color: undefined },
    { label: 'Cutoff', value: bailCourt.cutoff_new_arrests, color: undefined },
    { label: 'Youth', value: bailCourt.youth_custody_day && bailCourt.youth_custody_time ? `${bailCourt.youth_custody_day} ${bailCourt.youth_custody_time}` : null, color: 'sky' as const },
  ].filter(item => item.value);

  if (scheduleItems.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className={card.divided}>
        {scheduleItems.map((item) => (
          <ScheduleRow key={item.label} label={item.label} value={item.value!} color={item.color} />
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// BAIL CONTACTS STACK - Matches CourtContactsStack pattern from ContactCard
// =============================================================================

interface BailContactsStackProps {
  bailContacts: BailContact[];
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

function BailContactsStack({ bailContacts, onCopy, isCopied }: BailContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  const sheriffCoord = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.SHERIFF_VB_COORDINATOR);
  const sheriffTeamsChat = sheriffCoord?.teams_chat || null;

  const contactsList = useMemo(() => {
    const result: { label: string; email: string; id: string }[] = [];

    if (sheriffCoord?.email) {
      result.push({ label: 'Sheriff Coordinator', email: sheriffCoord.email, id: `sheriff-${sheriffCoord.id}` });
    }

    const crown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN);
    if (crown?.email) {
      result.push({ label: 'Bail Crown', email: crown.email, id: `crown-${crown.id}` });
    }

    const fedCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN);
    if (fedCrown?.email) {
      result.push({ label: 'Federal Crown', email: fedCrown.email, id: `fed-crown-${fedCrown.id}` });
    }

    return result;
  }, [bailContacts, sheriffCoord]);

  const handleTeamsClick = () => {
    if (sheriffTeamsChat) {
      window.open(`https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(sheriffTeamsChat)}`, '_blank');
    }
  };

  if (contactsList.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Toggle button only - Section title handles the header */}
      {(!showFull ? hasTruncation : true) && (
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

      {/* Contact rows - matches ContactRow pattern */}
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

      {/* Teams Chat Button */}
      {sheriffTeamsChat && (
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
  const { bailCourt, region, bailTeams, bailContacts, linkedCourts } = details;
  
  const [expandedSection, setExpandedSection] = useState<AccordionSection>('schedule');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { copiedField, copyToClipboard, isCopied } = useCopyToClipboard();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const scheduleRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);
  const courtsRef = useRef<HTMLDivElement>(null);

  const backLabel = referrerName ? `← Back to ${referrerName}` : '← Back to Bail Hubs';

  const hasSchedule = bailCourt.triage_time_am || bailCourt.triage_time_pm || 
                      bailCourt.court_start_am || bailCourt.cutoff_new_arrests ||
                      (bailCourt.youth_custody_day && bailCourt.youth_custody_time);

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
      schedule: scheduleRef, contacts: contactsRef, teams: teamsRef, courts: courtsRef,
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
    { key: 'schedule', label: 'Schedule', icon: <FaClock className={iconSize.md} />, show: hasSchedule },
    { key: 'contacts', label: 'Contacts', icon: <FaAt className={iconSize.md} />, count: bailContacts.length, show: bailContacts.length > 0 },
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
        
        <BailHubHeader bailCourt={bailCourt} region={region} collapsed={isHeaderCollapsed} />
        
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
          {/* Schedule section - p-3 wrapper matches CourtDetailPage */}
          {hasSchedule && (
            <Section
              ref={scheduleRef}
              color="amber"
              title="Schedule"
              isExpanded={expandedSection === 'schedule'}
              onToggle={() => toggleSection('schedule')}
            >
              <div className="p-3">
                <ScheduleList bailCourt={bailCourt} />
              </div>
            </Section>
          )}

          {/* Contacts section - p-3 wrapper matches CourtDetailPage */}
          {bailContacts.length > 0 && (
            <Section
              ref={contactsRef}
              color="amber"
              title="Bail Contacts"
              count={bailContacts.length}
              isExpanded={expandedSection === 'contacts'}
              onToggle={() => toggleSection('contacts')}
            >
              <div className="p-3">
                <BailContactsStack 
                  bailContacts={bailContacts} 
                  onCopy={copyToClipboard} 
                  isCopied={isCopied} 
                />
              </div>
            </Section>
          )}

          {/* Teams section - p-3 wrapper matches CourtDetailPage */}
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

          {/* Courts section - p-3 wrapper matches CourtDetailPage */}
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

      <Toast message="Copied to clipboard" isVisible={!!copiedField} />
    </div>
  );
}
