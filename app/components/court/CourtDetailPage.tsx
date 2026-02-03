'use client';

// =============================================================================
// TODO: SHADCN COMPONENT REPLACEMENTS
// =============================================================================
// 3. PillButton nav (line ~117) → Tabs or ToggleGroup
// 4. Bail Hub button (line ~179) → Card clickable variant or CardListItem
// 5. Access Code card (line ~225) → Card with onClick
// 6. Toast (line ~240) → Sonner or keep custom (simple enough)
// 7. Section accordion (lines ~146, ~163, ~204) → shadcn Accordion (optional)
// TODO: PERFORMANCE OPTIMIZATIONS
// =============================================================================
// 1. navButtons array → useMemo (recreated every render)
// 2. Consider React.memo for child components
// =============================================================================

import { useState, useRef, useCallback } from 'react';
import { FaArrowLeft, FaAt, FaUserPoliceTie, FaBuildingColumns, FaVideo, FaChevronRight, FaMagnifyingGlass, FaXmark } from '@/lib/icons';
import { cn } from '@/lib/utils';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { copiedField, copyToClipboard, isCopied } = useCopyToClipboard();

  const scrollRef = useRef<HTMLDivElement>(null);
  const contactsRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<HTMLDivElement>(null);
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

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // TODO: Wrap in useMemo - recreated every render
  const navButtons = [
    { key: 'contacts', label: 'Contacts', icon: <FaAt className="w-4 h-4" />, count: contacts.length, show: contacts.length > 0 },
    { key: 'cells', label: 'Cells', icon: <FaUserPoliceTie className="w-4 h-4" />, count: cells.length, show: cells.length > 0 },
    { key: 'teams', label: 'Teams', icon: <FaVideo className="w-4 h-4" />, count: teamsLinks.length, show: teamsLinks.length > 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      <StickyHeader>
        {/* Back button + Search bar row */}
        <div className="flex items-center gap-2 px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-1 text-muted-foreground hover:text-foreground shrink-0"
          >
            <FaArrowLeft className="w-5 h-5" />
          </Button>

          <div className="relative flex-1">
            <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
            <Input
              type="text"
              variant="search"
              size="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
              placeholder="Search courts, contacts, cells..."
              className="pl-10 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <FaXmark className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Court info section */}
        <CourtHeader court={court} collapsed={isHeaderCollapsed} />

        {/* TODO: Replace PillButton with Tabs or ToggleGroup */}
        {/* Pill navigation - with top border */}
        <div className="flex gap-1.5 px-3 py-2 border-t border-border/30">
          {navButtons.filter(btn => btn.show).map((btn) => (
            <PillButton className="flex-1 justify-center"
              key={btn.key}
              isActive={expandedSection === btn.key}
              onClick={() => navigateToSection(btn.key as AccordionSection)}
            >
              {btn.icon}
              <span>{btn.label}</span>
              <span className={expandedSection === btn.key ? 'text-foreground/70' : 'text-muted-foreground'}>
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

          {/* TODO: Section could be replaced with shadcn Accordion (optional - works fine) */}
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

          {/* TODO: Replace with Card clickable variant or CardListItem */}
          {/* Bail Hub Link */}
          {bailCourt && onNavigateToBailHub && (
            <button
              onClick={() => onNavigateToBailHub(bailCourt.id, `${court.name} Law Courts`)}
              className={cn(
                "w-full rounded-xl overflow-hidden",
                "bg-secondary/40 border border-semantic-amber/30",
                "hover:bg-secondary/60 hover:border-semantic-amber/50",
                "active:bg-secondary/50",
                "transition-all duration-200"
              )}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 rounded-lg bg-semantic-amber/15 flex items-center justify-center shrink-0">
                  <FaBuildingColumns className="w-5 h-5 text-semantic-amber" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-sm font-medium text-foreground">Virtual Bail</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{getBailHubTag(bailCourt.name)} • Tap for schedule & contacts</div>
                </div>
                <FaChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
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

          {/* TODO: Replace with Card clickable variant */}
          {/* Access code */}
          {court.access_code && (
            <div
              onClick={() => copyToClipboard(court.access_code!, 'access-code')}
              className="p-3 rounded-lg bg-secondary/30 border border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                Court Access Code
              </div>
              <div className="text-sm font-mono text-foreground">
                {court.access_code}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TODO: Consider replacing with shadcn Sonner (optional - works fine) */}
      <Toast message="Copied to clipboard" isVisible={!!copiedField} />
    </div>
  );
}
