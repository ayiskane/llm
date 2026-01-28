'use client';

import { cn, surface, text, border } from '@/lib/config/theme';

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
        surface.toast, text.body, 'text-sm',
        'shadow-lg', border.visible,
        'animate-fade-in'
      )}
    >
      {message}
    </div>
  );
}
