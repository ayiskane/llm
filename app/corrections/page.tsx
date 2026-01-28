import { fetchCorrectionalCentresServer } from '@/lib/api/server';
import { CorrectionsIndexPage } from '@/app/components/corrections';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function CorrectionsPage() {
  const centres = await fetchCorrectionalCentresServer();

  return <CorrectionsIndexPage initialCentres={centres} />;
}
