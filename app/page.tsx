'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Bank2, GeoAlt, Telephone, Clipboard, Check, Building, People, ShieldCheck, CameraVideo, ChevronRight, ChevronDown, EnvelopeAt } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';
import copy from 'copy-to-clipboard';

import { SearchBar, QuickSuggestions } from '@/app/components/SearchBar';
import { CourtCard, CourtCardMini, CourtHeader } from '@/app/components/CourtCard';
import { CourtContactsStack, CrownContactsStack, TopContactsPreview } from '@/app/components/ContactStack';
import { CellsList, CellsPreview } from '@/app/components/CellCard';
import { TeamsList } from '@/app/components/TeamsCard';
import { CircuitWarning } from '@/app/components/CircuitWarning';

import { useSearch, useCourtDetails } from '@/hooks/useSearch';
import type { Court } from '@/types';

// Views
type View = 'search' | 'results' | 'detail';

// Filter types for results
type ResultFilter = 'all' | 'courts' | 'contacts' | 'cells' | 'teams';

// Scroll target in detail view
type ScrollTarget = 'teams' | 'contacts' | 'cells' | 'bail' | null;

// Accordion section type
type AccordionSection = 'contacts' | 'cells' | 'teams' | 'bail' | null;

export default function Home() {
  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState('');
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ResultFilter>('all');
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget>(null);
  
  // Detail view accordion state
  const [expandedSection, setExpandedSection] = useState<AccordionSection>('contacts');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  
  const teamsRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const bailRef = useRef<HTMLDivElement>(null);
  const detailScrollRef = useRef<HTMLDivElement>(null);
  
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

  // Handle scroll for collapsing header in detail view
  useEffect(() => {
    const scrollContainer = detailScrollRef.current;
    if (!scrollContainer || view !== 'detail') return;

    const handleScroll = () => {
      setIsHeaderCollapsed(scrollContainer.scrollTop > 50);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [view]);

  // Reset state when entering detail view
  useEffect(() => {
    if (view === 'detail') {
      setIsHeaderCollapsed(false);
      setExpandedSection('contacts');
    }
  }, [view, selectedCourtId]);

  // Scroll to target section when flag is set
  useEffect(() => {
    if (scrollTarget && view === 'detail') {
      const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        teams: teamsRef,
        contacts: contactsRef,
        cells: cellsRef,
        bail: bailRef,
      };
      const ref = refs[scrollTarget];
      if (ref?.current) {
        setExpandedSection(scrollTarget as AccordionSection);
        setTimeout(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setScrollTarget(null);
        }, 150);
      }
    }
  }, [scrollTarget, view, detailTeams, detailContacts]);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0 && view === 'results') {
      clearResults();
      setView('search');
      setActiveFilter('all');
    }
  }, [view, clearResults]);

  // Handle search submit
  const handleSearchSubmit = useCallback((searchQuery?: string) => {
    const queryToSearch = searchQuery ?? query;
    if (queryToSearch.trim().length >= 2) {
      if (searchQuery) setQuery(searchQuery);
      search(queryToSearch);
      setView('results');
      setActiveFilter('all');
    }
  }, [query, search]);

  // Handle court selection
  const handleSelectCourt = useCallback((court: Court, scrollTo: ScrollTarget = null) => {
    setSelectedCourtId(court.id);
    fetchCourtDetails(court.id);
    setView('detail');
    if (scrollTo) setScrollTarget(scrollTo);
  }, [fetchCourtDetails]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (view === 'detail') {
      setView('results');
      setSelectedCourtId(null);
      setScrollTarget(null);
    } else if (view === 'results') {
      setQuery('');
      clearResults();
      setView('search');
      setActiveFilter('all');
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
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      window.open(`maps://maps.apple.com/?q=${encodedAddress}`, '_blank');
    } else if (/android/.test(userAgent)) {
      window.open(`geo:0,0?q=${encodedAddress}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
    }
  }, []);

  // Toggle accordion section
  const toggleSection = useCallback((section: AccordionSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  // Navigate to section via quick nav
  const navigateToSection = useCallback((section: AccordionSection) => {
    setExpandedSection(section);
    setScrollTarget(section as ScrollTarget);
  }, []);

  const suggestions = ['Abbotsford', 'Surrey', 'Victoria', 'Kelowna', 'Prince George'];

  const filterChips: { key: ResultFilter; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'All', icon: null, count: 0 },
    { key: 'courts', label: 'Courts', icon: <Building className="w-3.5 h-3.5" />, count: results?.courts.length || 0 },
    { key: 'contacts', label: 'Contacts', icon: <People className="w-3.5 h-3.5" />, count: results?.contacts.length || 0 },
    { key: 'cells', label: 'Cells', icon: <ShieldCheck className="w-3.5 h-3.5" />, count: results?.sheriffCells.length || 0 },
    { key: 'teams', label: 'Teams', icon: <CameraVideo className="w-3.5 h-3.5" />, count: results?.teamsLinks.length || 0 },
  ];

  const detailNavButtons = [
    { key: 'contacts', label: 'Contacts', icon: <EnvelopeAt className="w-4 h-4" />, count: detailContacts.length, show: !detailCourt?.is_circuit && detailContacts.length > 0 },
    { key: 'cells', label: 'Cells', icon: <ShieldCheck className="w-4 h-4" />, count: detailCells.length, show: detailCells.length > 0 },
    { key: 'bail', label: 'Bail', icon: <Bank2 className="w-4 h-4" />, count: detailBailCourt ? 1 : 0, show: !!detailBailCourt },
    { key: 'teams', label: 'Teams', icon: <CameraVideo className="w-4 h-4" />, count: detailTeams.length, show: detailTeams.length > 0 },
  ];

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
              <div className="mb-8 text-center">
                <Bank2 className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-white mb-2">BC Legal Reference</h1>
                <p className="text-slate-400 text-sm">Search courts, contacts, and cells</p>
              </div>
              
              <div className="w-full max-w-md">
                <SearchBar
                  value={query}
                  onChange={handleInputChange}
                  onSubmit={() => handleSearchSubmit()}
                  isLoading={isLoading}
                  autoFocus
                />
              </div>
              
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
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2 p-3">
                <button onClick={handleBack} className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex-1">
                  <SearchBar
                    value={query}
                    onChange={handleInputChange}
                    onSubmit={() => handleSearchSubmit()}
                    isLoading={isLoading}
                    onClear={() => { setQuery(''); clearResults(); setView('search'); setActiveFilter('all'); }}
                  />
                </div>
              </div>

              {results && (results.courtroomFilter || results.contactTypeLabel || results.cellTypeFilter || results.regionFilter) && (
                <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
                  {results.courtroomFilter && (
                    <span className="px-2.5 py-1 bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 text-xs rounded-full flex items-center gap-1.5">
                      <CameraVideo className="w-3 h-3" />CR {results.courtroomFilter}
                    </span>
                  )}
                  {results.contactTypeLabel && (
                    <span className="px-2.5 py-1 bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 text-xs rounded-full flex items-center gap-1.5">
                      <People className="w-3 h-3" />{results.contactTypeLabel}
                    </span>
                  )}
                  {results.cellTypeFilter && (
                    <span className="px-2.5 py-1 bg-amber-600/30 border border-amber-500/50 text-amber-300 text-xs rounded-full flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3" />{results.cellTypeFilter === 'ALL' ? 'Cells' : results.cellTypeFilter + ' Cells'}
                    </span>
                  )}
                  {results.regionFilter && (
                    <span className="px-2.5 py-1 bg-purple-600/30 border border-purple-500/50 text-purple-300 text-xs rounded-full flex items-center gap-1.5">
                      <Building className="w-3 h-3" />R{results.regionFilter}
                    </span>
                  )}
                </div>
              )}

              {results && (results.courts.length > 0 || results.contacts.length > 0 || results.sheriffCells.length > 0 || results.teamsLinks.length > 0) && (
                <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
                  {filterChips.map((chip) => {
                    if (chip.key !== 'all' && chip.count === 0) return null;
                    const isActive = activeFilter === chip.key;
                    return (
                      <button
                        key={chip.key}
                        onClick={() => setActiveFilter(chip.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                          isActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {chip.icon}
                        <span>{chip.label}</span>
                        {chip.key !== 'all' && <span className={`ml-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>{chip.count}</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 p-4 space-y-4">
              {error && <div className="text-red-400 text-center py-4">{error}</div>}
              {results && (
                <>
                  {results.courts.length === 0 && results.sheriffCells.length === 0 && (
                    <div className="text-slate-400 text-center py-8">No results found for &ldquo;{query}&rdquo;</div>
                  )}

                  {(activeFilter === 'all' || activeFilter === 'courts') && results.courts.length > 0 && (
                    <div className="space-y-2">
                      {results.courts.map((court) => (
                        <div key={court.id}>
                          <CourtCard 
                            court={court} 
                            onClick={() => handleSelectCourt(court)}
                            teamsLinkCount={activeFilter === 'all' ? results.teamsLinks.length : undefined}
                            onTeamsClick={() => handleSelectCourt(court, 'teams')}
                          />
                          {court.is_circuit && court.contact_hub_name && (
                            <div className="mt-2"><CircuitWarning courtName={court.name} hubCourtName={court.contact_hub_name} /></div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {(activeFilter === 'all' || activeFilter === 'teams') && results.courtroomFilter && results.teamsLinks.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 px-1">
                        <CameraVideo className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide">CR {results.courtroomFilter} MS Teams</h3>
                      </div>
                      <TeamsList links={results.teamsLinks} onCopyAll={() => setCopiedField('teams')} />
                    </div>
                  )}

                  {(activeFilter === 'all' || activeFilter === 'contacts') && results.courts.length > 0 && results.contacts.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1">
                        {activeFilter === 'contacts' ? 'Contacts' : 'Top Contacts'}
                      </h3>
                      {results.courts.filter(court => !court.is_circuit).map((court) => {
                        const courtContacts = results.contacts.filter(c => c.court_id === court.id);
                        if (courtContacts.length === 0) return null;
                        return (
                          <div key={court.id} className="bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-700/50">
                              <div className="flex items-center gap-2">
                                <People className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-200">
                                  {court.name.toLowerCase().includes('court') ? court.name : `${court.name} Law Courts`}
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <TopContactsPreview contacts={courtContacts} onCopy={() => setCopiedField('contact')} showAll={activeFilter === 'contacts'} />
                            </div>
                            {activeFilter === 'all' && courtContacts.length > 3 && (
                              <button
                                onClick={() => handleSelectCourt(court, 'contacts')}
                                className="w-full flex items-center justify-between px-4 py-3 border-t border-slate-700/50 text-sm text-indigo-400 hover:text-indigo-300 hover:bg-slate-800/50 transition-colors"
                              >
                                <span>View All Contacts</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(activeFilter === 'all' || activeFilter === 'cells') && results.sheriffCells.length > 0 && (
                    activeFilter === 'cells' ? <CellsList cells={results.sheriffCells} /> : <CellsPreview cells={results.sheriffCells} />
                  )}

                  {activeFilter === 'teams' && !results.courtroomFilter && results.teamsLinks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1 mb-2">MS Teams Links</h3>
                      <TeamsList links={results.teamsLinks} onCopyAll={() => setCopiedField('teams')} />
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Court Detail View - Accordion Style */}
        {view === 'detail' && detailCourt && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-screen flex flex-col"
          >
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-3 p-3">
                <button onClick={handleBack} className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <h1 className={`font-semibold text-white truncate transition-all duration-200 ${isHeaderCollapsed ? 'text-base' : 'text-lg'}`}>
                    {detailCourt.name}
                  </h1>
                  <div className={`flex flex-wrap gap-1.5 transition-all duration-200 ${isHeaderCollapsed ? 'mt-0.5' : 'mt-1.5'}`}>
                    {detailCourt.region_code && (
                      <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
                        {isHeaderCollapsed ? detailCourt.region_code : `${detailCourt.region_code} - ${detailCourt.region_name}`}
                      </span>
                    )}
                    {detailCourt.has_provincial && (
                      <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 text-xs rounded">
                        {isHeaderCollapsed ? 'PC' : 'Provincial'}
                      </span>
                    )}
                    {detailCourt.has_supreme && (
                      <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 text-xs rounded">
                        {isHeaderCollapsed ? 'SC' : 'Supreme'}
                      </span>
                    )}
                    {detailCourt.is_circuit && (
                      <span className="px-2 py-0.5 bg-amber-900/50 text-amber-300 text-xs rounded">Circuit</span>
                    )}
                  </div>
                </div>

                {detailCourt.address && (
                  <button onClick={() => handleOpenMap(detailCourt.address!)} className="p-2 text-slate-400 hover:text-white transition-colors">
                    <GeoAlt className="w-5 h-5" />
                  </button>
                )}
              </div>

              <AnimatePresence>
                {!isHeaderCollapsed && (detailCourt.phone || detailCourt.address) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-4 px-4 pb-3 text-sm">
                      {detailCourt.phone && (
                        <a href={`tel:${detailCourt.phone}`} className="flex items-center gap-1.5 text-slate-400 hover:text-white">
                          <Telephone className="w-4 h-4" /><span>{detailCourt.phone}</span>
                        </a>
                      )}
                      {detailCourt.address && (
                        <button onClick={() => handleOpenMap(detailCourt.address!)} className="flex items-center gap-1.5 text-slate-400 hover:text-white truncate">
                          <GeoAlt className="w-4 h-4 flex-shrink-0" /><span className="truncate">{detailCourt.address}</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
                {detailNavButtons.filter(btn => btn.show).map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => navigateToSection(btn.key as AccordionSection)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      expandedSection === btn.key ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {btn.icon}
                    <span>{btn.label}</span>
                    <span className={`ml-0.5 ${expandedSection === btn.key ? 'text-indigo-200' : 'text-slate-500'}`}>{btn.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div ref={detailScrollRef} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-3 pb-20">
                {detailCourt.is_circuit && detailCourt.contact_hub_name && (
                  <CircuitWarning courtName={detailCourt.name} hubCourtName={detailCourt.contact_hub_name} />
                )}

                {/* Contacts Accordion */}
                {!detailCourt.is_circuit && detailContacts.length > 0 && (
                  <div ref={contactsRef} className="rounded-xl border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => toggleSection('contacts')}
                      className={`w-full flex items-center gap-3 p-4 transition-colors ${expandedSection === 'contacts' ? 'bg-slate-800' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <EnvelopeAt className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white flex-1 text-left">Contacts</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/20 text-emerald-300">{detailContacts.length}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedSection === 'contacts' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedSection === 'contacts' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="p-4 bg-slate-900/50 border-t border-slate-700 space-y-4">
                            <CourtContactsStack contacts={detailContacts} onCopy={() => setCopiedField('contact')} />
                            <CrownContactsStack contacts={detailContacts} bailContacts={detailBailContacts} onCopy={() => setCopiedField('crown')} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Cells Accordion */}
                {detailCells.length > 0 && (
                  <div ref={cellsRef} className="rounded-xl border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => toggleSection('cells')}
                      className={`w-full flex items-center gap-3 p-4 transition-colors ${expandedSection === 'cells' ? 'bg-slate-800' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white flex-1 text-left">Sheriff Cells</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300">{detailCells.length}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedSection === 'cells' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedSection === 'cells' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                            <CellsList cells={detailCells} maxDisplay={20} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Bail Accordion */}
                {detailBailCourt && (
                  <div ref={bailRef} className="rounded-xl border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => toggleSection('bail')}
                      className={`w-full flex items-center gap-3 p-4 transition-colors ${expandedSection === 'bail' ? 'bg-slate-800' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-400">
                        <Bank2 className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white flex-1 text-left">Virtual Bail</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-teal-500/20 text-teal-300">{detailBailCourt.name}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedSection === 'bail' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedSection === 'bail' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="p-4 bg-slate-900/50 border-t border-slate-700 space-y-4">
                            {(detailBailCourt.triage_time_am || detailBailCourt.triage_time_pm) && (
                              <div className="grid grid-cols-2 gap-2">
                                {detailBailCourt.triage_time_am && (
                                  <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-slate-400 mb-1">AM Triage</div>
                                    <div className="text-sm text-slate-200">{detailBailCourt.triage_time_am}</div>
                                  </div>
                                )}
                                {detailBailCourt.triage_time_pm && (
                                  <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="text-xs text-slate-400 mb-1">PM Triage</div>
                                    <div className="text-sm text-slate-200">{detailBailCourt.triage_time_pm}</div>
                                  </div>
                                )}
                              </div>
                            )}
                            {detailBailTeams.length > 0 && (
                              <div>
                                <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Bail MS Teams</h4>
                                <TeamsList links={detailBailTeams} onCopyAll={() => setCopiedField('bailteams')} />
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Teams Accordion */}
                {detailTeams.length > 0 && (
                  <div ref={teamsRef} className="rounded-xl border border-slate-700 overflow-hidden">
                    <button
                      onClick={() => toggleSection('teams')}
                      className={`w-full flex items-center gap-3 p-4 transition-colors ${expandedSection === 'teams' ? 'bg-slate-800' : 'bg-slate-800/30 hover:bg-slate-800/50'}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <CameraVideo className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-white flex-1 text-left">MS Teams Links</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-500/20 text-indigo-300">{detailTeams.length}</span>
                      <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${expandedSection === 'teams' ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence>
                      {expandedSection === 'teams' && (
                        <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                          <div className="p-4 bg-slate-900/50 border-t border-slate-700">
                            <TeamsList links={detailTeams} onCopyAll={() => setCopiedField('teams')} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Access Code Card */}
                {detailCourt.access_code && (
                  <div 
                    className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => handleCopy(detailCourt.access_code!, 'access')}
                  >
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 mb-1">Court Access Code</div>
                      <div className="text-sm text-slate-200 font-mono">{detailCourt.access_code}</div>
                    </div>
                    {copiedField === 'access' ? <Check className="w-5 h-5 text-green-400" /> : <Clipboard className="w-5 h-5 text-slate-500" />}
                  </div>
                )}
              </div>
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

