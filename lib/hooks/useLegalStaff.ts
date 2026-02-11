"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchLegalStaff } from "@/lib/api/legalStaff";

export function useLegalStaff() {
  const query = useQuery({
    queryKey: ["legalStaff"],
    queryFn: fetchLegalStaff,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data?.staff ?? [],
    canManage: query.data?.canManage ?? false,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
