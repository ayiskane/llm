'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { FaArrowLeft, FaAt, FaUserPoliceTie, FaBuildingColumns, FaVideo, FaChevronRight, FaMagnifyingGlass, FaXmark, FaStarJelly } from '@/lib/icons';
import { cn, text, surface, border, iconSize } from '@/lib/config/theme';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton, Toast } from '../ui';
import { CourtHeader } from './CourtHeader';
import { CircuitCourtAlert } from './CircuitCourtAlert';
import { TeamsList } from '../features/TeamsCard';
import { CourtContactsStack, CrownContactsStack } from '../features/ContactCard';
import { CellList } from '../features/CellCard';
import { JcmFxdScheduleCard } from '../features/JcmFxdCard';
import { getBailHubTag } from '@/lib/config/constants';
import { useCopyToClipboard } from '@/lib/hooks/useCopyToClipboard';
import type { CourtDetails } from '@/types';

type AccordionSection = 'contacts' | 'cells' | 'teams' | null;

interface CourtDetailPageProps {
  courtDetails: CourtDetails;
  onBack?: () => void;
  onSearch?: (query: string) => void;
  onNavigateToCourt?: (courtId: number) => void;
  onNavigateToBailHub?: (bailCourtId: number, fromName: string) => void;
}

export function CourtDetailPage({ courtDetails, onBack, onSearch, onNavigateToCourt, onNavigateToBailHub }: CourtDetailPageProps) {
  const { court, contacts, cells, teamsLinks, bailCourt, jcmFxdSchedule } = courtDetails;

  const [expandedSection, setExpandedSection] = useState<AccordionSection>('contacts');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { copiedField, copyToClipboard, isCopied } = useCopyToClipboard();

  const scrollRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
  const teamsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Close search when clicking outside or pressing Escape
  const handleSearchBlur = useCallback(() => {
    if (!searchQuery.trim()) {
      setIsSearchExpanded(false);
    }
  }, [searchQuery]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      setIsSearchExpanded(false);
    } else if (e.key === 'Enter' && searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  }, [searchQuery, onSearch]);

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
      contacts: contactsRef, cells: cellsRef, teams: teamsRef,
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

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(prev => !prev);
    // TODO: Implement favorite persistence
  }, []);

  const navButtons = [
    { key: 'contacts', label: 'Contacts', icon: <FaAt className="w-4 h-4" />, count: contacts.length, show: contacts.length > 0 },
    { key: 'cells', label: 'Cells', icon: <FaUserPoliceTie className="w-4 h-4" />, count: cells.length, show: cells.length > 0 },
    { key: 'teams', label: 'Teams', icon: <FaVideo className="w-4 h-4" />, count: teamsLinks.length, show: teamsLinks.length > 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        {/* Back button + Search/Favorite row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={onBack}
            className={cn("p-2 -ml-1 transition-colors shrink-0", text.linkSubtle)}
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>

          {/* Expandable search bar */}
          <div className={cn(
            "flex-1 flex items-center justify-end gap-1 transition-all duration-200"
          )}>
            {isSearchExpanded ? (
              <div className="flex-1 relative animate-in fade-in slide-in-from-right-2 duration-200">
                <div className={cn("absolute left-3 top-1/2 -translate-y-1/2", text.hint)}>
                  <FaMagnifyingGlass className="w-4 h-4" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={handleSearchBlur}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search courts, contacts..."
                  className={cn("w-full h-9 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl", surface.modal, border.visible.replace('border-slate-700/50', 'border-slate-700'), text.heading, "placeholder:text-slate-500")}
                />
                {searchQuery && (
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    className={cn("absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1", text.linkSubtle)}
                  >
                    <FaXmark className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className={cn("p-2 rounded-lg transition-colors", text.linkSubtle, surface.cardHover)}
              >
                <FaMagnifyingGlass className="w-5 h-5" />
              </button>
            )}

            {/* Favorite button */}
            <button
              onClick={handleFavoriteToggle}
              className={cn(
                "p-2 rounded-lg transition-colors shrink-0",
                isFavorite
                  ? "text-amber-400 hover:text-amber-300"
                  : cn(text.linkSubtle, surface.cardHover)
              )}
            >
              <FaStarJelly className={cn("w-5 h-5", isFavorite && "fill-amber-400")} />
            </button>
          </div>
        </div>
        
        {/* Court info section */}
        <CourtHeader court={court} collapsed={isHeaderCollapsed} />
        
        {/* Pill navigation - with top border */}
        <div className={cn("flex gap-1.5 px-3 py-2 border-t", border.visible.replace('border ', ''))}>
          {navButtons.filter(btn => btn.show).map((btn) => (
            <PillButton className="flex-1 justify-center"
              key={btn.key}
              isActive={expandedSection === btn.key}
              onClick={() => navigateToSection(btn.key as AccordionSection)}
            >
              {btn.icon}
              <span>{btn.label}</span>
              <span className={expandedSection === btn.key ? 'text-white/70' : text.placeholder}>
                {btn.count}
              </span>
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

          {/* Bail Hub Link */}
          {bailCourt && onNavigateToBailHub && (
            <button
              onClick={() => onNavigateToBailHub(bailCourt.id, `${court.name} Law Courts`)}
              className={cn(
                "w-full rounded-xl overflow-hidden",
                surface.card, "border border-amber-500/30",
                "hover:bg-slate-800/60 hover:border-amber-500/50",
                "active:bg-slate-700/50",
                "transition-all duration-200"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                  <FaBuildingColumns className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className={cn("text-sm font-medium", text.body)}>Virtual Bail</div>
                  <div className={cn("text-xs mt-0.5", text.placeholder)}>{getBailHubTag(bailCourt.name)} • Tap for schedule & contacts</div>
                </div>
                <FaChevronRight className={cn("w-5 h-5 shrink-0", text.placeholder)} />
              </div>
            </button>
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
                {jcmFxdSchedule && (
                  <div className="mt-3">
                    <JcmFxdScheduleCard schedule={jcmFxdSchedule} />
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Access code */}
          {court.access_code && (
            <div
              onClick={() => copyToClipboard(court.access_code!, 'access-code')}
              className={cn("p-3 rounded-lg cursor-pointer transition-colors", surface.card, border.visible, surface.cardHover)}
            >
              <div className={cn("text-[9px] font-mono uppercase tracking-wider mb-1", text.placeholder)}>
                Court Access Code
              </div>
              <div className={cn("text-sm font-mono", text.label)}>
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


