'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { ArrowLeft, Bank2, GeoAlt, Telephone, Building, People, ShieldCheck, CameraVideo, ChevronRight, ChevronDown, EnvelopeAt } from 'react-bootstrap-icons';
import { motion, AnimatePresence } from 'framer-motion';
import copy from 'copy-to-clipboard';

import { SearchBar, QuickSuggestions } from '@/app/components/SearchBar';
import { CourtCard } from '@/app/components/CourtCard';
import { CourtContactsStack, CrownContactsStack, TopContactsPreview } from '@/app/components/ContactStack';
import { CellsList, CellsPreview } from '@/app/components/CellCard';
import { TeamsList } from '@/app/components/TeamsCard';
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
  PageLabel,
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

  // Scroll handling for collapsing header
  useEffect(() => {
    const scrollContainer = detailScrollRef.current;
    if (!scrollContainer || view !== 'detail') return;
    const handleScroll = () => setIsHeaderCollapsed(scrollContainer.scrollTop > 50);
    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, [view]);

  // Reset state on detail view entry
  useEffect(() => {
    if (view === 'detail') {
      setIsHeaderCollapsed(false);
      setExpandedSection('contacts');
    }
  }, [view, selectedCourtId]);

  // Scroll to target section
  useEffect(() => {
    if (scrollTarget && view === 'detail') {
      const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
        teams: teamsRef, contacts: contactsRef, cells: cellsRef, bail: bailRef,
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

  const handleCopy = useCallback((text: string, fieldName?: string) => {
    copy(text);
    setCopiedField(fieldName || 'copied');
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

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
    { key: 'bail', label: 'Bail', icon: <Bank2 className="w-4 h-4" />, count: detailBailCourt ? 1 : 0, show: !!detailBailCourt },
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
                <h1 className="text-2xl font-bold text-white mb-2">BC Legal Reference</h1>
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
                      <TeamsList links={results.teamsLinks} onCopyAll={() => setCopiedField('teams')} />
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
                              <TopContactsPreview contacts={courtContacts} onCopy={() => setCopiedField('contact')} showAll={activeFilter === 'contacts'} />
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
                      <h3 className="text-xs font-medium uppercase tracking-wide px-1 mb-2" style={{ color: theme.colors.text.subtle }}>MS Teams Links</h3>
                      <TeamsList links={results.teamsLinks} onCopyAll={() => setCopiedField('teams')} />
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
            className="min-h-screen flex flex-col"
          >
            <StickyHeader>
              <div className="flex items-center justify-between p-3">
                <BackButton onClick={handleBack} />
                <PageLabel>COURT_DETAIL</PageLabel>
              </div>

              {/* Title Block */}
              <div className="px-4 pb-3" style={{ borderBottom: `1px solid ${theme.colors.border.subtle}` }}>
                <h1 className={`font-semibold text-white transition-all duration-200 ${isHeaderCollapsed ? 'text-base' : 'text-lg'}`}>
                  {getCourtDisplayName(detailCourt)}
                </h1>
                {!isHeaderCollapsed && detailCourt.address && (
                  <p className="text-xs mt-1" style={{ color: theme.colors.text.subtle }}>
                    {detailCourt.address} {detailCourt.region_code && `· ${detailCourt.region_code} ${detailCourt.region_name}`}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  {isHeaderCollapsed && detailCourt.region_code && <Tag color="blue">{detailCourt.region_code}</Tag>}
                  {detailCourt.has_provincial && <Tag color="emerald">{isHeaderCollapsed ? 'PROV' : 'PROVINCIAL'}</Tag>}
                  {detailCourt.has_supreme && <Tag color="purple">{isHeaderCollapsed ? 'SUP' : 'SUPREME'}</Tag>}
                  {detailCourt.is_circuit && <Tag color="amber">CIRCUIT</Tag>}
                </div>
              </div>

              {/* Quick Nav */}
              <div className="flex gap-2 px-3 py-2 overflow-x-auto scrollbar-hide">
                {detailNavButtons.filter(btn => btn.show).map((btn) => (
                  <PillButton key={btn.key} isActive={expandedSection === btn.key} onClick={() => navigateToSection(btn.key as AccordionSection)}>
                    {btn.icon}
                    <span>{btn.label}</span>
                    <span style={{ color: expandedSection === btn.key ? 'rgba(255,255,255,0.7)' : theme.colors.text.disabled }}>{btn.count}</span>
                  </PillButton>
                ))}
              </div>
            </StickyHeader>

            {/* Scrollable Content */}
            <div ref={detailScrollRef} className="flex-1 overflow-y-auto">
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
                      <CourtContactsStack contacts={detailContacts} onCopy={() => setCopiedField('contact')} />
                      <CrownContactsStack contacts={detailContacts} bailContacts={detailBailContacts} onCopy={() => setCopiedField('crown')} />
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
                    count={detailBailCourt.name}
                    isExpanded={expandedSection === 'bail'}
                    onToggle={() => toggleSection('bail')}
                  >
                    <div className="p-3 space-y-3">
                      {(detailBailCourt.triage_time_am || detailBailCourt.triage_time_pm) && (
                        <div className="grid grid-cols-2 gap-2">
                          {detailBailCourt.triage_time_am && (
                            <div className="p-2.5 rounded-lg" style={{ background: theme.colors.bg.item }}>
                              <div className="text-[9px] mb-1 font-mono uppercase" style={{ color: theme.colors.text.subtle }}>AM Triage</div>
                              <div className="text-sm" style={{ color: theme.colors.text.secondary }}>{detailBailCourt.triage_time_am}</div>
                            </div>
                          )}
                          {detailBailCourt.triage_time_pm && (
                            <div className="p-2.5 rounded-lg" style={{ background: theme.colors.bg.item }}>
                              <div className="text-[9px] mb-1 font-mono uppercase" style={{ color: theme.colors.text.subtle }}>PM Triage</div>
                              <div className="text-sm" style={{ color: theme.colors.text.secondary }}>{detailBailCourt.triage_time_pm}</div>
                            </div>
                          )}
                        </div>
                      )}
                      {detailBailTeams.length > 0 && (
                        <div>
                          <h4 className="text-[9px] font-mono uppercase tracking-wide mb-2" style={{ color: theme.colors.text.subtle }}>Bail MS Teams</h4>
                          <TeamsList links={detailBailTeams} onCopyAll={() => setCopiedField('bailteams')} />
                        </div>
                      )}
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
                      <TeamsList links={detailTeams} onCopyAll={() => setCopiedField('teams')} />
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
