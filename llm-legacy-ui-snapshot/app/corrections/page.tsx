import { Suspense } from 'react';
import { CorrectionsIndexPage } from '@/app/components/corrections';

function LoadingFallback() {
  return (
    <div className="h-screen bg-[hsl(222.2,84%,4.9%)] flex items-center justify-center">
      <div className="text-slate-400">Loading corrections centres...</div>
    </div>
  );
}

export default function CorrectionsPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CorrectionsIndexPage />
    </Suspense>
  );
}
