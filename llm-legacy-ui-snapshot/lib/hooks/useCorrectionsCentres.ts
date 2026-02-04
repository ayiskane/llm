'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchCorrectionalCentres, fetchCorrectionalCentreById } from '@/lib/api/queries';
import type { CorrectionalCentre } from '@/types';

export type { CorrectionalCentre };

export function useCorrectionalCentres() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['correctional-centres'],
    queryFn: fetchCorrectionalCentres,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    centres: data || [],
    isLoading,
    error: error?.message || null,
  };
}

export function useCorrectionalCentre(id: number) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['correctional-centre', id],
    queryFn: () => fetchCorrectionalCentreById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

  return {
    centre: data || null,
    isLoading,
    error: error?.message || null,
  };
}

// Legacy alias
export const useCorrectionsCentres = useCorrectionalCentres;
