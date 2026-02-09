"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCorrectionals } from "@/lib/api/corrections";
import type { CorrectionalCentre } from "@/types";

export function useCorrectionals() {
  const query = useQuery<CorrectionalCentre[], Error>({
    queryKey: ["correctionals"],
    queryFn: fetchCorrectionals,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  return {
    centres: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
