'use client';

import { useMemo } from 'react';
import { Building, ChevronRight } from 'react-bootstrap-icons';
import { Card } from '@/app/components/ui/Card';
import { TeamsList } from './TeamsCard';
import { cn, textClasses, cardClasses, iconClasses, getSectionHeaderProps } from '@/lib/config/theme';
import { isVBTriageLink, getBailHubTag } from '@/lib/config/constants';
import type { BailCourt, BailTeam, TeamsLink, Court } from '@/types';

// Schedule component
interface BailScheduleProps {
  bailCourt: BailCourt;
}

export function BailSchedule({ bailCourt }: BailScheduleProps) {
  const scheduleItems = [
    { label: 'TRIAGE', value: bailCourt.triage_time_am && bailCourt.triage_time_pm 
      ? `${bailCourt.triage_time_am} / ${bailCourt.triage_time_pm}` 
      : bailCourt.triage_time_am || bailCourt.triage_time_pm || null 
    },
    { label: 'COURT', value: bailCourt.court_start_am && bailCourt.court_start_pm 
      ? `${bailCourt.court_start_am} / ${bailCourt.court_start_pm}` 
      : bailCourt.court_start_am || bailCourt.court_start_pm || null 
    },
    { label: 'CUTOFF', value: bailCourt.cutoff_new_arrests },
    { label: 'YOUTH', value: bailCourt.youth_custody_day && bailCourt.youth_custody_time 
      ? `${bailCourt.youth_custody_day} ${bailCourt.youth_custody_time}` 
      : null,
      isAmber: true 
    },
  ].filter(item => item.value);

  if (scheduleItems.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 {...getSectionHeaderProps()}>
        SCHEDULE
      </h4>
      <Card className="divide-y divide-slate-700/50">
        {scheduleItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center px-3 py-2">
            <span 
              className={cn(
                'text-xs font-mono font-semibold uppercase',
                item.isAmber ? 'text-amber-400' : 'text-slate-300'
              )}
              style={{ letterSpacing: '1px' }}
            >
              {item.label}
            </span>
            <span className="font-mono text-sm text-slate-400">
              {item.value}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// Link to bail hub court
interface BailHubLinkProps {
  court: Court;
  onClick: () => void;
}

export function BailHubLink({ court, onClick }: BailHubLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        cardClasses.interactive,
        'w-full p-3 flex items-center justify-between'
      )}
    >
      <div className="flex items-center gap-2">
        <Building className={cn(iconClasses.md, 'text-slate-400')} />
        <span className="text-sm font-medium text-slate-200">
          {court.name}
        </span>
      </div>
      <ChevronRight className={cn(iconClasses.md, 'text-slate-400')} />
    </button>
  );
}

// Full bail section content
interface BailSectionContentProps {
  bailCourt: BailCourt;
  currentCourtId: number;
  hubCourt?: Court | null;
  bailTeams: BailTeam[];
  courtTeams: TeamsLink[];
  onNavigateToHub?: () => void;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function BailSectionContent({
  bailCourt,
  currentCourtId,
  hubCourt,
  bailTeams,
  courtTeams,
  onNavigateToHub,
  onCopy,
  isCopied,
}: BailSectionContentProps) {
  // Check if current court is the bail hub
  const isHub = hubCourt?.id === currentCourtId;
  
  // Combine bail teams with VB Triage links from court teams
  const allBailTeams = useMemo(() => {
    const vbTriageFromCourt = courtTeams.filter(t => isVBTriageLink(t.name));
    const combined = [...bailTeams, ...vbTriageFromCourt];
    // Deduplicate by ID
    const seen = new Set<number>();
    return combined.filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }, [bailTeams, courtTeams]);

  return (
    <div className="space-y-4">
      {/* Link to hub court if not the hub */}
      {!isHub && hubCourt && onNavigateToHub && (
        <BailHubLink court={hubCourt} onClick={onNavigateToHub} />
      )}
      
      {/* Schedule */}
      <BailSchedule bailCourt={bailCourt} />
      
      {/* Teams links */}
      {allBailTeams.length > 0 && (
        <TeamsList
          links={allBailTeams}
          onCopy={onCopy}
          isCopied={isCopied}
        />
      )}
    </div>
  );
}

// Get bail hub tag for section title
export { getBailHubTag };

