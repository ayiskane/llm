// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - DESIGN TOKEN SYSTEM
// ============================================================================
// Centralized design tokens for consistent styling across all components
// Uses CSS custom properties defined in globals.css
// ============================================================================

export { cn } from '@/lib/utils';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type SectionColor = 'emerald' | 'blue' | 'amber' | 'purple' | 'indigo' | 'rose' | 'sky' | 'slate';
export type ContactCategory = 'court' | 'provincial' | 'federal' | 'supreme' | 'bail' | 'other';
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// ============================================================================
// SURFACE TOKENS - Backgrounds & Cards
// ============================================================================
// Naming: Describes WHERE/WHEN to use, not just appearance
// page = full page background | panel = raised sections | modal = overlays
// card = content containers | control = inputs/buttons | header = sticky headers

export const surface = {
  // Page-level backgrounds (darkest to lightest)
  page: 'bg-slate-950',              // Main page background
  panel: 'bg-slate-900',             // Raised panels, sidebars
  modal: 'bg-slate-800',             // Modals, dropdowns, popovers

  // Card backgrounds (transparent layers)
  card: 'bg-slate-800/30',           // Default card/container background
  cardHover: 'hover:bg-slate-800/50', // Card hover state
  cardPressed: 'bg-slate-800/80',    // Card active/pressed state

  // Control backgrounds (inputs, buttons, interactive elements)
  control: 'bg-slate-800/50',        // Input fields, interactive controls
  controlHover: 'hover:bg-slate-800/70',
  controlPressed: 'active:bg-slate-700/50',

  // Fixed elements
  header: 'bg-slate-900',            // Sticky headers, nav bars (darker than content area)
  toast: 'bg-slate-800/95',          // Toast notifications
} as const;

// ============================================================================
// TEXT TOKENS - Typography hierarchy
// ============================================================================
// Naming: Describes PURPOSE, not just visual weight
// heading = titles | body = main content | label = field labels
// hint = helper text | placeholder = empty states | disabled = inactive

export const text = {
  // Content hierarchy
  heading: 'text-white',             // Page titles, section headers, emphasis
  body: 'text-slate-200',            // Main readable content
  label: 'text-slate-300',           // Field labels, secondary info
  hint: 'text-slate-400',            // Helper text, metadata
  placeholder: 'text-slate-500',     // Placeholders, empty states
  disabled: 'text-slate-600',        // Disabled/inactive text

  // Semantic labels (compound styles)
  sectionHeader: 'text-xs text-slate-500 uppercase px-1 tracking-wide',
  roleLabel: 'text-[9px] text-slate-400 uppercase mb-1 tracking-[2px]',
  scheduleLabel: 'text-xs font-mono font-semibold uppercase tracking-wide',
  mono: 'text-slate-400 text-xs font-mono',

  // Interactive text
  link: 'text-blue-400 hover:text-blue-300',
  linkSubtle: 'text-slate-400 hover:text-white',
} as const;

// ============================================================================
// BORDER TOKENS
// ============================================================================
// visible = clearly visible borders | subtle = barely visible separation

export const border = {
  // Two border variants only
  visible: 'border border-slate-700/50',   // Standard visible borders
  subtle: 'border border-slate-800/50',    // Barely visible, soft separation

  // Divider versions (bottom border only)
  divider: 'border-b border-slate-700/50', // Horizontal separator

  // Focus states (for accessibility)
  focus: 'focus:ring-2 focus:ring-blue-500/40 focus:border-transparent',
  focusVisible: 'focus-visible:ring-2 focus-visible:ring-blue-500/40',

  // Accent borders (colored emphasis)
  accentBlue: 'border border-blue-500/50',
  accentAmber: 'border border-amber-500/30',
  accentEmerald: 'border border-emerald-500/30',
} as const;

// ============================================================================
// SECTION COLOR MAPPINGS
// ============================================================================

export const sectionColorMap: Record<SectionColor, { badge: string; border?: string; bg?: string }> = {
  emerald: {
    badge: 'bg-emerald-500/15 text-emerald-400',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
  },
  blue: {
    badge: 'bg-blue-500/15 text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-400',
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  purple: {
    badge: 'bg-purple-500/15 text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/10',
  },
  indigo: {
    badge: 'bg-indigo-500/15 text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
  },
  rose: {
    badge: 'bg-rose-500/15 text-rose-400',
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
  },
  sky: {
    badge: 'bg-sky-500/15 text-sky-400',
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
  },
  slate: {
    badge: 'bg-slate-500/15 text-slate-400',
    border: 'border-slate-500/30',
    bg: 'bg-slate-500/10',
  },
};

// ============================================================================
// CONTACT CATEGORY COLOR MAPPINGS
// ============================================================================

export const categoryColorMap: Record<ContactCategory, string> = {
  court: 'bg-blue-400',
  provincial: 'bg-emerald-400',
  federal: 'bg-purple-400',
  supreme: 'bg-rose-400',
  bail: 'bg-amber-400',
  other: 'bg-blue-400',
};

// ============================================================================
// ICON TOKENS
// ============================================================================

export const iconSize = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
} as const;

