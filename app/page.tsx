'use client';

import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Scale, MapPin, Phone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import copy from 'copy-to-clipboard';

import { SearchBar, QuickSuggestions } from '@/app/components/SearchBar';
import { CourtCard, CourtCardMini, CourtHeader } from '@/app/components/CourtCard';
import { CourtContactsStack, CrownContactsStack, TopContactsPreview } from '@/app/components/ContactStack';
import { CellsList, CellsPreview } from '@/app/components/CellCard';
import { TeamsList, TeamsLinkCountCard } from '@/app/components/TeamsCard';
import { CircuitWarning } from '@/app/components/CircuitWarning';

import { useSearch, useCourtDetails } from '@/hooks/useSearch';
import type { Court } from '@/types';

// Views
type View = 'search' | 'results' | 'detail';

export default function Home() {
  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState('');
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { results, isLoading, error, search, clearResults } = useSearch();
  const { 
    court: detailCourt, 
    contacts: detailContacts, 
    sheriffCells: detailCells,
    teamsLinks: detailTeams,
    bailCourt: detailBailCourt,
    bailContacts: detailBailContacts,
    bailTeamsLinks: detailBailTeams,
    fetchCourtDetails 
  } = useCourtDetails();

  // Handle input change (just updates the query, doesn't search)
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    // If cleared, go back to search view
    if (value.trim().length === 0 && view === 'results') {
      clearResults();
      setView('search');
    }
  }, [view, clearResults]);

  // Handle search submit (triggered on Enter key or quick suggestion click)
  const handleSearchSubmit = useCallback((searchQuery?: string) => {
    const queryToSearch = searchQuery ?? query;
    if (queryToSearch.trim().length >= 2) {
      if (searchQuery) {
        setQuery(searchQuery);
      }
      search(queryToSearch);
      setView('results');
    }
  }, [query, search]);

  // Handle court selection
  const handleSelectCourt = useCallback((court: Court) => {
    setSelectedCourtId(court.id);
    fetchCourtDetails(court.id);
    setView('detail');
  }, [fetchCourtDetails]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (view === 'detail') {
      setView('results');
      setSelectedCourtId(null);
    } else if (view === 'results') {
      setQuery('');
      clearResults();
      setView('search');
    }
  }, [view, clearResults]);

  // Copy feedback
  const handleCopy = useCallback((text: string, fieldName?: string) => {
    copy(text);
    setCopiedField(fieldName || 'copied');
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  // Map app selection
  const handleOpenMap = useCallback((address: string) => {
    const encodedAddress = encodeURIComponent(address);
    
    // Try to detect platform and open appropriate map app
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      // iOS - open in Apple Maps
      window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
    } else if (/android/.test(userAgent)) {
      // Android - open in Google Maps
      window.open(`geo:0,0?q=${encodedAddress}`, '_blank');
    } else {
      // Fallback to Google Maps web
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  }, []);

  // Quick suggestions
  const suggestions = ['Abbotsford', 'Surrey', 'Victoria', 'Kelowna', 'Prince George'];

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <AnimatePresence mode="wait">
        {/* Search Home View */}
        {view === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
              {/* Logo/Title */}
              <div className="mb-8 text-center">
                <Scale className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">BC Legal Reference</h1>
                <p className="text-slate-400 text-sm">Search courts, contacts, and cells</p>
              </div>
              
              {/* Search Bar */}
              <div className="w-full max-w-md">
                <SearchBar
                  value={query}
                  onChange={handleInputChange}
                  onSubmit={() => handleSearchSubmit()}
                  isLoading={isLoading}
                  autoFocus
                />
              </div>
              
              {/* Quick Suggestions */}
              <div className="mt-6">
                <QuickSuggestions 
                  suggestions={suggestions}
                  onSelect={handleSearchSubmit}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Search Results View */}
        {view === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2 p-3">
                <button
                  onClick={handleBack}
                  className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex-1">
                  <SearchBar
                    value={query}
                    onChange={handleInputChange}
                    onSubmit={() => handleSearchSubmit()}
                    isLoading={isLoading}
                    onClear={() => {
                      setQuery('');
                      clearResults();
                      setView('search');
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 p-4 space-y-4">
              {error && (
                <div className="text-red-400 text-center py-4">{error}</div>
              )}

              {results && (
                <>
                  {/* No results */}
                  {results.courts.length === 0 && results.sheriffCells.length === 0 && (
                    <div className="text-slate-400 text-center py-8">
                      No results found for &ldquo;{query}&rdquo;
                    </div>
                  )}

                  {/* Court Card */}
                  {results.courts.length > 0 && (
                    <div className="space-y-2">
                      {results.courts.map((court) => (
                        <div key={court.id}>
                          <CourtCard 
                            court={court} 
                            onClick={() => handleSelectCourt(court)}
                          />
                          
                          {/* Circuit court warning */}
                          {court.is_circuit && court.contact_hub_name && (
                            <div className="mt-2">
                              <CircuitWarning
                                courtName={court.name}
                                hubCourtName={court.contact_hub_name}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Top Contacts Preview (only for non-circuit courts) */}
                  {results.courts.length > 0 && !results.courts[0].is_circuit && results.contacts.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1">Top Contacts</h3>
                      <TopContactsPreview 
                        contacts={results.contacts}
                        onCopy={() => setCopiedField('contact')}
                      />
                    </div>
                  )}

                  {/* Cells Preview */}
                  {results.sheriffCells.length > 0 && (
                    <CellsPreview cells={results.sheriffCells} />
                  )}

                  {/* Teams Links Count Card */}
                  {results.teamsLinks.length > 0 && (
                    <TeamsLinkCountCard
                      count={results.teamsLinks.length}
                      onClick={() => {
                        if (results.courts.length > 0) {
                          handleSelectCourt(results.courts[0]);
                        }
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Court Detail View */}
        {view === 'detail' && detailCourt && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center justify-between p-3">
                <button
                  onClick={handleBack}
                  className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex-1 text-center">
                  <h1 className="font-semibold text-white truncate px-4">{detailCourt.name}</h1>
                </div>
                
                {/* Location button */}
                {detailCourt.address && (
                  <button
                    onClick={() => handleOpenMap(detailCourt.address!)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                )}
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {detailCourt.region_code && (
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                    {detailCourt.region_code} - {detailCourt.region_name}
                  </span>
                )}
                {detailCourt.has_provincial && (
                  <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded">
                    Provincial
                  </span>
                )}
                {detailCourt.has_supreme && (
                  <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded">
                    Supreme
                  </span>
                )}
                {detailCourt.is_circuit && (
                  <span className="px-2 py-0.5 bg-amber-900/50 text-amber-300 text-xs rounded">
                    Circuit
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-6 pb-20">
              {/* Circuit Court Warning */}
              {detailCourt.is_circuit && detailCourt.contact_hub_name && (
                <CircuitWarning
                  courtName={detailCourt.name}
                  hubCourtName={detailCourt.contact_hub_name}
                />
              )}

              {/* Quick Info */}
              {(detailCourt.phone || detailCourt.fax || detailCourt.access_code) && (
                <div className="grid grid-cols-2 gap-2">
                  {detailCourt.phone && (
                    <a 
                      href={`tel:${detailCourt.phone}`}
                      className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg"
                    >
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-400">Phone</div>
                        <div className="text-sm text-slate-200">{detailCourt.phone}</div>
                      </div>
                    </a>
                  )}
                  {detailCourt.fax && (
                    <div 
                      className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg cursor-pointer"
                      onClick={() => handleCopy(detailCourt.fax!, 'fax')}
                    >
                      <div className="flex-1">
                        <div className="text-xs text-slate-400">Fax</div>
                        <div className="text-sm text-slate-200">{detailCourt.fax}</div>
                      </div>
                      {copiedField === 'fax' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  )}
                  {detailCourt.access_code && (
                    <div 
                      className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg cursor-pointer col-span-2"
                      onClick={() => handleCopy(detailCourt.access_code!, 'access')}
                    >
                      <div className="flex-1">
                        <div className="text-xs text-slate-400">Access Code</div>
                        <div className="text-sm text-slate-200 font-mono">{detailCourt.access_code}</div>
                      </div>
                      {copiedField === 'access' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Court Contacts */}
              {!detailCourt.is_circuit && detailContacts.length > 0 && (
                <CourtContactsStack 
                  contacts={detailContacts}
                  onCopy={() => setCopiedField('contact')}
                />
              )}

              {/* Crown Contacts */}
              {!detailCourt.is_circuit && detailContacts.length > 0 && (
                <CrownContactsStack
                  contacts={detailContacts}
                  bailContacts={detailBailContacts}
                  onCopy={() => setCopiedField('crown')}
                />
              )}

              {/* Cells */}
              {detailCells.length > 0 && (
                <CellsList cells={detailCells} />
              )}

              {/* Bail Info */}
              {detailBailCourt && (
                <div className="space-y-3 p-4 bg-emerald-900/10 rounded-lg border border-emerald-800/30">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-300">
                      Virtual Bail - {detailBailCourt.name}
                    </span>
                  </div>
                  
                  {(detailBailCourt.triage_time_am || detailBailCourt.triage_time_pm) && (
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {detailBailCourt.triage_time_am && (
                        <div className="p-2 bg-slate-800/50 rounded">
                          <div className="text-slate-400">AM Triage</div>
                          <div className="text-slate-200">{detailBailCourt.triage_time_am}</div>
                        </div>
                      )}
                      {detailBailCourt.triage_time_pm && (
                        <div className="p-2 bg-slate-800/50 rounded">
                          <div className="text-slate-400">PM Triage</div>
                          <div className="text-slate-200">{detailBailCourt.triage_time_pm}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* MS Teams Links */}
              {detailTeams.length > 0 && (
                <div id="teams">
                  <TeamsList 
                    links={detailTeams}
                    onCopyAll={() => setCopiedField('teams')}
                  />
                </div>
              )}

              {/* Bail Teams Links */}
              {detailBailTeams.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1 mb-1.5">Bail MS Teams</h4>
                  <TeamsList 
                    links={detailBailTeams}
                    onCopyAll={() => setCopiedField('bailteams')}
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Copy Toast */}
      <AnimatePresence>
        {copiedField && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg shadow-lg"
          >
            Copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
