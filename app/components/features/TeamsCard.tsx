'use client';

import { useState, useMemo } from 'react';
import { MicrosoftTeams, Eye, EyeSlash, Clipboard, ClipboardCheck } from 'react-bootstrap-icons';
import { Card } from '@/app/components/ui/Card';
import { Button } from '@/app/components/ui/Button';
import { cn, textClasses, iconClasses } from '@/lib/config/theme';
import { formatDate, joinTeamsMeeting } from '@/lib/utils';
import { formatCourtRoom, isVBTriageLink } from '@/lib/config/constants';
import type { TeamsLink, BailTeam } from '@/types';

interface TeamsCardProps {
  link: TeamsLink | BailTeam;
  showDialIn?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsCard({ link, showDialIn = false, onCopy, isCopied }: TeamsCardProps) {
  const displayName = formatCourtRoom(link.name);
  
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MicrosoftTeams className={cn(iconClasses.md, 'text-purple-400')} />
          <span className="text-sm font-medium text-slate-200">
            {displayName}
          </span>
        </div>
        <Button
          variant="join"
          size="sm"
          onClick={() => joinTeamsMeeting(link.teams_link)}
        >
          Join
        </Button>
      </div>
      
      {/* Dial-in info (collapsed by default) */}
      {showDialIn && (link.phone || link.conference_id) && (
        <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs space-y-1">
          {link.phone && (
            <div className="flex items-center gap-2 text-slate-400">
              <span>📞</span>
              <span className="font-mono">{link.phone}</span>
            </div>
          )}
          {link.phone_toll_free && (
            <div className="flex items-center gap-2 text-slate-400">
              <span>🆓</span>
              <span className="font-mono">{link.phone_toll_free}</span>
            </div>
          )}
          {link.conference_id && (
            <div className="flex items-center gap-2 text-slate-400">
              <span>🔢</span>
              <span className="font-mono">ID: {link.conference_id}#</span>
              {onCopy && isCopied && (
                <button
                  onClick={() => onCopy(`${link.conference_id}#`, `conf-${link.id}`)}
                  className="p-1 hover:bg-slate-700/50 rounded transition-colors"
                >
                  {isCopied(`conf-${link.id}`) ? (
                    <ClipboardCheck className={cn(iconClasses.xs, 'text-green-400')} />
                  ) : (
                    <Clipboard className={iconClasses.xs} />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// Teams list with toggle for dial-in info
interface TeamsListProps {
  links: (TeamsLink | BailTeam)[];
  filterVBTriage?: boolean;
  onCopy?: (text: string, id: string) => void;
  isCopied?: (id: string) => boolean;
}

export function TeamsList({ links, filterVBTriage = false, onCopy, isCopied }: TeamsListProps) {
  const [showDialIn, setShowDialIn] = useState(false);
  
  // Filter out VB Triage if requested
  const filteredLinks = useMemo(() => {
    if (!filterVBTriage) return links;
    return links.filter(link => !isVBTriageLink(link.name));
  }, [links, filterVBTriage]);
  
  // Get most recent update date
  const lastUpdated = useMemo(() => {
    const dates = filteredLinks
      .map(l => 'source_updated_at' in l ? l.source_updated_at : null)
      .filter(Boolean) as string[];
    if (dates.length === 0) return null;
    return dates.sort().reverse()[0];
  }, [filteredLinks]);

  if (filteredLinks.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* Header with last updated and toggle */}
      <div className="flex items-center justify-between">
        {lastUpdated && (
          <span className={textClasses.muted}>
            LAST UPDATED: {formatDate(lastUpdated)}
          </span>
        )}
        <button
          onClick={() => setShowDialIn(!showDialIn)}
          className={cn(
            'flex items-center gap-1 px-2 py-1 rounded text-xs',
            'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors'
          )}
        >
          {showDialIn ? <EyeSlash className={iconClasses.xs} /> : <Eye className={iconClasses.xs} />}
          {showDialIn ? 'Hide dial-in' : 'Show dial-in'}
        </button>
      </div>
      
      {/* Links */}
      <div className="space-y-2">
        {filteredLinks.map(link => (
          <TeamsCard
            key={link.id}
            link={link}
            showDialIn={showDialIn}
            onCopy={onCopy}
            isCopied={isCopied}
          />
        ))}
      </div>
    </div>
  );
}

