// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - CONSTANTS
// ============================================================================

// App metadata
export const APP_NAME = 'LLM: Legal Legends Manual';
export const APP_DESCRIPTION = 'BC Court contacts and information directory';

// ============================================================================
// REGION CONFIGURATION
// ============================================================================

export const REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 2, name: 'Vancouver Coastal', code: 'R2' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
] as const;

export const REGION_COLORS: Record<number, { dot: string; tag: string }> = {
  1: { dot: 'bg-amber-500', tag: 'bg-amber-500/15 text-amber-400' },
  2: { dot: 'bg-blue-500', tag: 'bg-blue-500/15 text-blue-400' },
  3: { dot: 'bg-emerald-500', tag: 'bg-emerald-500/15 text-emerald-400' },
  4: { dot: 'bg-purple-500', tag: 'bg-purple-500/15 text-purple-400' },
  5: { dot: 'bg-rose-500', tag: 'bg-rose-500/15 text-rose-400' },
};

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
// CONTACT ROLES - Must match database contact_roles table IDs
// ============================================================================

export const CONTACT_ROLES = {
  CROWN: 1,
  JCM: 2,
  SHERIFF_QB: 3,
  REGISTRY_QB: 4,
  LABC_NAVIGATOR: 5,
  FEDERAL_CROWN: 6,
  SCHEDULING: 8,
  COURT_REGISTRY: 9,
  CRIMINAL_REGISTRY: 10,
  INTERPRETER: 11,
  BAIL_CROWN: 12,
  BAIL_JCM: 13,
  TRANSCRIPTS: 14,
  COORDINATOR: 21,
  SHERIFF_VB_COORDINATOR: 22,
  FIRST_NATIONS_CROWN: 23,
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

/**
 * Get bail hub tag text for section header
 * "Abbotsford Virtual Bail" -> "ABBOTSFORD HUB"
 */
export function getBailHubTag(bailCourtName: string | null | undefined): string {
  if (!bailCourtName) return '';
  return bailCourtName
    .toUpperCase()
    .replace(' VIRTUAL BAIL', '')
    .replace('FRASER', 'ABBY')
    .trim() + ' HUB';
}

/**
 * Format courtroom name - add CR prefix for courtroom numbers
 * "101" -> "CR 101", "Courtroom 5" -> "CR 5"
 */
export function formatCourtroomName(name: string | null | undefined): string {
  if (!name) return 'MS Teams';
  
  // Don't modify JCM, FXD, or triage names
  if (name.toLowerCase().includes('jcm') || 
      name.toLowerCase().includes('fxd') || 
      name.toLowerCase().includes('triage')) {
    return name;
  }
  
  // Already has CR prefix
  if (name.toLowerCase().startsWith('cr ') || name.toLowerCase().startsWith('cr-')) {
    return name;
  }
  
  // Starts with a number - add CR prefix
  if (/^\d/.test(name)) {
    return `CR ${name}`;
  }
  
  // "Courtroom 101" -> "CR 101"
  const courtroomMatch = name.match(/^courtroom\s*(\d+)/i);
  if (courtroomMatch) {
    return `CR ${courtroomMatch[1]}`;
  }
  
  return name;
}

