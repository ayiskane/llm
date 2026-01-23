'use client';

import { cn } from '@/lib/utils';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Sticky header with backdrop blur.
 * Background: rgba(8,11,18,0.95) - matches backup branch
 * Border: subtle blue tint
 */
export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <div 
      className={cn('flex-shrink-0 backdrop-blur-md', className)}
      style={{
        background: 'rgba(8,11,18,0.95)',
        borderBottom: '1px solid rgba(59,130,246,0.08)',
      }}
    >
      {children}
    </div>
  );
}
