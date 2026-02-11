"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "@/lib/api/supabase";
import { fetchAdminStatus, type AdminStatus } from "@/lib/api/admin";

export function useAdminStatus() {
  const query = useQuery({
    queryKey: ["adminStatus"],
    queryFn: fetchAdminStatus,
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  const [status, setStatus] = useState<AdminStatus>("offline");

  useEffect(() => {
    if (query.data?.status) {
      setStatus(query.data.status);
    }
  }, [query.data?.status]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("admin-status")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin" },
        (payload: RealtimePostgresChangesPayload<{ status: string }>) => {
          const nextStatus = (payload.new as { status?: string } | null)?.status;
          if (nextStatus === "online" || nextStatus === "offline") {
            setStatus(nextStatus);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    status,
    canManage: query.data?.canManage ?? false,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
}
