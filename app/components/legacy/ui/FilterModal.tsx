'use client';

import { useEffect } from 'react';
import { FaXmark } from '@/lib/icons';
import { cn } from '@/lib/config/theme';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  onApply?: () => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
  showActions?: boolean;
}

export function FilterModal({ 
  isOpen, 
  onClose, 
  title = 'Filters', 
  children,
  onApply,
  onReset,
  hasActiveFilters = false,
  showActions = true,
}: FilterModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleApply = () => {
    onApply?.();
    onClose();
  };

  const handleReset = () => {
    onReset?.();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-modal-title"
      >
        <div className="bg-slate-900 rounded-t-3xl border-t border-slate-700/50 shadow-2xl max-h-[85vh] flex flex-col">
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 rounded-full bg-slate-700" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between px-5 pb-4">
            <h2 id="filter-modal-title" className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Close filters"
            >
              <FaXmark className="w-4 h-4" />
            </button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-4">
            {children}
          </div>

          {/* Action buttons */}
          {showActions && (
            <div className="px-5 pb-6 pt-2 border-t border-slate-800 flex gap-3">
              {hasActiveFilters && onReset && (
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 font-medium text-sm hover:bg-slate-800 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                onClick={handleApply}
                className={cn(
                  "py-3 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 transition-colors",
                  hasActiveFilters && onReset ? "flex-1" : "flex-1"
                )}
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
