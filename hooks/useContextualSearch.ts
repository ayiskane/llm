'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  initContextualSearch, 
  contextualSearch, 
  quickSearch,
  isSearchIndexReady,
  type ContextualResult,
  type QuickSearchResult,
} from '@/lib/search/contextualSearch';

// ============================================================================
// HOOK: useContextualSearch
// ============================================================================
// Loads all data once, then provides instant contextual search
// 
// Usage:
//   const { search, quickSearch, results, isReady } = useContextualSearch();
//   
//   // Full contextual search
//   const results = search('north van');
//   // results[0].primary = North Vancouver Court
//   // results[0].related.contacts = [Crown, JCM, Registry...]
//   // results[0].related.cells = [North Van RCMP, ...]
//   // results[0].related.teamsLinks = [...]
//   // results[0].related.bailContacts = [...]
//   
//   // Quick search for typeahead
//   const suggestions = quickSearch('north van');
// ============================================================================

interface UseContextualSearchReturn {
  // Search functions
  search: (query: string) => ContextualResult[];
  quickSearch: (query: string, limit?: number) => QuickSearchResult[];
  
  // Async search with debounce (for input binding)
  searchAsync: (query: string) => void;
  results: ContextualResult[];
  
  // State
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useContextualSearch(): UseContextualSearchReturn {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ContextualResult[]>([]);
  
  const supabase = createClient();
  const debounceRef = useRef<NodeJS.Timeout>();
  const initStarted = useRef(false);

  // Initialize search index on mount
  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;

    async function loadSearchIndex() {
      setIsLoading(true);
      setError(null);

      try {
        // Load all data in parallel
        const [
          { data: courts, error: courtsError },
          { data: cells, error: cellsError },
          { data: contacts, error: contactsError },
          { data: teamsLinks, error: teamsError },
          { data: bailCourts, error: bailCourtsError },
          { data: bailContacts, error: bailContactsError },
          { data: programs, error: programsError },
          { data: contactsCourts, error: ccError },
          { data: cellsCourts, error: scError },
        ] = await Promise.all([
          supabase.from('courts')
            .select('*, regions(code, name)')
            .eq('is_staffed', true),
          supabase.from('sheriff_cells').select('*'),
          supabase.from('contacts').select('*, contact_roles(name)'),
          supabase.from('teams_links').select('*'),
          supabase.from('bail_courts').select('*'),
          supabase.from('bail_contacts').select('*, contact_roles(name)'),
          supabase.from('programs')
            .select('*, program_types(code, name)')
            .eq('is_active', true),
          supabase.from('contacts_courts').select('court_id, contact_id'),
          supabase.from('sheriff_cells_courts').select('court_id, sheriff_cell_id'),
        ]);

        // Check for errors
        const errors = [
          courtsError, cellsError, contactsError, teamsError,
          bailCourtsError, bailContactsError, programsError, ccError, scError
        ].filter(Boolean);
        
        if (errors.length > 0) {
          throw new Error(errors.map(e => e?.message).join(', '));
        }

        // Enrich data with joined fields
        const enrichedCourts = (courts || []).map(c => ({
          ...c,
          region_code: c.regions?.code,
          region_name: c.regions?.name,
        }));

        const enrichedContacts = (contacts || []).map(c => ({
          ...c,
          role_name: c.contact_roles?.name,
        }));

        const enrichedBailContacts = (bailContacts || []).map(c => ({
          ...c,
          role_name: c.contact_roles?.name,
        }));

        const enrichedPrograms = (programs || []).map(p => ({
          ...p,
          type_code: p.program_types?.code,
          type_name: p.program_types?.name,
        }));

        // Initialize the search index
        initContextualSearch({
          courts: enrichedCourts,
          cells: cells || [],
          contacts: enrichedContacts,
          teamsLinks: teamsLinks || [],
          bailCourts: bailCourts || [],
          bailContacts: enrichedBailContacts,
          programs: enrichedPrograms,
          contactsCourts: contactsCourts || [],
          cellsCourts: (cellsCourts || []).map(sc => ({
            court_id: sc.court_id,
            cell_id: sc.sheriff_cell_id,
          })),
        });

        setIsReady(true);
        console.log('Search index ready:', {
          courts: enrichedCourts.length,
          cells: cells?.length,
          contacts: enrichedContacts.length,
          programs: enrichedPrograms.length,
        });
      } catch (err) {
        console.error('Failed to load search index:', err);
        setError(err instanceof Error ? err.message : 'Failed to load search data');
      } finally {
        setIsLoading(false);
      }
    }

    loadSearchIndex();
  }, [supabase]);

  // Synchronous search (instant results)
  const search = useCallback((query: string): ContextualResult[] => {
    if (!isSearchIndexReady() || query.trim().length < 2) {
      return [];
    }
    return contextualSearch(query);
  }, []);

  // Quick search for typeahead
  const quickSearchFn = useCallback((query: string, limit = 8): QuickSearchResult[] => {
    if (!isSearchIndexReady() || query.trim().length < 2) {
      return [];
    }
    return quickSearch(query, limit);
  }, []);

  // Async search with debounce (for binding to input)
  const searchAsync = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(() => {
      const searchResults = contextualSearch(query);
      setResults(searchResults);
    }, 150);
  }, []);

  return {
    search,
    quickSearch: quickSearchFn,
    searchAsync,
    results,
    isReady,
    isLoading,
    error,
  };
}

// ============================================================================
// HOOK: useQuickSearch (lightweight for typeahead only)
// ============================================================================

interface UseQuickSearchReturn {
  suggestions: QuickSearchResult[];
  search: (query: string) => void;
  clear: () => void;
  isReady: boolean;
}

export function useQuickSearch(): UseQuickSearchReturn {
  const [suggestions, setSuggestions] = useState<QuickSearchResult[]>([]);
  const { isReady } = useContextualSearch();

  const search = useCallback((query: string) => {
    if (!isSearchIndexReady() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(quickSearch(query, 8));
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
  }, []);

  return { suggestions, search, clear, isReady };
}
