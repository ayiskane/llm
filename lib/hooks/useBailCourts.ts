'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchBailCourtsWithRegion, type BailCourtWithRegion } from '@/lib/api/queries';

export type { BailCourtWithRegion };

export function useBailCourts() {
  const query = useQuery<BailCourtWithRegion[], Error>({
    queryKey: ['bailCourts'],
    queryFn: fetchBailCourtsWithRegion,
  });

  return {
    bailCourts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
