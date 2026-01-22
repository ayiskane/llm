'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Bank2, GeoAlt, Telephone, Building, People, ShieldCheck, CameraVideo, ChevronRight, ChevronDown, EnvelopeAt } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';
import copy from 'copy-to-clipboard';

import { SearchBar, QuickSuggestions } from '@/app/components/SearchBar';
import { CourtCard } from '@/app/components/CourtCard';
import { CourtContactsStack, CrownContactsStack, TopContactsPreview } from '@/app/components/ContactStack';
import { CellsList, CellsPreview } from '@/app/components/CellCard';
import { TeamsList, isVBTriageLink } from '@/app/components/TeamsCard';
import { CircuitWarning } from '@/app/components/CircuitWarning';

// Shared UI Components
import {
  PageLayout,
  StickyHeader,
  Section,
  SectionDot,
  Tag,
  PillButton,
  Toast,
  BackButton,
} from '@/app/components/ui';
import { theme } from '@/lib/theme';

import { useSearch, useCourtDetails } from '@/hooks/useSearch';
import type { Court } from '@/types';

// Types
type View = 'search' | 'results' | 'detail';
type ResultFilter = 'all' | 'courts' | 'contacts' | 'cells' | 'teams';
type ScrollTarget = 'teams' | 'contacts' | 'cells' | 'bail' | null;
type AccordionSection = 'contacts' | 'cells' | 'teams' | 'bail' | null;

