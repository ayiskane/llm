'use client';

import { forwardRef, useState } from 'react';
import { FaChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { section } from '@/lib/config/theme';

// Kept for backward compatibility - color no longer affects styling
export type SectionColor = 'emerald' | 'amber' | 'teal' | 'indigo' | 'blue' | 'purple';

interface SectionProps {
  title: string;
  count?: number | string;
  color?: SectionColor; // kept for API compatibility but no longer affects styling
  defaultOpen?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ title, count, defaultOpen = false, isExpanded, onToggle, children, className }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    
    const isOpen = isExpanded !== undefined ? isExpanded : internalOpen;
    const handleToggle = onToggle ?? (() => setInternalOpen(!internalOpen));

    return (
      <div ref={ref} className={cn(section.container, className)}>
        {/* Header */}
        <button
          onClick={handleToggle}
          className={cn(section.header, isOpen && section.headerExpanded)}
        >
          {/* Title */}
          <span className={section.title}>{title}</span>
          
          {/* Count badge - unified subtle color */}
          {count !== undefined && count !== '' && (
            <span className="px-1.5 py-0.5 rounded text-xs font-mono bg-sky-500/15 text-sky-400/80">
              {count}
            </span>
          )}
          
          {/* Chevron */}
          <FaChevronDown
            className={cn(
              'w-4 h-4 text-slate-500 transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Content */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className={section.content}>{children}</div>
        </div>
      </div>
    );
  }
);

Section.displayName = 'Section';
