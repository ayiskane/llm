'use client';

import { FaMagnifyingGlass, FaXmark, FaSliders } from '@/lib/icons';
import { cn } from '@/lib/config/theme';

interface SearchBarWithFilterProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
  placeholder?: string;
}

export function SearchBarWithFilter({
  value,
  onChange,
  onClear,
  onFilterClick,
  hasActiveFilters,
  placeholder = 'Search...',
}: SearchBarWithFilterProps) {
  return (
    <div className="flex gap-2 px-4 pb-3">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <FaMagnifyingGlass className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl',
            'pl-11 pr-10 py-3 text-sm',
            'text-slate-200 placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40',
            'transition-all duration-200'
          )}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        onClick={onFilterClick}
        className={cn(
          'relative flex items-center justify-center w-12 rounded-xl border transition-all',
          hasActiveFilters
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
        )}
      >
        <FaSliders className="w-4 h-4" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
        )}
      </button>
    </div>
  );
}