export default function Home() {
  const [view, setView] = useState<View>('search');
  const [query, setQuery] = useState('');
  const [selectedCourtId, setSelectedCourtId] = useState<number | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ResultFilter>('all');
  const [scrollTarget, setScrollTarget] = useState<ScrollTarget>(null);
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

  // Track last collapsed state to add hysteresis
  const lastCollapsedRef = useRef(false);

  // Scroll handler for collapsing header - with hysteresis to prevent flickering
  const handleDetailScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const wasCollapsed = lastCollapsedRef.current;
    
    // Use different thresholds for collapsing vs expanding (hysteresis)
    // Collapse when scrolling down past 80px, expand when scrolling up past 30px
    let shouldCollapse = wasCollapsed;
    if (!wasCollapsed && scrollTop > 80) {
      shouldCollapse = true;
    } else if (wasCollapsed && scrollTop < 30) {
      shouldCollapse = false;
    }
    
    if (shouldCollapse !== wasCollapsed) {
      lastCollapsedRef.current = shouldCollapse;
      setIsHeaderCollapsed(shouldCollapse);
    }
  }, []);

  // Reset state on detail view entry
  useEffect(() => {
    if (view === 'detail') {
      setIsHeaderCollapsed(false);
      lastCollapsedRef.current = false;
      setExpandedSection('contacts');
      // Reset scroll position
      if (detailScrollRef.current) {
        detailScrollRef.current.scrollTop = 0;
      }
    }
  }, [view, selectedCourtId]);

  // Scroll to target section with offset for sticky header
  useEffect(() => {
    if (scrollTarget && view === 'detail') {
      const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        teams: teamsRef, contacts: contactsRef, cells: cellsRef, bail: bailRef,
      };
      const ref = refs[scrollTarget];
      const scrollContainer = detailScrollRef.current;
      
      if (ref?.current && scrollContainer) {
        setExpandedSection(scrollTarget as AccordionSection);
        setTimeout(() => {
          const element = ref.current;
          if (element) {
            // Get element position relative to scroll container
            const containerRect = scrollContainer.getBoundingClientRect();
            const elementRect = element.getBoundingClientRect();
            const offsetTop = elementRect.top - containerRect.top + scrollContainer.scrollTop;
            
            // Scroll with offset (no extra padding needed, element should be at top of scrollable area)
            scrollContainer.scrollTo({
              top: Math.max(0, offsetTop - 10), // 10px padding from top
              behavior: 'smooth'
            });
          }
          setScrollTarget(null);
        }, 200);
      }
    }
  }, [scrollTarget, view, detailTeams, detailContacts]);

  // Handlers
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length === 0 && view === 'results') {
      clearResults();
      setView('search');
      setActiveFilter('all');
    }
  }, [view, clearResults]);

  const handleSearchSubmit = useCallback((searchQuery?: string) => {
    const queryToSearch = searchQuery ?? query;
    if (queryToSearch.trim().length >= 2) {
      if (searchQuery) setQuery(searchQuery);
      search(queryToSearch);
      setView('results');
      setActiveFilter('all');
    }
  }, [query, search]);

  const handleSelectCourt = useCallback((court: Court, scrollTo: ScrollTarget = null) => {
    setSelectedCourtId(court.id);
    fetchCourtDetails(court.id);
    setView('detail');
    if (scrollTo) setScrollTarget(scrollTo);
  }, [fetchCourtDetails]);

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

  // Helper to show toast with auto-dismiss
  const showCopiedToast = useCallback((fieldName: string = 'copied') => {
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleCopy = useCallback((text: string, fieldName?: string) => {
    copy(text);
    showCopiedToast(fieldName || 'copied');
  }, [showCopiedToast]);

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

  const toggleSection = useCallback((section: AccordionSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  const navigateToSection = useCallback((section: AccordionSection) => {
    setExpandedSection(section);
    setScrollTarget(section as ScrollTarget);
  }, []);

  const getCourtDisplayName = (court: Court) => {
    const name = court.name.toLowerCase().includes('court') ? court.name : `${court.name} Law Courts`;
    return name.toUpperCase();
  };

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
    { key: 'bail', label: 'Bail', icon: <Bank2 className="w-4 h-4" />, count: '', show: !!detailBailCourt },
    { key: 'teams', label: 'Teams', icon: <CameraVideo className="w-4 h-4" />, count: detailTeams.length, show: detailTeams.length > 0 },
  ];

  return (
    <PageLayout>
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
                <div 
                  className="w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2))', border: `1px solid ${theme.colors.border.strong}` }}
                >
                  <Bank2 className="w-7 h-7 text-blue-400" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">LLM: Legal Legends Manual</h1>
                <p className="text-sm" style={{ color: theme.colors.text.subtle }}>Search courts, contacts, and cells</p>
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
                <QuickSuggestions suggestions={suggestions} onSelect={handleSearchSubmit} />
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
            <StickyHeader>
              <div className="flex items-center gap-2 p-3">
                <button onClick={handleBack} className="p-2 -ml-1 transition-colors" style={{ color: theme.colors.text.muted }}>
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

              {/* Active Filters */}
              {results && (results.courtroomFilter || results.contactTypeLabel || results.cellTypeFilter || results.regionFilter) && (
                <div className="flex flex-wrap items-center gap-2 px-3 pb-2">
                  {results.courtroomFilter && (
                    <FilterBadge color="indigo" icon={<CameraVideo className="w-3 h-3" />}>CR {results.courtroomFilter}</FilterBadge>
                  )}
                  {results.contactTypeLabel && (
                    <FilterBadge color="emerald" icon={<People className="w-3 h-3" />}>{results.contactTypeLabel}</FilterBadge>
                  )}
                  {results.cellTypeFilter && (
                    <FilterBadge color="amber" icon={<ShieldCheck className="w-3 h-3" />}>
                      {results.cellTypeFilter === 'ALL' ? 'Cells' : results.cellTypeFilter + ' Cells'}
                    </FilterBadge>
                  )}
                  {results.regionFilter && (
                    <FilterBadge color="purple" icon={<Building className="w-3 h-3" />}>R{results.regionFilter}</FilterBadge>
                  )}
                </div>
              )}

              {/* Filter Chips */}
              {results && (results.courts.length > 0 || results.contacts.length > 0 || results.sheriffCells.length > 0 || results.teamsLinks.length > 0) && (
                <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
                  {filterChips.map((chip) => {
                    if (chip.key !== 'all' && chip.count === 0) return null;
                    return (
                      <PillButton key={chip.key} isActive={activeFilter === chip.key} onClick={() => setActiveFilter(chip.key)}>
                        {chip.icon}
                        <span>{chip.label}</span>
                        {chip.key !== 'all' && <span style={{ color: activeFilter === chip.key ? 'rgba(255,255,255,0.7)' : theme.colors.text.disabled }}>{chip.count}</span>}
                      </PillButton>
                    );
                  })}
                </div>
              )}
            </StickyHeader>

            <div className="flex-1 p-4 space-y-4">
              {error && <div className="text-red-400 text-center py-4">{error}</div>}
              {results && (
                <>
                  {results.courts.length === 0 && results.sheriffCells.length === 0 && (
                    <div className="text-center py-8" style={{ color: theme.colors.text.subtle }}>No results found for &ldquo;{query}&rdquo;</div>
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
                        <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: theme.colors.text.subtle }}>CR {results.courtroomFilter} MS Teams</h3>
                      </div>
                      <TeamsList links={results.teamsLinks} onCopyAll={() => showCopiedToast('teams')} />
                    </div>
                  )}

                  {(activeFilter === 'all' || activeFilter === 'contacts') && results.courts.length > 0 && results.contacts.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-medium uppercase tracking-wide px-1" style={{ color: theme.colors.text.subtle }}>
                        {activeFilter === 'contacts' ? 'Contacts' : 'Top Contacts'}
                      </h3>
                      {results.courts.filter(court => !court.is_circuit).map((court) => {
                        const courtContacts = results.contacts.filter(c => c.court_id === court.id);
                        if (courtContacts.length === 0) return null;
                        return (
                          <div key={court.id} className="rounded-lg overflow-hidden" style={{ background: theme.colors.bg.card, border: `1px solid ${theme.colors.border.primary}` }}>
                            <div className="px-4 py-3" style={{ borderBottom: `1px solid ${theme.colors.border.subtle}` }}>
                              <div className="flex items-center gap-2">
                                <People className="w-4 h-4" style={{ color: theme.colors.text.subtle }} />
                                <span className="text-sm font-medium" style={{ color: theme.colors.text.secondary }}>
                                  {court.name.toLowerCase().includes('court') ? court.name : `${court.name} Law Courts`}
                                </span>
                              </div>
                            </div>
                            <div className="p-3">
                              <TopContactsPreview contacts={courtContacts} onCopy={() => showCopiedToast('contact')} showAll={activeFilter === 'contacts'} />
                            </div>
                            {activeFilter === 'all' && courtContacts.length > 3 && (
                              <button
                                onClick={() => handleSelectCourt(court, 'contacts')}
                                className="w-full flex items-center justify-between px-4 py-3 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                style={{ borderTop: `1px solid ${theme.colors.border.subtle}`, background: theme.colors.bg.subtle }}
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
                      <TeamsList links={results.teamsLinks} onCopyAll={() => showCopiedToast('teams')} />
                    </div>
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
            className="h-screen flex flex-col overflow-hidden"
          >
            <StickyHeader>
              {/* Back Button + Search Bar Row */}
              <div className="flex items-center gap-2 p-3 pb-2">
                <button onClick={handleBack} className="p-2 -ml-1 transition-colors" style={{ color: theme.colors.text.muted }}>
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

              {/* Title Block - with smooth transition */}
              <div 
                className="px-4 transition-all duration-300 ease-out"
                style={{ borderBottom: `1px solid ${theme.colors.border.subtle}` }}
              >
                {isHeaderCollapsed ? (
                  /* Collapsed: Name + Tags + Address Icon in one row */
                  <div className="flex items-center gap-2 pb-2">
                    <h1 className="text-sm font-semibold text-white flex-1">
                      {getCourtDisplayName(detailCourt)}
                    </h1>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {detailCourt.has_provincial && <Tag color="emerald">PC</Tag>}
                      {detailCourt.has_supreme && <Tag color="purple">SC</Tag>}
                      {detailCourt.is_circuit && <Tag color="amber">CIR</Tag>}
                    </div>
                    {detailCourt.address && (
                      <button 
                        onClick={() => handleOpenMap(detailCourt.address!)}
                        className="p-1.5 rounded-md transition-colors flex-shrink-0"
                        style={{ background: theme.colors.bg.item }}
                      >
                        <GeoAlt className="w-4 h-4 text-blue-400" />
                      </button>
                    )}
                  </div>
                ) : (
                  /* Expanded: Full layout */
                  <div className="pb-3">
                    <h1 className="text-lg font-semibold text-white">
                      {getCourtDisplayName(detailCourt)}
                    </h1>
                    {detailCourt.address && (
                      <button 
                        onClick={() => handleOpenMap(detailCourt.address!)}
                        className="flex items-center gap-1 text-xs mt-1 hover:text-blue-400 transition-colors"
                        style={{ color: theme.colors.text.subtle }}
                      >
                        <GeoAlt className="w-3 h-3" />
                        <span>{detailCourt.address}</span>
                      </button>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      {detailCourt.region_code && (
                        <span 
                          className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase"
                          style={{ 
                            background: 'rgba(255,255,255,0.05)', 
                            border: `1px solid ${theme.colors.border.primary}`,
                            color: theme.colors.text.muted,
                            letterSpacing: '2px'
                          }}
                        >
                          <span>{detailCourt.region_code}</span>
                          <span style={{ color: theme.colors.text.disabled }}>|</span>
                          <span>{detailCourt.region_name}</span>
                        </span>
                      )}
                      {detailCourt.has_provincial && <Tag color="emerald">PROVINCIAL</Tag>}
                      {detailCourt.has_supreme && <Tag color="purple">SUPREME</Tag>}
                      {detailCourt.is_circuit && <Tag color="amber">CIRCUIT</Tag>}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Nav */}
              <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
                {detailNavButtons.filter(btn => btn.show).map((btn) => (
                  <PillButton key={btn.key} isActive={expandedSection === btn.key} onClick={() => navigateToSection(btn.key as AccordionSection)}>
                    {btn.icon}
                    <span>{btn.label}</span>
                    {btn.count !== '' && <span style={{ color: expandedSection === btn.key ? 'rgba(255,255,255,0.7)' : theme.colors.text.disabled }}>{btn.count}</span>}
                  </PillButton>
                ))}
              </div>
            </StickyHeader>

            {/* Scrollable Content */}
            <div ref={detailScrollRef} className="flex-1 overflow-y-auto" onScroll={handleDetailScroll}>
              <div className="p-3 space-y-2.5 pb-20">
                {detailCourt.is_circuit && detailCourt.contact_hub_name && (
                  <CircuitWarning courtName={detailCourt.name} hubCourtName={detailCourt.contact_hub_name} />
                )}

                {/* Contacts Section */}
                {!detailCourt.is_circuit && detailContacts.length > 0 && (
                  <Section
                    ref={contactsRef}
                    color="emerald"
                    title="Contacts"
                    count={detailContacts.length}
                    isExpanded={expandedSection === 'contacts'}
                    onToggle={() => toggleSection('contacts')}
                  >
                    <div className="p-3 space-y-3">
                      <CourtContactsStack contacts={detailContacts} onCopy={() => showCopiedToast('contact')} />
                      <CrownContactsStack contacts={detailContacts} bailContacts={detailBailContacts} onCopy={() => showCopiedToast('crown')} />
                    </div>
                  </Section>
                )}

                {/* Cells Section */}
                {detailCells.length > 0 && (
                  <Section
                    ref={cellsRef}
                    color="amber"
                    title="Sheriff Cells"
                    count={detailCells.length}
                    isExpanded={expandedSection === 'cells'}
                    onToggle={() => toggleSection('cells')}
                  >
                    <div className="p-3">
                      <CellsList cells={detailCells} maxDisplay={20} />
                    </div>
                  </Section>
                )}

                {/* Bail Section */}
                {detailBailCourt && (
                  <Section
                    ref={bailRef}
                    color="teal"
                    title="Virtual Bail"
                    count={detailBailCourt.name ? `${detailBailCourt.name.toUpperCase().replace(' VIRTUAL BAIL', '').replace('FRASER', 'ABBY')} HUB` : ''}
                    isExpanded={expandedSection === 'bail'}
                    onToggle={() => toggleSection('bail')}
                  >
                    <div className="p-3 space-y-3">
                      {/* If bail hub is different court, show link card */}
                      {detailBailCourt.court_id && detailBailCourt.court_id !== detailCourt.id && (
                        <button
                          onClick={() => {
                            if (detailBailCourt.court_id) {
                              handleSelectCourt({ id: detailBailCourt.court_id } as Court, 'bail');
                            }
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-slate-700/50"
                          style={{ background: theme.colors.bg.item, border: `1px solid ${theme.colors.border.subtle}` }}
                        >
                          <Bank2 className="w-4 h-4 text-teal-400" />
                          <span className="flex-1 text-left text-sm font-medium text-white">
                            {detailBailCourt.name.replace(' Virtual Bail', '')} Law Courts
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-500" />
                        </button>
                      )}

                      {/* Schedule Section */}
                      {(detailBailCourt.triage_time_am || detailBailCourt.triage_time_pm || detailBailCourt.court_start_am || detailBailCourt.cutoff_new_arrests) && (
                        <div className="space-y-1.5">
                          <h4 className="text-xs text-slate-500 tracking-wide">Schedule</h4>
                          
                          {/* Vertical List */}
                          <div 
                            className="rounded-lg overflow-hidden divide-y divide-slate-700"
                            style={{ background: theme.colors.bg.item, border: `1px solid ${theme.colors.border.subtle}` }}
                          >
                            {/* Triage */}
                            {(detailBailCourt.triage_time_am || detailBailCourt.triage_time_pm) && (
                              <div className="flex justify-between px-3 py-2.5">
                                <span className="text-slate-400 text-xs">Triage</span>
                                <span className="text-slate-200 text-xs font-mono">
                                  {[detailBailCourt.triage_time_am, detailBailCourt.triage_time_pm].filter(Boolean).join(' / ')}
                                </span>
                              </div>
                            )}

                            {/* Court */}
                            {(detailBailCourt.court_start_am || detailBailCourt.court_start_pm) && (
                              <div className="flex justify-between px-3 py-2.5">
                                <span className="text-slate-400 text-xs">Court</span>
                                <span className="text-slate-200 text-xs font-mono">
                                  {[detailBailCourt.court_start_am, detailBailCourt.court_start_pm].filter(Boolean).join(' / ')}
                                </span>
                              </div>
                            )}

                            {/* Cutoff */}
                            {detailBailCourt.cutoff_new_arrests && (
                              <div className="flex justify-between px-3 py-2.5">
                                <span className="text-slate-400 text-xs">Cutoff</span>
                                <span className="text-slate-200 text-xs font-mono">{detailBailCourt.cutoff_new_arrests}</span>
                              </div>
                            )}

                            {/* Youth In-Custody - from database */}
                            {detailBailCourt.youth_custody_day && detailBailCourt.youth_custody_time && (
                              <div className="flex justify-between px-3 py-2.5">
                                <span className="text-amber-400 text-xs">Youth</span>
                                <span className="text-slate-200 text-xs font-mono">{detailBailCourt.youth_custody_day} {detailBailCourt.youth_custody_time}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Combine bail teams + VB Triage links from court teams (deduplicated) */}
                      {(() => {
                        const vbTriageLinks = detailTeams.filter(isVBTriageLink);
                        // Deduplicate: only add VB Triage links that aren't already in bail teams
                        const existingIds = new Set(detailBailTeams.map(l => l.id));
                        const uniqueVbTriageLinks = vbTriageLinks.filter(l => !existingIds.has(l.id));
                        const allBailTeams = [...detailBailTeams, ...uniqueVbTriageLinks];
                        return allBailTeams.length > 0 && (
                          <div>
                            <TeamsList links={allBailTeams} onCopyAll={() => showCopiedToast('bailteams')} filterVBTriage={false} />
                          </div>
                        );
                      })()}
                    </div>
                  </Section>
                )}

                {/* Teams Section */}
                {detailTeams.length > 0 && (
                  <Section
                    ref={teamsRef}
                    color="indigo"
                    title="MS Teams Links"
                    count={detailTeams.length}
                    isExpanded={expandedSection === 'teams'}
                    onToggle={() => toggleSection('teams')}
                  >
                    <div className="p-3">
                      <TeamsList links={detailTeams} onCopyAll={() => showCopiedToast('teams')} />
                    </div>
                  </Section>
                )}

                {/* Access Code */}
                {detailCourt.access_code && (
                  <div 
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                    style={{ background: theme.colors.bg.card, border: `1px solid ${theme.colors.border.primary}` }}
                    onClick={() => handleCopy(detailCourt.access_code!, 'access')}
                  >
                    <div className="flex-1">
                      <div className="text-[9px] mb-1 font-mono uppercase" style={{ color: theme.colors.text.subtle }}>Court Access Code</div>
                      <div className="text-sm font-mono" style={{ color: theme.colors.text.secondary }}>{detailCourt.access_code}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast show={!!copiedField} />
    </PageLayout>
  );
}

// Helper component for filter badges
function FilterBadge({ color, icon, children }: { color: 'indigo' | 'emerald' | 'amber' | 'purple'; icon: React.ReactNode; children: React.ReactNode }) {
  const colors = theme.colors.section[color];
  return (
    <span 
      className="px-2.5 py-1 text-xs rounded-full flex items-center gap-1.5"
      style={{ background: colors.bg, border: `1px solid ${colors.bg}`, color: colors.text }}
    >
      {icon}{children}
    </span>
  );
}



