'use client';

import { useCallback } from 'react';
import { FaArrowLeft, FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaCommentDots, FaBuilding } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, toggle, iconSize, getScheduleLabelClass } from '@/lib/config/theme';
import { TeamsList } from '@/app/components/features/TeamsCard';
import { CONTACT_ROLES, REGION_COLORS } from '@/lib/config/constants';
import { useCopyToClipboard, useTruncationDetection } from '@/lib/hooks';
import type { BailHubDetails, BailContact } from '@/types';
import { useState, useMemo } from 'react';

// =============================================================================
// REGION CODE MAP
// =============================================================================

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5', 6: 'FED' };

// =============================================================================
// SCHEDULE ROW COMPONENT
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
// BAIL SCHEDULE COMPONENT
// =============================================================================

function BailSchedule({ bailCourt }: { bailCourt: BailHubDetails['bailCourt'] }) {
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

// =============================================================================
// BAIL CONTACTS COMPONENT
// =============================================================================

function BailContactsSection({ 
  bailContacts, 
  onCopy, 
  isCopied 
}: { 
  bailContacts: BailContact[];
  onCopy: (text: string, id: string) => void;
  isCopied: (id: string) => boolean;
}) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  // Get sheriff coordinator Teams chat
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

  if (contactsList.length === 0) return null;

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

// =============================================================================
// LINKED COURTS COMPONENT
// =============================================================================

function LinkedCourts({ 
  courts, 
  onCourtClick 
}: { 
  courts: { id: number; name: string }[];
  onCourtClick: (courtId: number) => void;
}) {
  if (courts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className={text.sectionHeader}>Courts Using This Bail Hub</h4>
      <div className={card.divided}>
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => onCourtClick(court.id)}
            className="w-full flex items-center gap-3 py-2.5 px-3 hover:bg-slate-800/50 transition-colors text-left"
          >
            <FaBuilding className="w-4 h-4 text-slate-500 flex-shrink-0" />
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
}

export function BailHubDetailPage({ details, onBack, onNavigateToCourt }: BailHubDetailPageProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const { bailCourt, region, bailTeams, bailContacts, linkedCourts } = details;

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-950 border-b border-slate-800/50 px-4 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-3 transition-colors"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Bail Hubs</span>
        </button>

        <h1 className="text-xl font-bold text-white mb-2">{bailCourt.name}</h1>
        
        <div className="flex items-center gap-2 flex-wrap">
          {region && (
            <span className="px-2 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
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

        {bailCourt.notes && (
          <p className="text-sm text-slate-400 mt-3">{bailCourt.notes}</p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <BailSchedule bailCourt={bailCourt} />
          <BailContactsSection bailContacts={bailContacts} onCopy={copyToClipboard} isCopied={isCopied} />
          
          {bailTeams.length > 0 && (
            <div className="space-y-1.5">
              <h4 className={text.sectionHeader}>Teams Links</h4>
              <TeamsList links={bailTeams} filterVBTriage={false} onCopy={copyToClipboard} isCopied={isCopied} />
            </div>
          )}

          <LinkedCourts courts={linkedCourts} onCourtClick={onNavigateToCourt} />
        </div>
      </div>
    </div>
  );
}
