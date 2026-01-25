'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useCorrectionalCentre } from '@/lib/hooks/useCorrectionsCentres';
import { CorrectionDetailPage } from '@/app/components/corrections/CorrectionDetailPage';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CorrectionDetailRoute({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { centre, isLoading, error } = useCorrectionalCentre(parseInt(id, 10));

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading centre...</p>
        </div>
      </div>
    );
  }

  if (error || !centre) {
    return (
      <div className="h-[calc(100vh-4rem)] bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">Centre not found</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-blue-400 text-sm hover:text-blue-300"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <CorrectionDetailPage 
      centre={centre} 
      onBack={() => router.back()} 
    />
  );
}
