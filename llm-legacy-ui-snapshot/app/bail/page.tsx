import { Suspense } from 'react';
import { BailHubsIndexPage } from '@/app/components/bail';

function LoadingFallback() {
  return (
    <div className="h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center">
      <div className="text-slate-400">Loading bail hubs...</div>
    </div>
  );
}

export default function BailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <BailHubsIndexPage />
    </Suspense>
  );
}
