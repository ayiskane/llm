"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "@/lib/icons";
import { StickyHeader } from "@/app/components/layouts";
import {
  BailModeContent,
  BailModeNav,
  type BailAccordionSection,
} from "@/app/components/courts/BailModeContent";
import { useBailHubDetails } from "@/lib/hooks";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const VR9_BAIL_HUB_ID = 3;

export default function VR9BailHubPage() {
  const router = useRouter();
  const { data, isLoading, error } = useBailHubDetails(VR9_BAIL_HUB_ID);
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const [expandedSection, setExpandedSection] =
    useState<BailAccordionSection>("contacts");

  const bailHub = data?.bailHub ?? null;
  const bailTeams = data?.bailTeams ?? [];
  const bailContacts = data?.bailContacts ?? [];
  const cells = data?.cells ?? [];
  const courtroomSchedules = data?.courtroomSchedules ?? [];

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="-ml-1 text-muted-foreground hover:text-foreground shrink-0"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="text-sm font-semibold text-foreground">
              VR9 Bail Hub
            </div>
            <div className="text-[11px] text-muted-foreground">
              Virtual bail hub
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-2 px-3 py-2">
            <Skeleton className="h-8 flex-1 rounded-full" />
            <Skeleton className="h-8 flex-1 rounded-full" />
          </div>
        ) : bailHub ? (
          <BailModeNav
            bailTeams={bailTeams}
            expandedSection={expandedSection}
            onNavigateToSection={setExpandedSection}
          />
        ) : null}
      </StickyHeader>

      <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
        {isLoading ? (
          <div className="p-3 space-y-3">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-16 w-full rounded-lg" />
          </div>
        ) : error ? (
          <div className="p-3 text-sm text-destructive">{error}</div>
        ) : bailHub ? (
          <BailModeContent
            courtId={bailHub.court_id ?? 0}
            bailHub={bailHub}
            bailContacts={bailContacts}
            bailTeams={bailTeams}
            courtroomSchedules={courtroomSchedules}
            cells={cells}
            expandedSection={expandedSection}
            onCopy={copyToClipboard}
            isCopied={isCopied}
          />
        ) : null}
      </div>
    </div>
  );
}
