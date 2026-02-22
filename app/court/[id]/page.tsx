import CourtPageClient from "./CourtPageClient";
import { fetchCourtDetailsServer } from "@/lib/server/courts";

interface CourtPageProps {
  params: { id: string };
}

export default async function CourtPage({ params }: CourtPageProps) {
  const courtId = Number(params.id);
  if (!Number.isFinite(courtId)) {
    return <CourtPageClient courtDetails={null} />;
  }

  const courtDetails = await fetchCourtDetailsServer(courtId);
  return <CourtPageClient courtDetails={courtDetails} />;
}
