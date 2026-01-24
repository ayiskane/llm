'use client';

import { useState, useMemo, useCallback } from 'react';
import { FaBuildingShield, FaLocationDot, FaPhone } from '@/lib/icons';
import { cn } from '@/lib/config/theme';
import { REGIONS, REGION_COLORS } from '@/lib/config/constants';
import { useCorrectionsCentres } from '@/lib/hooks/useCorrectionsCentres';
import type { CorrectionsCentreWithRegion } from '@/lib/hooks/useCorrectionsCentres';
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
// TYPES
// =============================================================================

type GenderFilter = 'all' | 'men' | 'women';
type TypeFilter = 'all' | 'pretrial' | 'sentenced';

interface Filters {
  region: number;
  gender: GenderFilter;
  type: TypeFilter;
}

// Corrections only has centres in R1, R3, R4, R5 (no R2)
const CORRECTIONS_REGIONS = REGIONS.filter(r => r.id === 0 || [1, 3, 4, 5].includes(r.id));

// =============================================================================
// CENTRE CARD
// =============================================================================

interface CentreCardProps {
  centre: CorrectionsCentreWithRegion;
}

function CentreCard({ centre }: CentreCardProps) {
  const regionColors = REGION_COLORS[centre.region_id] || { tag: 'bg-slate-500/15 text-slate-400' };
  const phoneLink = centre.phone.replace(/[^0-9]/g, '');

  return (
    <div className="px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center">
          <FaBuildingShield className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-slate-100 truncate mb-1">
            {centre.name}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <FaLocationDot className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{centre.city}</span>
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', regionColors.tag)}>
              {centre.region_name}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a 
              href={`tel:+1${phoneLink}`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaPhone className="w-3 h-3" />
              {centre.phone}
            </a>
            {centre.is_women_only && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-pink-500/15 text-pink-400">
                Women
              </span>
            )}
            {centre.is_pretrial && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400">
                Pretrial
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CorrectionsIndexPage() {
  const { centres, isLoading, error } = useCorrectionsCentres();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    region: 0,
    gender: 'all',
    type: 'all',
  });

  const hasActiveFilters = filters.region !== 0 || filters.gender !== 'all' || filters.type !== 'all';

  const clearAllFilters = useCallback(() => {
    setFilters({ region: 0, gender: 'all', type: 'all' });
    setSearchQuery('');
  }, []);

  // Filter centres
  const filteredCentres = useMemo(() => {
    let result = centres;

    if (filters.region !== 0) {
      result = result.filter(c => c.region_id === filters.region);
    }
    if (filters.gender === 'women') {
      result = result.filter(c => c.is_women_only);
    } else if (filters.gender === 'men') {
      result = result.filter(c => !c.is_women_only);
    }
    if (filters.type === 'pretrial') {
      result = result.filter(c => c.is_pretrial);
    } else if (filters.type === 'sentenced') {
      result = result.filter(c => !c.is_pretrial);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.region_name.toLowerCase().includes(query)
      );
    }

    return result;
  }, [centres, filters, searchQuery]);

  // Filter options
  const genderOptions: { value: GenderFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'men', label: 'Men' },
    { value: 'women', label: 'Women' },
  ];

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pretrial', label: 'Pretrial' },
    { value: 'sentenced', label: 'Sentenced' },
  ];

  return (
    <IndexPageShell
      title="BC Corrections Index"
      subtitle="Provincial correctional centres"
      isLoading={isLoading}
      loadingText="Loading corrections centres..."
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
          <FilterPanel
            isOpen={isFilterOpen}
            hasFilters={hasActiveFilters}
            onClearAll={clearAllFilters}
          >
            <FilterGroup label="Region">
              {CORRECTIONS_REGIONS.map((region) => (
                <FilterChip
                  key={region.id}
                  isActive={filters.region === region.id}
                  onClick={() => setFilters({ ...filters, region: region.id })}
                  dotColor={region.id !== 0 ? REGION_COLORS[region.id]?.dot : undefined}
                >
                  {region.name}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Gender">
              {genderOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  isActive={filters.gender === opt.value}
                  onClick={() => setFilters({ ...filters, gender: opt.value })}
                >
                  {opt.label}
                </FilterChip>
              ))}
            </FilterGroup>
            <FilterGroup label="Type">
              {typeOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  isActive={filters.type === opt.value}
                  onClick={() => setFilters({ ...filters, type: opt.value })}
                >
                  {opt.label}
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
          message={
            searchQuery 
              ? `No centres found for "${searchQuery}"`
              : 'No centres match your filters'
          }
          onClear={(searchQuery || hasActiveFilters) ? clearAllFilters : undefined}
        />
      ) : (
        <>
          {filteredCentres.map((centre) => (
            <CentreCard key={centre.id} centre={centre} />
          ))}
          <ResultsCount
            count={filteredCentres.length}
            singular="centre"
            plural="centres"
          />
        </>
      )}
    </IndexPageShell>
  );
}
