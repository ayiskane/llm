import { notFound } from 'next/navigation';
import { fetchCourtDetailsServer, getAllCourtIds } from '@/lib/api/server';
import { CourtDetailPageClient } from './CourtDetailPageClient';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Generate static params for all courts at build time
export async function generateStaticParams() {
  const ids = await getAllCourtIds();
  return ids.map((id) => ({ id: String(id) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CourtPage({ params }: PageProps) {
  const { id } = await params;
  const courtId = Number(id);

  if (isNaN(courtId)) {
    notFound();
  }

  const courtDetails = await fetchCourtDetailsServer(courtId);

  if (!courtDetails) {
    notFound();
  }

  return <CourtDetailPageClient courtDetails={courtDetails} />;
}
