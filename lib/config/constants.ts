// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - CONSTANTS
// ============================================================================

// App metadata
export const APP_NAME = 'LLM: Legal Legends Manual';

// ============================================================================
// REGION CONFIGURATION
// ============================================================================

export const REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 2, name: 'Coastal', code: 'R2' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
] as const;

// ============================================================================
// UI CONFIGURATION
// ============================================================================

export const UI_CONFIG = {
  TOAST_DURATION_MS: 2000,
  COPY_FEEDBACK_MS: 2000,
  HEADER_COLLAPSE_THRESHOLD: 80,
  HEADER_EXPAND_THRESHOLD: 30,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a link is a VB Triage link
 */
export function isVBTriageLink(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return lower.includes('vb triage') || lower.includes('vbtriage') || lower.includes('triage');
}

