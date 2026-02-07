'use client';

import { FaCircleExclamation, FaChevronRight } from '@/lib/icons';
import { CardListItemAlert } from '@/components/ui/card';
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
    <CardListItemAlert
      onClick={canNavigate ? handleClick : undefined}
      disabled={!canNavigate}
      icon={<FaCircleExclamation className="w-4 h-4 text-amber-500" />}
      trailing={
        canNavigate ? (
          <FaChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
        ) : null
      }
      iconWrapClassName="bg-amber-500/15"
      className={cn(
        'bg-slate-800/50 border border-dashed border-amber-500/40',
        'disabled:cursor-default disabled:hover:bg-slate-800/50 disabled:active:bg-slate-800/50'
      )}
    >
      <p className="text-xs text-slate-400 leading-relaxed">
        Circuit court — contact{' '}
        <span className="text-amber-400 font-semibold">
          {hubCourtName}
        </span>
        {' '}for inquiries.
      </p>
    </CardListItemAlert>
  );
}
