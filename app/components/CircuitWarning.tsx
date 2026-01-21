'use client';

import { ExclamationTriangle } from 'react-bootstrap-icons';

interface CircuitWarningProps {
  courtName: string;
  hubCourtName: string;
  onHubClick?: () => void;
}

export function CircuitWarning({ courtName, hubCourtName, onHubClick }: CircuitWarningProps) {
  return (
    <div className="rounded-lg bg-amber-900/20 border border-amber-800/50 p-3">
      <div className="flex items-start gap-2">
        <ExclamationTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-amber-200">
            <span className="font-medium">{courtName}</span> is a circuit court.
          </p>
          <p className="text-xs text-amber-300/80 mt-1">
            For contacts, please refer to{' '}
            {onHubClick ? (
              <button 
                onClick={onHubClick}
                className="font-medium underline underline-offset-2 hover:text-amber-200 transition-colors"
              >
                {hubCourtName}
              </button>
            ) : (
              <span className="font-medium">{hubCourtName}</span>
            )}{' '}
            hub court.
          </p>
        </div>
      </div>
    </div>
  );
}

