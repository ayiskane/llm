'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBailSchedules } from '@/lib/api/courts';
import type { BailSchedules } from '@/types';

export function useBailSchedules(bailHubId: number | null, enabled: boolean) {
  const query = useQuery<BailSchedules, Error>({
    queryKey: ['bailSchedules', bailHubId],
    queryFn: () =>
      bailHubId
        ? fetchBailSchedules(bailHubId)
        : Promise.resolve({
            crownSchedules: [],
            judgeSchedules: [],
            dutyCounselSchedules: [],
          }),
    enabled: !!bailHubId && enabled,
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
