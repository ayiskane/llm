'use client';

import { FaLocationDot } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { Tag } from '../ui/Tag';
import { openInMaps } from '@/lib/utils';
import type { Court, CourtWithRegion } from '@/types';

interface CourtHeaderProps {
  court: Court | CourtWithRegion;
  collapsed?: boolean;
  className?: string;
}

/**
 * Get official display name per BC Gov naming conventions
 * @see https://www2.gov.bc.ca/gov/content/justice/courthouse-services/courthouse-locations
 */
function getDisplayName(court: Court | CourtWithRegion): string {
  const name = court.name;
  
  // Special case: Vancouver Provincial Court is commonly known as "222 Main"
  if (name === 'Vancouver Provincial Court') {
    return 'Vancouver Provincial Court (222 Main)';
  }
  
  // Already has "Court" in the name
  if (name.toLowerCase().includes('court')) {
    return name;
  }
  
  // Circuit courts → "[Location] Provincial Court"
  if (court.is_circuit) {
    return `${name} Provincial Court`;
  }
  
  // Staffed courthouses → "[Location] Law Courts"
  return `${name} Law Courts`;
}

/**
 * Mobile-first animated header with smooth height transition.
 * Uses CSS grid for smooth height animation (better than max-height hack).
 */
export function CourtHeader({ court, collapsed = false, className }: CourtHeaderProps) {
  const displayName = getDisplayName(court);

  const region = 'region' in court && court.region 
    ? court.region 
    : (court.region_code ? { code: court.region_code, name: court.region_name || '' } : null);

  return (
    <div className={cn('px-4 py-2', className)}>
      {/* Title row - always visible, changes size */}
      <div className="flex items-center gap-2">
        <h1 
          className={cn(
            'font-semibold text-white uppercase tracking-wide flex-1 truncate text-left',
            'transition-all duration-300 ease-out',
            collapsed ? 'text-sm' : 'text-lg'
          )}
        >
          {displayName}
        </h1>
        
        {/* Tags - compact when collapsed */}
        <div className={cn(
          'flex items-center gap-1 shrink-0 transition-opacity duration-300',
          collapsed ? 'opacity-100' : 'opacity-0 hidden'
        )}>
          {court.has_provincial && <Tag color="emerald" size="sm">PC</Tag>}
          {court.has_supreme && <Tag color="purple" size="sm">SC</Tag>}
          {court.is_circuit && <Tag color="amber" size="sm">CIR</Tag>}
        </div>
        
        {/* Map button - only in collapsed */}
        {court.address && collapsed && (
          <button
            onClick={() => openInMaps(court.address)}
            className="p-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 transition-colors shrink-0"
          >
            <FaLocationDot className="w-4 h-4 text-blue-400" />
          </button>
        )}
      </div>
      
      {/* Expandable content - uses grid for smooth height animation */}
      <div 
        className={cn(
          'grid transition-all duration-300 ease-out',
          collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        )}
      >
        <div className="overflow-hidden text-left">
          {/* Address - explicitly left aligned */}
          {court.address && (
            <button
              onClick={() => openInMaps(court.address)}
              className="flex items-center justify-start gap-1 text-xs mt-1 text-slate-500 hover:text-blue-400 transition-colors text-left"
            >
              <FaLocationDot className="w-3 h-3 shrink-0" />
              <span className="text-left">{court.address}</span>
            </button>
          )}
          
          {/* Region and tags row */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {region && (
              <span className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                <span>{region.code}</span>
                <span className="text-slate-600">|</span>
                <span>{region.name}</span>
              </span>
            )}
            {court.has_provincial && <Tag color="emerald">PROVINCIAL</Tag>}
            {court.has_supreme && <Tag color="purple">SUPREME</Tag>}
            {court.is_circuit && <Tag color="amber">CIRCUIT</Tag>}
          </div>
        </div>
      </div>
    </div>
  );
}
