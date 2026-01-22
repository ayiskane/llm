'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourtDetails } from '@/lib/api/queries';
import { CACHE_CONFIG } from '@/lib/config/constants';
import type { CourtDetails } from '@/types';

export function useCourtDetails(courtId: number | null) {
  return useQuery<CourtDetails | null>({
    queryKey: ['courtDetails', courtId],
    queryFn: () => courtId ? fetchCourtDetails(courtId) : Promise.resolve(null),
    enabled: !!courtId,
    staleTime: CACHE_CONFIG.STALE_TIME_MS,
    gcTime: CACHE_CONFIG.GC_TIME_MS,
  });
}
