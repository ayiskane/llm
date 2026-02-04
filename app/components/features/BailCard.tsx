'use client';

import { useState, useMemo } from 'react';
import { FaBuildingColumns, FaChevronRight, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, toggle, iconSize } from '@/lib/config/theme';
import { TeamsList } from './TeamsCard';
import { isVBTriageLink, getBailHubTag, CONTACT_ROLES } from '@/lib/config/constants';
import { useTruncationDetection } from '@/lib/hooks';
import type { BailHub, TeamsLink, WeekendBailHubWithTeams, BailContact, ContactWithRole } from '@/types';

// ============================================================================
// BAIL HUB LINK COMPONENT
// ============================================================================

interface BailHubLinkProps {
  bailHub: BailHub;
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

  const bailContactsList = useMemo(() => {
    const result: { label: string; email: string; id: string }[] = [];

    // 1. Bail JCM first (from contacts table via entity_contacts)
    const bailJcm = contacts.find(c => c.role_id === CONTACT_ROLES.BAIL_JCM);
    if (bailJcm?.email) {
      result.push({ label: 'Bail JCM', email: bailJcm.email, id: `bail-jcm-${bailJcm.id}` });
    }

    // 2. Sheriff VB Coordinator (from bailContacts)
    const sheriffCoord = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.SHERIFF_VB_COORDINATOR);
    if (sheriffCoord?.email) {
      result.push({
        label: 'Sheriff Coordinator',
        email: sheriffCoord.email,
        id: `sheriff-coord-${sheriffCoord.id}`
      });
    }

    // 3. Bail Crown (from bailContacts)
    const bailCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN);
    if (bailCrown?.email) {
      result.push({ label: 'Bail Crown', email: bailCrown.email, id: `bail-crown-${bailCrown.id}` });
    }

    // 4. Federal Crown (from bailContacts)
    const fedCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.FEDERAL_CROWN);
    if (fedCrown?.email) {
      result.push({ label: 'Federal Crown', email: fedCrown.email, id: `fed-crown-${fedCrown.id}` });
    }

    return result;
  }, [contacts, bailContacts]);

  if (bailContactsList.length === 0) return null;

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
    </div>
  );
}

export function BailHubLink({ bailHub, onNavigate }: BailHubLinkProps) {
  if (!bailHub.court_id) return null;

  const courtName = `${bailHub.name.replace(' Virtual Bail', '')} Law Courts`;

  return (
    <button
      onClick={() => onNavigate(bailHub.court_id!)}
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
  bailHub: BailHub;
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
  bailHub,
  currentCourtId,
  bailTeams,
  courtTeams,
  contacts,
  bailContacts,
  onNavigateToHub,
  onCopy,
  isCopied,
}: WeekdayBailContentProps) {
  const isHub = bailHub.court_id === currentCourtId;

  const allBailTeams = useMemo(() => {
    // Include VB Triage from courtTeams in Virtual Bail
    const vbTriageFromCourt = courtTeams.filter(t => isVBTriageLink(t.courtroom || t.type_name));
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
      const aName = a.courtroom || a.type_name || '';
      const bName = b.courtroom || b.type_name || '';

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
      {!isHub && bailHub.court_id && onNavigateToHub && (
        <BailHubLink bailHub={bailHub} onNavigate={onNavigateToHub} />
      )}
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
  weekendBailHubs: WeekendBailHubWithTeams[];
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

function WeekendBailContent({ weekendBailHubs, onCopy, isCopied }: WeekendBailContentProps) {
  const hubsWithTeams = weekendBailHubs.filter(wh => wh.teams.length > 0);

  if (hubsWithTeams.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-4">
        No evening/weekend bail information available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hubsWithTeams.map(({ bailHub, teams }) => (
        <div key={bailHub.id} className="space-y-2">
          <div className="text-xs font-medium text-purple-400/80 uppercase tracking-wider">
            {bailHub.name}
          </div>
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
  bailHub: BailHub;
  currentCourtId: number;
  currentCourtName: string;
  bailTeams: TeamsLink[];
  courtTeams: TeamsLink[];
  contacts: ContactWithRole[];
  bailContacts: BailContact[];
  weekendBailHubs?: WeekendBailHubWithTeams[];
  onNavigateToHub?: (courtId: number) => void;
  onNavigateToBailHub?: (bailHubId: number, fromName: string) => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function BailSectionContent({
  bailHub,
  currentCourtId,
  currentCourtName,
  bailTeams,
  courtTeams,
  contacts,
  bailContacts,
  weekendBailHubs = [],
  onNavigateToHub,
  onNavigateToBailHub,
  onCopy,
  isCopied,
}: BailSectionContentProps) {
  const [activeTab, setActiveTab] = useState<'weekday' | 'weekend'>('weekday');

  const hasWeekendBail = weekendBailHubs.some(wh => wh.teams.length > 0);

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
          bailHub={bailHub}
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
          weekendBailHubs={weekendBailHubs}
          onCopy={onCopy}
          isCopied={isCopied}
        />
      )}

      {/* View full bail hub details link */}
      {onNavigateToBailHub && (
        <button
          onClick={() => onNavigateToBailHub(bailHub.id, currentCourtName)}
          className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2 transition-colors"
        >
          View full bail hub details →
        </button>
      )}
    </div>
  );
}

export { getBailHubTag };
