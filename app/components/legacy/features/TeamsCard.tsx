'use client';

import { useState, useMemo } from 'react';
import { FaMicrosoftTeams, FaEye, FaEyeSlash, FaCopy, FaClipboardCheck, FaPhone, FaHashtag } from '@/lib/icons';
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
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsCard({ link, onCopy, isCopied }: TeamsCardProps) {
  const [showDialIn, setShowDialIn] = useState(false);
  
  const displayName = formatCourtroomName(link.courtroom || link.name);
  const hasDialInInfo = link.phone || link.conference_id;
  
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
          <FaMicrosoftTeams className={cn(iconSize.md, 'text-slate-400 flex-shrink-0')} />
          <span className={cn(text.secondary, 'text-sm font-medium truncate')}>{displayName}</span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {hasDialInInfo && (
            <button
              onClick={() => setShowDialIn(!showDialIn)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors',
                showDialIn 
                  ? 'bg-slate-700/50 text-slate-300' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
              )}
            >
              {showDialIn ? <FaEyeSlash className="w-3.5 h-3.5" /> : <FaEye className="w-3.5 h-3.5" />}
              <span>{showDialIn ? 'Hide' : 'Dial-in'}</span>
            </button>
          )}
          
          {link.teams_link && (
            <Button variant="join" size="sm" onClick={() => joinTeamsMeeting(link.teams_link)}>
              <FaMicrosoftTeams className="w-3.5 h-3.5" />
              Join
            </Button>
          )}
        </div>
      </div>
      
      {hasDialInInfo && showDialIn && (
        <div 
          className="mt-2 p-2.5 rounded bg-slate-950/70 border border-dashed border-slate-600/50 cursor-pointer hover:border-slate-500/50 transition-colors"
          onClick={handleCopyAll}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-1 font-mono text-xs">
              {link.phone && (
                <div className="flex items-center gap-2 text-slate-300">
                  <FaPhone className={cn(iconSize.sm, 'text-slate-500 shrink-0')} />
                  <span>{link.phone}</span>
                </div>
              )}
              {link.phone_toll_free && (
                <div className="flex items-center gap-2 text-slate-400">
                  <FaPhone className={cn(iconSize.sm, 'text-slate-500 shrink-0')} />
                  <span>{link.phone_toll_free}</span>
                </div>
              )}
              {link.conference_id && (
                <div className="flex items-center gap-2 text-slate-400">
                  <FaHashtag className={cn(iconSize.sm, 'text-slate-500 shrink-0')} />
                  <span>Conference ID: {link.conference_id}</span>
                </div>
              )}
            </div>
            
            {isCopied?.(`teams-${link.id}`) ? (
              <FaClipboardCheck className={cn(iconSize.md, 'text-emerald-400 flex-shrink-0')} />
            ) : (
              <FaCopy className={cn(iconSize.md, 'text-slate-500 flex-shrink-0')} />
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
  const filteredLinks = useMemo(() => {
    // If not filtering VB Triage (bail section), return links as-is (already sorted by caller)
    if (!filterVBTriage) return links;
    
    // Filter out triage for MS Teams card
    let result = links.filter(link => !isVBTriageLink(link.name || link.courtroom));
    
    // Helper to extract number from courtroom name (e.g., "CR 201" -> 201)
    const extractNumber = (name: string): number => {
      const match = name.match(/\d+/);
      return match ? parseInt(match[0], 10) : Infinity;
    };
    
    // Helper to check if it's a JCM FXD link
    const isJcmFxd = (name: string): boolean => {
      const upper = name.toUpperCase();
      return upper.includes('JCM') && upper.includes('FXD');
    };
    
    // Sort: JCM FXD first, then by number ascending
    return [...result].sort((a, b) => {
      const aName = a.name || a.courtroom || '';
      const bName = b.name || b.courtroom || '';
      
      // 1. JCM FXD links come first
      const aIsJcmFxd = isJcmFxd(aName);
      const bIsJcmFxd = isJcmFxd(bName);
      if (aIsJcmFxd && !bIsJcmFxd) return -1;
      if (!aIsJcmFxd && bIsJcmFxd) return 1;
      
      // 2. Sort by number ascending (CR 201 before CR 204)
      return extractNumber(aName) - extractNumber(bName);
    });
  }, [links, filterVBTriage]);
  
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
      {/* Last Updated - uses same style as "Court Contacts" / "Crown Contacts" headers */}
      {lastUpdated && (
        <h4 className={text.sectionHeader}>Last Updated: {lastUpdated}</h4>
      )}
      
      {filteredLinks.map((link) => (
        <TeamsCard key={link.id} link={link} onCopy={onCopy} isCopied={isCopied} />
      ))}
    </div>
  );
}
