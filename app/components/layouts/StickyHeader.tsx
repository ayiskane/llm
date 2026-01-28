'use client';

import { cn, surface } from '@/lib/config/theme';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky header with backdrop blur.
 * Uses theme token for consistent header styling.
 */
export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <div
      className={cn('shrink-0 backdrop-blur-md border-b border-blue-500/10', surface.header, className)}
    >
      {children}
    </div>
  );
}
