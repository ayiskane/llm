'use client';

// Court details hook (React Query with caching)
export { useCourtDetails } from './useCourtDetails';

// Courts list hook (React Query with caching)
export { useCourts } from './useCourts';
export type { CourtIndexItem } from './useCourts';

// Court sections (contacts/schedules/teams)
export { useCourtSections } from './useCourtSections';
export type { ContactEmailGroup, ContactPhoneItem } from './useCourtSections';

// Other hooks
export { useCopyToClipboard } from './useCopyToClipboard';
export { useScrollHeader } from './useScrollHeader';
export { useTruncationDetection } from './useTruncationDetection';
