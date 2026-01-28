'use client';

import { useRouter } from 'next/navigation';
import { CourtDetailPage } from '@/app/components/court';
import type { CourtDetails } from '@/types';

interface CourtDetailPageClientProps {
  courtDetails: CourtDetails;
}

export function CourtDetailPageClient({ courtDetails }: CourtDetailPageClientProps) {
  const router = useRouter();

  return (
    <CourtDetailPage
      courtDetails={courtDetails}
      onBack={() => router.back()}
      onNavigateToCourt={(courtId) => router.push(`/court/${courtId}`)}
      onNavigateToBailHub={(bailCourtId, fromName) =>
        router.push(`/bail/${bailCourtId}?from=${encodeURIComponent(fromName)}`)
      }
    />
  );
}
