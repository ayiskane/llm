'use client';

import { useMemo } from 'react';
import { Bank2, ChevronRight } from 'react-bootstrap-icons';
import { cn } from '@/lib/utils';
import { card, text, iconSize, getScheduleLabelClass } from '@/lib/config/theme';
import { TeamsList } from './TeamsCard';
import { isVBTriageLink, getBailHubTag } from '@/lib/config/constants';
import type { BailCourt, BailTeam, TeamsLink } from '@/types';

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
      <span className={getScheduleLabelClass(isAmber)}>{label}</span>
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
// BAIL HUB LINK COMPONENT
// ============================================================================

interface BailHubLinkProps {
  bailCourt: BailCourt;
  onNavigate: (courtId: number) => void;
}

export function BailHubLink({ bailCourt, onNavigate }: BailHubLinkProps) {
  if (!bailCourt.court_id) return null;

  return (
    <button
      onClick={() => onNavigate(bailCourt.court_id!)}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg card-base transition-colors hover:bg-slate-800/50"
    >
      <Bank2 className={cn(iconSize.md, 'text-teal-400')} />
      <span className="flex-1 text-left text-sm font-medium text-white">
        {bailCourt.name.replace(' Virtual Bail', '')} Law Courts
      </span>
      <ChevronRight className={cn(iconSize.md, 'text-slate-500')} />
    </button>
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
  onNavigateToHub?: (courtId: number) => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function BailSectionContent({
  bailCourt,
  currentCourtId,
  bailTeams,
  courtTeams,
  onNavigateToHub,
  onCopy,
  isCopied,
}: BailSectionContentProps) {
  const isHub = bailCourt.court_id === currentCourtId;
  
  const allBailTeams = useMemo(() => {
    const vbTriageFromCourt = courtTeams.filter(t => isVBTriageLink(t.name || t.courtroom));
    const combined = [...bailTeams, ...vbTriageFromCourt];
    const seen = new Set<number>();
    return combined.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [bailTeams, courtTeams]);

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
    </div>
  );
}

export { getBailHubTag };
