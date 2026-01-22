# Efficient Search Implementation Guide

## ✅ IMPLEMENTED: Contextual Search System

I've created a **contextual search system** that understands relationships between entities. When you search "north van", it returns:

```
┌─────────────────────────────────────────────────────────┐
│ 🏛️ North Vancouver                    [COURT]           │
│    R2 • Vancouver Coastal                               │
│    ─────────────────────────────────────────────────── │
│    👤 5 contacts  (Crown, JCM, Registry, Fed Crown)     │
│    📞 3 cells     (North Van RCMP, West Van PD, ...)    │
│    🔗 4 Teams links                                     │
│    ⚖️ Bail hub   (Vancouver Coastal Virtual Bail)       │
│    📋 2 programs                                        │
└─────────────────────────────────────────────────────────┘
```

### Files Created

| File | Purpose |
|------|---------|
| `lib/search/contextualSearch.ts` | Core search engine with alias expansion, fuzzy matching, relationship mapping |
| `hooks/useContextualSearch.ts` | React hook that loads all data and provides instant search |
| `app/components/ContextualSearchBar.tsx` | UI component with grouped results |

### How It Works

1. **Alias Expansion**: "north van" → "north vancouver"
2. **Fuzzy Match**: Finds "North Vancouver" court using Fuse.js
3. **Relationship Lookup**: Pulls all related entities via Maps:
   - `courtToContacts` → all contacts for that court
   - `courtToCells` → all cells serving that court  
   - `regionToCells` → additional cells in same region
   - `courtToTeamsLinks` → Teams links for courtrooms
   - `courtToBailCourt` → bail hub
   - `regionToBailContacts` → bail contacts for region
   - `regionToPrograms` → programs in region

### ⚠️ Required: Install Fuse.js

```bash
cd your-project
npm install fuse.js
```

### Usage

```tsx
import { useContextualSearch } from '@/hooks/useContextualSearch';
import { ContextualSearchBar } from '@/app/components/ContextualSearchBar';

// Option 1: Use the pre-built component
<ContextualSearchBar 
  onSelect={(result) => {
    console.log(result.primary);     // North Vancouver Court
    console.log(result.related);     // { contacts, cells, teamsLinks, ... }
  }}
/>

// Option 2: Use the hook directly
const { search, quickSearch, isReady } = useContextualSearch();

const results = search('north van');
// results[0].primary.item = North Vancouver Court
// results[0].related.contacts = [Crown, JCM, Registry, ...]
// results[0].related.cells = [North Van RCMP, ...]
```

### Supported Aliases

| Canonical | Aliases |
|-----------|---------|
| north vancouver | north van, n van, nvan, n. van, nv |
| abbotsford | abby, abb, abotsford, abbotford |
| new westminster | new west, newwest, nw |
| prince george | pg, prg, prince g |
| ... | (50+ aliases total) |

---

## Current State Analysis

Your app already has a solid foundation:
- **SearchParser** with intent detection, typo correction, and filter extraction
- **useSearch hook** querying Supabase with `search_courts`, `search_cells`, `search_bail_courts` RPCs
- **Alias/typo maps** for common court name variations

However, there are significant opportunities for improvement in speed, relevance, and user experience.

---

## Recommended Architecture: Hybrid Search

**Best approach for your use case: Client-side fuzzy search + Server-side full-text search**

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Query                                │
│                    "abby crown 204"                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Query Parser (existing)                       │
│  ┌────────────┬──────────────┬─────────────┬──────────────┐    │
│  │ courtTerm  │ contactType  │ courtroom   │ region       │    │
│  │ "abbotsford"│ "crown"     │ "204"       │ null         │    │
│  └────────────┴──────────────┴─────────────┴──────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   INSTANT (< 50ms)      │     │   COMPREHENSIVE         │
│   Client-Side Cache     │     │   Supabase FTS          │
│   + Fuse.js Fuzzy       │     │   (if cache miss)       │
└─────────────────────────┘     └─────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Unified Results                               │
│  Courts → Contacts → Cells → Teams Links → Bail Info            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### 1. Create a Unified Search Index (Priority: HIGH)

Your data is scattered across multiple tables. Create a **denormalized search view** combining all searchable entities:

