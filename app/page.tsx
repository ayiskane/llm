'use client';

import { useState, useCallback } from 'react';
import { ArrowLeft } from 'react-bootstrap-icons';
import { SearchBar, Section, Toast } from '@/app/components/ui';
import { 
  CourtCard, 
  CourtHeader, 
  ContactStack, 
  CellList, 
  TeamsList, 
  BailSectionContent,
  getBailHubTag 
} from '@/app/components/features';
import { useSearch, useCourtDetails, useCopyToClipboard, useScrollHeader } from '@/lib/hooks';
import { APP_NAME, isVBTriageLink, COURT_CONTACT_ROLE_IDS, CROWN_CONTACT_ROLE_IDS } from '@/lib/config/constants';
import { cn } from '@/lib/config/theme';
import type { Court, ViewMode } from '@/types';

export default function Home() {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  
  // Hooks
  const { query, results, search, clearSearch, hasResults, isLoadingIndex } = useSearch();
  const { data: courtDetails, isLoading: isLoadingDetails } = useCourtDetails(selectedCourtId);
  const { copiedField, copyToClipboard, isCopied } = useCopyToClipboard();
  const { scrollRef, isHeaderCollapsed, scrollToTop } = useScrollHeader();

  // Handlers
  const handleSelectCourt = useCallback((court: Court) => {
    setSelectedCourtId(court.id);
    setViewMode('detail');
    scrollToTop();
  }, [scrollToTop]);

  const handleBack = useCallback(() => {
    if (viewMode === 'detail') {
      setViewMode(hasResults ? 'results' : 'home');
      setSelectedCourtId(null);
    } else if (viewMode === 'results') {
      clearSearch();
      setViewMode('home');
    }
  }, [viewMode, hasResults, clearSearch]);

  const handleSearch = useCallback((newQuery: string) => {
    search(newQuery);
    if (newQuery.length >= 2) {
      setViewMode('results');
    } else if (newQuery.length === 0) {
      setViewMode('home');
    }
  }, [search]);

  const handleClearSearch = useCallback(() => {
    clearSearch();
    setViewMode('home');
  }, [clearSearch]);

  // Copy handler
  const handleCopy = useCallback((text: string, id: string) => {
    copyToClipboard(text, id);
  }, [copyToClipboard]);

  // Render home view
  if (viewMode === 'home') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center text-slate-100">
            {APP_NAME}
          </h1>
          <SearchBar
            value={query}
            onChange={handleSearch}
            onClear={handleClearSearch}
            autoFocus
          />
          {isLoadingIndex && (
            <p className="text-center text-sm text-slate-500">
              Loading search index...
            </p>
          )}
        </div>
      </div>
    );
  }

  // Render results view
  if (viewMode === 'results') {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50 p-3">
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <SearchBar
              value={query}
              onChange={handleSearch}
              onClear={handleClearSearch}
              compact
              className="flex-1"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 p-4 max-w-2xl mx-auto w-full">
          {results.courts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs text-slate-500 uppercase tracking-wide">
                Courts ({results.courts.length})
              </h2>
              {results.courts.map(court => (
                <CourtCard
                  key={court.id}
                  court={court}
                  onClick={() => handleSelectCourt(court)}
                />
              ))}
            </div>
          )}

          {!hasResults && query.length >= 2 && (
            <div className="text-center py-12 text-slate-500">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    );
  }

  // Render detail view
  if (viewMode === 'detail' && courtDetails) {
    const { court, contacts, cells, teamsLinks, bailCourt, bailTeams } = courtDetails;
    
    // Filter contacts by category using the helper functions
    const courtContacts = contacts.filter(c => 
      COURT_CONTACT_ROLE_IDS.includes(c.contact_role_id)
    );
    const crownContacts = contacts.filter(c => 
      CROWN_CONTACT_ROLE_IDS.includes(c.contact_role_id)
    );
    
    // Filter out VB Triage from main teams list (shown in bail section)
    const filteredTeams = teamsLinks.filter(t => !isVBTriageLink(t.name));

    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className={cn(
          'sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800/50',
          'transition-all duration-200'
        )}>
          <div className="p-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <SearchBar
                value={query}
                onChange={handleSearch}
                onClear={handleClearSearch}
                compact
                className="flex-1"
              />
            </div>
          </div>
          
          {/* Court header (collapsible) */}
          {!isHeaderCollapsed && (
            <div className="px-4 pb-4 max-w-2xl mx-auto animate-fade-in">
              <CourtHeader court={court} />
            </div>
          )}
        </div>

        {/* Content */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4"
        >
          {/* Contacts */}
          {courtContacts.length > 0 && (
            <Section title="Contacts" count={courtContacts.length} color="blue" defaultOpen>
              <ContactStack
                contacts={courtContacts}
                category="court"
                onCopy={handleCopy}
                isCopied={isCopied}
              />
            </Section>
          )}

          {/* Crown Contacts */}
          {crownContacts.length > 0 && (
            <Section title="Crown" count={crownContacts.length} color="purple">
              <ContactStack
                contacts={crownContacts}
                category="crown"
                onCopy={handleCopy}
                isCopied={isCopied}
              />
            </Section>
          )}

          {/* Cells */}
          {cells.length > 0 && (
            <Section title="Sheriff Cells" count={cells.length} color="amber">
              <CellList cells={cells} />
            </Section>
          )}

          {/* Virtual Bail */}
          {bailCourt && (
            <Section 
              title="Virtual Bail" 
              count={getBailHubTag(bailCourt.name)} 
              color="teal"
            >
              <BailSectionContent
                bailCourt={bailCourt}
                currentCourtId={court.id}
                bailTeams={bailTeams}
                courtTeams={teamsLinks}
                onCopy={handleCopy}
                isCopied={isCopied}
              />
            </Section>
          )}

          {/* Teams Links */}
          {filteredTeams.length > 0 && (
            <Section title="MS Teams" count={filteredTeams.length} color="slate">
              <TeamsList
                links={filteredTeams}
                filterVBTriage
                onCopy={handleCopy}
                isCopied={isCopied}
              />
            </Section>
          )}
        </div>

        {/* Toast */}
        <Toast 
          message="Copied to clipboard" 
          isVisible={copiedField !== null} 
        />
      </div>
    );
  }

  // Loading state
  if (isLoadingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-500">Loading...</div>
      </div>
    );
  }

  return null;
}
