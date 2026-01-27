'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBailHubDetails } from '@/lib/api/queries';
import type { BailHubDetails } from '@/types';

export function useBailHubDetails(bailCourtId: number | null) {
  const query = useQuery<BailHubDetails | null, Error>({
    queryKey: ['bailHubDetails', bailCourtId],
    queryFn: () => bailCourtId ? fetchBailHubDetails(bailCourtId) : Promise.resolve(null),
    enabled: !!bailCourtId,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
