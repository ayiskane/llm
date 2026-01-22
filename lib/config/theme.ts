// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - THEME CONFIGURATION
// ============================================================================
// Cyber Ocean Theme - All color values and styling tokens in one place
// ============================================================================

// ============================================================================
// BASE THEME OBJECT
// ============================================================================

export const theme = {
  // Base colors
  colors: {
    bg: {
      primary: '#080b12',
      card: 'rgba(59,130,246,0.03)',
      cardHover: 'rgba(59,130,246,0.06)',
      cardActive: 'rgba(59,130,246,0.08)',
      subtle: 'rgba(59,130,246,0.02)',
      item: 'rgba(59,130,246,0.04)',
      header: 'rgba(8,11,18,0.95)',
      headerSolid: 'rgba(8,11,18,0.9)',
    },
    border: {
      primary: 'rgba(59,130,246,0.12)',
      subtle: 'rgba(59,130,246,0.08)',
      light: 'rgba(59,130,246,0.06)',
      accent: 'rgba(59,130,246,0.15)',
      strong: 'rgba(59,130,246,0.2)',
    },
    accent: {
      primary: '#3b82f6',     // blue-500
      secondary: '#22d3ee',   // cyan-400
      gradient: 'linear-gradient(135deg, #3b82f6, #22d3ee)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#e4e4e7',   // zinc-200
      muted: '#a1a1aa',       // zinc-400
      subtle: '#71717a',      // zinc-500
      disabled: '#52525b',    // zinc-600
    },
    // Section/category colors
    section: {
      emerald: {
        dot: '#34d399',
        bg: 'rgba(16,185,129,0.15)',
        text: '#34d399',
      },
      blue: {
        dot: '#60a5fa',
        bg: 'rgba(59,130,246,0.15)',
        text: '#60a5fa',
      },
      amber: {
        dot: '#fbbf24',
        bg: 'rgba(245,158,11,0.15)',
        text: '#fbbf24',
      },
      cyan: {
        dot: '#22d3ee',
        bg: 'rgba(34,211,238,0.15)',
        text: '#22d3ee',
      },
      indigo: {
        dot: '#a5b4fc',
        bg: 'rgba(99,102,241,0.15)',
        text: '#a5b4fc',
      },
      purple: {
        dot: '#a78bfa',
        bg: 'rgba(139,92,246,0.15)',
        text: '#a78bfa',
      },
      teal: {
        dot: '#2dd4bf',
        bg: 'rgba(20,184,166,0.15)',
        text: '#2dd4bf',
      },
    },
    // Contact category colors
    category: {
      court: '#3b82f6',      // blue
      provincial: '#22c55e', // green
      bail: '#14b8a6',       // teal
      crown: '#a855f7',      // purple
      other: '#6b7280',      // gray
    },
  },

  // Background effects
  effects: {
    grid: {
      image: 'linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)',
      size: '40px 40px',
      opacity: 0.2,
    },
    orb1: {
      position: { top: '-150px', right: '-100px' },
      size: { width: '500px', height: '500px' },
      gradient: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, rgba(6,182,212,0.12) 40%, transparent 70%)',
      blur: '100px',
    },
    orb2: {
      position: { bottom: '-150px', left: '-100px' },
      size: { width: '400px', height: '400px' },
      gradient: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 60%)',
      blur: '100px',
    },
  },

  // Component-specific styles
  components: {
    card: {
      base: {
        background: 'rgba(59,130,246,0.03)',
        border: '1px solid rgba(59,130,246,0.12)',
        borderRadius: '8px',
      },
      header: {
        background: 'rgba(59,130,246,0.06)',
        borderBottom: '1px solid rgba(59,130,246,0.08)',
        padding: '12px',
      },
      body: {
        background: 'rgba(59,130,246,0.02)',
      },
    },
    button: {
      primary: {
        background: 'linear-gradient(135deg, #3b82f6, #22d3ee)',
        color: 'white',
      },
      secondary: {
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.15)',
        color: '#a1a1aa',
      },
      copy: {
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.15)',
      },
    },
    tag: {
      base: {
        fontSize: '9px',
        padding: '2px 8px',
        borderRadius: '4px',
        fontFamily: 'monospace',
      },
    },
    section: {
      header: {
        padding: '12px',
        gap: '10px',
      },
      title: {
        fontSize: '10px',
        fontFamily: 'monospace',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
      },
    },
    entry: {
      label: {
        fontSize: '9px',
        fontFamily: 'monospace',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.04em',
        marginBottom: '4px',
      },
      value: {
        fontSize: '13px',
      },
      row: {
        padding: '8px 12px',
        borderBottom: '1px solid rgba(59,130,246,0.06)',
      },
    },
  },
  
  // Toast styles
  toast: {
    background: 'rgba(51, 65, 85, 0.95)',
    duration: 2000,
  },
} as const;

// ============================================================================
// TAILWIND CLASS CONSTANTS
// ============================================================================

// Card containers
export const cardClasses = {
  base: 'bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden',
  padded: 'bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden px-4',
  divided: 'bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden divide-y divide-slate-700/50',
  interactive: 'bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden cursor-pointer hover:bg-slate-800 transition-colors active:bg-slate-700',
  row: 'py-3 border-b border-slate-700/30 last:border-b-0',
  flexRow: 'flex justify-between px-4 py-2.5',
} as const;

