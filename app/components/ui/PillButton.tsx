'use client';

import { cn } from '@/lib/utils';

interface PillButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PillButton({ children, isActive = false, onClick, className }: PillButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border',
        isActive
          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:border-slate-600/50',
        className
      )}
    >
      {children}
    </button>
  );
}
