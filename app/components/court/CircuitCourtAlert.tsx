'use client';

import { FaCircleExclamation, FaChevronRight } from '@/lib/icons';
import { cn, text, surface } from '@/lib/config/theme';

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
        surface.control, 'border border-dashed border-amber-500/40',
        canNavigate && 'cursor-pointer active:bg-slate-800/70 transition-colors'
      )}
    >
      {/* Icon container */}
      <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
        <FaCircleExclamation className="w-4 h-4 text-amber-500" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs leading-relaxed", text.hint)}>
          Circuit court — contact{' '}
          <span className="text-amber-400 font-semibold">
            {hubCourtName}
          </span>
          {' '}for inquiries.
        </p>
        {canNavigate && (
          <p className={cn("text-xs mt-0.5", text.placeholder)}>
            Tap to view court details
          </p>
        )}
      </div>

      {/* Chevron if navigable */}
      {canNavigate && (
        <FaChevronRight className={cn("w-4 h-4 shrink-0", text.disabled)} />
      )}
    </div>
  );
}
