'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCourtScheduleDates } from '@/lib/api/courts';
import type { CourtScheduleDate } from '@/types';

export function useCourtScheduleDates(
  courtId: number | null,
  enabled: boolean
) {
  const query = useQuery<CourtScheduleDate[], Error>({
    queryKey: ['courtScheduleDates', courtId],
    queryFn: () =>
      courtId ? fetchCourtScheduleDates(courtId) : Promise.resolve([]),
    enabled: !!courtId && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
