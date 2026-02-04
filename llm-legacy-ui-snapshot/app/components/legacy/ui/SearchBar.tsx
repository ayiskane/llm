'use client';

import { FaMagnifyingGlass, FaXmark } from '@/lib/icons';
import { cn } from '@/lib/config/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  compact?: boolean;
  className?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = 'Search courts, cells, contacts...',
  compact = false,
  className,
  autoFocus = false,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <FaMagnifyingGlass className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full bg-slate-800/50 border border-slate-700/50 rounded-full',
          'text-slate-200 placeholder:text-slate-500',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
          'transition-all duration-200',
          compact ? 'pl-10 pr-10 py-2 text-sm h-9' : 'pl-12 pr-12 py-3 h-12'
        )}
      />
      {value && (
        <button
          onClick={onClear}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'text-slate-400 hover:text-slate-200 transition-colors'
          )}
        >
          <FaXmark className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        </button>
      )}
    </div>
  );
}
