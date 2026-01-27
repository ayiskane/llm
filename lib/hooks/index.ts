'use client';

// Search hook
export { useSearch } from './useSearch';
export type { SearchResults } from './useSearch';

// Court details hook (React Query with caching)
export { useCourtDetails } from './useCourtDetails';

// Courts list hook (React Query with caching)
export { useCourts } from './useCourts';
export type { CourtWithRegionName } from './useCourts';

// Bail courts hook (React Query with caching)
export { useBailCourts } from './useBailCourts';
export type { BailCourtWithRegion } from './useBailCourts';

// Bail hub details hook (React Query with caching)
export { useBailHubDetails } from './useBailHubDetails';

// Other hooks
export { useCopyToClipboard } from './useCopyToClipboard';
export { useScrollHeader } from './useScrollHeader';
export { useTruncationDetection } from './useTruncationDetection';
