// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - THEME CONFIGURATION
// ============================================================================
// Tailwind utility class strings for consistent styling across components
// ============================================================================

export { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BadgeColor = 'emerald' | 'purple' | 'amber' | 'blue' | 'rose' | 'sky' | 'slate';

// ============================================================================
// BADGE COLOR MAPPINGS (for custom use cases outside Badge component)
// ============================================================================

export const badgeColors: Record<BadgeColor, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  purple: 'bg-purple-500/15 text-purple-400',
  amber: 'bg-amber-500/15 text-amber-400',
  blue: 'bg-blue-500/15 text-blue-400',
  rose: 'bg-rose-500/15 text-rose-400',
  sky: 'bg-sky-500/15 text-sky-400',
  slate: 'bg-slate-500/15 text-slate-400',
};

// ============================================================================
// ICON SIZES
// ============================================================================

export const iconSize = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const;

// ============================================================================
// TEXT STYLES
// ============================================================================

export const text = {
  // Headers
  sectionHeader: 'text-[10px] uppercase tracking-widest text-muted-foreground',
  pageTitle: 'text-lg font-bold text-foreground',
  pageSubtitle: 'text-xs text-muted-foreground',
  // Body
  primary: 'text-sm font-medium text-foreground',
  secondary: 'text-[11px] text-muted-foreground',
  muted: 'text-xs text-muted-foreground',
} as const;

// ============================================================================
// CARD STYLES
// ============================================================================

export const card = {
  base: 'rounded-xl overflow-hidden',
  divided: 'divide-y divide-border',
  row: 'w-full text-left px-3 py-2.5 transition-colors hover:bg-muted/50 active:bg-muted',
} as const;

// ============================================================================
// LAYOUT STYLES
// ============================================================================

export const layout = {
  stickyHeader: 'sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80',
  stickySection: 'sticky top-0 z-10 px-4 py-1.5 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80',
  pageContainer: 'h-full flex flex-col bg-background',
  scrollContainer: 'h-full overflow-y-auto',
} as const;

// ============================================================================
// FILTER BUTTON STYLES
// ============================================================================

export const filterButton = {
  base: 'h-9 w-9 p-0 relative',
  active: 'border-primary text-primary',
  badge: 'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground',
} as const;
