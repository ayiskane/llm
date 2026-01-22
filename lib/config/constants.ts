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

// Alias for backwards compatibility
export const UI = UI_CONFIG;

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
