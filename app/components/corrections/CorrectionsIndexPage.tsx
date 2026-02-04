'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark, FaSliders, FaBuildingShield } from '@/lib/icons';
import { AlphabetNav, FilterModal } from '@/app/components/ui';
import { cn } from '@/lib/config/theme';
import { useCorrectionalCentres } from '@/lib/hooks/useCorrectionsCentres';
import { REGION_CODES, REGION_NAMES } from '@/types';
import type { CorrectionalCentre } from '@/lib/hooks/useCorrectionsCentres';

// =============================================================================
// CONSTANTS
// =============================================================================

// Correctional centre type IDs from the database
const CENTRE_TYPE = {
  PROVINCIAL: 1,
  FEDERAL: 2,
} as const;

const CORRECTIONS_REGIONS = [
  { id: 0, name: 'All Regions', code: 'ALL' },
  { id: 1, name: 'Island', code: 'R1' },
  { id: 3, name: 'Fraser', code: 'R3' },
  { id: 4, name: 'Interior', code: 'R4' },
  { id: 5, name: 'Northern', code: 'R5' },
] as const;

const JURISDICTION_OPTIONS = [
  { value: 'all' as const, label: 'All' },
  { value: 'provincial' as const, label: 'Provincial' },
  { value: 'federal' as const, label: 'Federal' },
] as const;

// Helper to get region info from region_id
const getRegionInfo = (regionId: number | null) => {
  if (!regionId) return { id: 0, code: 'UNK', name: 'Unknown' };
  return {
    id: regionId,
    code: REGION_CODES[regionId] || 'UNK',
    name: REGION_NAMES[regionId] || 'Unknown'
  };
};

// Helper to check if centre is federal
const isFederal = (centre: CorrectionalCentre) => centre.type_id === CENTRE_TYPE.FEDERAL;

// =============================================================================
// TYPES & HELPERS
// =============================================================================

type JurisdictionFilter = 'all' | 'provincial' | 'federal';
interface Filters { region: number; jurisdiction: JurisdictionFilter; }