```sql
-- Create unified search view in Supabase
CREATE OR REPLACE VIEW unified_search AS

-- Courts
SELECT 
  'court' as entity_type,
  c.id,
  c.name as primary_name,
  c.name as search_text,
  c.region_id,
  r.code as region_code,
  jsonb_build_object(
    'address', c.address,
    'phone', c.phone,
    'has_provincial', c.has_provincial,
    'has_supreme', c.has_supreme,
    'is_circuit', c.is_circuit
  ) as metadata
FROM courts c
LEFT JOIN regions r ON c.region_id = r.id
WHERE c.is_staffed = true

UNION ALL

-- Sheriff Cells (RCMP/PD)
SELECT 
  'cell' as entity_type,
  sc.id,
  sc.name as primary_name,
  sc.name || ' ' || COALESCE(sc.catchment, '') as search_text,
  sc.region_id,
  r.code as region_code,
  jsonb_build_object(
    'cell_type', sc.cell_type,
    'phones', sc.phones,
    'catchment', sc.catchment
  ) as metadata
FROM sheriff_cells sc
LEFT JOIN regions r ON sc.region_id = r.id

UNION ALL

-- Bail Courts
SELECT 
  'bail_court' as entity_type,
  bc.id,
  bc.name as primary_name,
  bc.name as search_text,
  bc.region_id,
  r.code as region_code,
  jsonb_build_object(
    'is_hybrid', bc.is_hybrid,
    'is_daytime', bc.is_daytime,
    'court_start_am', bc.court_start_am
  ) as metadata
FROM bail_courts bc
LEFT JOIN regions r ON bc.region_id = r.id

UNION ALL

-- Programs
SELECT 
  'program' as entity_type,
  p.id,
  p.name as primary_name,
  p.name || ' ' || COALESCE(p.location, '') as search_text,
  p.region_id,
  r.code as region_code,
  jsonb_build_object(
    'type', pt.name,
    'location', p.location,
    'phone', p.phone,
    'gender', p.gender,
    'indigenous_only', p.indigenous_only
  ) as metadata
FROM programs p
LEFT JOIN regions r ON p.region_id = r.id
LEFT JOIN program_types pt ON p.type_id = pt.id
WHERE p.is_active = true;

-- Add full-text search index
CREATE INDEX idx_unified_search_fts ON unified_search 
USING gin(to_tsvector('english', search_text));
```

### 2. PostgreSQL Full-Text Search Function

```sql
-- Create search RPC function
CREATE OR REPLACE FUNCTION search_all(
  search_term TEXT,
  entity_filter TEXT DEFAULT NULL,
  region_filter INTEGER DEFAULT NULL,
  result_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  entity_type TEXT,
  id INTEGER,
  primary_name TEXT,
  region_code TEXT,
  metadata JSONB,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.entity_type,
    us.id,
    us.primary_name,
    us.region_code,
    us.metadata,
    ts_rank(to_tsvector('english', us.search_text), plainto_tsquery('english', search_term)) as rank
  FROM unified_search us
  WHERE 
    to_tsvector('english', us.search_text) @@ plainto_tsquery('english', search_term)
    AND (entity_filter IS NULL OR us.entity_type = entity_filter)
    AND (region_filter IS NULL OR us.region_id = region_filter)
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;
```

### 3. Client-Side Cache + Fuse.js (Priority: HIGH)

For instant search-as-you-type, cache frequently-accessed data client-side and use Fuse.js:

```typescript
// lib/search/searchIndex.ts
import Fuse from 'fuse.js';
import type { Court, ShellCell, BailCourt, Program } from '@/types';

interface SearchableItem {
  id: number;
  type: 'court' | 'cell' | 'bail_court' | 'program';
  name: string;
  searchText: string;
  regionId: number | null;
  regionCode: string | null;
  metadata: Record<string, any>;
}

let fuseInstance: Fuse<SearchableItem> | null = null;
let searchableData: SearchableItem[] = [];

// Fuse.js configuration optimized for your data
const fuseOptions: Fuse.IFuseOptions<SearchableItem> = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'searchText', weight: 0.3 },
    { name: 'regionCode', weight: 0.1 },
  ],
  threshold: 0.35,        // Lower = stricter matching
  distance: 100,          // How far to search in the string
  minMatchCharLength: 2,
  includeScore: true,
  includeMatches: true,   // For highlighting
  ignoreLocation: true,   // Search anywhere in string
  useExtendedSearch: true,
};

export async function initSearchIndex(
  courts: Court[],
  cells: ShellCell[],
  bailCourts: BailCourt[],
  programs: Program[]
): Promise<void> {
  searchableData = [
    // Courts
    ...courts.map(c => ({
      id: c.id,
      type: 'court' as const,
      name: c.name,
      searchText: `${c.name} ${c.region_name || ''} ${c.address || ''}`,
      regionId: c.region_id,
      regionCode: c.region_code || null,
      metadata: c,
    })),
    // Cells
    ...cells.map(c => ({
      id: c.id,
      type: 'cell' as const,
      name: c.name,
      searchText: `${c.name} ${c.catchment || ''} ${c.cell_type}`,
      regionId: c.region_id,
      regionCode: null,
      metadata: c,
    })),
    // Bail Courts
    ...bailCourts.map(b => ({
      id: b.id,
      type: 'bail_court' as const,
      name: b.name,
      searchText: b.name,
      regionId: b.region_id,
      regionCode: null,
      metadata: b,
    })),
    // Programs
    ...programs.map(p => ({
      id: p.id,
      type: 'program' as const,
      name: p.name,
      searchText: `${p.name} ${p.location || ''} ${p.type_name || ''}`,
      regionId: p.region_id,
      regionCode: p.region_name || null,
      metadata: p,
    })),
  ];

  fuseInstance = new Fuse(searchableData, fuseOptions);
}

export function fuzzySearch(
  query: string,
  filters?: {
    type?: 'court' | 'cell' | 'bail_court' | 'program';
    regionId?: number;
  }
): SearchableItem[] {
  if (!fuseInstance || !query.trim()) return [];

  let results = fuseInstance.search(query);

  // Apply filters
  if (filters?.type) {
    results = results.filter(r => r.item.type === filters.type);
  }
  if (filters?.regionId) {
    results = results.filter(r => r.item.regionId === filters.regionId);
  }

  return results.map(r => r.item);
}
```

