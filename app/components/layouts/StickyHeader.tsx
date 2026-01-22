'use client';

import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <div className={cn('sticky-header', className)}>
      {children}
    </div>
  );
}
