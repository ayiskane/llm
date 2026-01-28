'use client';

import { useRouter } from 'next/navigation';
import { CorrectionDetailPage } from '@/app/components/corrections/CorrectionDetailPage';
import type { CorrectionalCentre } from '@/types';

interface CorrectionDetailPageClientProps {
  centre: CorrectionalCentre;
}

export function CorrectionDetailPageClient({ centre }: CorrectionDetailPageClientProps) {
  const router = useRouter();

  return (
    <CorrectionDetailPage
      centre={centre}
      onBack={() => router.back()}
    />
  );
}