### 4. Enhanced Search Hook

```typescript
// hooks/useUnifiedSearch.ts
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { parseSearchQuery } from '@/lib/searchParser';
import { fuzzySearch, initSearchIndex } from '@/lib/search/searchIndex';
import type { Court, ShellCell, BailCourt } from '@/types';

interface UnifiedSearchResult {
  courts: Court[];
  cells: ShellCell[];
  bailCourts: BailCourt[];
  programs: any[];
  isFromCache: boolean;
}

export function useUnifiedSearch() {
  const [results, setResults] = useState<UnifiedSearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIndexReady, setIsIndexReady] = useState(false);
  const supabase = createClient();
  const debounceRef = useRef<NodeJS.Timeout>();

  // Initialize client-side search index on mount
  useEffect(() => {
    async function loadIndex() {
      const [
        { data: courts },
        { data: cells },
        { data: bailCourts },
        { data: programs }
      ] = await Promise.all([
        supabase.from('courts').select('*').eq('is_staffed', true),
        supabase.from('sheriff_cells').select('*'),
        supabase.from('bail_courts').select('*'),
        supabase.from('programs').select('*').eq('is_active', true),
      ]);

      await initSearchIndex(
        courts || [],
        cells || [],
        bailCourts || [],
        programs || []
      );
      setIsIndexReady(true);
    }
    loadIndex();
  }, []);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    // Debounce
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);

      try {
        const parsed = parseSearchQuery(query);
        
        // Try client-side fuzzy search first (instant)
        if (isIndexReady) {
          const fuzzyResults = fuzzySearch(parsed.courtTerm || query, {
            regionId: parsed.filters.region || undefined,
          });

          if (fuzzyResults.length > 0) {
            const grouped = groupByType(fuzzyResults);
            setResults({
              ...grouped,
              isFromCache: true,
            });
            setIsLoading(false);
            return;
          }
        }

        // Fallback to server-side search
        const { data, error } = await supabase.rpc('search_all', {
          search_term: parsed.courtTerm || query,
          entity_filter: parsed.filters.entityType,
          region_filter: parsed.filters.region,
        });

        if (error) throw error;

        const grouped = groupByType(data || []);
        setResults({
          ...grouped,
          isFromCache: false,
        });
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 150); // 150ms debounce
  }, [isIndexReady, supabase]);

  return { results, isLoading, search, isIndexReady };
}

function groupByType(items: any[]): Omit<UnifiedSearchResult, 'isFromCache'> {
  return {
    courts: items.filter(i => i.type === 'court').map(i => i.metadata),
    cells: items.filter(i => i.type === 'cell').map(i => i.metadata),
    bailCourts: items.filter(i => i.type === 'bail_court').map(i => i.metadata),
    programs: items.filter(i => i.type === 'program').map(i => i.metadata),
  };
}
```

---

## Additional Optimizations

### 5. Search-As-You-Type with Typeahead