export const cellIcon = {
  bg: 'bg-slate-500/20',
  color: 'text-amber-400',
} as const;

// ============================================================================
// COMPONENT PRESETS - Card variants
// ============================================================================

export const card = {
  base: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50',
  padded: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 px-4',
  divided: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 divide-y divide-slate-700/50',
  row: 'py-3 border-b border-slate-700/30 last:border-b-0',
  flexRow: 'flex justify-between px-4 py-2.5',
  coupon: 'flex items-stretch rounded-lg overflow-hidden cursor-pointer transition-all bg-blue-500/[0.03] border border-dashed border-blue-500/25 hover:border-blue-500/40',
  couponDivider: 'border-l border-dashed border-blue-500/25',
  interactive: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 active:bg-slate-800/60 transition-colors cursor-pointer',
} as const;

// ============================================================================
// COMPONENT PRESETS - Section/Accordion
// ============================================================================

export const section = {
  container: 'rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50',
  header: 'w-full flex items-center gap-2.5 p-3 transition-colors border-b border-slate-700/30',
  headerExpanded: 'bg-slate-800/50',
  title: 'flex-1 text-left text-[13px] uppercase tracking-wider text-slate-200 font-medium',
  content: 'bg-slate-900/20',
} as const;

// ============================================================================
// COMPONENT PRESETS - Pills & Toggles
// ============================================================================

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
// COMPONENT PRESETS - Inputs
// ============================================================================

export const input = {
  base: 'bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-transparent',
  search: 'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40',
  searchCompact: 'w-full h-9 pl-10 pr-9 bg-slate-800 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl',
} as const;

// ============================================================================
// COMPONENT PRESETS - Buttons
// ============================================================================

export const button = {
  // Base styles
  base: 'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all',

  // Variants
  primary: 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700',
  secondary: 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800/70 hover:text-slate-200',
  ghost: 'text-slate-400 hover:text-white hover:bg-slate-800/50',
  danger: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25',

  // Sizes
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
  lg: 'px-4 py-2.5 text-sm',

  // Icon buttons
  icon: 'p-2 rounded-lg',
  iconSm: 'p-1.5 rounded-md',
} as const;

// ============================================================================
// COMPONENT PRESETS - List items
// ============================================================================

export const listItem = {
  base: 'w-full text-left px-4 py-3 border-b border-slate-700/30 last:border-b-0',
  interactive: 'w-full text-left px-4 py-3 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-800/30 active:bg-slate-800/50 transition-colors',
  header: 'sticky top-0 z-10 px-4 py-2 bg-slate-950 border-b border-slate-800/50',
} as const;

// ============================================================================
// COMPONENT PRESETS - Tags/Badges
// ============================================================================

export const tag = {
  base: 'px-2 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase tracking-widest',
  default: 'bg-white/5 border border-slate-700/50 text-slate-400',
  sm: 'px-2 py-1.5 text-[9px]',
  md: 'px-2.5 py-1.5 text-[10px]',
} as const;

// ============================================================================
// COMPONENT PRESETS - Filter chips
// ============================================================================

export const filterChip = {
  base: 'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
  active: 'bg-blue-500/20 border border-blue-500/50 text-blue-400',
  inactive: 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800/70',
  activeAlt: 'bg-blue-500/20 text-blue-300 border border-blue-500/40',
  inactiveAlt: 'bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:border-slate-600',
} as const;

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

export const layout = {
  // Page containers
  page: 'h-full flex flex-col',
  pageWithNav: 'h-full flex flex-col bg-slate-950',

  // Scroll containers
  scrollArea: 'flex-1 min-h-0 overflow-y-auto scroll-smooth',
  scrollContent: 'p-3 space-y-2.5 pb-20',

  // Sticky elements
  stickyTop: 'sticky top-0 z-10',
  stickyBottom: 'sticky bottom-0 z-10',
} as const;

// ============================================================================
// SPACING TOKENS
// ============================================================================

export const spacing = {
  // Padding presets
  section: 'p-3',
  card: 'px-4 py-3',
  cardCompact: 'px-3 py-2',
  listItem: 'px-4 py-3',

  // Gap presets
  stack: 'space-y-2.5',
  stackTight: 'space-y-2',
  stackLoose: 'space-y-3',
  inline: 'gap-2',
  inlineTight: 'gap-1.5',
  inlineLoose: 'gap-3',
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

export function getScheduleLabelClass(color?: 'amber' | 'sky'): string {
  const colorClass = color === 'amber' ? 'text-amber-400'
    : color === 'sky' ? 'text-sky-400'
    : 'text-slate-300';
  return `${text.scheduleLabel} ${colorClass}`;
}

// Combine multiple token classes
export function tokens(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
