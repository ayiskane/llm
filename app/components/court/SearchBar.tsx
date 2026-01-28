'use client';

import { useRef, useEffect } from 'react';
import { FaMagnifyingGlass, FaXmark, FaArrowsRotate } from '@/lib/icons';
import { cn, text, surface, border } from '@/lib/config/theme';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({ 
  value, 
  onChange, 
  onSubmit, 
  onClear, 
  isLoading,
  placeholder = "Search courts, contacts, cells...",
  autoFocus = false,
  className,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleClear = () => {
    onChange('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSubmit?.();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", text.hint)}>
        {isLoading ? (
          <FaArrowsRotate className="w-4 h-4 animate-spin" />
        ) : (
          <FaMagnifyingGlass className="w-4 h-4" />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn("w-full h-9 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl", surface.modal, border.visible.replace('border-slate-700/50', 'border-slate-700'), text.heading, "placeholder:text-slate-500")}
      />

      {value && (
        <button
          onClick={handleClear}
          className={cn("absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1", text.linkSubtle)}
        >
          <FaXmark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
