'use client';

import { useState, useMemo, useCallback } from 'react';
import { FaBuildingShield, FaLocationDot, FaPhone } from '@/lib/icons';
import { cn } from '@/lib/config/theme';
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
// TYPES
// =============================================================================

type JurisdictionFilter = 'all' | 'provincial' | 'federal';
type TypeFilter = 'all' | 'pretrial' | 'sentenced' | 'women';

interface Filters {
  jurisdiction: JurisdictionFilter;
  type: TypeFilter;
}

// =============================================================================
// CENTRE CARD
// =============================================================================

interface CentreCardProps {
  centre: CorrectionalCentre;
}

function CentreCard({ centre }: CentreCardProps) {
  const phoneLink = centre.general_phone.replace(/[^0-9]/g, '');
  
  // Determine tag color based on type
  const getTypeTag = () => {
    if (centre.is_federal) {
      return { text: 'Federal', class: 'bg-rose-500/15 text-rose-400' };
    }
    if (centre.centre_type === 'pretrial') {
      return { text: 'Pretrial', class: 'bg-amber-500/15 text-amber-400' };
    }
    if (centre.centre_type === 'women') {
      return { text: 'Women', class: 'bg-pink-500/15 text-pink-400' };
    }
    return { text: 'Provincial', class: 'bg-emerald-500/15 text-emerald-400' };
  };

  const typeTag = getTypeTag();

  return (
    <div className="px-4 py-3 border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-800/80 flex items-center justify-center">
          <FaBuildingShield className="w-5 h-5 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <h3 className="text-sm font-medium text-slate-100 flex-1">
              {centre.name}
            </h3>
            {centre.short_name && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                {centre.short_name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <FaLocationDot className="w-3 h-3 flex-shrink-0" />
            <span>{centre.location}</span>
            <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-medium', typeTag.class)}>
              {typeTag.text}
            </span>
            {centre.security_level && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-400">
                {centre.security_level}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <a 
              href={`tel:+1${phoneLink}`}
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <FaPhone className="w-3 h-3" />
              {centre.general_phone}
              {centre.general_phone_option && (
                <span className="text-slate-500">({centre.general_phone_option})</span>
              )}
            </a>
            {centre.has_bc_gc_link && (
              <span className="text-[10px] text-emerald-400">BC GC Link</span>
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
  const { centres, isLoading, error } = useCorrectionalCentres();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    jurisdiction: 'all',
    type: 'all',
  });

  const hasActiveFilters = filters.jurisdiction !== 'all' || filters.type !== 'all';

  const clearAllFilters = useCallback(() => {
    setFilters({ jurisdiction: 'all', type: 'all' });
    setSearchQuery('');
  }, []);

  // Filter centres
  const filteredCentres = useMemo(() => {
    let result = centres;

    // Filter by jurisdiction
    if (filters.jurisdiction === 'provincial') {
      result = result.filter(c => !c.is_federal);
    } else if (filters.jurisdiction === 'federal') {
      result = result.filter(c => c.is_federal);
    }

    // Filter by type
    if (filters.type === 'pretrial') {
      result = result.filter(c => c.centre_type === 'pretrial');
    } else if (filters.type === 'women') {
      result = result.filter(c => c.centre_type === 'women');
    } else if (filters.type === 'sentenced') {
      result = result.filter(c => c.centre_type === 'provincial' || c.centre_type === 'federal');
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.location.toLowerCase().includes(query) ||
        (c.short_name?.toLowerCase().includes(query) ?? false)
      );
    }

    return result;
  }, [centres, filters, searchQuery]);

  // Filter options
  const jurisdictionOptions: { value: JurisdictionFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'provincial', label: 'Provincial' },
    { value: 'federal', label: 'Federal' },
  ];

  const typeOptions: { value: TypeFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'pretrial', label: 'Pretrial' },
    { value: 'sentenced', label: 'Sentenced' },
    { value: 'women', label: 'Women' },
  ];

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
          <FilterPanel
            isOpen={isFilterOpen}
            hasFilters={hasActiveFilters}
            onClearAll={clearAllFilters}
          >
            <FilterGroup label="Jurisdiction">
              {jurisdictionOptions.map((opt) => (
                <FilterChip
                  key={opt.value}
                  isActive={filters.jurisdiction === opt.value}
                  onClick={() => setFilters({ ...filters, jurisdiction: opt.value })}
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
