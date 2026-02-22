"use client";

import { useRouter } from "next/navigation";
import { CorrectionDetailPage } from "@/app/components/corrections";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CorrectionalCentre } from "@/types";

interface CorrectionPageClientProps {
  centre: CorrectionalCentre | null;
}

export default function CorrectionPageClient({
  centre,
}: CorrectionPageClientProps) {
  const router = useRouter();

  if (!centre) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Failed to load correctional centre</CardTitle>
            <CardDescription>Centre not found</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="ghost" onClick={() => router.back()}>
              Go back
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <CorrectionDetailPage centre={centre} onBack={() => router.back()} />;
}
