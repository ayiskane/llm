'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCourtsIndex,
  fetchCourtsIndexStamp,
  type CourtIndexItem,
} from '@/lib/api/courtsIndex';

// Re-export the type for convenience
export type { CourtIndexItem } from '@/lib/api/courtsIndex';

const COURTS_CACHE_KEY = 'courts-index-cache-v1';

type CourtsCache = {
  updatedAt: string;
  data: CourtIndexItem[];
};

function readCourtsCache(): CourtsCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COURTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CourtsCache;
    if (!parsed?.updatedAt || !Array.isArray(parsed?.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCourtsCache(cache: CourtsCache) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COURTS_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage write failures (private mode, quota, etc.)
  }
}

export function useCourts() {
  const query = useQuery<CourtIndexItem[], Error>({
    queryKey: ['courts-index'],
    queryFn: async () => {
      const cached = readCourtsCache();
      const latestStamp = await fetchCourtsIndexStamp();

      if (cached && latestStamp && cached.updatedAt === latestStamp) {
        return cached.data;
      }

      const data = await fetchCourtsIndex();
      const stampToStore = latestStamp ?? new Date().toISOString();
      writeCourtsCache({ updatedAt: stampToStore, data });
      return data;
    },
    staleTime: 0,
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
  });

  return {
    courts: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
