'use client';

import { GeoAlt } from 'react-bootstrap-icons';
import { cn } from '@/lib/utils';
import { Tag } from '../ui/Tag';
import { openInMaps } from '@/lib/utils';
import type { Court } from '@/types';

interface CourtHeaderProps {
  court: Court;
  collapsed?: boolean;
  className?: string;
}

export function CourtHeader({ court, collapsed = false, className }: CourtHeaderProps) {
  const displayName = court.name.toLowerCase().includes('court') 
    ? court.name 
    : `${court.name} Law Courts`;

  if (collapsed) {
    return (
      <div className={cn('flex items-center gap-2 py-2 px-4', className)}>
        <h1 className="text-sm font-semibold text-white flex-1 truncate uppercase">
          {displayName}
        </h1>
        <div className="flex items-center gap-1 flex-shrink-0">
          {court.has_provincial && <Tag color="emerald" size="sm">PC</Tag>}
          {court.has_supreme && <Tag color="purple" size="sm">SC</Tag>}
          {court.is_circuit && <Tag color="amber" size="sm">CIR</Tag>}
        </div>
        {court.address && (
          <button
            onClick={() => openInMaps(court.address)}
            className="p-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 transition-colors flex-shrink-0"
          >
            <GeoAlt className="w-4 h-4 text-blue-400" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('py-3 px-4', className)}>
      <h1 className="text-lg font-semibold text-white uppercase">
        {displayName}
      </h1>
      
      {court.address && (
        <button
          onClick={() => openInMaps(court.address)}
          className="flex items-center gap-1.5 text-xs mt-1 text-slate-400 hover:text-blue-400 transition-colors"
        >
          <GeoAlt className="w-3.5 h-3.5" />
          <span>{court.address}</span>
        </button>
      )}
      
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {court.region_code && (
          <span className="px-2 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1.5 uppercase bg-slate-800/50 border border-slate-700/50 text-slate-400 tracking-widest">
            <span>{court.region_code}</span>
            <span className="text-slate-600">|</span>
            <span>{court.region_name}</span>
          </span>
        )}
        {court.has_provincial && <Tag color="emerald">PROVINCIAL</Tag>}
        {court.has_supreme && <Tag color="purple">SUPREME</Tag>}
        {court.is_circuit && <Tag color="amber">CIRCUIT</Tag>}
      </div>
    </div>
  );
}
