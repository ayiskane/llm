'use client';

import { useState, useMemo } from 'react';
import { MicrosoftTeams, Eye, EyeSlash, Clipboard, ClipboardCheck, Telephone } from 'react-bootstrap-icons';
import { cn } from '@/lib/utils';
import { text, iconSize } from '@/lib/config/theme';
import { Button } from '@/app/components/ui/Button';
import { joinTeamsMeeting } from '@/lib/utils';
import { isVBTriageLink, formatCourtroomName } from '@/lib/config/constants';
import type { TeamsLink, BailTeam } from '@/types';

// ============================================================================
// TEAMS CARD COMPONENT
// ============================================================================

interface TeamsCardProps {
  link: TeamsLink | BailTeam;
  showDialIn?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsCard({ link, showDialIn = false, onCopy, isCopied }: TeamsCardProps) {
  const displayName = formatCourtroomName(link.courtroom || link.name);
  const hasDialInInfo = link.phone || link.conference_id;
  
  /**
   * Copy format:
   * {Link}
   * {phone}
   * {toll free number}
   * Conference ID: {conference ID}
   */
  const handleCopyAll = () => {
    if (!onCopy) return;
    const copyText = [
      link.teams_link,
      link.phone,
      link.phone_toll_free,
      link.conference_id && `Conference ID: ${link.conference_id}`,
    ].filter(Boolean).join('\n');
    onCopy(copyText, `teams-${link.id}`);
  };

  return (
    <div className="py-2.5 px-3 rounded-lg bg-slate-800/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MicrosoftTeams className={cn(iconSize.md, 'text-slate-400 flex-shrink-0')} />
          <span className={cn(text.secondary, 'text-sm font-medium truncate')}>{displayName}</span>
        </div>
        
        {link.teams_link && (
          <Button variant="join" size="sm" onClick={() => joinTeamsMeeting(link.teams_link)}>
            <MicrosoftTeams className="w-3.5 h-3.5" />
            Join
          </Button>
        )}
      </div>
      
      {hasDialInInfo && showDialIn && (
        <div 
          className="mt-2 p-2 rounded bg-slate-900/50 cursor-pointer hover:bg-slate-900/70 transition-colors"
          onClick={handleCopyAll}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              {link.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Telephone className={iconSize.xs} />
                  <span>{link.phone}</span>
                </div>
              )}
              {link.phone_toll_free && (
                <div className="text-xs text-slate-500 ml-4.5">Toll-free: {link.phone_toll_free}</div>
              )}
              {link.conference_id && (
                <div className={cn(text.monoValue, 'text-slate-400')}>ID: {link.conference_id}</div>
              )}
            </div>
            
            {isCopied?.(`teams-${link.id}`) ? (
              <ClipboardCheck className={cn(iconSize.md, 'text-emerald-400 flex-shrink-0')} />
            ) : (
              <Clipboard className={cn(iconSize.md, 'text-slate-500 flex-shrink-0')} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TEAMS LIST COMPONENT
// ============================================================================

interface TeamsListProps {
  links: (TeamsLink | BailTeam)[];
  filterVBTriage?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsList({ links, filterVBTriage = true, onCopy, isCopied }: TeamsListProps) {
  const [showDialIn, setShowDialIn] = useState(false);
  
  const filteredLinks = useMemo(() => {
    if (!filterVBTriage) return links;
    return links.filter(link => !isVBTriageLink(link.name || link.courtroom));
  }, [links, filterVBTriage]);
  
  const hasAnyDialInInfo = filteredLinks.some(link => link.phone || link.conference_id);
  
  const lastUpdated = useMemo(() => {
    const dates = filteredLinks
      .map(l => 'source_updated_at' in l ? l.source_updated_at : null)
      .filter((d): d is string => !!d)
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()));
    
    if (dates.length === 0) return null;
    
    const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
    return mostRecent.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [filteredLinks]);

  if (filteredLinks.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between px-1">
        {lastUpdated && (
          <span className="text-xs text-slate-500 uppercase">Last Updated: {lastUpdated}</span>
        )}
        {hasAnyDialInInfo && (
          <button
            onClick={() => setShowDialIn(!showDialIn)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showDialIn ? <EyeSlash className={iconSize.sm} /> : <Eye className={iconSize.sm} />}
            <span>{showDialIn ? 'Hide dial-in' : 'Show dial-in'}</span>
          </button>
        )}
      </div>
      
      {filteredLinks.map((link) => (
        <TeamsCard key={link.id} link={link} showDialIn={showDialIn} onCopy={onCopy} isCopied={isCopied} />
      ))}
    </div>
  );
}
