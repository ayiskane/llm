'use client';

import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky header with backdrop blur.
 * Uses CSS variables for theming consistency.
 */
export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <div
      className={cn(
        'shrink-0 backdrop-blur-md bg-background/95 border-b border-primary/10',
        className
      )}
    >
      {children}
    </div>
  );
}
