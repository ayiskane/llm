"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchBugReports } from "@/lib/api/bugReports";
import type { BugReport } from "@/types";

export function useBugReports() {
  const query = useQuery<BugReport[], Error>({
    queryKey: ["bugReports"],
    queryFn: fetchBugReports,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return {
    data: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
