// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - APPLICATION CONSTANTS
// ============================================================================

// ============================================================================
// APP CONFIG
// ============================================================================

export const APP_CONFIG = {
  name: 'LLM: Legal Legends Manual',
  shortName: 'LLM',
  description: 'Quick reference for BC criminal lawyers',
  version: '2.0.0',
} as const;

// Convenience exports
export const APP_NAME = APP_CONFIG.name;
export const APP_DESCRIPTION = APP_CONFIG.description;

// ============================================================================
// UI CONFIG
// ============================================================================

export const UI_CONFIG = {
  TOAST_DURATION_MS: 2000,
  SEARCH_DEBOUNCE_MS: 300,
  HEADER_COLLAPSE_THRESHOLD: 80,
  HEADER_EXPAND_THRESHOLD: 30,
} as const;

// ============================================================================
// CACHE CONFIG (React Query)
// ============================================================================

export const CACHE_CONFIG = {
  STALE_TIME_MS: 5 * 60 * 1000,  // 5 minutes
  GC_TIME_MS: 30 * 60 * 1000,    // 30 minutes
} as const;

// ============================================================================
// CONTACT ROLE IDS (references to contact_roles table in Supabase)
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
  FIRST_NATIONS_CROWN: 23,
} as const;

// Contact role display names
export const ROLE_DISPLAY_NAMES: Record<number, string> = {
  [CONTACT_ROLES.CROWN]: 'Crown',
  [CONTACT_ROLES.JCM]: 'JCM',
  [CONTACT_ROLES.SHERIFF_QB]: 'Sheriff QB',
  [CONTACT_ROLES.REGISTRY_QB]: 'Registry QB',
  [CONTACT_ROLES.LABC_NAVIGATOR]: 'LABC Navigator',
  [CONTACT_ROLES.FEDERAL_CROWN]: 'Federal Crown',
  [CONTACT_ROLES.SCHEDULING]: 'SC Scheduling',
  [CONTACT_ROLES.COURT_REGISTRY]: 'Court Registry',
  [CONTACT_ROLES.CRIMINAL_REGISTRY]: 'Criminal Registry',
  [CONTACT_ROLES.INTERPRETER]: 'Interpreter Request',
  [CONTACT_ROLES.BAIL_CROWN]: 'Bail Crown',
  [CONTACT_ROLES.BAIL_JCM]: 'Bail JCM',
  [CONTACT_ROLES.TRANSCRIPTS]: 'Transcripts',
  [CONTACT_ROLES.COORDINATOR]: 'Coordinator',
  [CONTACT_ROLES.FIRST_NATIONS_CROWN]: 'First Nations Crown',
};

// Group contacts into categories for UI display
export const COURT_CONTACT_ROLE_IDS = [
  CONTACT_ROLES.CRIMINAL_REGISTRY,
  CONTACT_ROLES.JCM,
  CONTACT_ROLES.BAIL_JCM,
  CONTACT_ROLES.SCHEDULING,
  CONTACT_ROLES.INTERPRETER,
  CONTACT_ROLES.LABC_NAVIGATOR,
];

export const CROWN_CONTACT_ROLE_IDS = [
  CONTACT_ROLES.CROWN,
  CONTACT_ROLES.FEDERAL_CROWN,
  CONTACT_ROLES.FIRST_NATIONS_CROWN,
];

// ============================================================================
// BAIL HELPERS
// ============================================================================

/**
 * Check if a teams link name indicates VB Triage
 */
export function isVBTriageLink(name: string | null | undefined): boolean {
  if (!name) return false;
  const lower = name.toLowerCase();
  return lower.includes('triage') || lower.includes('vb triage');
}

/**
 * Get display tag for bail hub
 */
export function getBailHubTag(bailCourtName: string | null | undefined): string {
  if (!bailCourtName) return 'Virtual Bail';
  return bailCourtName;
}

/**
 * Format courtroom number for display
 * "CR 101" -> "101", "Courtroom 5" -> "5"
 */
export function formatCourtRoom(courtroom: string | null | undefined): string {
  if (!courtroom) return '';
  // Remove common prefixes
  return courtroom
    .replace(/^(CR|Courtroom|Room)\s*/i, '')
    .replace(/^0+/, '') // Remove leading zeros
    .trim();
}

// ============================================================================
// LOCATION ALIASES (for future fuzzy search)
// ============================================================================

export const LOCATION_ALIASES: Record<string, string[]> = {
  'north vancouver': ['north van', 'n van', 'nvan', 'n. van', 'north v', 'nv'],
  'vancouver': ['van', 'vcr', 'yvr', '222 main', 'robson square', 'dcc', 'downtown'],
  'richmond': ['rich', 'rmd'],
  'surrey': ['sur', 'sry', 'srry'],
  'abbotsford': ['abby', 'abb', 'abbot', 'abotsford', 'abbotford'],
  'chilliwack': ['chwk', 'cwk', 'chl', 'chilli', 'chilwack', 'chillwack'],
  'new westminster': ['new west', 'newwest', 'nw', 'n westminster'],
  'port coquitlam': ['poco', 'port coq', 'coquitlam', 'pco'],
  'kelowna': ['kel', 'kelo', 'klowna'],
  'kamloops': ['kam', 'kams', 'kamloop'],
  'penticton': ['pent', 'pentic'],
  'vernon': ['vern'],
  'cranbrook': ['cran'],
  'nelson': ['nel'],
  'victoria': ['vic', 'vict', 'victora'],
  'nanaimo': ['nan', 'nanaino', 'nanimo'],
  'courtenay': ['court', 'ctnay'],
  'campbell river': ['campbell', 'camp river', 'campbel river'],
  'duncan': ['dun'],
  'port alberni': ['alberni', 'port alb'],
  'prince george': ['pg', 'prg', 'prince g', 'pringe george', 'prince goerge'],
  'prince rupert': ['rupert', 'pr'],
  'terrace': ['terr'],
  'dawson creek': ['dawson', 'dc'],
  'fort st john': ['fort st j', 'fsj', 'fort st. john'],
  'fort nelson': ['fort n', 'fn'],
  'quesnel': ['ques'],
  'williams lake': ['williams', 'wl'],
};
