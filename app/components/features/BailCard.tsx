'use client';

import { useState, useMemo } from 'react';
import { FaBuildingColumns, FaChevronRight } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, getScheduleLabelClass } from '@/lib/config/theme';
import { TeamsList } from './TeamsCard';
import { isVBTriageLink, getBailHubTag } from '@/lib/config/constants';
import type { BailCourt, BailTeam, TeamsLink, WeekendBailCourtWithTeams } from '@/types';

// ============================================================================
// SCHEDULE ROW COMPONENT
// ============================================================================

interface ScheduleRowProps {
  label: string;
  value: string;
  isAmber?: boolean;
}

function ScheduleRow({ label, value, isAmber = false }: ScheduleRowProps) {
  return (
    <div className={card.flexRow}>
      <span 
        className={getScheduleLabelClass(isAmber)}
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
            isAmber 
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
        <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
          <FaBuildingColumns className="w-5 h-5 text-teal-400" />
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
          ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
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
  onNavigateToHub?: (courtId: number) => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

function WeekdayBailContent({
  bailCourt,
  currentCourtId,
  bailTeams,
  courtTeams,
  onNavigateToHub,
  onCopy,
  isCopied,
}: WeekdayBailContentProps) {
  const isHub = bailCourt.court_id === currentCourtId;
  
  const allBailTeams = useMemo(() => {
    const vbTriageFromCourt = courtTeams.filter(t => isVBTriageLink(t.name || t.courtroom));
    const combined = [...bailTeams, ...vbTriageFromCourt];
    
    const seen = new Set<number>();
    const unique = combined.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    
    return unique.sort((a, b) => {
      const aIsTriage = isVBTriageLink(a.name || a.courtroom);
      const bIsTriage = isVBTriageLink(b.name || b.courtroom);
      if (aIsTriage && !bIsTriage) return -1;
      if (!aIsTriage && bIsTriage) return 1;
      return (a.name || a.courtroom || '').localeCompare(b.name || b.courtroom || '');
    });
  }, [bailTeams, courtTeams]);

  return (
    <div className="space-y-3">
      {!isHub && bailCourt.court_id && onNavigateToHub && (
        <BailHubLink bailCourt={bailCourt} onNavigate={onNavigateToHub} />
      )}
      <BailSchedule bailCourt={bailCourt} />
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
  bailTeams: BailTeam[];
  courtTeams: TeamsLink[];
  weekendBailCourts?: WeekendBailCourtWithTeams[];
  onNavigateToHub?: (courtId: number) => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function BailSectionContent({
  bailCourt,
  currentCourtId,
  bailTeams,
  courtTeams,
  weekendBailCourts = [],
  onNavigateToHub,
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
    </div>
  );
}

export { getBailHubTag };
