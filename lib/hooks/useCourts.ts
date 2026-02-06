'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchCourtsIndex,
  fetchCourtsIndexStamp,
  type CourtIndexItem,
} from '@/lib/api/courts';

// Re-export the type for convenience
export type { CourtIndexItem } from '@/lib/api/courts';

const COURTS_CACHE_KEY = 'courts-index-cache-v1';
const COURTS_STAMP_TTL_MS = 5 * 60 * 1000; // 5 minutes

type CourtsCache = {
  updatedAt: string;
  data: CourtIndexItem[];
  checkedAt: number;
};

function readCourtsCache(): CourtsCache | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COURTS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CourtsCache;
    if (!parsed?.updatedAt || !Array.isArray(parsed?.data)) return null;
    if (typeof parsed.checkedAt !== 'number') return null;
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
      const now = Date.now();
      const isFreshCheck = cached && now - cached.checkedAt < COURTS_STAMP_TTL_MS;

      const latestStamp = isFreshCheck ? cached.updatedAt : await fetchCourtsIndexStamp();

      if (cached && latestStamp && cached.updatedAt === latestStamp) {
        writeCourtsCache({ ...cached, checkedAt: now });
        return cached.data;
      }

      const data = await fetchCourtsIndex();
      const stampToStore = latestStamp ?? new Date().toISOString();
      writeCourtsCache({ updatedAt: stampToStore, data, checkedAt: now });
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
