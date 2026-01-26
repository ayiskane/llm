// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - THEME CONFIGURATION
// ============================================================================
// Tailwind utility class strings for consistent styling across components
// ============================================================================

export { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SectionColor = 'emerald' | 'blue' | 'amber' | 'purple' | 'teal' | 'indigo' | 'cyan' | 'rose';
export type ContactCategory = 'court' | 'provincial' | 'supreme' | 'bail' | 'other';

// ============================================================================
// SECTION COLOR MAPPINGS
// ============================================================================

export const sectionColorMap: Record<SectionColor, { dot: string; badge: string }> = {
  emerald: { dot: 'text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-400' },
  blue: { dot: 'text-blue-400', badge: 'bg-blue-500/15 text-blue-400' },
  amber: { dot: 'text-amber-400', badge: 'bg-amber-500/15 text-amber-400' },
  purple: { dot: 'text-purple-400', badge: 'bg-purple-500/15 text-purple-400' },
  teal: { dot: 'text-teal-400', badge: 'bg-teal-500/15 text-teal-400' },
  indigo: { dot: 'text-indigo-400', badge: 'bg-indigo-500/15 text-indigo-400' },
  cyan: { dot: 'text-cyan-400', badge: 'bg-cyan-500/15 text-cyan-400' },
  rose: { dot: 'text-rose-400', badge: 'bg-rose-500/15 text-rose-400' },
};

// ============================================================================
// CONTACT CATEGORY COLOR MAPPINGS
// ============================================================================

export const categoryColorMap: Record<ContactCategory, string> = {
  court: 'bg-blue-400',
  provincial: 'bg-emerald-400',
  supreme: 'bg-purple-400',
  bail: 'bg-amber-400',
  other: 'bg-zinc-500',
};

// ============================================================================
// UTILITY CLASS STRINGS
// ============================================================================

export const iconSize = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

export const text = {
  // Headers - use for "COURT CONTACTS", "CROWN CONTACTS", "LAST UPDATED", etc.
  sectionHeader: 'text-xs text-slate-500 uppercase px-1 tracking-wide',
  roleLabel: 'text-[9px] text-slate-400 uppercase mb-1 tracking-[2px]',
  scheduleLabel: 'text-xs font-mono font-semibold uppercase tracking-wide',
  monoValue: 'text-slate-400 text-xs font-mono',
  // Body text
  primary: 'text-white',
  secondary: 'text-slate-200',
  muted: 'text-slate-300',
  subtle: 'text-slate-400',
  disabled: 'text-slate-500',
} as const;

export const card = {
  base: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50',
  padded: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 px-4',
  divided: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 divide-y divide-slate-700/50',
  row: 'py-3 border-b border-slate-700/30 last:border-b-0',
  flexRow: 'flex justify-between px-4 py-2.5',
  coupon: 'flex items-stretch rounded-lg overflow-hidden cursor-pointer transition-all bg-blue-500/[0.03] border border-dashed border-blue-500/25 hover:border-blue-500/40',
  couponDivider: 'border-l border-dashed border-blue-500/25',
} as const;

export const section = {
  container: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50',
  header: 'w-full flex items-center gap-2.5 p-3 transition-colors border-b border-slate-700/30',
  headerExpanded: 'bg-slate-800/50',
  title: 'flex-1 text-left text-[13px] uppercase tracking-wider text-slate-200 font-medium',
  content: 'bg-slate-900/20',
} as const;

export const pill = {
  base: 'inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors',
  active: 'bg-blue-500/25 border border-blue-500/40 text-blue-300',
  inactive: 'bg-blue-500/[0.04] border border-blue-500/15 text-slate-400',
} as const;

export const toggle = {
  base: 'flex items-center gap-1.5 px-2 py-1 rounded text-xs tracking-wide transition-all',
  active: 'bg-blue-500/15 border border-blue-500/40 text-blue-400',
  inactive: 'bg-transparent border border-slate-700/50 text-slate-500',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getSectionColors(color: SectionColor) {
  return sectionColorMap[color];
}

export function getCategoryAccentClass(category: ContactCategory): string {
  return categoryColorMap[category];
}

export function getScheduleLabelClass(isAmber = false): string {
  return `${text.scheduleLabel} ${isAmber ? 'text-amber-400' : 'text-slate-300'}`;
}