// Typography classes
export const textClasses = {
  // Headers
  sectionHeader: 'text-xs text-slate-500 uppercase px-1',
  roleLabel: 'text-[9px] text-slate-400 uppercase mb-1',
  scheduleLabel: 'text-xs font-mono font-semibold uppercase',
  lastUpdated: 'text-xs text-slate-500 uppercase',
  
  // Body text
  primary: 'text-white',
  secondary: 'text-slate-200',
  muted: 'text-slate-300',
  subtle: 'text-slate-400',
  disabled: 'text-slate-500',
  
  // Monospace
  mono: 'font-mono',
  monoSm: 'text-xs font-mono',
  monoValue: 'text-slate-400 text-xs font-mono',
  
  // Interactive
  link: 'text-blue-400 hover:text-blue-300 cursor-pointer transition-colors',
} as const;

// Icon sizes
export const iconClasses = {
  xs: 'w-3 h-3',
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-7 h-7',
} as const;

// Button classes
export const buttonClasses = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-slate-700 hover:bg-slate-600 transition-colors',
  ghost: 'hover:bg-slate-700/50 transition-colors',
  icon: 'p-2 rounded-lg transition-colors',
  join: 'bg-purple-600 hover:bg-purple-500 text-white transition-colors',
  navLink: 'w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-slate-700/50',
  copy: 'p-1.5 rounded transition-colors hover:bg-slate-700',
  action: 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
} as const;

// Common inline styles
export const inlineStyles = {
  sectionHeader: { fontFamily: 'Inter, sans-serif', letterSpacing: '1px' },
  roleLabelSpaced: { fontFamily: 'Inter, sans-serif', letterSpacing: '1px' },
  roleLabelNormal: { fontFamily: 'Inter, sans-serif' },
  scheduleLabel: { letterSpacing: '1px' },
  regionTag: { letterSpacing: '2px' },
} as const;

// ============================================================================
// SECTION COLORS (for accordions/cards)
// ============================================================================

export type SectionColor = 'emerald' | 'blue' | 'amber' | 'cyan' | 'indigo' | 'purple' | 'teal';

export const sectionColors: Record<SectionColor, { dot: string; bg: string; border: string; text: string }> = {
  emerald: {
    dot: 'bg-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
  },
  blue: {
    dot: 'bg-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400',
  },
  amber: {
    dot: 'bg-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
  },
  cyan: {
    dot: 'bg-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
  },
  indigo: {
    dot: 'bg-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    text: 'text-indigo-400',
  },
  purple: {
    dot: 'bg-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-400',
  },
  teal: {
    dot: 'bg-teal-400',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-400',
  },
};

// ============================================================================
// ACCORDION COLORS (for collapsible sections)
// ============================================================================

export const accordionColors = {
  slate: {
    dot: 'bg-slate-400',
    border: 'border-slate-500/30',
    hover: 'hover:bg-slate-800/50',
  },
  emerald: {
    dot: 'bg-emerald-400',
    border: 'border-emerald-500/30',
    hover: 'hover:bg-emerald-900/20',
  },
  blue: {
    dot: 'bg-blue-400',
    border: 'border-blue-500/30',
    hover: 'hover:bg-blue-900/20',
  },
  amber: {
    dot: 'bg-amber-400',
    border: 'border-amber-500/30',
    hover: 'hover:bg-amber-900/20',
  },
  cyan: {
    dot: 'bg-cyan-400',
    border: 'border-cyan-500/30',
    hover: 'hover:bg-cyan-900/20',
  },
  indigo: {
    dot: 'bg-indigo-400',
    border: 'border-indigo-500/30',
    hover: 'hover:bg-indigo-900/20',
  },
  purple: {
    dot: 'bg-purple-400',
    border: 'border-purple-500/30',
    hover: 'hover:bg-purple-900/20',
  },
  teal: {
    dot: 'bg-teal-400',
    border: 'border-teal-500/30',
    hover: 'hover:bg-teal-900/20',
  },
} as const;

// ============================================================================
// BAIL REGION COLORS
// ============================================================================

export const bailColorClasses: Record<string, { bg: string; border: string; text: string; gradient: string }> = {
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-600' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', gradient: 'from-violet-500 to-violet-600' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500 to-amber-600' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', gradient: 'from-emerald-500 to-emerald-600' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', gradient: 'from-red-500 to-orange-500' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combine multiple class strings, filtering out falsy values
 * Similar to clsx/cn from class-variance-authority
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get section header props (className + style)
 */
export function getSectionHeaderProps() {
  return {
    className: textClasses.sectionHeader,
    style: inlineStyles.sectionHeader,
  };
}

/**
 * Get role label props with optional letter-spacing
 */
export function getRoleLabelProps(withLetterSpacing = true) {
  return {
    className: textClasses.roleLabel,
    style: withLetterSpacing ? inlineStyles.roleLabelSpaced : inlineStyles.roleLabelNormal,
  };
}

/**
 * Get schedule label class with optional amber color
 */
export function getScheduleLabelClass(isAmber = false) {
  return cn(textClasses.scheduleLabel, isAmber ? 'text-amber-400' : 'text-slate-300');
}

/**
 * Get section color classes by name
 */
export function getSectionColorClasses(color: SectionColor) {
  return sectionColors[color];
}

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const animations = {
  duration: {
    fast: 150,
    normal: 200,
    slow: 300,
  },
  easing: {
    default: 'ease-out',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
} as const;

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

export const zIndex = {
  dropdown: 10,
  sticky: 20,
  header: 30,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

// ============================================================================
// BREAKPOINTS (matches Tailwind defaults)
// ============================================================================

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Type exports
export type ThemeColors = typeof theme.colors;
export type CategoryColor = keyof typeof theme.colors.category;



