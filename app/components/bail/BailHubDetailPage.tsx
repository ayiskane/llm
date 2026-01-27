'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { FaArrowLeft, FaAt, FaVideo, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaCommentDots, FaBuilding, FaClock } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton, Toast } from '../ui';
import { TeamsList } from '@/app/components/features/TeamsCard';
import { CONTACT_ROLES, REGION_COLORS } from '@/lib/config/constants';
import { useCopyToClipboard, useTruncationDetection } from '@/lib/hooks';
import type { BailHubDetails, BailContact } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

type AccordionSection = 'schedule' | 'contacts' | 'teams' | 'courts' | null;

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5', 6: 'FED' };

// =============================================================================
// BAIL HUB HEADER - Matches CourtHeader/CentreHeader pattern
// =============================================================================

interface BailHubHeaderProps {
  bailCourt: BailHubDetails['bailCourt'];
  region: BailHubDetails['region'];
  collapsed: boolean;
}

function BailHubHeader({ bailCourt, region, collapsed }: BailHubHeaderProps) {
  return (
    <div className="px-4 py-2">
      {/* Title row - always visible, changes size */}
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
        
        {/* Tags - compact when collapsed */}
        <div className={cn(
          'flex items-center gap-1 shrink-0 transition-opacity duration-300',
          collapsed ? 'opacity-100' : 'opacity-0 hidden'
        )}>
          {region && (
            <span className="px-1.5 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
              <span className={cn('w-1.5 h-1.5 rounded-full', REGION_COLORS[region.id]?.dot)} />
              <span>{REGION_CODE[region.id] || region.code}</span>
            </span>
          )}
          <span className={cn(
            'px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide rounded',
            bailCourt.is_daytime ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
          )}>
            {bailCourt.is_daytime ? 'DAY' : 'EVE'}
          </span>
        </div>
      </div>
      
      {/* Expandable content - uses grid for smooth height animation */}
      <div 
        className={cn(
          'grid transition-all duration-300 ease-out',
          collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        )}
      >
        <div className="overflow-hidden text-left">
          {/* Tags row */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {region && (
              <span className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                <span className={cn('w-1.5 h-1.5 rounded-full', REGION_COLORS[region.id]?.dot)} />
                <span>{REGION_CODE[region.id] || region.code}</span>
                <span className="text-slate-600">|</span>
                <span>{region.name}</span>
              </span>
            )}
            <span className={cn(
              'px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide rounded',
              bailCourt.is_daytime ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
            )}>
              {bailCourt.is_daytime ? 'Weekday' : 'Evening/Weekend'}
            </span>
            {bailCourt.is_hybrid && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">Hybrid</span>
            )}
          </div>
          
          {/* Notes */}
          {bailCourt.notes && (
            <p className="text-xs text-slate-500 mt-1">{bailCourt.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// SCHEDULE SECTION CONTENT
// =============================================================================

function ScheduleContent({ bailCourt }: { bailCourt: BailHubDetails['bailCourt'] }) {
  const scheduleItems = [
    { label: 'Triage', value: [bailCourt.triage_time_am, bailCourt.triage_time_pm].filter(Boolean).join(' / '), color: 'amber' },
    { label: 'Court', value: [bailCourt.court_start_am, bailCourt.court_start_pm].filter(Boolean).join(' / '), color: 'amber' },
    { label: 'Cutoff', value: bailCourt.cutoff_new_arrests, color: 'amber' },
    { label: 'Youth', value: bailCourt.youth_custody_day && bailCourt.youth_custody_time ? `${bailCourt.youth_custody_day} ${bailCourt.youth_custody_time}` : null, color: 'sky' },
  ].filter(item => item.value);

  if (scheduleItems.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No schedule information available
      </div>
    );
  }

  return (
    <div className="bg-slate-900/20 divide-y divide-slate-700/30">
      {scheduleItems.map((item) => (
        <div key={item.label} className="flex items-center justify-between px-4 py-3">
          <span className={cn(
            'text-xs font-mono font-semibold uppercase tracking-wide',
            item.color === 'sky' ? 'text-sky-400' : 'text-amber-400'
          )} style={{ letterSpacing: '1px' }}>
            {item.label}
          </span>
          <span className="text-slate-400 text-xs font-mono">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// CONTACTS SECTION CONTENT
// =============================================================================

interface ContactsContentProps {
  bailContacts: BailContact[];
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}

function ContactsContent({ bailContacts, onCopy, isCopied }: ContactsContentProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  const sheriffCoord = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.SHERIFF_VB_COORDINATOR);
  const sheriffTeamsChat = sheriffCoord?.teams_chat || null;

  const contactsList = useMemo(() => {
    const result: { label: string; email: string; id: string }[] = [];

    // Sheriff VB Coordinator
    if (sheriffCoord?.email) {
      result.push({ label: 'Sheriff Coordinator', email: sheriffCoord.email, id: `sheriff-${sheriffCoord.id}` });
    }

    // Crown
    const crown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN);
    if (crown?.email) {
      result.push({ label: 'Bail Crown', email: crown.email, id: `crown-${crown.id}` });
    }

    // Federal Crown
    const fedCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN);
    if (fedCrown?.email) {
      result.push({ label: 'Federal Crown', email: fedCrown.email, id: `fed-crown-${fedCrown.id}` });
    }

    return result;
  }, [bailContacts, sheriffCoord]);

  const handleTeamsClick = () => {
    if (sheriffTeamsChat) {
      const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(sheriffTeamsChat)}`;
      window.open(teamsUrl, '_blank');
    }
  };

  if (contactsList.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No contacts available
      </div>
    );
  }

  return (
    <div className="bg-slate-900/20">
      {/* Show full toggle */}
      {(!showFull ? hasTruncation : true) && (
        <div className="flex justify-end px-3 py-2 border-b border-slate-700/30">
          <button
            onClick={(e) => { e.stopPropagation(); setShowFull(!showFull); }}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded text-xs tracking-wide transition-all',
              showFull ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400' : 'bg-transparent border border-slate-700/50 text-slate-500'
            )}
          >
            {showFull ? <FaEyeSlash className="w-3 h-3" /> : <FaEye className="w-3 h-3" />}
            <span>{showFull ? 'Truncate' : 'Show full'}</span>
          </button>
        </div>
      )}

      {/* Contacts list */}
      <div className="divide-y divide-slate-700/30">
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
              <div className="flex-1 py-3 px-3 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">{contact.label}</div>
                <div 
                  ref={!showFull ? registerRef : undefined}
                  className={cn(
                    "text-[11px] text-slate-300 font-mono mt-0.5",
                    showFull ? 'break-all whitespace-normal' : 'truncate'
                  )}
                >
                  {contact.email}
                </div>
              </div>
              <div className="flex items-center px-3">
                {isFieldCopied ? (
                  <FaClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FaCopy className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Teams Chat Button */}
      {sheriffTeamsChat && (
        <div className="p-3 border-t border-slate-700/30">
          <button
            onClick={handleTeamsClick}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md",
              "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700",
              "text-white text-sm font-medium shadow-sm",
              "transition-colors duration-150"
            )}
          >
            <FaCommentDots className="w-4 h-4" />
            <span>Chat with Sheriff Coordinator</span>
          </button>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// LINKED COURTS SECTION CONTENT
// =============================================================================

interface LinkedCourtsContentProps {
  courts: { id: number; name: string }[];
  onCourtClick: (courtId: number) => void;
}

function LinkedCourtsContent({ courts, onCourtClick }: LinkedCourtsContentProps) {
  if (courts.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-sm">
        No linked courts
      </div>
    );
  }

  return (
    <div className="bg-slate-900/20 divide-y divide-slate-700/30">
      {courts.map((court) => (
        <button
          key={court.id}
          onClick={() => onCourtClick(court.id)}
          className="w-full flex items-center gap-3 py-3 px-4 hover:bg-slate-800/50 transition-colors text-left"
        >
          <FaBuilding className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <span className="text-sm text-slate-200">{court.name}</span>
        </button>
      ))}
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

  // Check if schedule has content
  const hasSchedule = bailCourt.triage_time_am || bailCourt.triage_time_pm || 
                      bailCourt.court_start_am || bailCourt.cutoff_new_arrests ||
                      (bailCourt.youth_custody_day && bailCourt.youth_custody_time);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const wasCollapsed = isHeaderCollapsed;
    
    if (!wasCollapsed && scrollTop > 80) {
      setIsHeaderCollapsed(true);
    } else if (wasCollapsed && scrollTop < 30) {
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
    { key: 'schedule', label: 'Schedule', icon: <FaClock className="w-4 h-4" />, show: hasSchedule },
    { key: 'contacts', label: 'Contacts', icon: <FaAt className="w-4 h-4" />, count: bailContacts.length, show: bailContacts.length > 0 },
    { key: 'teams', label: 'Teams', icon: <FaVideo className="w-4 h-4" />, count: bailTeams.length, show: bailTeams.length > 0 },
    { key: 'courts', label: 'Courts', icon: <FaBuilding className="w-4 h-4" />, count: linkedCourts.length, show: linkedCourts.length > 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        {/* Back button row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="text-sm">{backLabel}</span>
          </button>
        </div>
        
        {/* Bail Hub header */}
        <BailHubHeader bailCourt={bailCourt} region={region} collapsed={isHeaderCollapsed} />
        
        {/* Pill navigation - with top border */}
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

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth" onScroll={handleScroll}>
        <div className="p-3 space-y-2.5 pb-20">
          {/* Schedule section */}
          {hasSchedule && (
            <Section
              ref={scheduleRef}
              color="amber"
              title="Schedule"
              isExpanded={expandedSection === 'schedule'}
              onToggle={() => toggleSection('schedule')}
            >
              <ScheduleContent bailCourt={bailCourt} />
            </Section>
          )}

          {/* Contacts section */}
          {bailContacts.length > 0 && (
            <Section
              ref={contactsRef}
              color="amber"
              title="Bail Contacts"
              count={bailContacts.length}
              isExpanded={expandedSection === 'contacts'}
              onToggle={() => toggleSection('contacts')}
            >
              <ContactsContent 
                bailContacts={bailContacts} 
                onCopy={copyToClipboard} 
                isCopied={isCopied} 
              />
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

          {/* Linked Courts section */}
          {linkedCourts.length > 0 && (
            <Section
              ref={courtsRef}
              color="blue"
              title="Courts Using This Hub"
              count={linkedCourts.length}
              isExpanded={expandedSection === 'courts'}
              onToggle={() => toggleSection('courts')}
            >
              <LinkedCourtsContent courts={linkedCourts} onCourtClick={onNavigateToCourt} />
            </Section>
          )}
        </div>
      </div>

      <Toast message="Copied to clipboard" isVisible={!!copiedField} />
    </div>
  );
}
