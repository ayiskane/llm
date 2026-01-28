'use client';

import { cn } from '@/lib/config/theme';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export function Toast({ message, isVisible }: ToastProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'fixed bottom-20 left-1/2 -translate-x-1/2 z-50',
        'px-4 py-2 rounded-lg',
        'bg-slate-800/95 text-slate-200 text-sm',
        'shadow-lg border border-slate-700/50',
        'animate-fade-in'
      )}
    >
      {message}
    </div>
  );
}
