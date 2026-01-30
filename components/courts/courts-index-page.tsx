'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { AlphabetNav } from '@/components/ui/alphabet-nav';
import { StickyHeader } from '@/components/layouts/sticky-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { REGIONS, REGION_CODES, REGION_COLORS } from '@/lib/config/constants';
import { supabaseClient } from '@/lib/supabase/client';
import type { CourtListItem, GroupedCourts } from '@/types';

type CourtTypeFilter = 'all' | 'staffed' | 'circuit';
type CourtLevelFilter = 'all' | 'pc' | 'sc';

const COURT_TYPE_OPTIONS = [
  { value: 'all' as const, label: 'All Courts' },
  { value: 'staffed' as const, label: 'Staffed Only' },
  { value: 'circuit' as const, label: 'Circuit Only' },
];

const COURT_LEVEL_OPTIONS = [
  { value: 'all' as const, label: 'All Levels' },
  { value: 'pc' as const, label: 'Provincial (PC)' },
  { value: 'sc' as const, label: 'Supreme (SC)' },
];

function groupCourtsByLetter(courts: CourtListItem[]): GroupedCourts[] {
  const grouped = courts.reduce((acc, court) => {
    const firstChar = court.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    (acc[letter] ??= []).push(court);
    return acc;
  }, {} as Record<string, CourtListItem[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letter, courts]) => ({ letter, courts }));
}

function getCourtDisplayName(court: CourtListItem): string {
  const name = court.name;
  if (name.toLowerCase().includes('court')) return name;
  if (court.is_circuit) return `${name} Provincial Court`;
  if (court.has_provincial || court.has_supreme) return `${name} Law Courts`;
  return name;
}

