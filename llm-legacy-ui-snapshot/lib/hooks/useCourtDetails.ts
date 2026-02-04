'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourtDetails } from '@/lib/api/queries';
import type { CourtDetails } from '@/types';

/**
 * Hook to fetch court details with React Query caching
 * Uses default React Query caching (5 min gcTime, 0 staleTime)
 */
export function useCourtDetails(courtId: number | null) {
  const query = useQuery<CourtDetails | null, Error>({
    queryKey: ['courtDetails', courtId],
    queryFn: () => courtId ? fetchCourtDetails(courtId) : Promise.resolve(null),
    enabled: !!courtId,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
