'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBailHubDetails } from '@/lib/api/courts';
import type { BailHub, BailContact, CourtroomSchedule, SheriffCell, TeamsLink } from '@/types';

type BailHubDetails = {
  bailHub: BailHub | null;
  bailTeams: TeamsLink[];
  bailContacts: BailContact[];
  cells: SheriffCell[];
  courtroomSchedules: CourtroomSchedule[];
};

export function useBailHubDetails(bailHubId: number) {
  const query = useQuery<BailHubDetails, Error>({
    queryKey: ['bailHubDetails', bailHubId],
    queryFn: () => fetchBailHubDetails(bailHubId),
    enabled: Number.isFinite(bailHubId),
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
