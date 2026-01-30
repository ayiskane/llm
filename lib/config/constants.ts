// App metadata
export const APP_NAME = 'LLM: Legal Legends Manual';
export const APP_DESCRIPTION = 'BC Court contacts and information directory';

// Region configuration
export const REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 2, name: 'Vancouver Coastal', code: 'R2' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
] as const;

export const REGION_COLORS: Record<number, { dot: string; tag: string }> = {
  1: { dot: 'bg-amber-500', tag: 'bg-amber-500/15 text-amber-500 dark:text-amber-400' },
  2: { dot: 'bg-blue-500', tag: 'bg-blue-500/15 text-blue-500 dark:text-blue-400' },
  3: { dot: 'bg-emerald-500', tag: 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400' },
  4: { dot: 'bg-purple-500', tag: 'bg-purple-500/15 text-purple-500 dark:text-purple-400' },
  5: { dot: 'bg-rose-500', tag: 'bg-rose-500/15 text-rose-500 dark:text-rose-400' },
};

export const REGION_CODES: Record<number, string> = {
  1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5', 6: 'FED',
};

export const REGION_NAMES: Record<number, string> = {
  1: 'Island',
  2: 'Vancouver Coastal',
  3: 'Fraser',
  4: 'Interior',
  5: 'Northern',
  6: 'Federal',
};
