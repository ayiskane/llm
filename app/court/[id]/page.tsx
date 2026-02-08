'use client';

import { useParams, useRouter } from 'next/navigation';
import { CourtDetailPage } from '@/app/components/court';
import { useCourtDetails } from '@/lib/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CourtPage() {
  const params = useParams();
  const router = useRouter();
  const courtId = params.id ? Number(params.id) : null;
  
  const { data: courtDetails, isLoading, error } = useCourtDetails(courtId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Loading court details</CardTitle>
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

  // Error state
  if (error || !courtDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Failed to load court</CardTitle>
            <CardDescription>{error || 'Court not found'}</CardDescription>
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
      // onNavigateToBailHub={(bailCourtId, fromName) => router.push(`/bail/${bailCourtId}?from=${encodeURIComponent(fromName)}`)}
    />
  );
}
