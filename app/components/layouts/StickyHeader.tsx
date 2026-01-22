'use client';

import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-20 flex-shrink-0',
        'bg-slate-950/90 backdrop-blur-md',
        'border-b border-slate-800/50',
        className
      )}
    >
      {children}
    </header>
  );
}
