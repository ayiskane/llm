'use client';

import { InfoCircle, ChevronRight } from 'react-bootstrap-icons';
import { cn } from '@/lib/utils';

interface CircuitCourtAlertProps {
  hubCourtName: string;
  hubCourtId?: number | null;
  onNavigateToHub?: (courtId: number) => void;
}

/**
 * Compact alert card for circuit courts (Design 4: Minimal Inline)
 * Shows info icon + message with link to contact hub court
 */
export function CircuitCourtAlert({ 
  hubCourtName, 
  hubCourtId,
  onNavigateToHub 
}: CircuitCourtAlertProps) {
  const canNavigate = hubCourtId && onNavigateToHub;
  
  const handleClick = () => {
    if (canNavigate) {
      onNavigateToHub(hubCourtId);
    }
  };

  return (
    <div 
      onClick={canNavigate ? handleClick : undefined}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2.5 rounded-xl',
        'bg-slate-800/50 border border-dashed border-amber-500/40',
        canNavigate && 'cursor-pointer active:bg-slate-800/70 transition-colors'
      )}
    >
      {/* Icon container */}
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center flex-shrink-0">
        <InfoCircle className="w-4 h-4 text-amber-500" />
      </div>
      
      {/* Text */}
      <p className="flex-1 text-xs text-slate-400 leading-relaxed">
        Circuit court — contact{' '}
        <span className="text-amber-400 font-semibold">
          {hubCourtName}
        </span>
        {' '}for inquiries.
      </p>
      
      {/* Chevron if navigable */}
      {canNavigate && (
        <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
      )}
    </div>
  );
}
