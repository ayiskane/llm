// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - THEME CONFIGURATION (OPTIMIZED)
// ============================================================================
// Centralized theme tokens - all styling in one place
// ============================================================================

// Re-export cn from lib/utils (shadcn version with tailwind-merge)
export { cn } from '@/lib/utils';

// ============================================================================
// COLOR TOKENS - Semantic color values
// ============================================================================

export const colors = {
  // Accent colors (hex for inline styles)
  accent: {
    blue: '#60a5fa',
    emerald: '#34d399',
    purple: '#a78bfa',
    amber: '#fbbf24',
    cyan: '#22d3ee',
    rose: '#fb7185',
    teal: '#2dd4bf',
    zinc: '#71717a',
  },
  // Border colors
  border: {
    primary: 'rgba(51,65,85,0.5)',      // slate-700/50
    accent: 'rgba(59,130,246,0.25)',    // blue-500/25
    accentHover: 'rgba(59,130,246,0.4)', // blue-500/40
  },
  // Background colors
  bg: {
    card: 'rgba(59,130,246,0.03)',      // Very subtle blue tint
    cardHover: 'rgba(59,130,246,0.06)', // Slightly more on hover
    item: 'rgba(30,41,59,0.5)',         // slate-800/50
  },
  // Text colors
  text: {
    primary: '#f1f5f9',    // slate-100
    secondary: '#e2e8f0',  // slate-200
    muted: '#94a3b8',      // slate-400
    subtle: '#64748b',     // slate-500
    disabled: '#71717a',   // zinc-500
  },
} as const;

// ============================================================================
// CONTACT CATEGORY COLORS - For accent bars on contact cards
// ============================================================================

export type ContactCategory = 'court' | 'provincial' | 'supreme' | 'bail' | 'other';

export const contactCategoryColors: Record<ContactCategory, string> = {
  court: colors.accent.blue,
  provincial: colors.accent.emerald,
  supreme: colors.accent.purple,
  bail: colors.accent.amber,
  other: colors.accent.zinc,
} as const;

// ============================================================================
// TAG COLORS - For Tag component
// ============================================================================

export const tagColors = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  indigo: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
  cyan: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  rose: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  teal: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
} as const;

export type TagColor = keyof typeof tagColors;

// ============================================================================
// TEXT CLASSES - Typography tokens
// ============================================================================

export const textClasses = {
  // Headers
  sectionHeader: 'text-xs text-slate-500 uppercase tracking-wider',
  roleLabel: 'text-[9px] text-slate-400 uppercase font-mono',
  scheduleLabel: 'text-xs font-mono font-semibold uppercase tracking-wide',
  
  // Content
  muted: 'text-xs text-slate-500',
  subtle: 'text-sm text-slate-400',
  
  // Interactive
  link: 'text-blue-400 hover:text-blue-300 transition-colors cursor-pointer',
} as const;

// ============================================================================
// ICON CLASSES - Size tokens for react-bootstrap-icons
// ============================================================================

export const iconClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
} as const;

// ============================================================================
// CARD CLASSES - Card styling tokens
// ============================================================================

export const cardClasses = {
  // Interactive card variant (for clickable cards like BailHubLink)
  interactive: 'bg-slate-800/30 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 hover:border-slate-600/50 transition-all',
  
  // Coupon style for contact cards
  coupon: 'flex items-stretch rounded-lg overflow-hidden cursor-pointer transition-all hover:border-blue-500/40',
} as const;

// Coupon card inline styles (for properties not in Tailwind)
export const couponCardStyles = {
  container: {
    background: colors.bg.card,
    border: `1px dashed ${colors.border.accent}`,
  },
  divider: {
    borderLeft: `1px dashed ${colors.border.accent}`,
  },
} as const;

// ============================================================================
// ACCORDION COLORS - For Section component
// ============================================================================

export const accordionColors = {
  slate: {
    border: 'border-slate-600',
    dot: 'bg-slate-400',
    hover: 'hover:bg-slate-800/50',
  },
  emerald: {
    border: 'border-emerald-500/50',
    dot: 'bg-emerald-400',
    hover: 'hover:bg-emerald-500/10',
  },
  blue: {
    border: 'border-blue-500/50',
    dot: 'bg-blue-400',
    hover: 'hover:bg-blue-500/10',
  },
  amber: {
    border: 'border-amber-500/50',
    dot: 'bg-amber-400',
    hover: 'hover:bg-amber-500/10',
  },
  purple: {
    border: 'border-purple-500/50',
    dot: 'bg-purple-400',
    hover: 'hover:bg-purple-500/10',
  },
  cyan: {
    border: 'border-cyan-500/50',
    dot: 'bg-cyan-400',
    hover: 'hover:bg-cyan-500/10',
  },
  rose: {
    border: 'border-rose-500/50',
    dot: 'bg-rose-400',
    hover: 'hover:bg-rose-500/10',
  },
  teal: {
    border: 'border-teal-500/50',
    dot: 'bg-teal-400',
    hover: 'hover:bg-teal-500/10',
  },
} as const;

export type AccordionColor = keyof typeof accordionColors;

// ============================================================================
// INLINE STYLES - For properties requiring inline styles
// ============================================================================

export const inlineStyles = {
  letterSpacing: {
    wide: { letterSpacing: '1px' } as const,
    wider: { letterSpacing: '2px' } as const,
    widest: { letterSpacing: '0.1em' } as const,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS - Props generators for common patterns
// ============================================================================

/**
 * Get section header props (className + style)
 */
export function getSectionHeaderProps() {
  return {
    className: textClasses.sectionHeader,
    style: inlineStyles.letterSpacing.wide,
  };
}

/**
 * Get role label props (className + letter spacing)
 */
export function getRoleLabelProps() {
  return {
    className: textClasses.roleLabel,
    style: inlineStyles.letterSpacing.wide,
  };
}

/**
 * Get schedule label class with optional amber highlight
 */
export function getScheduleLabelClass(isAmber = false) {
  return `${textClasses.scheduleLabel} ${isAmber ? 'text-amber-400' : 'text-slate-300'}`;
}

/**
 * Get tag classes for a given color
 */
export function getTagClasses(color: TagColor, size: 'sm' | 'md' = 'sm') {
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1.5 text-[9px] tracking-widest' 
    : 'px-2.5 py-1.5 text-[10px] tracking-wide';
  return `inline-flex items-center justify-center rounded font-mono uppercase leading-none border ${tagColors[color]} ${sizeClasses}`;
}

/**
 * Get contact category color for accent bar
 */
export function getContactCategoryColor(category: ContactCategory): string {
  return contactCategoryColors[category];
}

/**
 * Get toggle button styles (for Show Full toggle)
 */
export function getToggleButtonStyles(isActive: boolean) {
  return {
    background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
    border: `1px solid ${isActive ? colors.border.accentHover : colors.border.primary}`,
    color: isActive ? colors.accent.blue : colors.text.disabled,
  };
}
