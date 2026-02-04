'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark, FaSliders, FaScaleBalanced } from '@/lib/icons';
import { AlphabetNav, FilterModal } from '@/app/components/ui';
import { cn } from '@/lib/config/theme';
import { useBailCourts, type BailCourtWithRegion } from '@/lib/hooks';

// =============================================================================
// CONSTANTS
// =============================================================================

const BAIL_REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 2, name: 'Vancouver Coastal', code: 'R2' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
] as const;

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5', 6: 'FED' };

// =============================================================================
// TYPES & HELPERS
// =============================================================================

function groupByLetter(hubs: BailCourtWithRegion[]) {
  const grouped = hubs.reduce((acc, h) => {
    const letter = /[A-Z]/.test(h.name[0]) ? h.name[0].toUpperCase() : '#';
    (acc[letter] ??= []).push(h);
    return acc;
  }, {} as Record<string, BailCourtWithRegion[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letter, hubs]) => ({ letter, hubs }));
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SearchBar({ value, onChange, onClear, onFilterClick, hasActiveFilters }: {
  value: string; onChange: (v: string) => void; onClear: () => void; onFilterClick: () => void; hasActiveFilters: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search bail hubs..."
          className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        {value && (
          <button onClick={onClear} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
            <FaXmark className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        onClick={onFilterClick}
        className={cn(
          'relative flex items-center justify-center w-12 rounded-xl border transition-all',
          hasActiveFilters ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
        )}
      >
        <FaSliders className="w-4 h-4" />
        {hasActiveFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />}
      </button>
    </div>
  );
}

function FilterModalContent({ regionFilter, onRegionChange }: {
  regionFilter: number; onRegionChange: (r: number) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3 block">Region</label>
        <div className="flex flex-wrap gap-2">
          {BAIL_REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onRegionChange(r.id)}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all',
                regionFilter === r.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:border-slate-600'
              )}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function BailHubListItem({ hub, onClick }: { hub: BailCourtWithRegion; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-800/30 active:bg-slate-800/50">
      <div className="text-sm font-medium text-slate-200 mb-1.5">{hub.name}</div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="px-2 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
          <span>{REGION_CODE[hub.region_id] || 'R?'}</span>
          <span className="text-slate-600">|</span>
          <span>{hub.region_name}</span>
        </span>
      </div>
    </button>
  );
}

function LetterSection({ letter, hubs, onHubClick }: {
  letter: string; hubs: BailCourtWithRegion[]; onHubClick: (id: number) => void;
}) {
  return (
    <div id={`section-${letter}`} data-letter={letter}>
      <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950 border-b border-slate-800/50">
        <span className="text-sm font-bold text-blue-400">{letter}</span>
      </div>
      <div className="bg-slate-800/20">
        {hubs.map((h) => <BailHubListItem key={h.id} hub={h} onClick={() => onHubClick(h.id)} />)}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BailHubsIndexPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { bailCourts: bailHubs, isLoading, error } = useBailCourts();
  const [regionFilter, setRegionFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const hasActiveFilters = regionFilter !== 0;
  const clearAllFilters = useCallback(() => { setRegionFilter(0); setSearchQuery(''); }, []);
  const handleHubClick = useCallback((hubId: number) => router.push(`/bail/${hubId}`), [router]);

  const filteredHubs = useMemo(() => {
    let result = bailHubs;
    // Filter by region
    if (regionFilter !== 0) result = result.filter(h => h.region_id === regionFilter);
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.region_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [bailHubs, regionFilter, searchQuery]);

  const groupedHubs = useMemo(() => groupByLetter(filteredHubs), [filteredHubs]);
  const availableLetters = useMemo(() => groupedHubs.map(g => g.letter), [groupedHubs]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableLetters.length === 0) return;

    const handleScroll = () => {
      const sections = container.querySelectorAll('[data-letter]');
      let currentLetter: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        if (rect.top <= containerRect.top + 50) {
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

  if (isLoading) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading bail hubs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load bail hubs</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="shrink-0 bg-slate-950 border-b border-slate-800/50">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-white">BC Bail Hubs</h1>
        </div>
        {/* Search */}
        <div className="px-4 pb-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} onFilterClick={() => setIsFilterOpen(true)} hasActiveFilters={hasActiveFilters} />
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Bail Hubs"
        onReset={() => setRegionFilter(0)}
        hasActiveFilters={hasActiveFilters}
      >
        <FilterModalContent regionFilter={regionFilter} onRegionChange={setRegionFilter} />
      </FilterModal>

      {/* Content area with AlphabetNav */}
      <div className="flex-1 min-h-0 relative">
        {/* Scrollable content */}
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {groupedHubs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaScaleBalanced className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-400 text-center">{searchQuery ? `No bail hubs found for "${searchQuery}"` : 'No bail hubs match your filters'}</p>
              {(searchQuery || hasActiveFilters) && (
                <button onClick={clearAllFilters} className="mt-4 text-blue-400 text-sm hover:text-blue-300">Clear filters</button>
              )}
            </div>
          ) : (
            <>
              {groupedHubs.map((group) => (
                <LetterSection key={group.letter} letter={group.letter} hubs={group.hubs} onHubClick={handleHubClick} />
              ))}
              <div className="py-4 text-center">
                <span className="text-xs text-slate-500">{filteredHubs.length} bail {filteredHubs.length === 1 ? 'hub' : 'hubs'}</span>
              </div>
            </>
          )}
        </div>

        {/* AlphabetNav */}
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
