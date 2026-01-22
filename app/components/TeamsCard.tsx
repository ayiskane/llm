'use client';

import { useState } from 'react';
import { MicrosoftTeams, Telephone, Clipboard, Check, ChevronRight, BoxArrowUpRight } from 'react-bootstrap-icons';
import { Button } from '@/components/ui/button';
import copy from 'copy-to-clipboard';
import type { TeamsLink } from '@/types';

// Format courtroom name with CR prefix (but not for JCM FXD)
function formatCourtroomName(link: TeamsLink): string {
  const name = link.courtroom || link.name || 'MS Teams';
  
  // Don't modify JCM FXD
  if (name.toLowerCase().includes('jcm') || name.toLowerCase().includes('fxd')) {
    return name;
  }
  
  // Check if it's already prefixed with CR
  if (name.toLowerCase().startsWith('cr ') || name.toLowerCase().startsWith('cr-')) {
    return name;
  }
  
  // Check if it's a number or starts with a number (courtroom number)
  const numMatch = name.match(/^(\d+)/);
  if (numMatch) {
    return `CR ${name}`;
  }
  
  // Check for patterns like "Courtroom 101" and convert to "CR 101"
  const courtroomMatch = name.match(/^courtroom\s*(\d+)/i);
  if (courtroomMatch) {
    return `CR ${courtroomMatch[1]}`;
  }
  
  return name;
}

// Check if this is a VB Triage link (should be filtered from regular Teams list)
export function isVBTriageLink(link: TeamsLink): boolean {
  const name = (link.courtroom || link.name || '').toLowerCase();
  return name.includes('vb triage') || name.includes('vbtriage') || name.includes('triage');
}

interface TeamsCardProps {
  link: TeamsLink;
  onCopyAll?: () => void;
}

export function TeamsCard({ link, onCopyAll }: TeamsCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAll = () => {
    const text = [
      link.phone && `Phone: ${link.phone}`,
      link.phone_toll_free && `Toll-free: ${link.phone_toll_free}`,
      link.conference_id && `Conference ID: ${link.conference_id}`,
    ].filter(Boolean).join('\n');
    
    copy(text);
    setCopied(true);
    onCopyAll?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoin = () => {
    if (link.teams_link) {
      window.open(link.teams_link, '_blank');
    }
  };

  const displayName = formatCourtroomName(link);

  return (
    <div className="py-2.5 px-3 rounded-lg bg-slate-800/30">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <MicrosoftTeams className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-200 truncate">{displayName}</span>
        </div>
        
        {link.teams_link && (
          <Button
            variant="secondary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 h-7"
            onClick={handleJoin}
          >
            <MicrosoftTeams className="w-3 h-3 mr-1" />
            Join
          </Button>
        )}
      </div>
      
      {/* Dial-in info - tap to copy */}
      {(link.phone || link.conference_id) && (
        <div 
          className="mt-2 p-2 rounded bg-slate-900/50 cursor-pointer hover:bg-slate-900/70 transition-colors"
          onClick={handleCopyAll}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0 space-y-0.5">
              {link.phone && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Telephone className="w-3 h-3" />
                  <span>{link.phone}</span>
                </div>
              )}
              {link.phone_toll_free && (
                <div className="text-xs text-slate-500 ml-4.5">
                  Toll-free: {link.phone_toll_free}
                </div>
              )}
              {link.conference_id && (
                <div className="text-xs text-slate-400 font-mono">
                  ID: {link.conference_id}
                </div>
              )}
            </div>
            
            {copied ? (
              <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <Clipboard className="w-4 h-4 text-slate-500 flex-shrink-0" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Teams links preview card for search results (shows count, tap to navigate)
interface TeamsLinkCountCardProps {
  count: number;
  onClick?: () => void;
}

export function TeamsLinkCountCard({ count, onClick }: TeamsLinkCountCardProps) {
  if (count === 0) return null;

  return (
    <div 
      className="py-3 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors active:bg-slate-700"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MicrosoftTeams className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-slate-200">
            {count} MS Teams Link{count !== 1 ? 's' : ''}
          </span>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-500" />
      </div>
    </div>
  );
}

// Full teams list for court detail page
interface TeamsListProps {
  links: TeamsLink[];
  onCopyAll?: () => void;
  filterVBTriage?: boolean;
}

export function TeamsList({ links, onCopyAll, filterVBTriage = true }: TeamsListProps) {
  // Filter out VB Triage links by default (they're shown in Virtual Bail section)
  const filteredLinks = filterVBTriage ? links.filter(link => !isVBTriageLink(link)) : links;
  
  if (filteredLinks.length === 0) return null;

  // Get the most recent source_updated_at from all links
  const getMostRecentDate = () => {
    const dates = filteredLinks
      .map(link => link.source_updated_at)
      .filter((d): d is string => !!d)
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()));
    
    if (dates.length === 0) return null;
    
    const mostRecent = new Date(Math.max(...dates.map(d => d.getTime())));
    return mostRecent.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const displayDate = getMostRecentDate();

  return (
    <div className="space-y-1.5">
      {displayDate && (
        <h4 className="text-xs font-medium text-slate-500 tracking-wide px-1">
          Last Updated: {displayDate}
        </h4>
      )}
      {filteredLinks.map((link) => (
        <TeamsCard key={link.id} link={link} onCopyAll={onCopyAll} />
      ))}
    </div>
  );
}


