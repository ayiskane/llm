"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlphabetNav } from "./AlphabetNav";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type CountLabel = (count: number) => string;

interface AlphabetIndexPageProps<T> {
  title: string;
  items: T[];
  getItemKey: (item: T) => string | number;
  getItemLabel: (item: T) => string;
  renderItem: (item: T) => React.ReactNode;
  headerAction?: React.ReactNode;
  emptyContent?: React.ReactNode;
  countLabel?: CountLabel;
  error?: string | null;
  errorTitle?: string;
  isLoading?: boolean;
}

interface GroupedItems<T> {
  letter: string;
  items: T[];
}

function groupByLetter<T>(
  items: T[],
  getLabel: (item: T) => string,
): GroupedItems<T>[] {
  const grouped = items.reduce(
    (acc, item) => {
      const label = getLabel(item);
      const firstChar = label.charAt(0).toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : "#";
      (acc[letter] ??= []).push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === "#" ? 1 : b === "#" ? -1 : a.localeCompare(b)))
    .map(([letter, items]) => ({ letter, items }));
}

function defaultCountLabel(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

export function AlphabetIndexPage<T>({
  title,
  items,
  getItemKey,
  getItemLabel,
  renderItem,
  headerAction,
  emptyContent,
  countLabel = defaultCountLabel,
  error,
  errorTitle = "Failed to load",
  isLoading = false,
}: AlphabetIndexPageProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const groupedItems = useMemo(
    () => groupByLetter(items, getItemLabel),
    [items, getItemLabel],
  );
  const availableLetters = useMemo(
    () => groupedItems.map((g) => g.letter),
    [groupedItems],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableLetters.length === 0) return;

    const handleScroll = () => {
      const sections = container.querySelectorAll("[data-letter]");
      let currentLetter: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top <= containerRect.top + 50) {
          currentLetter = section.getAttribute("data-letter");
        }
      });

      setActiveLetter(currentLetter || availableLetters[0]);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener("scroll", handleScroll);
  }, [availableLetters]);

  const handleLetterChange = useCallback((letter: string) => {
    const section = document.getElementById(`section-${letter}`);
    if (section) {
      section.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        <div className="shrink-0 bg-background border-b border-border">
          <div className="px-4 pt-4 pb-2">
            <Skeleton className="h-7 w-48" />
          </div>
        </div>
        <div className="flex-1 px-4 py-2 space-y-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="py-3 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-destructive mb-2">{errorTitle}</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="shrink-0 bg-background border-b border-border">
        <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {headerAction}
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {groupedItems.length === 0 ? (
            (emptyContent ?? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <p className="text-muted-foreground text-center">
                  No items available.
                </p>
              </div>
            ))
          ) : (
            <>
              {groupedItems.map((group) => (
                <div
                  key={group.letter}
                  id={`section-${group.letter}`}
                  data-letter={group.letter}
                >
                  <div className="sticky top-0 z-10 px-4 py-2 bg-background border-b border-border">
                    <span className="text-sm font-bold text-primary">
                      {group.letter}
                    </span>
                  </div>
                  <Card variant="list">
                    {group.items.map((item) => (
                      <Fragment key={getItemKey(item)}>
                        {renderItem(item)}
                      </Fragment>
                    ))}
                  </Card>
                </div>
              ))}
              <div className="py-4 text-center">
                <span className="text-xs text-muted-foreground">
                  {countLabel(items.length)}
                </span>
              </div>
            </>
          )}
        </div>

        {availableLetters.length > 1 && (
          <AlphabetNav
            availableLetters={availableLetters}
            activeLetter={activeLetter}
            onLetterChange={handleLetterChange}
          />
        )}
      </div>
    </div>
  );
}
