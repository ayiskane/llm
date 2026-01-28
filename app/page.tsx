import { Suspense } from 'react';
import { fetchCourtsServer } from '@/lib/api/server';
import { CourtsIndexPage } from '@/app/components/courts';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

function LoadingFallback() {
  return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-slate-400">Loading courts...</div>
    </div>
  );
}

export default async function Home() {
  const courts = await fetchCourtsServer();

  return (
    <Suspense fallback={<LoadingFallback />}>
      <CourtsIndexPage initialCourts={courts} />
    </Suspense>
  );
}
