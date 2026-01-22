// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - THEME CONFIGURATION
// ============================================================================
// Type definitions and class name mappings for Tailwind CSS classes
// All actual styles defined in globals.css using @layer components
// ============================================================================

export { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SectionColor = 'emerald' | 'blue' | 'amber' | 'purple' | 'teal' | 'indigo' | 'cyan' | 'rose';
export type ContactCategory = 'court' | 'provincial' | 'supreme' | 'bail' | 'other';

// ============================================================================
// SECTION COLOR MAPPINGS (for dynamic class application)
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
// ICON SIZE CLASSES
// ============================================================================

export const iconSize = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
} as const;

// ============================================================================
// TEXT STYLE CLASSES (reference to @layer components in globals.css)
// ============================================================================

export const text = {
  sectionHeader: 'text-section-header',
  roleLabel: 'text-role-label',
  scheduleLabel: 'text-schedule-label',
  monoValue: 'text-mono-value',
  primary: 'text-white',
  secondary: 'text-slate-200',
  muted: 'text-slate-300',
  subtle: 'text-slate-400',
  disabled: 'text-slate-500',
} as const;

// ============================================================================
// CARD STYLE CLASSES (reference to @layer components in globals.css)
// ============================================================================

export const card = {
  base: 'card-base',
  padded: 'card-padded',
  divided: 'card-divided',
  row: 'card-row',
  flexRow: 'card-flex-row',
  coupon: 'card-coupon',
  couponDivider: 'card-coupon-divider',
} as const;

// ============================================================================
// SECTION STYLE CLASSES
// ============================================================================

export const section = {
  container: 'section-container',
  header: 'section-header',
  headerExpanded: 'section-header-expanded',
  title: 'section-title',
  content: 'section-content',
} as const;

// ============================================================================
// PILL BUTTON CLASSES
// ============================================================================

export const pill = {
  base: 'pill-base',
  active: 'pill-active',
  inactive: 'pill-inactive',
} as const;

// ============================================================================
// TOGGLE BUTTON CLASSES
// ============================================================================

export const toggle = {
  base: 'toggle-btn',
  active: 'toggle-btn-active',
  inactive: 'toggle-btn-inactive',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get section color classes for a given color
 */
export function getSectionColors(color: SectionColor) {
  return sectionColorMap[color];
}

/**
 * Get category accent bar class
 */
export function getCategoryAccentClass(category: ContactCategory): string {
  return categoryColorMap[category];
}

/**
 * Get schedule label class with optional amber color
 */
export function getScheduleLabelClass(isAmber = false): string {
  return `${text.scheduleLabel} ${isAmber ? 'text-amber-400' : 'text-slate-300'}`;
}
