"use client";

import { useRouter } from "next/navigation";
import { CourtDetailPage } from "@/app/components/courts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CourtDetails } from "@/types";

interface CourtPageClientProps {
  courtDetails: CourtDetails | null;
}

export default function CourtPageClient({
  courtDetails,
}: CourtPageClientProps) {
  const router = useRouter();

  if (!courtDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Failed to load court</CardTitle>
            <CardDescription>Court not found</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" onClick={() => router.back()}>
              Go back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <CourtDetailPage
      courtDetails={courtDetails}
      onBack={() => router.back()}
      onNavigateToCourt={(courtId) => router.push(`/court/${courtId}`)}
    />
  );
}
