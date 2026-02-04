'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { FaMagnifyingGlass, FaXmark, FaScaleBalanced } from '@/lib/icons';
import { cn } from '@/lib/config/theme';
import { REGION_COLORS } from '@/lib/config/constants';
import { useBailCourts, type BailCourtWithRegion } from '@/lib/hooks';

// =============================================================================
// CONSTANTS
// =============================================================================

const REGIONS_ORDER = [1, 2, 3, 4, 5] as const; // R1-R5 in order
const REGION_INFO: Record<number, { code: string; name: string }> = {
  1: { code: 'R1', name: 'Island' },
  2: { code: 'R2', name: 'Vancouver Coastal' },
  3: { code: 'R3', name: 'Fraser' },
  4: { code: 'R4', name: 'Interior' },
  5: { code: 'R5', name: 'Northern' },
  6: { code: 'FED', name: 'Federal' },
};

// =============================================================================
// TYPES & HELPERS
// =============================================================================

type ScheduleTab = 'weekday' | 'weekend';

function groupByRegion(courts: BailCourtWithRegion[]) {
  const grouped: Record<number, BailCourtWithRegion[]> = {};
  courts.forEach(c => {
    (grouped[c.region_id] ??= []).push(c);
  });
  // Sort courts within each region alphabetically
  Object.values(grouped).forEach(arr => arr.sort((a, b) => a.name.localeCompare(b.name)));
  return grouped;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function ScheduleTabs({ activeTab, onTabChange, counts }: {
  activeTab: ScheduleTab;
  onTabChange: (tab: ScheduleTab) => void;
  counts: { weekday: number; weekend: number };
}) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onTabChange('weekday')}
        className={cn(
          'flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all',
          activeTab === 'weekday'
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800/70'
        )}
      >
        Weekday
        <span className={cn('ml-1.5', activeTab === 'weekday' ? 'text-amber-400/70' : 'text-slate-500')}>
          {counts.weekday}
        </span>
      </button>
      <button
        onClick={() => onTabChange('weekend')}
        className={cn(
          'flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all',
          activeTab === 'weekend'
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
            : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-800/70'
        )}
      >
        Evening / Weekend
        <span className={cn('ml-1.5', activeTab === 'weekend' ? 'text-purple-400/70' : 'text-slate-500')}>
          {counts.weekend}
        </span>
      </button>
    </div>
  );
}

function SearchBar({ value, onChange, onClear }: {
  value: string; onChange: (v: string) => void; onClear: () => void;
}) {
  return (
    <div className="relative">
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
  );
}

function SectionHeader({ title, code, colorDot }: { title: string; code?: string; colorDot?: string }) {
  return (
    <div className="sticky top-0 z-10 px-4 py-2 bg-slate-950 border-b border-slate-800/50">
      <div className="flex items-center gap-2">
        {colorDot && <span className={cn('w-2 h-2 rounded-full', colorDot)} />}
        {code && <span className="text-xs font-mono text-slate-500">{code}</span>}
        {code && <span className="text-slate-600">|</span>}
        <span className="text-sm font-bold text-blue-400">{title}</span>
      </div>
    </div>
  );
}

function BailCourtListItem({ court, onClick, showRegion = false }: { 
  court: BailCourtWithRegion; 
  onClick: () => void;
  showRegion?: boolean;
}) {
  const region = REGION_INFO[court.region_id];
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-800/30 active:bg-slate-800/50">
      <div className="text-sm font-medium text-slate-200">{court.name}</div>
      {showRegion && region && (
        <div className="flex items-center gap-1.5 mt-1">
          <span className="px-2 py-0.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
            <span>{region.code}</span>
            <span className="text-slate-600">|</span>
            <span>{region.name}</span>
          </span>
        </div>
      )}
    </button>
  );
}

// =============================================================================
// WEEKDAY LIST - Grouped by Region
// =============================================================================

