'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Phone, MapPin, Check, Scale, Shield, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Types
interface CellResult {
  id: number;
  name: string;
  cell_type: 'police' | 'courthouse' | 'youth' | 'justice_centre' | 'federal';
  phones: string[];
  catchment: string | null;
}

interface CourtResult {
  id: number;
  name: string;
  region_name?: string;
  address: string | null;
  phone: string | null;
  is_circuit: boolean;
}

interface SearchResults {
  cells: CellResult[];
  courts: CourtResult[];
  relatedCourts: CourtResult[];
  relatedCells: CellResult[];
}

// Main App
export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy to clipboard
  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  }, []);

  // Search function
  const handleSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults(null);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const searchTerm = `%${q}%`;

    try {
      // 1. Search cells by name or catchment
      const { data: cellsData } = await supabase
        .from('cells')
        .select('id, name, cell_type, phones, catchment')
        .or(`name.ilike.${searchTerm},catchment.ilike.${searchTerm}`)
        .order('name');

      // 2. Search courts by name
      const { data: courtsData } = await supabase
        .from('courts')
        .select('id, name, address, phone, is_circuit, region_id')
        .ilike('name', searchTerm)
        .order('name');

      // 3. Get related courts for cells (via cell_courts junction)
      const cellIds = (cellsData || []).map(c => c.id);
      let relatedCourts: CourtResult[] = [];
      
      if (cellIds.length > 0) {
        const { data: cellCourtsData } = await supabase
          .from('cell_courts')
          .select('cell_id, courts:court_id (id, name, address, phone, is_circuit, region_id)')
          .in('cell_id', cellIds);

        if (cellCourtsData) {
          const courtMap = new Map<number, CourtResult>();
          for (const cc of cellCourtsData) {
            const court = cc.courts as unknown as CourtResult;
            if (court && !courtMap.has(court.id)) {
              courtMap.set(court.id, court);
            }
          }
          relatedCourts = Array.from(courtMap.values());
        }
      }

      // 4. Get related cells for courts
      const courtIds = (courtsData || []).map(c => c.id);
      let relatedCells: CellResult[] = [];

      if (courtIds.length > 0) {
        const { data: courtCellsData } = await supabase
          .from('cell_courts')
          .select('court_id, cells:cell_id (id, name, cell_type, phones, catchment)')
          .in('court_id', courtIds);

        if (courtCellsData) {
          const cellMap = new Map<number, CellResult>();
          for (const cc of courtCellsData) {
            const cell = cc.cells as unknown as CellResult;
            if (cell && !cellMap.has(cell.id)) {
              cellMap.set(cell.id, cell);
            }
          }
          relatedCells = Array.from(cellMap.values());
        }
      }

      // 5. Get region names
      const allRegionIds = new Set<number>();
      [...(courtsData || []), ...relatedCourts].forEach((c: any) => {
        if (c.region_id) allRegionIds.add(c.region_id);
      });

      let regionMap = new Map<number, string>();
      if (allRegionIds.size > 0) {
        const { data: regionsData } = await supabase
          .from('regions')
          .select('id, name')
          .in('id', Array.from(allRegionIds));

        if (regionsData) {
          regionsData.forEach(r => regionMap.set(r.id, r.name));
        }
      }

      // Enrich courts with region names
      const enrichCourt = (court: any): CourtResult => ({
        ...court,
        region_name: regionMap.get(court.region_id),
      });

      setResults({
        cells: cellsData || [],
        courts: (courtsData || []).map(enrichCourt),
        relatedCourts: relatedCourts.map(enrichCourt),
        relatedCells: relatedCells,
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const goHome = useCallback(() => {
    setQuery('');
    setResults(null);
  }, []);

  // Show results view
  if (results) {
    return (
      <ResultsView
        query={query}
        setQuery={setQuery}
        results={results}
        loading={loading}
        copiedField={copiedField}
        onCopy={copyToClipboard}
        onBack={goHome}
      />
    );
  }

  // Home view
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
          <Scale className="w-10 h-10 text-white" />
        </div>
        
        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-2">BC Legal Directory</h1>
        <p className="text-zinc-400 text-center mb-8 max-w-xs">
          Find courts, RCMP cells, bail contacts, and more across British Columbia
        </p>
        
        {/* Search Bar */}
        <div className="w-full max-w-md">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search city, court, or RCMP..."
              className="w-full pl-12 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          
          {/* Quick search suggestions */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {['Hope', 'Surrey', 'Kelowna', 'Victoria', 'Prince George'].map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:border-zinc-700 hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom hint */}
      <div className="pb-8 text-center">
        <p className="text-zinc-600 text-sm">
          Try searching "Hope" to see RCMP → Court connections
        </p>
      </div>
    </div>
  );
}

// Results View Component
interface ResultsViewProps {
  query: string;
  setQuery: (q: string) => void;
  results: SearchResults;
  loading: boolean;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  onBack: () => void;
}

const ResultsView = memo(function ResultsView({
  query,
  setQuery,
  results,
  loading,
  copiedField,
  onCopy,
  onBack,
}: ResultsViewProps) {
  const { cells, courts, relatedCourts, relatedCells } = results;
  const totalResults = cells.length + courts.length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-500" />
            </div>
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-emerald-500 rounded-full animate-spin" />
            <span className="ml-2 text-zinc-500">Searching...</span>
          </div>
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-zinc-500">
              Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
            </p>

            {/* Cells Section */}
            {cells.length > 0 && (
              <div className="rounded-2xl border border-blue-500/30 overflow-hidden">
                <div className="px-4 py-3 bg-blue-500/10 border-b border-blue-500/30">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    <span className="font-medium text-white">Police & RCMP</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      {cells.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {cells.map(cell => (
                    <CellCard key={cell.id} cell={cell} copiedField={copiedField} onCopy={onCopy} />
                  ))}
                  
                  {relatedCourts.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        Arrests go to this court
                      </p>
                      {relatedCourts.map(court => (
                        <CourtCard key={court.id} court={court} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Courts Section */}
            {courts.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 overflow-hidden">
                <div className="px-4 py-3 bg-emerald-500/10 border-b border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium text-white">Courts</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {courts.length}
                    </span>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  {courts.map(court => (
                    <CourtCard key={court.id} court={court} />
                  ))}
                  
                  {relatedCells.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3 flex items-center gap-2">
                        <ChevronRight className="w-4 h-4" />
                        RCMP detachments serving this court
                      </p>
                      <div className="space-y-2">
                        {relatedCells.map(cell => (
                          <CellCard key={cell.id} cell={cell} copiedField={copiedField} onCopy={onCopy} compact />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* No results */}
            {totalResults === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm mt-2">Try searching for a city, court name, or RCMP detachment</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
});

// Cell Card Component
interface CellCardProps {
  cell: CellResult;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  compact?: boolean;
}

const CellCard = memo(function CellCard({ cell, copiedField, onCopy, compact }: CellCardProps) {
  const phones = cell.phones || [];

  return (
    <div className={`bg-zinc-900 rounded-xl border border-zinc-800 ${compact ? 'p-3' : 'p-4'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white">{cell.name}</h3>
          {cell.catchment && (
            <p className="text-xs text-zinc-500 mt-0.5">Serves: {cell.catchment}</p>
          )}
          {phones.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {phones.map((phone, idx) => (
                <button
                  key={idx}
                  onClick={() => onCopy(phone, `cell-${cell.id}-phone-${idx}`)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                    copiedField === `cell-${cell.id}-phone-${idx}`
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {copiedField === `cell-${cell.id}-phone-${idx}` ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Phone className="w-3 h-3" />
                  )}
                  {phone}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Court Card Component
interface CourtCardProps {
  court: CourtResult;
}

const CourtCard = memo(function CourtCard({ court }: CourtCardProps) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Building2 className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white">{court.name}</h3>
          <div className="flex items-center gap-2 mt-0.5">
            {court.region_name && (
              <span className="text-xs text-zinc-500">{court.region_name}</span>
            )}
            {court.is_circuit && (
              <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                Circuit
              </span>
            )}
          </div>
          {court.address && (
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {court.address}
            </p>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-zinc-500" />
      </div>
    </div>
  );
});
