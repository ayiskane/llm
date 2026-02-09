"use client";

import { useParams, useRouter } from "next/navigation";
import { CorrectionDetailPage } from "@/app/components/corrections";
import { useCorrectional } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function CorrectionPage() {
  const params = useParams();
  const router = useRouter();
  const centreId = params.id ? Number(params.id) : null;

  const { data: centre, isLoading, error } = useCorrectional(centreId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Loading correctional centre</CardTitle>
            <CardDescription>Fetching the latest information...</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !centre) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Failed to load correctional centre</CardTitle>
            <CardDescription>{error || "Centre not found"}</CardDescription>
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
    <CorrectionDetailPage centre={centre} onBack={() => router.back()} />
  );
}
