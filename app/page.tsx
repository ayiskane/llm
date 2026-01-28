import { fetchCourtsServer } from '@/lib/api/server';
import { CourtsIndexPage } from '@/app/components/courts';

// ISR: Revalidate every 5 minutes
export const revalidate = 300;

export default async function Home() {
  const courts = await fetchCourtsServer();

  return <CourtsIndexPage initialCourts={courts} />;
}
