'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourtsWithRegions, type CourtWithRegionName } from '@/lib/api/queries';

// Re-export the type for convenience
export type { CourtWithRegionName } from '@/lib/api/queries';

export function useCourts() {
  const query = useQuery<CourtWithRegionName[], Error>({
    queryKey: ['courts-with-regions'],
    queryFn: fetchCourtsWithRegions,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });

  return {
    courts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
