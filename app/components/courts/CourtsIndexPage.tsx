'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark, FaLocationDot, FaSliders } from '@/lib/icons';
import { AlphabetNav } from '@/app/components/ui/AlphabetNav';
import { cn } from '@/lib/config/theme';
import { useCourts } from '@/lib/hooks/useCourts';
import type { CourtWithRegionName } from '@/lib/hooks/useCourts';

// =============================================================================
// CONSTANTS
// =============================================================================

const REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 2, name: 'Vancouver Coastal', code: 'R2' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
] as const;

const REGION_COLORS: Record<number, { dot: string; tag: string }> = {
  1: { dot: 'bg-amber-500', tag: 'bg-amber-500/15 text-amber-400' },
  2: { dot: 'bg-blue-500', tag: 'bg-blue-500/15 text-blue-400' },
  3: { dot: 'bg-emerald-500', tag: 'bg-emerald-500/15 text-emerald-400' },
  4: { dot: 'bg-purple-500', tag: 'bg-purple-500/15 text-purple-400' },
  5: { dot: 'bg-cyan-500', tag: 'bg-cyan-500/15 text-cyan-400' },
};

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5' };

// =============================================================================
// TYPES
// =============================================================================

interface GroupedCourts {
  letter: string;
  courts: CourtWithRegionName[];
}

type CourtTypeFilter = 'all' | 'staffed' | 'circuit';
type CourtLevelFilter = 'all' | 'pc' | 'sc';

interface Filters {
  region: number;
  courtType: CourtTypeFilter;
  courtLevel: CourtLevelFilter;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function groupCourtsByLetter(courts: CourtWithRegionName[]): GroupedCourts[] {
  const grouped = courts.reduce((acc, court) => {
    const firstChar = court.name.charAt(0).toUpperCase();
    const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
    (acc[letter] ??= []).push(court);
    return acc;
  }, {} as Record<string, CourtWithRegionName[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letter, courts]) => ({ letter, courts }));
}

