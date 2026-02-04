'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { BailHubDetailPage } from '@/app/components/bail';
import { useBailHubDetails } from '@/lib/hooks';

export default function BailHubPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bailCourtId = params.id ? Number(params.id) : null;
  const referrerName = searchParams.get('from');
  
  const { data: details, isLoading, error } = useBailHubDetails(bailCourtId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading bail hub...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="min-h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load bail hub</p>
          <p className="text-slate-500 text-sm mb-4">{error || 'Bail hub not found'}</p>
          <button
            onClick={() => router.back()}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <BailHubDetailPage 
      details={details}
      onBack={() => router.back()}
      onNavigateToCourt={(courtId) => router.push(`/court/${courtId}`)}
      referrerName={referrerName}
    />
  );
}
