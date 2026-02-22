'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProvincialSchedules } from '@/lib/api/courts';
import type { ProvincialSchedules } from '@/types';

export function useProvincialSchedules(
  courtId: number | null,
  enabled: boolean
) {
  const query = useQuery<ProvincialSchedules, Error>({
    queryKey: ['provincialSchedules', courtId, 'oc-duty-counsel'],
    queryFn: () =>
      courtId
        ? fetchProvincialSchedules(courtId)
        : Promise.resolve({
            crownSchedules: [],
            judgeSchedules: [],
            dutyCounselSchedules: [],
          }),
    enabled: !!courtId && enabled,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? {
      crownSchedules: [],
      judgeSchedules: [],
      dutyCounselSchedules: [],
    },
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
