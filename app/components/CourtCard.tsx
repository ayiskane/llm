'use client';

import { Building2, MapPin, Phone, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Court } from '@/types';

interface CourtCardProps {
  court: Court;
  onClick?: () => void;
  showArrow?: boolean;
}

// Helper to format court name with "Law Courts" suffix for non-circuit courts
function formatCourtName(court: Court): string {
  // Don't add "Law Courts" if it's a circuit court or already has special naming
  if (court.is_circuit) return court.name;
  if (court.name.toLowerCase().includes('court')) return court.name;
  return `${court.name} Law Courts`;
}

export function CourtCard({ court, onClick, showArrow = true }: CourtCardProps) {
  return (
    <div 
      className={`bg-slate-800/50 rounded-lg p-4 border border-slate-700/50 ${onClick ? 'cursor-pointer hover:bg-slate-800 transition-colors active:bg-slate-700' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <h3 className="font-semibold text-white truncate">{formatCourtName(court)}</h3>
          </div>
          
          <div className="flex flex-wrap gap-1.5 mt-2">
            {court.region_code && (
              <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                {court.region_code}
              </Badge>
            )}
            {court.has_provincial && (
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 text-xs">
                PC
              </Badge>
            )}
            {court.has_supreme && (
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs">
                SC
              </Badge>
            )}
            {court.is_circuit && (
              <Badge variant="secondary" className="bg-amber-900/50 text-amber-300 text-xs">
                Circuit
              </Badge>
            )}
          </div>
          
          {/* View Court Page link */}
          {showArrow && onClick && (
            <div className="flex items-center gap-1 mt-3 text-sm text-indigo-400">
              <span>View Court Page</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { formatCourtName };

// Compact version for search results with preview info
interface CourtCardMiniProps {
  court: Court;
  onClick?: () => void;
  teamsLinkCount?: number;
}

export function CourtCardMini({ court, onClick, teamsLinkCount }: CourtCardMiniProps) {
  return (
    <div 
      className={`bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 ${onClick ? 'cursor-pointer hover:bg-slate-800 transition-colors active:bg-slate-700' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-white truncate">{court.name}</span>
        </div>
        
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {court.region_code && (
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-[10px] px-1.5 py-0">
              {court.region_code}
            </Badge>
          )}
          {court.has_provincial && (
            <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 text-[10px] px-1.5 py-0">
              PC
            </Badge>
          )}
          {court.has_supreme && (
            <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-[10px] px-1.5 py-0">
              SC
            </Badge>
          )}
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
}

// Court header for detail page
interface CourtHeaderProps {
  court: Court;
  onBack?: () => void;
  onLocationClick?: () => void;
}

export function CourtHeader({ court, onBack, onLocationClick }: CourtHeaderProps) {
  return (
    <div className="bg-slate-800 border-b border-slate-700">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{court.name}</h1>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {court.region_code && (
                <Badge variant="secondary" className="bg-slate-700 text-slate-300 text-xs">
                  {court.region_code} - {court.region_name}
                </Badge>
              )}
              {court.has_provincial && (
                <Badge variant="secondary" className="bg-blue-900/50 text-blue-300 text-xs">
                  Provincial
                </Badge>
              )}
              {court.has_supreme && (
                <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 text-xs">
                  Supreme
                </Badge>
              )}
              {court.is_circuit && (
                <Badge variant="secondary" className="bg-amber-900/50 text-amber-300 text-xs">
                  Circuit
                </Badge>
              )}
            </div>
          </div>
          
          {court.address && (
            <button 
              onClick={onLocationClick}
              className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors ml-2"
            >
              <MapPin className="w-5 h-5 text-slate-300" />
            </button>
          )}
        </div>
        
        {/* Quick contact buttons */}
        {(court.phone || court.fax) && (
          <div className="flex gap-2 mt-3">
            {court.phone && (
              <a 
                href={`tel:${court.phone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 rounded-lg text-sm text-slate-300 hover:bg-slate-600 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

