'use client';

import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, EnvelopeAt, ShieldCheck, Bank2, CameraVideo } from 'react-bootstrap-icons';
import { cn } from '@/lib/utils';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton, Toast } from '../ui';
import { CourtHeader } from './CourtHeader';
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
}

export function CourtDetailPage({ courtDetails, onBack }: CourtDetailPageProps) {
  const { court, contacts, cells, teamsLinks, bailCourt, bailTeams, bailContacts } = courtDetails;
  
  const [expandedSection, setExpandedSection] = useState<AccordionSection>('contacts');
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
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
      // Use requestAnimationFrame to wait for DOM update after section expands
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

  const navButtons = [
    { key: 'contacts', label: 'Contacts', icon: <EnvelopeAt className="w-4 h-4" />, count: contacts.length, show: !court.is_circuit && contacts.length > 0 },
    { key: 'cells', label: 'Cells', icon: <ShieldCheck className="w-4 h-4" />, count: cells.length, show: cells.length > 0 },
    { key: 'bail', label: 'Bail', icon: <Bank2 className="w-4 h-4" />, count: '', show: !!bailCourt },
    { key: 'teams', label: 'Teams', icon: <CameraVideo className="w-4 h-4" />, count: teamsLinks.length, show: teamsLinks.length > 0 },
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <StickyHeader>
        {/* Court info section */}
        <CourtHeader court={court} collapsed={isHeaderCollapsed} />
        
        {/* Pill navigation - with top border */}
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto border-t border-slate-700/30">
          {navButtons.filter(btn => btn.show).map((btn) => (
            <PillButton 
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
      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth" onScroll={handleScroll}>
        <div className="p-3 space-y-2.5 pb-20">
          {/* Circuit court notice */}
          {court.is_circuit && court.contact_hub_name && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
              <strong>{court.name}</strong> is a circuit court. Contact information is managed by{' '}
              <strong>{court.contact_hub_name}</strong>.
            </div>
          )}

          {/* Contacts section */}
          {!court.is_circuit && contacts.length > 0 && (
            <Section
              ref={contactsRef}
              color="emerald"
              title="Contacts"
              count={contacts.length}
              isExpanded={expandedSection === 'contacts'}
              onToggle={() => toggleSection('contacts')}
            >
              <div className="p-3 space-y-3">
                <CourtContactsStack contacts={contacts} onCopy={copyToClipboard} isCopied={isCopied} />
                <CrownContactsStack contacts={contacts} bailContacts={bailContacts} onCopy={copyToClipboard} isCopied={isCopied} />
              </div>
            </Section>
          )}

          {/* Cells section */}
          {cells.length > 0 && (
            <Section
              ref={cellsRef}
              color="amber"
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
              color="teal"
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
