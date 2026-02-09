"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCorrectional } from "@/lib/api/corrections";
import type { CorrectionalCentre } from "@/types";

export function useCorrectional(id: number | null) {
  const query = useQuery<CorrectionalCentre | null, Error>({
    queryKey: ["correctional", id],
    queryFn: () => (id ? fetchCorrectional(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
  };
}