export function CourtsIndexPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [courts, setCourts] = useState<CourtListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    region: 0,
    courtType: 'all' as CourtTypeFilter,
    courtLevel: 'all' as CourtLevelFilter,
  });
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Fetch courts from Supabase
  useEffect(() => {
    async function fetchCourts() {
      const { data, error } = await supabaseClient
        .from('v2_courts')
        .select(`
          id,
          name,
          region_id,
          is_circuit,
          has_provincial,
          has_supreme,
          v2_regions!inner(name)
        `)
        .order('name');

      if (error) {
        console.error('Error fetching courts:', error);
        setLoading(false);
        return;
      }

      const mapped: CourtListItem[] = (data || []).map((c) => ({
        id: c.id,
        name: c.name,
        region_id: c.region_id,
        region_name: (c.v2_regions as { name: string }[] | null)?.[0]?.name || '',
        is_circuit: c.is_circuit,
        has_provincial: c.has_provincial,
        has_supreme: c.has_supreme,
      }));

      setCourts(mapped);
      setLoading(false);
    }

    fetchCourts();
  }, []);

  const hasActiveFilters =
    filters.region !== 0 || filters.courtType !== 'all' || filters.courtLevel !== 'all';

  const clearFilters = useCallback(() => {
    setFilters({ region: 0, courtType: 'all', courtLevel: 'all' });
    setSearchQuery('');
  }, []);

  const filteredCourts = useMemo(() => {
    let result = courts;

    if (filters.region !== 0) {
      result = result.filter((court) => court.region_id === filters.region);
    }

    if (filters.courtType === 'staffed') {
      result = result.filter((court) => !court.is_circuit);
    } else if (filters.courtType === 'circuit') {
      result = result.filter((court) => court.is_circuit);
    }

    if (filters.courtLevel === 'pc') {
      result = result.filter((court) => court.has_provincial);
    } else if (filters.courtLevel === 'sc') {
      result = result.filter((court) => court.has_supreme);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (court) =>
          court.name.toLowerCase().includes(query) ||
          getCourtDisplayName(court).toLowerCase().includes(query) ||
          court.region_name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [courts, filters, searchQuery]);

  const groupedCourts = useMemo(() => groupCourtsByLetter(filteredCourts), [filteredCourts]);
  const availableLetters = useMemo(() => groupedCourts.map((group) => group.letter), [groupedCourts]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableLetters.length === 0) return;

    const handleScroll = () => {
      const sections = container.querySelectorAll('[data-letter]');
      let currentLetter: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top <= containerRect.top + 64) {
          currentLetter = section.getAttribute('data-letter');
        }
      });

      setActiveLetter(currentLetter || availableLetters[0]);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => container.removeEventListener('scroll', handleScroll);
  }, [availableLetters]);

  const handleLetterChange = useCallback((letter: string) => {
    const section = document.getElementById(`section-${letter}`);
    if (section) {
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  const handleCourtClick = useCallback(
    (courtId: number) => {
      router.push(`/court/${courtId}`);
    },
    [router]
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-muted-foreground">Loading courts...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <StickyHeader>
        <div className="px-4 pt-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">BC Court Index</h1>
              <p className="text-xs text-muted-foreground">
                Browse all courts by region, type, and level.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
              {courts.length} Courts
            </Badge>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courts or regions"
                className="pl-9 pr-10 h-11"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={hasActiveFilters ? 'default' : 'outline'}
                  className="h-11 w-11 px-0"
                  aria-label="Open filters"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="space-y-6">
                <SheetHeader>
                  <SheetTitle>Filter Courts</SheetTitle>
                  <SheetDescription>Choose region, court type, and level.</SheetDescription>
                </SheetHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Region</p>
                    <div className="flex flex-wrap gap-2">
                      {REGIONS.map((region) => (
                        <Button
                          key={region.id}
                          variant={filters.region === region.id ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setFilters((prev) => ({ ...prev, region: region.id }))}
                        >
                          {region.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Court Type</p>
                    <div className="flex flex-wrap gap-2">
                      {COURT_TYPE_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant={filters.courtType === option.value ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setFilters((prev) => ({ ...prev, courtType: option.value }))}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Court Level</p>
                    <div className="flex flex-wrap gap-2">
                      {COURT_LEVEL_OPTIONS.map((option) => (
                        <Button
                          key={option.value}
                          variant={filters.courtLevel === option.value ? 'default' : 'outline'}
                          size="sm"
                          className="rounded-full text-xs"
                          onClick={() => setFilters((prev) => ({ ...prev, courtLevel: option.value }))}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button variant="ghost" className="w-full" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </StickyHeader>

      <div className="flex-1 min-h-0 relative">
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {groupedCourts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <MapPin className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? `No courts found for "${searchQuery}".` : 'No courts match your filters.'}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Reset search & filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-6 py-4">
              {groupedCourts.map((group) => (
                <div key={group.letter} id={`section-${group.letter}`} data-letter={group.letter}>
                  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur">
                    <div className="px-4 py-2 flex items-center gap-2 text-xs font-semibold text-primary">
                      <span>{group.letter}</span>
                      <span className="text-muted-foreground">{group.courts.length} courts</span>
                    </div>
                    <Separator />
                  </div>
                  <Card className="mx-4 mt-2 divide-y divide-border/60">
                    {group.courts.map((court) => (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => handleCourtClick(court.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 transition-colors',
                          'hover:bg-muted/50 active:bg-muted'
                        )}
                      >
                        <div className="text-sm font-semibold text-foreground">
                          {getCourtDisplayName(court)}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge className={cn('text-[10px] uppercase tracking-widest', REGION_COLORS[court.region_id]?.tag)}>
                            {REGION_CODES[court.region_id] || 'R?'} • {court.region_name}
                          </Badge>
                          {court.has_provincial && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20">
                              PC
                            </Badge>
                          )}
                          {court.has_supreme && (
                            <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20">
                              SC
                            </Badge>
                          )}
                          {court.is_circuit && (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20">
                              Circuit
                            </Badge>
                          )}
                        </div>
                      </button>
                    ))}
                  </Card>
                </div>
              ))}
              <div className="text-center text-xs text-muted-foreground pb-6">
                {filteredCourts.length} {filteredCourts.length === 1 ? 'court' : 'courts'}
              </div>
            </div>
          )}
        </div>

        {!searchQuery && availableLetters.length > 1 && (
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
