'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProvincialSchedules } from '@/lib/api/courts';
import type { ProvincialSchedules } from '@/types';

export function useProvincialSchedules(
  courtId: number | null,
  enabled: boolean
) {
  const query = useQuery<ProvincialSchedules, Error>({
    queryKey: ['provincialSchedules', courtId],
    queryFn: () =>
      courtId
        ? fetchProvincialSchedules(courtId)
        : Promise.resolve({ crownSchedules: [], judgeSchedules: [] }),
    enabled: !!courtId && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? { crownSchedules: [], judgeSchedules: [] },
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
