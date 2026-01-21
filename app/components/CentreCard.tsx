'use client';

import { memo } from 'react';
import Link from 'next/link';
import { ChevronRight, Building, Telephone, GeoAlt } from 'react-bootstrap-icons';
import type { CorrectionalCentre } from '@/lib/constants/correctional-centres';
import { CENTRE_TYPE_LABELS, SECURITY_LEVEL_LABELS } from '@/lib/constants/correctional-centres';

interface CentreCardProps {
  centre: CorrectionalCentre;
}

export const CentreCard = memo(function CentreCard({ centre }: CentreCardProps) {
  const typeLabel = CENTRE_TYPE_LABELS[centre.centreType] || centre.centreType;
  
  return (
    <Link
      href={`/correctional-centres/${centre.shortName.toLowerCase()}`}
      className="block w-full text-left p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-white">{centre.shortName}</h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              centre.isFederal 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {centre.isFederal ? 'Federal' : 'Provincial'}
            </span>
          </div>
          <p className="text-sm text-zinc-400 mt-0.5">{centre.name}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <GeoAlt className="w-3 h-3" />
              {centre.location}
            </span>
            <span>R{centre.regionId} {centre.regionName}</span>
            {centre.securityLevel && (
              <span className="text-amber-500">
                {SECURITY_LEVEL_LABELS[centre.securityLevel]}
              </span>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-1" />
      </div>
      {centre.generalPhone && (
        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
          <Telephone className="w-3 h-3" />
          <span>{centre.generalPhone}</span>
          {centre.generalPhoneOption && (
            <span className="text-zinc-600">({centre.generalPhoneOption})</span>
          )}
        </div>
      )}
    </Link>
  );
});

// Mini card for search results
interface CentreCardMiniProps {
  centre: CorrectionalCentre;
  onClick?: () => void;
}

export const CentreCardMini = memo(function CentreCardMini({ centre, onClick }: CentreCardMiniProps) {
  return (
    <Link
      href={`/correctional-centres/${centre.shortName.toLowerCase()}`}
      onClick={onClick}
      className="block p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-zinc-400" />
            <span className="font-medium text-white">{centre.shortName}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
              centre.isFederal 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {centre.isFederal ? 'Fed' : 'Prov'}
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">{centre.location} · R{centre.regionId}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-zinc-600" />
      </div>
    </Link>
  );
});

// Constants banner component
export const CorrectionsConstantsBanner = memo(function CorrectionsConstantsBanner() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
      <h2 className="text-sm font-medium text-zinc-400 mb-3">System Information</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-zinc-500">Corrections Caller ID:</span>
          <span className="text-white ml-2 font-mono">844-369-7776</span>
        </div>
        <div>
          <span className="text-zinc-500">Register as Lawyer:</span>
          <span className="text-white ml-2 font-mono">236-478-0284</span>
          <span className="text-zinc-600 ml-1">(Cindy)</span>
        </div>
        <div>
          <span className="text-zinc-500">Unknown Inmate Location:</span>
          <span className="text-white ml-2 font-mono">250-387-1605</span>
        </div>
        <div>
          <span className="text-zinc-500">Hours:</span>
          <span className="text-zinc-400 ml-2">Mon-Fri 8AM-4PM</span>
        </div>
        <div>
          <span className="text-zinc-500">Unlock:</span>
          <span className="text-zinc-400 ml-2">07:00-07:30 (wkday) · 10:00 (wkend)</span>
        </div>
        <div>
          <span className="text-zinc-500">Evening Lock:</span>
          <span className="text-zinc-400 ml-2">21:45-22:00</span>
        </div>
      </div>
    </div>
  );
});
