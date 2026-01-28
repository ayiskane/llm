'use client';

import { cn, text, surface } from '@/lib/config/theme';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen', text.heading, surface.page, className)}>
      {/* Cyber Ocean Background Effects */}
      <div className="cyber-grid" aria-hidden="true" />
      <div className="cyber-orb-1" aria-hidden="true" />
      <div className="cyber-orb-2" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
