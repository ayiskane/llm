'use client';

import { useState, useMemo } from 'react';
import { FaBuildingColumns, FaChevronRight, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaCommentDots } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, toggle, iconSize, getScheduleLabelClass } from '@/lib/config/theme';
import { TeamsList } from './TeamsCard';
import { isVBTriageLink, getBailHubTag, CONTACT_ROLES } from '@/lib/config/constants';
import { useTruncationDetection } from '@/lib/hooks';
import type { BailCourt, BailTeam, TeamsLink, WeekendBailCourtWithTeams, BailContact, ContactWithRole } from '@/types';

// ============================================================================
// SCHEDULE ROW COMPONENT
// ============================================================================

interface ScheduleRowProps {
  label: string;
  value: string;
  color?: 'amber' | 'sky';
}

function ScheduleRow({ label, value, color }: ScheduleRowProps) {
  return (
    <div className={card.flexRow}>
      <span 
        className={getScheduleLabelClass(color)}
        style={{ letterSpacing: '1px' }}
      >
        {label}
      </span>
      <span className={text.monoValue}>{value}</span>
    </div>
  );
}

// ============================================================================
// BAIL SCHEDULE COMPONENT
// ============================================================================

interface BailScheduleProps {
  bailCourt: BailCourt;
}

export function BailSchedule({ bailCourt }: BailScheduleProps) {
  const hasSchedule = bailCourt.triage_time_am || bailCourt.triage_time_pm || 
                      bailCourt.court_start_am || bailCourt.cutoff_new_arrests ||
                      (bailCourt.youth_custody_day && bailCourt.youth_custody_time);
  
  if (!hasSchedule) return null;

  return (
    <div className="space-y-1.5">
      <h4 className={text.sectionHeader}>Schedule</h4>
      
      <div className={card.divided}>
        {(bailCourt.triage_time_am || bailCourt.triage_time_pm) && (
          <ScheduleRow 
            label="Triage" 
            value={[bailCourt.triage_time_am, bailCourt.triage_time_pm].filter(Boolean).join(' / ')} 
          />
        )}

        {(bailCourt.court_start_am || bailCourt.court_start_pm) && (
          <ScheduleRow 
            label="Court" 
            value={[bailCourt.court_start_am, bailCourt.court_start_pm].filter(Boolean).join(' / ')} 
          />
        )}

        {bailCourt.cutoff_new_arrests && (
          <ScheduleRow label="Cutoff" value={bailCourt.cutoff_new_arrests} />
        )}

        {bailCourt.youth_custody_day && bailCourt.youth_custody_time && (
          <ScheduleRow 
            label="Youth" 
            value={`${bailCourt.youth_custody_day} ${bailCourt.youth_custody_time}`}
            color="sky"
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// BAIL HUB LINK COMPONENT
// ============================================================================

interface BailHubLinkProps {
  bailCourt: BailCourt;
  onNavigate: (courtId: number) => void;
}

// ============================================================================
// BAIL CONTACTS STACK
// ============================================================================

interface BailContactsStackProps {
  contacts: ContactWithRole[];
  bailContacts: BailContact[];
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

function BailContactsStack({ contacts, bailContacts, onCopy, isCopied }: BailContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();
  
  // Get sheriff coordinator Teams chat separately
  const sheriffCoord = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.SHERIFF_VB_COORDINATOR);
  const sheriffTeamsChat = sheriffCoord?.teams_chat || null;
  
  const bailContactsList = useMemo(() => {
    const result: { label: string; email: string; id: string }[] = [];

    // 1. Bail JCM first (from contacts table)
    const bailJcm = contacts.find(c => c.contact_role_id === CONTACT_ROLES.BAIL_JCM);
    if (bailJcm) {
      const email = bailJcm.emails?.[0] || bailJcm.email;
      if (email) {
        result.push({ label: 'Bail JCM', email, id: `bail-jcm-${bailJcm.id}` });
      }
    }

    // 2. Sheriff VB Coordinator (from bailContacts table)
    if (sheriffCoord?.email) {
      result.push({ 
        label: 'Sheriff Coordinator', 
        email: sheriffCoord.email, 
        id: `sheriff-coord-${sheriffCoord.id}`
      });
    }

    // 3. Bail Crown (from bailContacts table)
    const bailCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN);
    if (bailCrown?.email) {
      result.push({ label: 'Bail Crown', email: bailCrown.email, id: `bail-crown-${bailCrown.id}` });
    }

    // 4. Federal Crown (from bailContacts table)
    const fedCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN);
    if (fedCrown?.email) {
      result.push({ label: 'Federal Crown', email: fedCrown.email, id: `fed-crown-${fedCrown.id}` });
    }

    return result;
  }, [contacts, bailContacts, sheriffCoord]);

  if (bailContactsList.length === 0) return null;

  const handleTeamsClick = () => {
    if (sheriffTeamsChat) {
      const teamsUrl = `https://teams.microsoft.com/l/chat/0/0?users=${encodeURIComponent(sheriffTeamsChat)}`;
      window.open(teamsUrl, '_blank');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className={text.sectionHeader}>Bail Contacts</h4>
        {(!showFull ? hasTruncation : true) && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowFull(!showFull); }}
            className={cn(toggle.base, showFull ? toggle.active : toggle.inactive)}
          >
            {showFull ? <FaEyeSlash className={iconSize.xs} /> : <FaEye className={iconSize.xs} />}
            <span>{showFull ? 'Truncate' : 'Show full'}</span>
          </button>
        )}
      </div>
      <div className={card.divided}>
        {bailContactsList.map((contact) => {
          const isFieldCopied = isCopied ? isCopied(contact.id) : false;
          return (
            <div 
              key={contact.id}
              onClick={() => onCopy?.(contact.email, contact.id)}
              className={cn(
                "flex items-stretch cursor-pointer group transition-colors",
                isFieldCopied ? "bg-emerald-500/10" : "hover:bg-slate-800/50"
              )}
            >
              {/* Vertical color bar - amber for bail */}
              <div className="w-1 flex-shrink-0 bg-amber-400" />
              
              {/* Content: label + email stacked */}
              <div className="flex-1 py-2 px-3 min-w-0">
                <div className="text-[9px] text-slate-500 uppercase tracking-wider">
                  {contact.label}
                </div>
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
              
              {/* Copy icon */}
              <div className="flex items-center px-2">
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
      
      {/* Teams Chat Button - separate from contact list */}
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
          <FaCommentDots className="w-4 h-4" />
          <span>Chat with Sheriff Coordinator</span>
        </button>
      )}
    </div>
  );
}

export function BailHubLink({ bailCourt, onNavigate }: BailHubLinkProps) {
  if (!bailCourt.court_id) return null;

  const courtName = `${bailCourt.name.replace(' Virtual Bail', '')} Law Courts`;

  return (
    <button
      onClick={() => onNavigate(bailCourt.court_id!)}
      className={cn(
        "w-full rounded-xl overflow-hidden",
        "bg-slate-800/40 border border-slate-700/50",
        "hover:bg-slate-800/60 hover:border-slate-600/50",
        "active:bg-slate-700/50",
        "transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-3 px-3 py-3">
        <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
          <FaBuildingColumns className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium text-slate-200 truncate">{courtName}</div>
          <div className="text-xs text-slate-500 mt-0.5">Tap to view court details</div>
        </div>
        <FaChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
      </div>
    </button>
  );
}

// ============================================================================
// BAIL TAB BUTTON
// ============================================================================

interface BailTabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function BailTab({ label, isActive, onClick }: BailTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all",
        isActive
          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
          : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
      )}
    >
      {label}
    </button>
  );
}

// ============================================================================
// WEEKDAY BAIL CONTENT
// ============================================================================

interface WeekdayBailContentProps {
  bailCourt: BailCourt;
  currentCourtId: number;
  bailTeams: TeamsLink[];
  courtTeams: TeamsLink[];
  contacts: ContactWithRole[];
  bailContacts: BailContact[];
  onNavigateToHub?: (courtId: number) => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

function WeekdayBailContent({
  bailCourt,
  currentCourtId,
  bailTeams,
  courtTeams,
  contacts,
  bailContacts,
  onNavigateToHub,
  onCopy,
  isCopied,
}: WeekdayBailContentProps) {
  const isHub = bailCourt.court_id === currentCourtId;
  
  const allBailTeams = useMemo(() => {
    // Include VB Triage from courtTeams in Virtual Bail
    const vbTriageFromCourt = courtTeams.filter(t => isVBTriageLink(t.name || t.courtroom));
    const combined = [...bailTeams, ...vbTriageFromCourt];
    
    const seen = new Set<number>();
    const unique = combined.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    
    // Helper to extract number from courtroom name (e.g., "CR 201" -> 201)
    const extractNumber = (name: string): number => {
      const match = name.match(/\d+/);
      return match ? parseInt(match[0], 10) : Infinity;
    };
    
    return unique.sort((a, b) => {
      const aName = a.name || a.courtroom || '';
      const bName = b.name || b.courtroom || '';
      
      // 1. VB Triage links come first
      const aIsTriage = isVBTriageLink(aName);
      const bIsTriage = isVBTriageLink(bName);
      if (aIsTriage && !bIsTriage) return -1;
      if (!aIsTriage && bIsTriage) return 1;
      
      // 2. Sort by number ascending (CR 201 before CR 204)
      return extractNumber(aName) - extractNumber(bName);
    });
  }, [bailTeams, courtTeams]);

  return (
    <div className="space-y-3">
      {!isHub && bailCourt.court_id && onNavigateToHub && (
        <BailHubLink bailCourt={bailCourt} onNavigate={onNavigateToHub} />
      )}
      <BailSchedule bailCourt={bailCourt} />
      <BailContactsStack contacts={contacts} bailContacts={bailContacts} onCopy={onCopy} isCopied={isCopied} />
      {allBailTeams.length > 0 && (
        <TeamsList links={allBailTeams} filterVBTriage={false} onCopy={onCopy} isCopied={isCopied} />
      )}
    </div>
  );
}

// ============================================================================
// WEEKEND BAIL CONTENT
// ============================================================================

interface WeekendBailContentProps {
  weekendBailCourts: WeekendBailCourtWithTeams[];
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

function WeekendBailContent({ weekendBailCourts, onCopy, isCopied }: WeekendBailContentProps) {
  const courtsWithTeams = weekendBailCourts.filter(wc => wc.teams.length > 0);
  
  if (courtsWithTeams.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-4">
        No evening/weekend bail information available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {courtsWithTeams.map(({ court, teams }) => (
        <div key={court.id} className="space-y-2">
          <div className="text-xs font-medium text-purple-400/80 uppercase tracking-wider">
            {court.name}
          </div>
          {court.notes && (
            <div className="text-xs text-slate-500 -mt-1">{court.notes}</div>
          )}
          <TeamsList links={teams} filterVBTriage={false} onCopy={onCopy} isCopied={isCopied} />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// BAIL SECTION CONTENT - TABBED
// ============================================================================

interface BailSectionContentProps {
  bailCourt: BailCourt;
  currentCourtId: number;
  currentCourtName: string;
  bailTeams: BailTeam[];
  courtTeams: TeamsLink[];
  contacts: ContactWithRole[];
  bailContacts: BailContact[];
  weekendBailCourts?: WeekendBailCourtWithTeams[];
  onNavigateToHub?: (courtId: number) => void;
  onNavigateToBailHub?: (bailCourtId: number, fromName: string) => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function BailSectionContent({
  bailCourt,
  currentCourtId,
  currentCourtName,
  bailTeams,
  courtTeams,
  contacts,
  bailContacts,
  weekendBailCourts = [],
  onNavigateToHub,
  onNavigateToBailHub,
  onCopy,
  isCopied,
}: BailSectionContentProps) {
  const [activeTab, setActiveTab] = useState<'weekday' | 'weekend'>('weekday');
  
  const hasWeekendBail = weekendBailCourts.some(wc => wc.teams.length > 0);

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-2">
        <BailTab 
          label="Weekday" 
          isActive={activeTab === 'weekday'} 
          onClick={() => setActiveTab('weekday')} 
        />
        <BailTab 
          label="Evening / Weekend" 
          isActive={activeTab === 'weekend'} 
          onClick={() => setActiveTab('weekend')} 
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'weekday' ? (
        <WeekdayBailContent
          bailCourt={bailCourt}
          currentCourtId={currentCourtId}
          bailTeams={bailTeams}
          courtTeams={courtTeams}
          contacts={contacts}
          bailContacts={bailContacts}
          onNavigateToHub={onNavigateToHub}
          onCopy={onCopy}
          isCopied={isCopied}
        />
      ) : (
        <WeekendBailContent
          weekendBailCourts={weekendBailCourts}
          onCopy={onCopy}
          isCopied={isCopied}
        />
      )}

      {/* View full bail hub details link */}
      {onNavigateToBailHub && (
        <button
          onClick={() => onNavigateToBailHub(bailCourt.id, currentCourtName)}
          className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2 transition-colors"
        >
          View full bail hub details →
        </button>
      )}
    </div>
  );
}

export { getBailHubTag };