```typescript
// components/SearchTypeahead.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { fuzzySearch } from '@/lib/search/searchIndex';

interface Suggestion {
  id: number;
  type: string;
  name: string;
  subtitle?: string;
}

export function SearchTypeahead({ onSelect }: { onSelect: (item: Suggestion) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Instant fuzzy search (no debounce for typeahead)
    const results = fuzzySearch(query).slice(0, 8);
    setSuggestions(results.map(r => ({
      id: r.id,
      type: r.type,
      name: r.name,
      subtitle: r.type === 'cell' 
        ? r.metadata.cell_type 
        : r.regionCode || undefined,
    })));
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelect(suggestions[selectedIndex]);
      setQuery('');
      setSuggestions([]);
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setSelectedIndex(-1);
    }
  }, [suggestions, selectedIndex, onSelect]);

  return (
    <div className="relative">
      <input
        ref={inputRef}
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search courts, cells, programs..."
        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5"
      />
      
      {suggestions.length > 0 && (
        <ul className="absolute w-full mt-1 bg-slate-900 rounded-xl border border-white/10 overflow-hidden z-50">
          {suggestions.map((s, i) => (
            <li
              key={`${s.type}-${s.id}`}
              onClick={() => {
                onSelect(s);
                setQuery('');
                setSuggestions([]);
              }}
              className={`px-4 py-3 cursor-pointer flex justify-between ${
                i === selectedIndex ? 'bg-blue-500/20' : 'hover:bg-white/5'
              }`}
            >
              <span>{s.name}</span>
              <span className="text-xs text-white/40 uppercase">{s.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### 6. Command Palette / Spotlight Search (⌘K)

For power users (lawyers love keyboard shortcuts):

```typescript
// components/CommandPalette.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Dialog } from '@headlessui/react';
import { fuzzySearch } from '@/lib/search/searchIndex';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      setResults(fuzzySearch(query).slice(0, 10));
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-start justify-center pt-[20vh]">
        <Dialog.Panel className="w-full max-w-xl bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search everything..."
            className="w-full px-6 py-4 text-lg bg-transparent border-b border-white/10"
          />
          
          <div className="max-h-96 overflow-auto">
            {results.map((item, i) => (
              <div
                key={`${item.type}-${item.id}`}
                className="px-6 py-3 hover:bg-white/5 cursor-pointer flex items-center gap-3"
              >
                <TypeIcon type={item.type} />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-white/50">{item.regionCode}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="px-6 py-3 border-t border-white/10 text-xs text-white/40">
            <kbd className="px-1 bg-white/10 rounded">↑↓</kbd> navigate
            <kbd className="px-1 bg-white/10 rounded ml-3">↵</kbd> select
            <kbd className="px-1 bg-white/10 rounded ml-3">esc</kbd> close
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
```

### 7. Offline Support with Service Worker

Critical for lawyers in courthouses with poor connectivity:

```typescript
// public/sw.js
const CACHE_NAME = 'legal-ref-v1';
const SEARCH_DATA_CACHE = 'search-data-v1';

// Cache search data for offline use
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/rest/v1/')) {
    event.respondWith(
      caches.open(SEARCH_DATA_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request));
      })
    );
  }
});
```

---

## Performance Benchmarks to Aim For

| Metric | Target | Current (estimated) |
|--------|--------|---------------------|
| First result (cache hit) | < 50ms | ~200ms |
| First result (cache miss) | < 300ms | ~500ms |
| Full page render | < 100ms | ~150ms |
| Search index size | < 500KB | N/A |
| Offline availability | 100% for cached data | 0% |

---

## Implementation Roadmap

### Phase 1: Quick Wins (1-2 days)
1. ✅ Add Fuse.js: `npm install fuse.js`
2. Create `searchIndex.ts` with client-side cache
3. Debounce search input (150-200ms)
4. Show loading skeleton during search

### Phase 2: Database Optimization (2-3 days)
1. Create unified search view in Supabase
2. Add PostgreSQL full-text search indexes
3. Create `search_all` RPC function
4. Enable pg_trgm extension for fuzzy matching

### Phase 3: UX Enhancements (2-3 days)
1. Add search typeahead/autocomplete
2. Implement ⌘K command palette
3. Add recent searches (localStorage)
4. Add favorites/bookmarks

### Phase 4: Offline & PWA (1-2 days)
1. Add service worker for offline cache
2. Configure next-pwa
3. Add "offline mode" indicator
4. Pre-cache critical search data

---

## Packages to Install

```bash
npm install fuse.js           # Fuzzy search
npm install @headlessui/react # Command palette UI
npm install next-pwa          # PWA/offline support
```

---

## Summary

The key insight is: **lawyers need speed and forgiveness**.

- **Speed**: Client-side Fuse.js gives instant results for 80% of queries
- **Forgiveness**: Fuzzy matching handles typos like "Abotsford" → "Abbotsford"
- **Offline**: PWA caching ensures the app works in courthouses with poor WiFi
- **Discoverability**: ⌘K command palette lets power users fly through the app

Start with Phase 1 (Fuse.js integration) - it's the highest impact for lowest effort.
