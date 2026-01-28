import { notFound } from 'next/navigation';
import { fetchBailHubDetailsServer, getAllBailCourtIds } from '@/lib/api/server';
import { BailHubDetailPageClient } from './BailHubDetailPageClient';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

// Generate static params for all bail courts at build time
export async function generateStaticParams() {
  const ids = await getAllBailCourtIds();
  return ids.map((id) => ({ id: String(id) }));
}

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function BailHubPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { from: referrerName } = await searchParams;
  const bailCourtId = Number(id);

  if (isNaN(bailCourtId)) {
    notFound();
  }

  const details = await fetchBailHubDetailsServer(bailCourtId);

  if (!details) {
    notFound();
  }

  return <BailHubDetailPageClient details={details} referrerName={referrerName} />;
}
