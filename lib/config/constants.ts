// App metadata
export const APP_NAME = 'LLM: Legal Legends Manual';
export const APP_DESCRIPTION = 'BC Court contacts and information directory';

// Region configuration - single source of truth
export const REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 2, name: 'Coastal', code: 'R2' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
  { id: 6, name: 'Federal', code: 'FED' },
] as const;

// Derived lookups for quick access by ID
export const REGION_CODES = Object.fromEntries(
  REGIONS.filter((r) => r.id > 0).map((r) => [r.id, r.code])
) as Record<number, string>;

export const REGION_NAMES = Object.fromEntries(
  REGIONS.filter((r) => r.id > 0).map((r) => [r.id, r.name])
) as Record<number, string>;
