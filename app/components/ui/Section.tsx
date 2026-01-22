'use client';

import { forwardRef, useState } from 'react';
import { ChevronDown } from 'react-bootstrap-icons';
import { cn } from '@/lib/utils';

// Section color configuration
const sectionColors = {
  emerald: {
    dot: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400',
    border: 'border-l-emerald-500/50',
  },
  blue: {
    dot: 'text-blue-400',
    badge: 'bg-blue-500/15 text-blue-400',
    border: 'border-l-blue-500/50',
  },
  amber: {
    dot: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400',
    border: 'border-l-amber-500/50',
  },
  purple: {
    dot: 'text-purple-400',
    badge: 'bg-purple-500/15 text-purple-400',
    border: 'border-l-purple-500/50',
  },
  indigo: {
    dot: 'text-indigo-400',
    badge: 'bg-indigo-500/15 text-indigo-400',
    border: 'border-l-indigo-500/50',
  },
  cyan: {
    dot: 'text-cyan-400',
    badge: 'bg-cyan-500/15 text-cyan-400',
    border: 'border-l-cyan-500/50',
  },
  teal: {
    dot: 'text-teal-400',
    badge: 'bg-teal-500/15 text-teal-400',
    border: 'border-l-teal-500/50',
  },
  rose: {
    dot: 'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-400',
    border: 'border-l-rose-500/50',
  },
} as const;

export type SectionColor = keyof typeof sectionColors;

interface SectionProps {
  title: string;
  count?: number | string;
  color?: SectionColor;
  defaultOpen?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Section = forwardRef<HTMLDivElement, SectionProps>(
  ({ title, count, color = 'blue', defaultOpen = false, isExpanded, onToggle, children, className }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    
    // Support both controlled and uncontrolled modes
    const isOpen = isExpanded !== undefined ? isExpanded : internalOpen;
    const handleToggle = onToggle ?? (() => setInternalOpen(!internalOpen));
    
    const colors = sectionColors[color];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg overflow-hidden border border-slate-700/50 bg-slate-800/30',
          'border-l-2',
          colors.border,
          className
        )}
      >
        {/* Header */}
        <button
          onClick={handleToggle}
          className={cn(
            'w-full flex items-center gap-2.5 p-3 transition-colors',
            'hover:bg-slate-800/50',
            isOpen && 'bg-slate-800/30'
          )}
        >
          {/* Dot indicator */}
          <span className={cn('text-[8px]', colors.dot)}>●</span>
          
          {/* Title */}
          <span className="flex-1 text-left text-[13px] uppercase tracking-wider text-slate-300 font-medium">
            {title}
          </span>
          
          {/* Count badge */}
          {count !== undefined && count !== '' && (
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-mono', colors.badge)}>
              {count}
            </span>
          )}
          
          {/* Chevron */}
          <ChevronDown
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
          <div className="bg-slate-900/30 border-t border-slate-700/30">
            {children}
          </div>
        </div>
      </div>
    );
  }
);

Section.displayName = 'Section';
