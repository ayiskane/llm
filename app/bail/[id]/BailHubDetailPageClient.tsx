'use client';

import { useRouter } from 'next/navigation';
import { BailHubDetailPage } from '@/app/components/bail';
import type { BailHubDetails } from '@/types';

interface BailHubDetailPageClientProps {
  details: BailHubDetails;
  referrerName?: string | null;
}

export function BailHubDetailPageClient({ details, referrerName }: BailHubDetailPageClientProps) {
  const router = useRouter();

  return (
    <BailHubDetailPage
      details={details}
      onBack={() => router.back()}
      onNavigateToCourt={(courtId) => router.push(`/court/${courtId}`)}
      referrerName={referrerName}
    />
  );
}
