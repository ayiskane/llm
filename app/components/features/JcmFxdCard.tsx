// 'use client';

// import { FaMicrosoftTeams } from '@/lib/icons';
// import { cn } from '@/lib/utils';
// import { card, text, iconSize } from '@/lib/config/theme';
// import { Button } from '@/app/components/ui/Button';
// import { joinTeamsMeeting } from '@/lib/utils';
// import type { JcmFxdSchedule } from '@/types';

// // ============================================================================
// // SCHEDULE ROW COMPONENT
// // ============================================================================

// interface ScheduleRowProps {
//   label: string;
//   value: string;
// }

// function ScheduleRow({ label, value }: ScheduleRowProps) {
//   return (
//     <div className={card.flexRow}>
//       <span className={cn(text.scheduleLabel, 'text-slate-300')} style={{ letterSpacing: '1px' }}>
//         {label}
//       </span>
//       <span className={text.monoValue}>{value}</span>
//     </div>
//   );
// }

// // ============================================================================
// // JCM FXD SCHEDULE COMPONENT
// // ============================================================================

// interface JcmFxdScheduleCardProps {
//   schedule: JcmFxdSchedule;
// }

// export function JcmFxdScheduleCard({ schedule }: JcmFxdScheduleCardProps) {
//   const hasTeamsLink = !!schedule.teams_link?.url;
//   const hasSchedule = !!schedule.days || !!schedule.time || !!schedule.day_of_week || !!schedule.time_start;

//   // No schedule info at all
//   if (!hasSchedule && !hasTeamsLink) {
//     return null;
//   }

//   // Display values
//   const displayDays = schedule.days || schedule.day_of_week || '';
//   const displayTime = schedule.time || schedule.time_start || '';

//   // Has schedule (with or without Teams link)
//   return (
//     <div className="space-y-1.5">
//       <h4 className={text.sectionHeader}>JCM Fixed Date</h4>
//       <div className={card.divided}>
//         {displayDays && (
//           <ScheduleRow label="Days" value={displayDays} />
//         )}
//         {displayTime && (
//           <ScheduleRow label="Time" value={displayTime} />
//         )}
//         {hasTeamsLink && (
//           <div className={cn(card.flexRow, "items-center")}>
//             <span className={cn(text.scheduleLabel, 'text-slate-300')} style={{ letterSpacing: '1px' }}>
//               Method
//             </span>
//             <span className="text-xs text-indigo-400 font-medium">Teams</span>
//           </div>
//         )}
//       </div>

//       {/* Join button if Teams link exists */}
//       {hasTeamsLink && schedule.teams_link?.url && (
//         <div className="pt-1">
//           <Button
//             variant="join"
//             size="sm"
//             className="w-full justify-center"
//             onClick={() => joinTeamsMeeting(schedule.teams_link!.url!)}
//           >
//             <FaMicrosoftTeams className="w-3.5 h-3.5" />
//             Join JCM FXD
//           </Button>
//         </div>
//       )}

//       {schedule.notes && (
//         <div className="px-1 text-xs text-slate-500">{schedule.notes}</div>
//       )}
//     </div>
//   );
// }
