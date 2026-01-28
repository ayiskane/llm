import { fetchBailCourtsServer } from '@/lib/api/server';
import { BailHubsIndexPage } from '@/app/components/bail';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function BailPage() {
  const bailCourts = await fetchBailCourtsServer();

  return <BailHubsIndexPage initialBailCourts={bailCourts} />;
}
