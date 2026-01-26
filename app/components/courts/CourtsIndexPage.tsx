'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark, FaBuilding, FaLocationDot, FaSliders, FaChevronDown } from '@/lib/icons';
import { cn, pill, text } from '@/lib/config/theme';
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
    
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(court);
    return acc;
  }, {} as Record<string, CourtWithRegionName[]>);

  return Object.entries(grouped)
    .sort(([a], [b]) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b);
    })
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

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFilterClick: () => void;
  hasActiveFilters: boolean;
}

function SearchBar({ value, onChange, onClear, onFilterClick, hasActiveFilters }: SearchBarProps) {
  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <FaMagnifyingGlass className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search courts..."
          className={cn(
            'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl',
            'pl-11 pr-10 py-3 text-sm',
            'text-slate-200 placeholder:text-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40',
            'transition-all duration-200'
          )}
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <FaXmark className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        onClick={onFilterClick}
        className={cn(
          'relative flex items-center justify-center w-12 rounded-xl border transition-all',
          hasActiveFilters
            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
        )}
      >
        <FaSliders className="w-4 h-4" />
        {hasActiveFilters && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full" />
        )}
      </button>
    </div>
  );
}

interface FilterPanelProps {
  isOpen: boolean;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onClearAll: () => void;
}

function FilterPanel({ isOpen, filters, onFilterChange, onClearAll }: FilterPanelProps) {
  if (!isOpen) return null;

  const courtTypeOptions: { value: CourtTypeFilter; label: string }[] = [
    { value: 'all', label: 'All Courts' },
    { value: 'staffed', label: 'Staffed Only' },
    { value: 'circuit', label: 'Circuit Only' },
  ];

  const courtLevelOptions: { value: CourtLevelFilter; label: string }[] = [
    { value: 'all', label: 'All Levels' },
    { value: 'pc', label: 'Provincial (PC)' },
    { value: 'sc', label: 'Supreme (SC)' },
  ];

  const hasFilters = filters.region !== 0 || filters.courtType !== 'all' || filters.courtLevel !== 'all';

  return (
    <div className="border-t border-slate-700/30 bg-slate-900/50">
      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Region</label>
          <div className="flex flex-wrap gap-1.5">
            {REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => onFilterChange({ ...filters, region: region.id })}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  'flex items-center gap-1.5',
                  filters.region === region.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                )}
              >
                {region.id !== 0 && (
                  <span className={cn('w-1.5 h-1.5 rounded-full', REGION_COLORS[region.id]?.dot)} />
                )}
                {region.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Court Type</label>
          <div className="flex gap-1.5">
            {courtTypeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, courtType: option.value })}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filters.courtType === option.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5 block">Court Level</label>
          <div className="flex gap-1.5">
            {courtLevelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange({ ...filters, courtLevel: option.value })}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filters.courtLevel === option.value
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-slate-600'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={onClearAll}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

interface LetterSectionProps {
  letter: string;
  courts: CourtWithRegionName[];
  onCourtClick: (courtId: number) => void;
}

function LetterSection({ letter, courts, onCourtClick }: LetterSectionProps) {
  return (
    <div>
      {/* Sticky Letter Header */}
      <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950 border-b border-slate-800/50">
        <span className="text-sm font-bold text-blue-400">{letter}</span>
      </div>
      
      {/* Court Cards */}
      <div className="divide-y divide-slate-800/50">
        {courts.map((court) => (
          <button
            key={court.id}
            onClick={() => onCourtClick(court.id)}
            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/30 active:bg-slate-800/50 transition-colors text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">
                {getCourtDisplayName(court)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded', REGION_COLORS[court.region_id]?.tag)}>
                  {court.region_name}
                </span>
                {court.has_provincial && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">PC</span>
                )}
                {court.has_supreme && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400">SC</span>
                )}
                {court.is_circuit && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">Circuit</span>
                )}
              </div>
            </div>
            <FaChevronDown className="w-3 h-3 text-slate-500 -rotate-90 flex-shrink-0" />
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
  const { courts, isLoading, error } = useCourts();

  // State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    region: Number(searchParams.get('region')) || 0,
    courtType: (searchParams.get('type') as CourtTypeFilter) || 'all',
    courtLevel: (searchParams.get('level') as CourtLevelFilter) || 'all',
  });

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.region !== 0) params.set('region', String(filters.region));
    if (filters.courtType !== 'all') params.set('type', filters.courtType);
    if (filters.courtLevel !== 'all') params.set('level', filters.courtLevel);
    if (searchQuery) params.set('q', searchQuery);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [filters, searchQuery, router]);

  const hasActiveFilters = filters.region !== 0 || filters.courtType !== 'all' || filters.courtLevel !== 'all';

  const clearAllFilters = useCallback(() => {
    setFilters({ region: 0, courtType: 'all', courtLevel: 'all' });
    setSearchQuery('');
  }, []);

  const filteredCourts = useMemo(() => {
    let result = courts;

    if (filters.region !== 0) {
      result = result.filter(court => court.region_id === filters.region);
    }
    if (filters.courtType === 'staffed') {
      result = result.filter(court => !court.is_circuit);
    } else if (filters.courtType === 'circuit') {
      result = result.filter(court => court.is_circuit);
    }
    if (filters.courtLevel === 'pc') {
      result = result.filter(court => court.has_provincial);
    } else if (filters.courtLevel === 'sc') {
      result = result.filter(court => court.has_supreme);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(court => {
        const displayName = getCourtDisplayName(court).toLowerCase();
        return court.name.toLowerCase().includes(query) ||
          displayName.includes(query) ||
          court.region_name.toLowerCase().includes(query);
      });
    }

    return result;
  }, [courts, filters, searchQuery]);

  const groupedCourts = useMemo(() => groupCourtsByLetter(filteredCourts), [filteredCourts]);

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
      {/* Fixed Header */}
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
        <FilterPanel
          isOpen={isFilterOpen}
          filters={filters}
          onFilterChange={setFilters}
          onClearAll={clearAllFilters}
        />
      </div>

      {/* Scrollable List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {groupedCourts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <FaLocationDot className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 text-center">
              {searchQuery ? `No courts found for "${searchQuery}"` : 'No courts match your filters'}
            </p>
            {(searchQuery || hasActiveFilters) && (
              <button
                onClick={() => { setSearchQuery(''); clearAllFilters(); }}
                className="mt-4 text-blue-400 text-sm hover:text-blue-300 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {groupedCourts.map((group) => (
              <LetterSection
                key={group.letter}
                letter={group.letter}
                courts={group.courts}
                onCourtClick={handleCourtClick}
              />
            ))}
            <div className="py-3 text-center">
              <span className="text-xs text-slate-500">
                {filteredCourts.length} {filteredCourts.length === 1 ? 'court' : 'courts'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
