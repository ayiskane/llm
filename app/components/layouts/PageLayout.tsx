'use client';

import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background text-foreground', className)}>
      {/* Cyber Ocean Background Effects */}
      <div className="cyber-grid" aria-hidden="true" />
      <div className="orb-1" aria-hidden="true" />
      <div className="orb-2" aria-hidden="true" />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
