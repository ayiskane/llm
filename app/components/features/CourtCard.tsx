'use client';

import { GeoAlt, ChevronRight } from 'react-bootstrap-icons';
import { cn, iconSize } from '@/lib/config/theme';
import { openInMaps } from '@/lib/utils';
import type { Court, CourtWithRegion } from '@/types';

interface CourtCardProps {
  court: Court | CourtWithRegion;
  onClick: () => void;
  contactCount?: number;
  cellCount?: number;
  teamsCount?: number;
}

export function CourtCard({ court, onClick, contactCount, cellCount, teamsCount }: CourtCardProps) {
  const region = 'region' in court ? court.region : null;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-lg',
        'bg-slate-800/30 border border-slate-700/50',
        'hover:bg-slate-800/50 hover:border-slate-600/50',
        'transition-all duration-200'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-200 text-sm">
            {court.name}
          </h3>
          
          {court.address && (
            <div className="flex items-start gap-1 mt-1">
              <GeoAlt className={cn(iconSize.xs, 'text-slate-500 mt-0.5 shrink-0')} />
              <span className="text-xs text-slate-400 line-clamp-2">
                {court.address}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            {region && (
              <span className="text-xs text-slate-500">
                {region.code} | {region.name}
              </span>
            )}
            <div className="flex gap-1">
              {court.has_provincial && (
                <span className="px-1.5 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 rounded">
                  PC
                </span>
              )}
              {court.has_supreme && (
                <span className="px-1.5 py-0.5 text-[10px] bg-purple-500/20 text-purple-400 rounded">
                  SC
                </span>
              )}
            </div>
          </div>
        </div>
        
        <ChevronRight className={cn(iconSize.md, 'text-slate-500 shrink-0 mt-1')} />
      </div>
      
      {(contactCount || cellCount || teamsCount) && (
        <div className="flex gap-3 mt-3 pt-3 border-t border-slate-700/50">
          {contactCount !== undefined && contactCount > 0 && (
            <span className="text-xs text-slate-500">
              {contactCount} Contacts
            </span>
          )}
          {cellCount !== undefined && cellCount > 0 && (
            <span className="text-xs text-slate-500">
              {cellCount} Cells
            </span>
          )}
          {teamsCount !== undefined && teamsCount > 0 && (
            <span className="text-xs text-slate-500">
              {teamsCount} Teams
            </span>
          )}
        </div>
      )}
    </button>
  );
}

interface CourtHeaderProps {
  court: CourtWithRegion;
}

export function CourtHeader({ court }: CourtHeaderProps) {
  return (
    <div className="space-y-2">
      <h1 className="text-lg font-semibold text-slate-100 uppercase tracking-wide">
        {court.name}
      </h1>
      
      {court.address && (
        <button
          onClick={() => openInMaps(court.address)}
          className="flex items-start gap-1 text-left group"
        >
          <GeoAlt className={cn(iconSize.sm, 'text-slate-500 mt-0.5 shrink-0 group-hover:text-blue-400 transition-colors')} />
          <span className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">
            {court.address}
          </span>
        </button>
      )}
      
      <div className="flex items-center gap-2">
        {court.region && (
          <span className="text-sm text-slate-500">
            {court.region.code} | {court.region.name}
          </span>
        )}
        <div className="flex gap-1">
          {court.has_provincial && (
            <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded">
              Provincial
            </span>
          )}
          {court.has_supreme && (
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-400 rounded">
              Supreme
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
