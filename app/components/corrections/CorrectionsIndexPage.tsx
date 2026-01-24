'use client';

import { useState, useMemo, useCallback } from 'react';
import { FaBuildingShield, FaLocationDot, FaPhone } from '@/lib/icons';
import { cn } from '@/lib/config/theme';
import { REGION_COLORS } from '@/lib/config/constants';
import { useCorrectionalCentres } from '@/lib/hooks/useCorrectionsCentres';
import type { CorrectionalCentre } from '@/lib/hooks/useCorrectionsCentres';
import {
  IndexPageShell,
  EmptyState,
  ResultsCount,
  SearchBarWithFilter,
  FilterPanel,
  FilterGroup,
  FilterChip,
} from '@/app/components/ui';

// =============================================================================
// REGION MAPPING
// =============================================================================

const LOCATION_TO_REGION: Record<string, number> = {
  'Victoria': 1,
  'Nanaimo': 1,
  'Oliver': 4,
  'Kamloops': 4,
  'Prince George': 5,
  'Surrey': 3,
  'Port Coquitlam': 3,
  'Maple Ridge': 3,
  'Chilliwack': 3,
  'Abbotsford': 3,
  'Agassiz': 3,
  'Mission': 3,
};

const REGIONS = [
  { id: 0, name: 'All Regions' },
  { id: 1, name: 'Island' },
  { id: 3, name: 'Fraser' },
  { id: 4, name: 'Interior' },
  { id: 5, name: 'Northern' },
] as const;

function getRegionId(location: string): number {
  return LOCATION_TO_REGION[location] ?? 0;
}

function getRegionName(location: string): string {
  const regionId = getRegionId(location);
  return REGIONS.find(r => r.id === regionId)?.name ?? 'Unknown';
}

// =============================================================================
// TYPES
// =============================================================================

type JurisdictionFilter = 'all' | 'provincial' | 'federal';

interface Filters {
  jurisdiction: JurisdictionFilter;
  region: number;
}

// =============================================================================
// CENTRE CARD
// =============================================================================

function CentreCard({ centre }: { centre: CorrectionalCentre }) {
  const phoneLink = centre.general_phone.replace(/[^0-9]/g, '');
  const regionId = getRegionId(centre.location);
  const regionColors = REGION_COLORS[regionId] || { tag: 'bg-slate-500/15 text-slate-400' };

  return (
    <div className="px-4 py-3 border-b border-slate-800/50">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h3 className="text-sm font-medium text-slate-100">{centre.name}</h3>
        {centre.short_name && (
          <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded flex-shrink-0">
            {centre.short_name}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
        <FaLocationDot className="w-3 h-3" />
        <span>{centre.location}</span>
        <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', regionColors.tag)}>
          {getRegionName(centre.location)}
        </span>
        {centre.is_federal && (
          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-rose-500/15 text-rose-400">
            Federal
          </span>
        )}
      </div>
      <a 
        href={`tel:+1${phoneLink}`}
        className="inline-flex items-center gap-1.5 text-xs text-blue-400"
      >
        <FaPhone className="w-3 h-3" />
        {centre.general_phone}
        {centre.general_phone_option && (
          <span className="text-slate-500">({centre.general_phone_option})</span>
        )}
      </a>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CorrectionsIndexPage() {
  const { centres, isLoading, error } = useCorrectionalCentres();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({ jurisdiction: 'all', region: 0 });

  const hasActiveFilters = filters.jurisdiction !== 'all' || filters.region !== 0;

  const clearAllFilters = useCallback(() => {
    setFilters({ jurisdiction: 'all', region: 0 });
    setSearchQuery('');
  }, []);

  const filteredCentres = useMemo(() => {
    let result = centres;

    if (filters.jurisdiction === 'provincial') {
      result = result.filter(c => !c.is_federal);
    } else if (filters.jurisdiction === 'federal') {
      result = result.filter(c => c.is_federal);
    }

    if (filters.region !== 0) {
      result = result.filter(c => getRegionId(c.location) === filters.region);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        c.short_name?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [centres, filters, searchQuery]);

  return (
    <IndexPageShell
      title="BC Corrections Index"
      subtitle="Provincial & federal correctional centres"
      isLoading={isLoading}
      loadingText="Loading correctional centres..."
      error={error}
      headerContent={
        <>
          <SearchBarWithFilter
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
            onFilterClick={() => setIsFilterOpen(!isFilterOpen)}
            hasActiveFilters={hasActiveFilters}
            placeholder="Search centres..."
          />
          <FilterPanel isOpen={isFilterOpen} hasFilters={hasActiveFilters} onClearAll={clearAllFilters}>
            <FilterGroup label="Jurisdiction">
              {(['all', 'provincial', 'federal'] as const).map(v => (
                <FilterChip
                  key={v}
                  isActive={filters.jurisdiction === v}
                  onClick={() => setFilters({ ...filters, jurisdiction: v })}
                >
                  {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Region">
              {REGIONS.map(r => (
                <FilterChip
                  key={r.id}
                  isActive={filters.region === r.id}
                  onClick={() => setFilters({ ...filters, region: r.id })}
                  dotColor={r.id !== 0 ? REGION_COLORS[r.id]?.dot : undefined}
                >
                  {r.name}
                </FilterChip>
              ))}
            </FilterGroup>
          </FilterPanel>
        </>
      }
    >
      {filteredCentres.length === 0 ? (
        <EmptyState
          icon={<FaBuildingShield className="w-full h-full" />}
          message={searchQuery ? `No centres found for "${searchQuery}"` : 'No centres match your filters'}
          onClear={(searchQuery || hasActiveFilters) ? clearAllFilters : undefined}
        />
      ) : (
        <>
          {filteredCentres.map(c => <CentreCard key={c.id} centre={c} />)}
          <ResultsCount count={filteredCentres.length} singular="centre" plural="centres" />
        </>
      )}
    </IndexPageShell>
  );
}
