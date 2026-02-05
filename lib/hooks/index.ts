'use client';

// Search hook
export { useSearch } from './useSearch';
export type { SearchResults } from './useSearch';

// Court details hook (React Query with caching)
export { useCourtDetails } from './useCourtDetails';

// Courts list hook (React Query with caching)
export { useCourts } from './useCourts';
export type { CourtIndexItem } from './useCourts';

// Other hooks
export { useCopyToClipboard } from './useCopyToClipboard';
export { useScrollHeader } from './useScrollHeader';
export { useTruncationDetection } from './useTruncationDetection';
