'use client';

import { FaAt, FaMicrosoftTeams } from '@/lib/icons';
import { cn, card, text, iconSize } from '@/lib/config/theme';
import { Button } from '@/app/components/ui/Button';
import { joinTeamsMeeting } from '@/lib/utils';
import type { JcmFxdSchedule } from '@/types';

// ============================================================================
// SCHEDULE ROW COMPONENT
// ============================================================================

interface ScheduleRowProps {
  label: string;
  value: string;
}

function ScheduleRow({ label, value }: ScheduleRowProps) {
  return (
    <div className={card.flexRow}>
      <span className={cn(text.scheduleLabel, text.label)} style={{ letterSpacing: '1px' }}>
        {label}
      </span>
      <span className={text.mono}>{value}</span>
    </div>
  );
}

// ============================================================================
// JCM FXD SCHEDULE COMPONENT
// ============================================================================

interface JcmFxdScheduleCardProps {
  schedule: JcmFxdSchedule;
}

export function JcmFxdScheduleCard({ schedule }: JcmFxdScheduleCardProps) {
  const hasTeamsLink = !!schedule.teams_link_id && !!schedule.teams_link;
  const hasSchedule = !!schedule.days || !!schedule.time;
  const emailOnly = !hasTeamsLink && schedule.email_acceptable;

  // Email Only - no Teams link
  if (emailOnly && !hasSchedule) {
    return (
      <div className="space-y-1.5">
        <h4 className={text.sectionHeader}>JCM Fixed Date</h4>
        <div className={cn(card.base, "p-3")}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <FaAt className={cn(iconSize.md, "text-emerald-400")} />
            </div>
            <div>
              <div className={cn("text-sm", text.body)}>Email Only</div>
              <div className={cn("text-xs", text.placeholder)}>No in-person JCM FXD appearances</div>
            </div>
          </div>
          {schedule.notes && (
            <div className={cn("mt-2 text-xs", text.hint)}>{schedule.notes}</div>
          )}
        </div>
      </div>
    );
  }

  // Teams Only - has Teams link, no email option
  if (hasTeamsLink && !schedule.email_acceptable && !hasSchedule) {
    return (
      <div className="space-y-1.5">
        <h4 className={text.sectionHeader}>JCM Fixed Date</h4>
        <div className={cn(card.base, "p-3")}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <FaMicrosoftTeams className={cn(iconSize.md, "text-indigo-400")} />
              </div>
              <div>
                <div className={cn("text-sm", text.body)}>Teams Only</div>
                <div className={cn("text-xs", text.placeholder)}>Must appear via MS Teams</div>
              </div>
            </div>
            {schedule.teams_link?.teams_link && (
              <Button 
                variant="join" 
                size="sm" 
                onClick={() => joinTeamsMeeting(schedule.teams_link!.teams_link!)}
              >
                <FaMicrosoftTeams className="w-3.5 h-3.5" />
                Join
              </Button>
            )}
          </div>
          {schedule.notes && (
            <div className={cn("mt-2 text-xs", text.hint)}>{schedule.notes}</div>
          )}
        </div>
      </div>
    );
  }

  // Has schedule (with or without Teams link)
  return (
    <div className="space-y-1.5">
      <h4 className={text.sectionHeader}>JCM Fixed Date</h4>
      <div className={card.divided}>
        {schedule.days && (
          <ScheduleRow label="Days" value={schedule.days} />
        )}
        {schedule.time && (
          <ScheduleRow label="Time" value={schedule.time} />
        )}
        <div className={cn(card.flexRow, "items-center")}>
          <span className={cn(text.scheduleLabel, text.label)} style={{ letterSpacing: '1px' }}>
            Method
          </span>
          <div className="flex items-center gap-2">
            {hasTeamsLink && (
              <span className="text-xs text-indigo-400 font-medium">Teams</span>
            )}
            {hasTeamsLink && schedule.email_acceptable && (
              <span className="text-xs text-slate-500">/</span>
            )}
            {schedule.email_acceptable && (
              <span className="text-xs text-emerald-400 font-medium">Email</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Join button if Teams link exists */}
      {hasTeamsLink && schedule.teams_link?.teams_link && (
        <div className="pt-1">
          <Button 
            variant="join" 
            size="sm"
            className="w-full justify-center"
            onClick={() => joinTeamsMeeting(schedule.teams_link!.teams_link!)}
          >
            <FaMicrosoftTeams className="w-3.5 h-3.5" />
            Join JCM FXD
          </Button>
        </div>
      )}
      
      {schedule.notes && (
        <div className={cn("px-1 text-xs", text.placeholder)}>{schedule.notes}</div>
      )}
    </div>
  );
}
