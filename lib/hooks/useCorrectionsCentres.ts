'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCorrectionsCentresWithRegions } from '@/lib/api/queries';
import type { CorrectionsCentreWithRegion } from '@/types';

export type { CorrectionsCentreWithRegion };

export function useCorrectionsCentres() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['corrections-centres'],
    queryFn: fetchCorrectionsCentresWithRegions,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    centres: data || [],
    isLoading,
    error: error?.message || null,
  };
}
