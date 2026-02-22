import CorrectionPageClient from "./CorrectionPageClient";
import { fetchCorrectionalServer } from "@/lib/server/corrections";

interface CorrectionPageProps {
  params: { id: string };
}

export default async function CorrectionPage({ params }: CorrectionPageProps) {
  const centreId = Number(params.id);
  if (!Number.isFinite(centreId)) {
    return <CorrectionPageClient centre={null} />;
  }

  const centre = await fetchCorrectionalServer(centreId);
  return <CorrectionPageClient centre={centre} />;
}
