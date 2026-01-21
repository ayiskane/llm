'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ 
  value, 
  onChange, 
  onSubmit, 
  onClear, 
  isLoading,
  placeholder = "Search courts, contacts, cells...",
  autoFocus = false
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
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </div>
      
      <Input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full h-12 pl-11 pr-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl"
      />
      
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors p-1"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// Full screen search overlay (for detail pages)
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function SearchOverlay({ 
  isOpen, 
  onClose, 
  value, 
  onChange, 
  onSubmit,
  isLoading,
  children 
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-slate-900"
        >
          <div className="flex flex-col h-full">
            {/* Search Header */}
            <div className="flex items-center gap-2 p-3 bg-slate-800 border-b border-slate-700">
              <button
                onClick={onClose}
                className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </div>
                
                <Input
                  ref={inputRef}
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
                  placeholder="Search..."
                  className="w-full h-10 pl-9 pr-8 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg"
                />
                
                {value && (
                  <button
                    onClick={() => onChange('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Quick search suggestions
interface QuickSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
}

export function QuickSuggestions({ suggestions, onSelect }: QuickSuggestionsProps) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion}
          onClick={() => onSelect(suggestion)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-full transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  );
}
