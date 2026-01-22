'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, MapPin, Phone, Users, Gavel, Building2, Scale, ChevronRight } from 'lucide-react';
import { useContextualSearch } from '@/hooks/useContextualSearch';
import type { ContextualResult, QuickSearchResult } from '@/lib/search/contextualSearch';

// ============================================================================
// CONTEXTUAL SEARCH BAR
// ============================================================================
// Shows search results grouped by primary entity with related items
//
// Example: Search "north van" shows:
// ┌─────────────────────────────────────────────────────────┐
// │ 🏛️ North Vancouver                                      │
// │    R2 • Vancouver Coastal                               │
// │    ────────────────────────────────────────────────────│
// │    👤 Contacts: Crown, JCM, Registry                    │
// │    📞 Cells: North Van RCMP, West Van PD                │
// │    🔗 Teams: CR 101, CR 102, CR 103                     │
// │    ⚖️ Bail: Vancouver Coastal Virtual Bail             │
// └─────────────────────────────────────────────────────────┘
// ============================================================================

interface ContextualSearchBarProps {
  onSelect?: (result: ContextualResult) => void;
  placeholder?: string;
  className?: string;
}

export function ContextualSearchBar({
  onSelect,
  placeholder = "Search courts, cells, programs...",
  className = "",
}: ContextualSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { search, quickSearch, isReady, isLoading } = useContextualSearch();
  const [results, setResults] = useState<ContextualResult[]>([]);
  const [suggestions, setSuggestions] = useState<QuickSearchResult[]>([]);

  // Search on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSuggestions([]);
      return;
    }

    // Quick search for suggestions (instant)
    const quickResults = quickSearch(query, 5);
    setSuggestions(quickResults);

    // Full contextual search (slightly delayed for complex results)
    const timeout = setTimeout(() => {
      const fullResults = search(query);
      setResults(fullResults);
    }, 100);

    return () => clearTimeout(timeout);
  }, [query, search, quickSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      onSelect?.(results[selectedIndex]);
      setQuery('');
      setIsOpen(false);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [results, selectedIndex, onSelect]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={isReady ? placeholder : "Loading search..."}
          disabled={!isReady}
          className="w-full pl-12 pr-10 py-3 rounded-xl border border-white/10 bg-white/5 
                     text-white placeholder:text-white/40 
                     focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setSuggestions([]);
              inputRef.current?.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute w-full mt-2 bg-slate-900 rounded-xl border border-white/10 
                        shadow-2xl overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
          {isLoading && (
            <div className="px-4 py-8 text-center text-white/40">
              Loading search data...
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-white/40">
              No results for "{query}"
            </div>
          )}

          {!isLoading && results.map((result, index) => (
            <ContextualResultCard
              key={`${result.primary.type}-${result.primary.item.id}`}
              result={result}
              isSelected={index === selectedIndex}
              onClick={() => {
                onSelect?.(result);
                setQuery('');
                setIsOpen(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CONTEXTUAL RESULT CARD
// ============================================================================

interface ContextualResultCardProps {
  result: ContextualResult;
  isSelected: boolean;
  onClick: () => void;
}

function ContextualResultCard({ result, isSelected, onClick }: ContextualResultCardProps) {
  const { primary, related } = result;
  
  return (
    <div
      onClick={onClick}
      className={`p-4 cursor-pointer border-b border-white/5 last:border-b-0 
                  transition-colors ${isSelected ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
    >
      {/* Primary Entity */}
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${getPrimaryBgColor(primary.type)}`}>
          {getPrimaryIcon(primary.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-white truncate">
              {primary.item.name}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60 uppercase">
              {primary.type.replace('_', ' ')}
            </span>
          </div>
          {primary.type === 'court' && primary.item.region_name && (
            <div className="text-sm text-white/50 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {primary.item.region_code} • {primary.item.region_name}
            </div>
          )}
          {primary.type === 'cell' && (
            <div className="text-sm text-white/50 mt-0.5">
              {primary.item.cell_type} • {primary.item.catchment}
            </div>
          )}
          {primary.type === 'program' && (
            <div className="text-sm text-white/50 mt-0.5">
              {primary.item.type_name} • {primary.item.location}
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-white/30" />
      </div>

      {/* Related Items Summary */}
      <div className="mt-3 pl-11 flex flex-wrap gap-2">
        {related.contacts.length > 0 && (
          <RelatedBadge 
            icon={<Users className="w-3 h-3" />}
            label={`${related.contacts.length} contacts`}
          />
        )}
        {related.cells.length > 0 && (
          <RelatedBadge 
            icon={<Phone className="w-3 h-3" />}
            label={`${related.cells.length} cells`}
          />
        )}
        {related.teamsLinks.length > 0 && (
          <RelatedBadge 
            icon={<Building2 className="w-3 h-3" />}
            label={`${related.teamsLinks.length} Teams links`}
          />
        )}
        {related.bailCourt && (
          <RelatedBadge 
            icon={<Scale className="w-3 h-3" />}
            label="Bail hub"
          />
        )}
        {related.programs.length > 0 && (
          <RelatedBadge 
            icon={<Gavel className="w-3 h-3" />}
            label={`${related.programs.length} programs`}
          />
        )}
      </div>

      {/* Contact Types Preview (if court) */}
      {primary.type === 'court' && related.contacts.length > 0 && (
        <div className="mt-2 pl-11 text-xs text-white/40">
          {getContactTypesPreview(related.contacts)}
        </div>
      )}
    </div>
  );
}

function RelatedBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 text-xs text-white/50">
      {icon}
      {label}
    </div>
  );
}

function getPrimaryIcon(type: string) {
  switch (type) {
    case 'court':
      return <Gavel className="w-4 h-4 text-blue-400" />;
    case 'cell':
      return <Phone className="w-4 h-4 text-amber-400" />;
    case 'bail_court':
      return <Scale className="w-4 h-4 text-purple-400" />;
    case 'program':
      return <Building2 className="w-4 h-4 text-green-400" />;
    default:
      return <MapPin className="w-4 h-4 text-white/50" />;
  }
}

function getPrimaryBgColor(type: string) {
  switch (type) {
    case 'court':
      return 'bg-blue-500/20';
    case 'cell':
      return 'bg-amber-500/20';
    case 'bail_court':
      return 'bg-purple-500/20';
    case 'program':
      return 'bg-green-500/20';
    default:
      return 'bg-white/10';
  }
}

function getContactTypesPreview(contacts: any[]): string {
  const roleNames = [...new Set(contacts.map(c => c.role_name).filter(Boolean))];
  if (roleNames.length <= 3) {
    return roleNames.join(', ');
  }
  return `${roleNames.slice(0, 3).join(', ')} +${roleNames.length - 3} more`;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default ContextualSearchBar;
