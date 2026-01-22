// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - CONSTANTS
// ============================================================================

// App metadata
export const APP_NAME = 'LLM: Legal Legends Manual';
export const APP_DESCRIPTION = 'BC Court contacts and information directory';

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
// CONTACT ROLES
// ============================================================================

export const CONTACT_ROLES = {
  COURT_REGISTRY: 1,
  CRIMINAL_REGISTRY: 2,
  JCM: 3,
  BAIL_JCM: 4,
  SCHEDULING: 5,
  INTERPRETER: 6,
  CROWN: 7,
  BAIL_CROWN: 8,
  FEDERAL_CROWN: 9,
  FIRST_NATIONS_CROWN: 10,
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
