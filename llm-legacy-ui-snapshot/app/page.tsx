import { Suspense } from 'react';
import { CourtsIndexPage } from '@/app/components/courts';

function LoadingFallback() {
  return (
    <div className="h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center">
      <div className="text-slate-400">Loading courts...</div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CourtsIndexPage />
    </Suspense>
  );
}
