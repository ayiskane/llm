'use client';

import { useState } from 'react';
import { PageLayout } from '@/app/components/layouts';
import { CourtDetailPage } from '@/app/components/court';
import { useCourtDetails } from '@/lib/hooks';

// Default court ID - Update this to your preferred default court
// This should be a court that has good data for testing (e.g., Victoria, Robson Square)
const DEFAULT_COURT_ID = 1;

export default function Home() {
  const [courtId] = useState<number>(DEFAULT_COURT_ID);
  
  const { data: courtDetails, isLoading, error } = useCourtDetails(courtId);

  // Loading state
  if (isLoading) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400">Loading court details...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // Error state
  if (error || !courtDetails) {
    return (
      <PageLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-400 mb-4">
              {error?.message || 'Failed to load court details'}
            </p>
            <p className="text-slate-500 text-sm">
              Court ID: {courtId}
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <CourtDetailPage courtDetails={courtDetails} />
    </PageLayout>
  );
}
