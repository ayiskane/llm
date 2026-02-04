'use client';

import { useParams, useRouter } from 'next/navigation';
import { CourtDetailPage } from '@/app/components/court';
import { useCourtDetails } from '@/lib/hooks';

export default function CourtPage() {
  const params = useParams();
  const router = useRouter();
  const courtId = params.id ? Number(params.id) : null;
  
  const { data: courtDetails, isLoading, error } = useCourtDetails(courtId);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading court details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !courtDetails) {
    return (
      <div className="min-h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load court</p>
          <p className="text-slate-500 text-sm mb-4">{error || 'Court not found'}</p>
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
    <CourtDetailPage 
      courtDetails={courtDetails}
      onBack={() => router.back()}
      onNavigateToCourt={(courtId) => router.push(`/court/${courtId}`)}
      onNavigateToBailHub={(bailCourtId, fromName) => router.push(`/bail/${bailCourtId}?from=${encodeURIComponent(fromName)}`)}
    />
  );
}
