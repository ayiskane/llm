'use client';

import { FaMagnifyingGlass, FaXmark } from '@/lib/icons';
import { cn, surface, text, border } from '@/lib/config/theme';

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
      <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", text.hint)}>
        <FaMagnifyingGlass className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full rounded-full',
          surface.control, border.visible,
          text.body, 'placeholder:text-slate-500',
          border.focus,
          'transition-all duration-200',
          compact ? 'pl-10 pr-10 py-2 text-sm h-9' : 'pl-12 pr-12 py-3 h-12'
        )}
      />
      {value && (
        <button
          onClick={onClear}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            text.hint, 'hover:text-slate-200 transition-colors'
          )}
        >
          <FaXmark className={compact ? 'w-4 h-4' : 'w-5 h-5'} />
        </button>
      )}
    </div>
  );
}
