import { Suspense } from "react";
import { CorrectionsIndexPage } from "@/app/components/corrections";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingFallback() {
  return (
    <div className="h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Loading corrections</CardTitle>
          <CardDescription>Preparing the corrections index...</CardDescription>
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

export default function CorrectionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CorrectionsIndexPage />
    </Suspense>
  );
}
