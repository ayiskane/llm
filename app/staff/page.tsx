"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLegalStaff } from "@/lib/hooks";
import { revokeLegalStaff } from "@/lib/api/legalStaff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  expired: "bg-red-500/15 text-red-300 border border-red-500/30",
};

export default function StaffManagementPage() {
  const { data, canManage, isLoading, error } = useLegalStaff();
  const queryClient = useQueryClient();
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleRevoke = async (staffId: string) => {
    if (revokingId) return;
    setRevokingId(staffId);
    try {
      const payload = await revokeLegalStaff(staffId);
      queryClient.setQueryData(["legalStaff"], payload);
      toast.success("Access revoked.");
    } catch {
      toast.error("Could not revoke access.");
    } finally {
      setRevokingId(null);
    }
  };

  if (!canManage && !isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        This page is only available to verified lawyers.
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-foreground">
          Legal Staff
        </h1>
        <p className="text-xs text-muted-foreground">
          Verify or revoke staff access from your firm.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : data.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          No staff linked to your account yet.
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">Name</TableHead>
                <TableHead className="w-[120px]">Firm</TableHead>
                <TableHead className="w-[120px]">Phone</TableHead>
                <TableHead className="w-[110px]">Status</TableHead>
                <TableHead className="w-[120px] text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((staff) => (
                <TableRow key={staff.id} className="text-xs">
                  <TableCell className="truncate">
                    {staff.full_name ?? "—"}
                  </TableCell>
                  <TableCell className="truncate">
                    {staff.firm_name ?? "—"}
                  </TableCell>
                  <TableCell className="truncate">
                    {staff.phone_number ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="region"
                      className={cn(
                        "text-[9px] uppercase tracking-wider",
                        STATUS_STYLES[staff.status] || "border-border/50",
                      )}
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(staff.id)}
                      disabled={revokingId === staff.id}
                      className="text-[10px] uppercase tracking-widest"
                    >
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