function WeekdayList({ courts, onCourtClick }: { 
  courts: BailCourtWithRegion[]; 
  onCourtClick: (id: number) => void;
}) {
  const grouped = useMemo(() => groupByRegion(courts), [courts]);
  
  return (
    <>
      {REGIONS_ORDER.map(regionId => {
        const regionCourts = grouped[regionId];
        if (!regionCourts?.length) return null;
        const info = REGION_INFO[regionId];
        return (
          <div key={regionId}>
            <SectionHeader 
              title={info.name} 
              code={info.code} 
              colorDot={REGION_COLORS[regionId]?.dot}
            />
            <div className="bg-slate-800/20">
              {regionCourts.map(c => (
                <BailCourtListItem key={c.id} court={c} onClick={() => onCourtClick(c.id)} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

// =============================================================================
// WEEKEND LIST - Justice Center + Federal sections
// =============================================================================

function WeekendList({ courts, onCourtClick }: { 
  courts: BailCourtWithRegion[]; 
  onCourtClick: (id: number) => void;
}) {
  const { justiceCenters, federal } = useMemo(() => {
    const jc: BailCourtWithRegion[] = [];
    const fed: BailCourtWithRegion[] = [];
    courts.forEach(c => {
      if (c.region_id === 6) fed.push(c);
      else jc.push(c);
    });
    // Sort alphabetically
    jc.sort((a, b) => a.name.localeCompare(b.name));
    fed.sort((a, b) => a.name.localeCompare(b.name));
    return { justiceCenters: jc, federal: fed };
  }, [courts]);

  return (
    <>
      {justiceCenters.length > 0 && (
        <div>
          <SectionHeader title="Justice Center" />
          <div className="bg-slate-800/20">
            {justiceCenters.map(c => (
              <BailCourtListItem key={c.id} court={c} onClick={() => onCourtClick(c.id)} showRegion />
            ))}
          </div>
        </div>
      )}
      {federal.length > 0 && (
        <div>
          <SectionHeader title="Federal" />
          <div className="bg-slate-800/20">
            {federal.map(c => (
              <BailCourtListItem key={c.id} court={c} onClick={() => onCourtClick(c.id)} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BailHubsIndexPage() {
  const router = useRouter();
  const { bailCourts, isLoading, error } = useBailCourts();
  const [activeTab, setActiveTab] = useState<ScheduleTab>('weekday');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCourtClick = useCallback((courtId: number) => router.push(`/bail/${courtId}`), [router]);

  // Count for tabs
  const tabCounts = useMemo(() => ({
    weekday: bailCourts.filter(c => c.is_daytime).length,
    weekend: bailCourts.filter(c => !c.is_daytime).length,
  }), [bailCourts]);

  const filteredCourts = useMemo(() => {
    let result = bailCourts;
    // Filter by active tab
    if (activeTab === 'weekday') result = result.filter(c => c.is_daytime);
    else result = result.filter(c => !c.is_daytime);
    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.region_name.toLowerCase().includes(q) ||
        c.notes?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [bailCourts, activeTab, searchQuery]);

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
      <div className="flex-shrink-0 bg-slate-950 border-b border-slate-800/50">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-white">BC Bail Hubs</h1>
        </div>
        {/* Search */}
        <div className="px-4 pb-2">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
        </div>
        {/* Schedule Tabs */}
        <div className="px-4 pb-2">
          <ScheduleTabs activeTab={activeTab} onTabChange={setActiveTab} counts={tabCounts} />
        </div>
        {/* 525 Detention Review - only on weekday */}
        {activeTab === 'weekday' && (
          <div className="px-4 pb-3">
            <button
              onClick={() => router.push('/bail/525')}
              className="w-full py-2 px-3 rounded-lg text-xs font-medium bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-800/70 hover:text-slate-200 transition-all text-left"
            >
              525 Detention Review
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {filteredCourts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <FaScaleBalanced className="w-12 h-12 text-slate-700 mb-4" />
            <p className="text-slate-400 text-center">
              {searchQuery ? `No bail hubs found for "${searchQuery}"` : 'No bail hubs available'}
            </p>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="mt-4 text-blue-400 text-sm hover:text-blue-300">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            {activeTab === 'weekday' ? (
              <WeekdayList courts={filteredCourts} onCourtClick={handleCourtClick} />
            ) : (
              <WeekendList courts={filteredCourts} onCourtClick={handleCourtClick} />
            )}
            <div className="py-4 text-center">
              <span className="text-xs text-slate-500">
                {filteredCourts.length} bail {filteredCourts.length === 1 ? 'hub' : 'hubs'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