function getCourtDisplayName(court: CourtWithRegionName): string {
  const name = court.name;
  if (name.toLowerCase().includes('court')) return name;
  if (court.is_circuit) return `${name} Provincial Court`;
  if (court.has_provincial || court.has_supreme) return `${name} Law Courts`;
  return name;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function SearchBar({ value, onChange, onClear, onFilterClick, hasActiveFilters }: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search courts..."
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

function FilterPanel({ isOpen, filters, onFilterChange, onClearAll }: {
  isOpen: boolean;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearAll: () => void;
}) {
  if (!isOpen) return null;

  const courtTypeOptions = [
    { value: 'all' as const, label: 'All Courts' },
    { value: 'staffed' as const, label: 'Staffed Only' },
    { value: 'circuit' as const, label: 'Circuit Only' },
  ];

  const courtLevelOptions = [
    { value: 'all' as const, label: 'All Levels' },
    { value: 'pc' as const, label: 'Provincial (PC)' },
    { value: 'sc' as const, label: 'Supreme (SC)' },
  ];

  const hasFilters = filters.region !== 0 || filters.courtType !== 'all' || filters.courtLevel !== 'all';

  return (
    <div className="border-t border-slate-700/30 bg-slate-900/50 px-4 py-3 space-y-3">
      <div>
        <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Region</label>
        <div className="flex flex-wrap gap-1.5">
          {REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => onFilterChange({ ...filters, region: region.id })}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5',
                filters.region === region.id ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              )}
            >
              {region.id !== 0 && <span className={cn('w-1.5 h-1.5 rounded-full', REGION_COLORS[region.id]?.dot)} />}
              {region.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Court Type</label>
        <div className="flex gap-1.5">
          {courtTypeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ ...filters, courtType: opt.value })}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium',
                filters.courtType === opt.value ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Court Level</label>
        <div className="flex gap-1.5">
          {courtLevelOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onFilterChange({ ...filters, courtLevel: opt.value })}
              className={cn(
                'px-2.5 py-1.5 rounded-lg text-xs font-medium',
                filters.courtLevel === opt.value ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      {hasFilters && <button onClick={onClearAll} className="text-xs text-slate-500 hover:text-slate-300">Clear all filters</button>}
    </div>
  );
}

function LetterSection({ letter, courts, onCourtClick }: {
  letter: string;
  courts: CourtWithRegionName[];
  onCourtClick: (id: number) => void;
}) {
  return (
    <div id={`section-${letter}`} data-letter={letter}>
      <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950 border-b border-slate-800/50">
        <span className="text-sm font-bold text-blue-400">{letter}</span>
      </div>
      <div className="divide-y divide-slate-800/50">
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => onCourtClick(court.id)}
            className="w-full px-4 py-3 hover:bg-slate-800/30 active:bg-slate-800/50 text-left"
          >
            <div className="text-sm font-medium text-white mb-1.5">{getCourtDisplayName(court)}</div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                <span>{REGION_CODE[court.region_id] || 'R?'}</span>
                <span className="text-slate-600">|</span>
                <span>{court.region_name}</span>
              </span>
              {court.has_provincial && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">PC</span>}
              {court.has_supreme && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">SC</span>}
              {court.is_circuit && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Circuit</span>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CourtsIndexPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { courts, isLoading, error } = useCourts();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    region: Number(searchParams.get('region')) || 0,
    courtType: (searchParams.get('type') as CourtTypeFilter) || 'all',
    courtLevel: (searchParams.get('level') as CourtLevelFilter) || 'all',
  });

  // URL sync
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.region !== 0) params.set('region', String(filters.region));
    if (filters.courtType !== 'all') params.set('type', filters.courtType);
    if (filters.courtLevel !== 'all') params.set('level', filters.courtLevel);
    if (searchQuery) params.set('q', searchQuery);
    router.replace(params.toString() ? `?${params.toString()}` : '/', { scroll: false });
  }, [filters, searchQuery, router]);

  const hasActiveFilters = filters.region !== 0 || filters.courtType !== 'all' || filters.courtLevel !== 'all';

  const clearAllFilters = useCallback(() => {
    setFilters({ region: 0, courtType: 'all', courtLevel: 'all' });
    setSearchQuery('');
  }, []);

  const filteredCourts = useMemo(() => {
    let result = courts;
    if (filters.region !== 0) result = result.filter(c => c.region_id === filters.region);
    if (filters.courtType === 'staffed') result = result.filter(c => !c.is_circuit);
    else if (filters.courtType === 'circuit') result = result.filter(c => c.is_circuit);
    if (filters.courtLevel === 'pc') result = result.filter(c => c.has_provincial);
    else if (filters.courtLevel === 'sc') result = result.filter(c => c.has_supreme);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || getCourtDisplayName(c).toLowerCase().includes(q) || c.region_name.toLowerCase().includes(q));
    }
    return result;
  }, [courts, filters, searchQuery]);

  const groupedCourts = useMemo(() => groupCourtsByLetter(filteredCourts), [filteredCourts]);
  const availableLetters = useMemo(() => groupedCourts.map(g => g.letter), [groupedCourts]);

  // Track scroll position to update active letter
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableLetters.length === 0) return;

    const handleScroll = () => {
      const sections = container.querySelectorAll('[data-letter]');
      let currentLetter: string | null = null;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // Section is "active" if its top is at or above the container top + small offset
        if (rect.top <= containerRect.top + 50) {
          currentLetter = section.getAttribute('data-letter');
        }
      });

      setActiveLetter(currentLetter || availableLetters[0]);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => container.removeEventListener('scroll', handleScroll);
  }, [availableLetters]);

  const handleLetterChange = useCallback((letter: string) => {
    const section = document.getElementById(`section-${letter}`);
    if (section) {
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }, []);

  const handleCourtClick = useCallback((courtId: number) => {
    router.push(`/court/${courtId}`);
  }, [router]);

  if (isLoading) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading courts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load courts</p>
          <p className="text-slate-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex-shrink-0 bg-slate-950 border-b border-slate-800/50">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-white">BC Court Index</h1>
        </div>
        <div className="px-4 pb-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
        <FilterPanel isOpen={isFilterOpen} filters={filters} onFilterChange={setFilters} onClearAll={clearAllFilters} />
      </div>

      {/* Scrollable content */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto">
        {groupedCourts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <FaLocationDot className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 text-center">
              {searchQuery ? `No courts found for "${searchQuery}"` : 'No courts match your filters'}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <button onClick={() => { setSearchQuery(''); clearAllFilters(); }} className="mt-4 text-blue-400 text-sm hover:text-blue-300">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="pb-4">
            {groupedCourts.map((group) => (
              <LetterSection key={group.letter} letter={group.letter} courts={group.courts} onCourtClick={handleCourtClick} />
            ))}
            <div className="py-3 text-center">
              <span className="text-xs text-slate-500">{filteredCourts.length} {filteredCourts.length === 1 ? 'court' : 'courts'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Alphabet Nav */}
      {!searchQuery && availableLetters.length > 1 && (
        <AlphabetNav 
          availableLetters={availableLetters} 
          activeLetter={activeLetter}
          onLetterChange={handleLetterChange} 
        />
      )}
    </div>
  );
}
