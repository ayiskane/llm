'use client';

import { useState, useRef, useCallback } from 'react';
import { FaArrowLeft, FaAt, FaUserPoliceTie, FaBuildingColumns, FaVideo } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton, Toast } from '../ui';
import { CourtHeader } from './CourtHeader';
import { SearchBar } from './SearchBar';
import { CircuitCourtAlert } from './CircuitCourtAlert';
import { TeamsList } from '../features/TeamsCard';
import { CourtContactsStack, CrownContactsStack } from '../features/ContactCard';
import { CellList } from '../features/CellCard';
import { BailSectionContent } from '../features/BailCard';
import { getBailHubTag } from '@/lib/config/constants';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import type { CourtDetails } from '@/types';

type AccordionSection = 'contacts' | 'cells' | 'bail' | 'teams' | null;

interface CourtDetailPageProps {
  courtDetails: CourtDetails;
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onNavigateToCourt?: (courtId: number) => void;
}

export function CourtDetailPage({ courtDetails, onBack, onSearch, onNavigateToCourt }: CourtDetailPageProps) {
  const { court, contacts, cells, teamsLinks, bailCourt, bailTeams, bailContacts, weekendBailCourts } = courtDetails;
  
  const [expandedSection, setExpandedSection] = useState<AccordionSection>('contacts');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { copiedField, copyToClipboard, isCopied } = useCopyToClipboard();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const bailRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const wasCollapsed = isHeaderCollapsed;
    
    if (!wasCollapsed && scrollTop > 80) {
      setIsHeaderCollapsed(true);
    } else if (wasCollapsed && scrollTop < 30) {
      setIsHeaderCollapsed(false);
    }
  }, [isHeaderCollapsed]);

  const navigateToSection = useCallback((section: AccordionSection) => {
    setExpandedSection(section);
    
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      contacts: contactsRef, cells: cellsRef, bail: bailRef, teams: teamsRef,
    };
    
    const ref = section ? refs[section] : null;
    
    if (ref?.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }, []);

  const toggleSection = useCallback((section: AccordionSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  const navButtons = [
    { key: 'contacts', label: 'Contacts', icon: <FaAt className="w-4 h-4" />, count: contacts.length, show: contacts.length > 0 },
    { key: 'cells', label: 'Cells', icon: <FaUserPoliceTie className="w-4 h-4" />, count: cells.length, show: cells.length > 0 },
    { key: 'bail', label: 'Bail', icon: <FaBuildingColumns className="w-4 h-4" />, count: '', show: !!bailCourt },
    { key: 'teams', label: 'Teams', icon: <FaVideo className="w-4 h-4" />, count: teamsLinks.length, show: teamsLinks.length > 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        {/* Back button + Search bar row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={onBack}
            className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            placeholder="Search courts, contacts, cells..."
            className="flex-1"
          />
        </div>
        
        {/* Court info section */}
        <CourtHeader court={court} collapsed={isHeaderCollapsed} />
        
        {/* Pill navigation - with top border */}
        <div className="flex gap-1.5 px-3 py-2 border-t border-slate-700/30">
          {navButtons.filter(btn => btn.show).map((btn) => (
            <PillButton className="flex-1 justify-center" 
              key={btn.key} 
              isActive={expandedSection === btn.key} 
              onClick={() => navigateToSection(btn.key as AccordionSection)}
            >
              {btn.icon}
              <span>{btn.label}</span>
              {btn.count !== '' && (
                <span className={expandedSection === btn.key ? 'text-white/70' : 'text-slate-500'}>
                  {btn.count}
                </span>
              )}
            </PillButton>
          ))}
        </div>
      </StickyHeader>

      {/* Scrollable content */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth" onScroll={handleScroll}>
        <div className="p-3 space-y-2.5 pb-20">
          {/* Circuit court alert - Design 4: Compact Minimal */}
          {court.is_circuit && court.contact_hub_name && (
            <CircuitCourtAlert
              hubCourtName={court.contact_hub_name}
              hubCourtId={court.contact_hub_id}
              onNavigateToHub={onNavigateToCourt}
            />
          )}

          {/* Contacts section - for circuit courts, shows hub court's contacts */}
          {contacts.length > 0 && (
            <Section
              ref={contactsRef}
              color="blue"
              title="Contacts"
              count={contacts.length}
              isExpanded={expandedSection === 'contacts'}
              onToggle={() => toggleSection('contacts')}
            >
              <div className="p-3 space-y-3">
                <CourtContactsStack contacts={contacts} onCopy={copyToClipboard} isCopied={isCopied} />
                <CrownContactsStack contacts={contacts} onCopy={copyToClipboard} isCopied={isCopied} />
              </div>
            </Section>
          )}

          {/* Cells section */}
          {cells.length > 0 && (
            <Section
              ref={cellsRef}
              color="blue"
              title="Sheriff Cells"
              count={cells.length}
              isExpanded={expandedSection === 'cells'}
              onToggle={() => toggleSection('cells')}
            >
              <div className="p-3">
                <CellList cells={cells} />
              </div>
            </Section>
          )}

          {/* Bail section */}
          {bailCourt && (
            <Section
              ref={bailRef}
              color="amber"
              title="Virtual Bail"
              count={getBailHubTag(bailCourt.name)}
              isExpanded={expandedSection === 'bail'}
              onToggle={() => toggleSection('bail')}
            >
              <div className="p-3">
                <BailSectionContent
                  bailCourt={bailCourt}
                  currentCourtId={court.id}
                  bailTeams={bailTeams}
                  courtTeams={teamsLinks}
                  contacts={contacts}
                  bailContacts={bailContacts}
                  weekendBailCourts={weekendBailCourts}
                  onNavigateToHub={onNavigateToCourt}
                  onCopy={copyToClipboard}
                  isCopied={isCopied}
                />
              </div>
            </Section>
          )}

          {/* Teams section */}
          {teamsLinks.length > 0 && (
            <Section
              ref={teamsRef}
              color="indigo"
              title="MS Teams Links"
              count={teamsLinks.length}
              isExpanded={expandedSection === 'teams'}
              onToggle={() => toggleSection('teams')}
            >
              <div className="p-3">
                <TeamsList links={teamsLinks} onCopy={copyToClipboard} isCopied={isCopied} />
              </div>
            </Section>
          )}

          {/* Access code */}
          {court.access_code && (
            <div
              onClick={() => copyToClipboard(court.access_code!, 'access-code')}
              className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                Court Access Code
              </div>
              <div className="text-sm font-mono text-slate-300">
                {court.access_code}
              </div>
            </div>
          )}
        </div>
      </div>

      <Toast message="Copied to clipboard" isVisible={!!copiedField} />
    </div>
  );
}


