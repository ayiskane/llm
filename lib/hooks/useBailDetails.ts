'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBailDetails } from '@/lib/api/courts';
import type { BailDetails, CourtWithRegion } from '@/types';

/**
 * Hook to fetch bail details on demand (BailMode only).
 */
export function useBailDetails(
  court: CourtWithRegion | null,
  enabled: boolean
) {
  const query = useQuery<BailDetails | null, Error>({
    queryKey: ['bailDetails', court?.id],
    queryFn: () =>
      court ? fetchBailDetails(court.id, court.region_id ?? null) : Promise.resolve(null),
    enabled: enabled && !!court,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
