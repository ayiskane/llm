import { notFound } from 'next/navigation';
import { fetchCorrectionalCentreByIdServer, getAllCorrectionalCentreIds } from '@/lib/api/server';
import { CorrectionDetailPageClient } from './CorrectionDetailPageClient';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Generate static params for all correctional centres at build time
export async function generateStaticParams() {
  const ids = await getAllCorrectionalCentreIds();
  return ids.map((id) => ({ id: String(id) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CorrectionDetailRoute({ params }: PageProps) {
  const { id } = await params;
  const centreId = Number(id);

  if (isNaN(centreId)) {
    notFound();
  }

  const centre = await fetchCorrectionalCentreByIdServer(centreId);

  if (!centre) {
    notFound();
  }

  return <CorrectionDetailPageClient centre={centre} />;
}
