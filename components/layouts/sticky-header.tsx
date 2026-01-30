'use client';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

interface StickyHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyHeader({ children, className }: StickyHeaderProps) {
  return (
    <Card
      className={cn(
        'sticky top-0 z-20 rounded-none border-x-0 border-t-0 border-b border-border/60 bg-background/95 backdrop-blur',
        className
      )}
    >
      {children}
    </Card>
  );
}
