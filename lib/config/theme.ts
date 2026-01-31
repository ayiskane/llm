// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - THEME CONFIGURATION
// ============================================================================
// Tailwind utility class strings for consistent styling across components
// Uses CSS variables from globals.css for consistency
// ============================================================================

export { cn } from '@/lib/utils';

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
  divided: 'divide-y divide-border/50',
  row: 'interactive-row px-3 py-2',
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

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const button = {
  teams: 'btn-teams',
  call: 'btn-call',
  copy: 'btn-copy',
} as const;

// ============================================================================
// ICON CONTAINER STYLES
// ============================================================================

export const iconContainer = {
  default: 'icon-container',
  emerald: 'icon-container-emerald',
  indigo: 'icon-container-indigo',
  amber: 'icon-container-amber',
} as const;

// ============================================================================
// ACCENT BAR STYLES (vertical color strips on contact cards)
// ============================================================================