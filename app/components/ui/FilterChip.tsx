'use client';

import { ReactNode } from 'react';
import { cn, surface, text, border } from '@/lib/config/theme';

interface FilterChipProps {
  children: ReactNode;
  isActive: boolean;
  onClick: () => void;
  dotColor?: string;
}

export function FilterChip({ children, isActive, onClick, dotColor }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
        'flex items-center gap-1.5',
        isActive
          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
          : cn(surface.control, text.hint, border.visible, 'hover:border-slate-600')
      )}
    >
      {dotColor && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColor)} />
      )}
      {children}
    </button>
  );
}

// =============================================================================
// FILTER GROUP
// =============================================================================

interface FilterGroupProps {
  label: string;
  children: ReactNode;
}

export function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div>
      <label className={cn("text-[10px] uppercase tracking-wider mb-1.5 block", text.placeholder)}>
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// FILTER PANEL WRAPPER
// =============================================================================

interface FilterPanelProps {
  isOpen: boolean;
  onClearAll?: () => void;
  hasFilters?: boolean;
  children: ReactNode;
}

export function FilterPanel({ isOpen, onClearAll, hasFilters, children }: FilterPanelProps) {
  if (!isOpen) return null;

  return (
    <div className={cn("border-t border-slate-700/30", surface.panel)}>
      <div className="px-4 py-3 space-y-3">
        {children}

        {hasFilters && onClearAll && (
          <button
            onClick={onClearAll}
            className={cn("text-xs underline underline-offset-2", text.hint, "hover:text-slate-200")}
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}
