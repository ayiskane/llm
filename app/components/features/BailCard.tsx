'use client';

import { useMemo } from 'react';
import { FaBuildingColumns, FaChevronRight } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, iconSize, getScheduleLabelClass } from '@/lib/config/theme';
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
                      bailCourt.court_start_am || bailCourt.cutoff_new_arrests;
  
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
// BAIL HUB LINK COMPONENT - Card style linking to hub court
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
      {/* Card content */}
      <div className="flex items-center gap-3 px-3 py-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
          <FaBuildingColumns className="w-5 h-5 text-teal-400" />
        </div>
        
        {/* Court info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-medium text-slate-200 truncate">
            {courtName}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Tap to view court details
          </div>
        </div>
        
        {/* Chevron */}
        <FaChevronRight className="w-5 h-5 text-slate-500 shrink-0" />
      </div>
    </button>
  );
}

// ============================================================================
// WEEKEND BAIL COURT CARD - Shows a single weekend bail court with its teams
// ============================================================================

interface WeekendBailCardProps {
  weekendCourt: WeekendBailCourtWithTeams;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

function WeekendBailCard({ weekendCourt, onCopy, isCopied }: WeekendBailCardProps) {
  const { court, teams } = weekendCourt;
  
  if (teams.length === 0) return null;
  
  return (
    <div className="space-y-2">
      <div className="text-xs font-medium text-purple-400/80 uppercase tracking-wider">
        {court.name}
      </div>
      {court.notes && (
        <div className="text-xs text-slate-500 -mt-1">
          {court.notes}
        </div>
      )}
      <TeamsList
        links={teams}
        filterVBTriage={false}
        onCopy={onCopy}
        isCopied={isCopied}
      />
    </div>
  );
}

// ============================================================================
// BAIL SECTION CONTENT COMPONENT
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
  const isHub = bailCourt.court_id === currentCourtId;
  
  // Combine and sort bail teams: VB Triage links first, then courtroom links
  const allBailTeams = useMemo(() => {
    // Get VB triage links from court teams
    const vbTriageFromCourt = courtTeams.filter(t => isVBTriageLink(t.name || t.courtroom));
    
    // Combine all teams
    const combined = [...bailTeams, ...vbTriageFromCourt];
    
    // Deduplicate by id
    const seen = new Set<number>();
    const unique = combined.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
    
    // Sort: VB Triage links first, then others
    return unique.sort((a, b) => {
      const aIsTriage = isVBTriageLink(a.name || a.courtroom);
      const bIsTriage = isVBTriageLink(b.name || b.courtroom);
      
      // Triage links come first
      if (aIsTriage && !bIsTriage) return -1;
      if (!aIsTriage && bIsTriage) return 1;
      
      // Within same type, sort alphabetically by name
      const aName = a.name || a.courtroom || '';
      const bName = b.name || b.courtroom || '';
      return aName.localeCompare(bName);
    });
  }, [bailTeams, courtTeams]);

  // Filter weekend bail courts that have teams
  const weekendCourtsWithTeams = weekendBailCourts.filter(wc => wc.teams.length > 0);

  return (
    <div className="space-y-3">
      {!isHub && bailCourt.court_id && onNavigateToHub && (
        <BailHubLink bailCourt={bailCourt} onNavigate={onNavigateToHub} />
      )}
      
      <BailSchedule bailCourt={bailCourt} />
      
      {allBailTeams.length > 0 && (
        <TeamsList
          links={allBailTeams}
          filterVBTriage={false}
          onCopy={onCopy}
          isCopied={isCopied}
        />
      )}
      
      {/* Weekend/Evening Bail Section - handles multiple bail courts */}
      {weekendCourtsWithTeams.length > 0 && (
        <div className="space-y-3">
          <h4 className={text.sectionHeader}>Weekend / Evening Bail</h4>
          {weekendCourtsWithTeams.map((wc) => (
            <WeekendBailCard
              key={wc.court.id}
              weekendCourt={wc}
              onCopy={onCopy}
              isCopied={isCopied}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export { getBailHubTag };