function groupByLetter(centres: CorrectionalCentre[]) {
  const grouped = centres.reduce((acc, c) => {
    const letter = /[A-Z]/.test(c.name[0]) ? c.name[0].toUpperCase() : '#';
    (acc[letter] ??= []).push(c);
    return acc;
  }, {} as Record<string, CorrectionalCentre[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => (a === '#' ? 1 : b === '#' ? -1 : a.localeCompare(b)))
    .map(([letter, centres]) => ({ letter, centres }));
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
          placeholder="Search centres..."
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

function FilterModalContent({ filters, onFilterChange }: {
  filters: Filters; onFilterChange: (f: Filters) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Region */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3 block">Region</label>
        <div className="flex flex-wrap gap-2">
          {CORRECTIONS_REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onFilterChange({ ...filters, region: r.id })}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all',
                filters.region === r.id 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:border-slate-600'
              )}
            >
              {/* {r.id !== 0 && <span className={cn('w-2 h-2 rounded-full', REGION_COLORS[r.id]?.dot)} />} */}
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Jurisdiction */}
      <div>
        <label className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3 block">Jurisdiction</label>
        <div className="flex flex-wrap gap-2">
          {JURISDICTION_OPTIONS.map((j) => (
            <button
              key={j.value}
              onClick={() => onFilterChange({ ...filters, jurisdiction: j.value })}
              className={cn(
                'px-3 py-2 rounded-xl text-sm font-medium transition-all',
                filters.jurisdiction === j.value 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' 
                  : 'bg-slate-800/80 text-slate-300 border border-slate-700/50 hover:border-slate-600'
              )}
            >
              {j.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CentreListItem({ centre, onClick }: { centre: CorrectionalCentre; onClick: () => void }) {
  const region = getRegionInfo(centre.region_id);
  const federal = isFederal(centre);
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-800/30 active:bg-slate-800/50">
      <div className="text-sm font-medium text-slate-200 mb-1.5">{centre.name}</div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="px-2 py-1 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
          <span>{region.code}</span>
          <span className="text-slate-600">|</span>
          <span>{region.name}</span>
        </span>
        <span className={cn('px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide rounded', federal ? 'bg-purple-500/15 text-purple-400' : 'bg-emerald-500/15 text-emerald-400')}>
          {federal ? 'Federal' : 'Provincial'}
        </span>
        {centre.short_name && (
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400">{centre.short_name}</span>
        )}
      </div>
    </button>
  );
}

function LetterSection({ letter, centres, onCentreClick }: {
  letter: string; centres: CorrectionalCentre[]; onCentreClick: (id: number) => void;
}) {
  return (
    <div id={`section-${letter}`} data-letter={letter}>
      <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950 border-b border-slate-800/50">
        <span className="text-sm font-bold text-blue-400">{letter}</span>
      </div>
      <div className="bg-slate-800/20">
        {centres.map((c) => <CentreListItem key={c.id} centre={c} onClick={() => onCentreClick(c.id)} />)}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CorrectionsIndexPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { centres, isLoading, error } = useCorrectionalCentres();
  const [filters, setFilters] = useState<Filters>({ region: 0, jurisdiction: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  const hasActiveFilters = filters.region !== 0 || filters.jurisdiction !== 'all';
  const clearAllFilters = useCallback(() => { setFilters({ region: 0, jurisdiction: 'all' }); setSearchQuery(''); }, []);
  const handleCentreClick = useCallback((centreId: number) => router.push(`/corrections/${centreId}`), [router]);

  const filteredCentres = useMemo(() => {
    let result = centres;
    if (filters.region !== 0) result = result.filter(c => c.region_id === filters.region);
    if (filters.jurisdiction === 'provincial') result = result.filter(c => !isFederal(c));
    else if (filters.jurisdiction === 'federal') result = result.filter(c => isFederal(c));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.short_name?.toLowerCase().includes(q) ||
        c.region_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [centres, filters, searchQuery]);

  const groupedCentres = useMemo(() => groupByLetter(filteredCentres), [filteredCentres]);
  const availableLetters = useMemo(() => groupedCentres.map(g => g.letter), [groupedCentres]);

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
          <p className="text-slate-400 text-sm">Loading centres...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load centres</p>
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
          <h1 className="text-xl font-bold text-white">BC Corrections Index</h1>
        </div>
        <div className="px-4 pb-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} onFilterClick={() => setIsFilterOpen(true)} hasActiveFilters={hasActiveFilters} />
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Centres"
        onReset={() => setFilters({ region: 0, jurisdiction: 'all' })}
        hasActiveFilters={hasActiveFilters}
      >
        <FilterModalContent filters={filters} onFilterChange={setFilters} />
      </FilterModal>

      {/* Content area with AlphabetNav */}
      <div className="flex-1 min-h-0 relative">
        {/* Scrollable content */}
        <div ref={scrollContainerRef} className="h-full overflow-y-auto">
          {groupedCentres.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <FaBuildingShield className="w-12 h-12 text-slate-700 mb-4" />
              <p className="text-slate-400 text-center">{searchQuery ? `No centres found for "${searchQuery}"` : 'No centres match your filters'}</p>
              {(searchQuery || hasActiveFilters) && (
                <button onClick={clearAllFilters} className="mt-4 text-blue-400 text-sm hover:text-blue-300">Clear filters</button>
              )}
            </div>
          ) : (
            <>
              {groupedCentres.map((group) => (
                <LetterSection key={group.letter} letter={group.letter} centres={group.centres} onCentreClick={handleCentreClick} />
              ))}
              <div className="py-4 text-center">
                <span className="text-xs text-slate-500">{filteredCentres.length} {filteredCentres.length === 1 ? 'centre' : 'centres'}</span>
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
