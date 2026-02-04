'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/config/theme';

// =============================================================================
// TYPES
// =============================================================================

interface IndexPageShellProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  loadingText?: string;
  error?: string | null;
  headerContent?: ReactNode;
  children: ReactNode;
}

// =============================================================================
// LOADING STATE
// =============================================================================

function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="h-[calc(100vh-4rem)] bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">{text}</p>
      </div>
    </div>
  );
}

// =============================================================================
// ERROR STATE
// =============================================================================

function ErrorState({ message }: { message: string }) {
  return (
    <div className="h-[calc(100vh-4rem)] bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-red-400 mb-2">Something went wrong</p>
        <p className="text-slate-500 text-sm">{message}</p>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function IndexPageShell({
  title,
  subtitle,
  isLoading,
  loadingText,
  error,
  headerContent,
  children,
}: IndexPageShellProps) {
  if (isLoading) {
    return <LoadingState text={loadingText} />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-[hsl(222.2,84%,4.9%)] overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-[rgba(8,11,18,0.98)] border-b border-blue-500/10">
        {/* Title */}
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Header content (search, filters, etc.) */}
        {headerContent}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  icon: ReactNode;
  message: string;
  onClear?: () => void;
}

export function EmptyState({ icon, message, onClear }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-12 h-12 text-slate-700 mb-4">
        {icon}
      </div>
      <p className="text-slate-400 text-center">{message}</p>
      {onClear && (
        <button
          onClick={onClear}
          className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

// =============================================================================
// RESULTS COUNT
// =============================================================================

interface ResultsCountProps {
  count: number;
  singular: string;
  plural: string;
}

export function ResultsCount({ count, singular, plural }: ResultsCountProps) {
  return (
    <div className="py-4 text-center">
      <span className="text-xs text-slate-500">
        {count} {count === 1 ? singular : plural}
      </span>
    </div>
  );
}
