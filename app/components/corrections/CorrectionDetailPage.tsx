'use client';

import { useState, useRef, useCallback } from 'react';
import { FaArrowLeft, FaPhone, FaClock, FaUsers, FaFolder, FaCheck, FaXmark } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton } from '../ui';
import { SearchBar } from '../court/SearchBar';
import type { CorrectionalCentre } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

const LOCATION_TO_REGION: Record<string, { code: string; name: string }> = {
  'Victoria': { code: 'R1', name: 'Island' },
  'Nanaimo': { code: 'R1', name: 'Island' },
  'Surrey': { code: 'R3', name: 'Fraser' },
  'Port Coquitlam': { code: 'R3', name: 'Fraser' },
  'Maple Ridge': { code: 'R3', name: 'Fraser' },
  'Chilliwack': { code: 'R3', name: 'Fraser' },
  'Abbotsford': { code: 'R3', name: 'Fraser' },
  'Agassiz': { code: 'R3', name: 'Fraser' },
  'Mission': { code: 'R3', name: 'Fraser' },
  'Oliver': { code: 'R4', name: 'Interior' },
  'Kamloops': { code: 'R4', name: 'Interior' },
  'Prince George': { code: 'R5', name: 'Northern' },
};

type AccordionSection = 'contact' | 'callback' | 'visits' | 'disclosure' | null;

// =============================================================================
// CENTRE HEADER
// =============================================================================

function CentreHeader({ centre, collapsed }: { centre: CorrectionalCentre; collapsed: boolean }) {
  const region = LOCATION_TO_REGION[centre.location];
  
  if (collapsed) {
    return (
      <div className="px-4 py-2 border-t border-slate-700/30">
        <div className="flex items-center gap-2">
          {centre.short_name && (
            <span className="text-[10px] text-slate-500 font-mono">{centre.short_name}</span>
          )}
          <span className="text-sm font-medium text-white truncate">{centre.name}</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="px-4 pt-2 pb-3">
      <div className="flex items-start justify-between">
        <div>
          {centre.short_name && (
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">
              {centre.short_name}
            </p>
          )}
          <h1 className="text-xl font-bold text-white leading-tight">{centre.name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            {centre.location}
            {region && ` • ${region.code} ${region.name}`}
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 mt-3 flex-wrap">
        <span className={cn(
          'px-2 py-1 text-[10px] font-bold rounded',
          centre.is_federal 
            ? 'bg-purple-500/15 text-purple-400' 
            : 'bg-emerald-500/15 text-emerald-400'
        )}>
          {centre.is_federal ? 'FEDERAL' : 'PROVINCIAL'}
        </span>
        {centre.centre_type && centre.centre_type !== 'provincial' && centre.centre_type !== 'federal' && (
          <span className="px-2 py-1 text-[10px] font-bold rounded bg-amber-500/15 text-amber-400 uppercase">
            {centre.centre_type}
          </span>
        )}
        {centre.has_bc_gc_link && (
          <span className="px-2 py-1 text-[10px] font-bold rounded bg-blue-500/15 text-blue-400">
            GC LINK
          </span>
        )}
        {centre.security_level && (
          <span className="px-2 py-1 text-[10px] font-bold rounded bg-slate-500/15 text-slate-400 uppercase">
            {centre.security_level}
          </span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SECTION COMPONENTS
// =============================================================================

function ContactSection({ centre }: { centre: CorrectionalCentre }) {
  return (
    <div className="bg-slate-900/20 divide-y divide-slate-700/30">
      <a href={`tel:${centre.general_phone}`} className="flex justify-between px-4 py-2.5 hover:bg-slate-800/20 active:bg-slate-800/30">
        <span className="text-sm text-slate-400">General Phone</span>
        <span className="text-sm text-blue-400">
          {centre.general_phone}
          {centre.general_phone_option && (
            <span className="text-slate-500 text-xs ml-1">({centre.general_phone_option})</span>
          )}
        </span>
      </a>
      {centre.general_fax && (
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-sm text-slate-400">General Fax</span>
          <span className="text-sm text-slate-300">{centre.general_fax}</span>
        </div>
      )}
      {centre.cdn_fax && (
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-sm text-slate-400">CDN Fax</span>
          <span className={cn('text-sm', centre.accepts_cdn_by_fax ? 'text-emerald-400' : 'text-slate-300')}>
            {centre.cdn_fax}
            {centre.accepts_cdn_by_fax && ' ✓'}
          </span>
        </div>
      )}
    </div>
  );
}

function CallbackSection({ centre }: { centre: CorrectionalCentre }) {
  const hasCallback1 = centre.callback_1_start && centre.callback_1_end;
  const hasCallback2 = centre.callback_2_start && centre.callback_2_end;
  
  if (!hasCallback1 && !hasCallback2 && !centre.lawyer_callback_email) {
    return (
      <div className="bg-slate-900/20 px-4 py-4">
        <p className="text-sm text-slate-500">No callback information available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/20 divide-y divide-slate-700/30">
      {hasCallback1 && (
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-sm text-slate-400">Window 1</span>
          <span className="text-sm text-purple-400 font-mono">
            {centre.callback_1_start} – {centre.callback_1_end}
          </span>
        </div>
      )}
      {hasCallback2 && (
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-sm text-slate-400">Window 2</span>
          <span className="text-sm text-purple-400 font-mono">
            {centre.callback_2_start} – {centre.callback_2_end}
          </span>
        </div>
      )}
      {centre.lawyer_callback_email && (
        <a href={`mailto:${centre.lawyer_callback_email}`} className="flex justify-between px-4 py-2.5 hover:bg-slate-800/20 active:bg-slate-800/30">
          <span className="text-sm text-slate-400">Email</span>
          <span className="text-sm text-blue-400 truncate ml-4">{centre.lawyer_callback_email}</span>
        </a>
      )}
    </div>
  );
}

function VisitsSection({ centre }: { centre: CorrectionalCentre }) {
  const hasVisitInfo = centre.visit_hours_inperson || centre.visit_hours_virtual || 
                       centre.visit_request_phone || centre.visit_request_email;
  
  if (!hasVisitInfo) {
    return (
      <div className="bg-slate-900/20 px-4 py-4">
        <p className="text-sm text-slate-500">No visit information available</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/20 divide-y divide-slate-700/30">
      {centre.visit_hours_inperson && (
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-sm text-slate-400">In-Person</span>
          <span className="text-sm text-slate-300">{centre.visit_hours_inperson}</span>
        </div>
      )}
      {centre.visit_hours_virtual && (
        <div className="flex justify-between px-4 py-2.5">
          <span className="text-sm text-slate-400">Virtual</span>
          <span className="text-sm text-slate-300">{centre.visit_hours_virtual}</span>
        </div>
      )}
      {centre.visit_request_phone && (
        <a href={`tel:${centre.visit_request_phone}`} className="flex justify-between px-4 py-2.5 hover:bg-slate-800/20 active:bg-slate-800/30">
          <span className="text-sm text-slate-400">Request Phone</span>
          <span className="text-sm text-blue-400">{centre.visit_request_phone}</span>
        </a>
      )}
      {centre.visit_request_email && (
        <a href={`mailto:${centre.visit_request_email}`} className="flex justify-between px-4 py-2.5 hover:bg-slate-800/20 active:bg-slate-800/30">
          <span className="text-sm text-slate-400">Request Email</span>
          <span className="text-sm text-blue-400 truncate ml-4">{centre.visit_request_email}</span>
        </a>
      )}
      {centre.virtual_visit_email && centre.virtual_visit_email !== centre.visit_request_email && (
        <a href={`mailto:${centre.virtual_visit_email}`} className="flex justify-between px-4 py-2.5 hover:bg-slate-800/20 active:bg-slate-800/30">
          <span className="text-sm text-slate-400">Virtual Email</span>
          <span className="text-sm text-blue-400 truncate ml-4">{centre.virtual_visit_email}</span>
        </a>
      )}
      {centre.visit_notes && (
        <div className="px-4 py-3">
          <p className="text-xs text-slate-500">{centre.visit_notes}</p>
        </div>
      )}
    </div>
  );
}

function DisclosureSection({ centre }: { centre: CorrectionalCentre }) {
  const formats = [
    { label: 'USB', accepted: centre.accepts_usb },
    { label: 'Hard Drive', accepted: centre.accepts_hard_drive },
    { label: 'CD/DVD', accepted: centre.accepts_cd_dvd },
  ];

  return (
    <div className="bg-slate-900/20">
      <table className="w-full text-sm">
        <tbody>
          {formats.map((format, idx) => (
            <tr key={format.label} className={idx < formats.length - 1 ? 'border-b border-slate-700/30' : ''}>
              <td className="px-4 py-2.5 text-slate-400">{format.label}</td>
              <td className="px-4 py-2.5 text-right">
                <span className={cn(
                  'inline-flex items-center justify-center w-6 h-6 rounded-full',
                  format.accepted ? 'bg-emerald-500/15' : 'bg-red-500/15'
                )}>
                  {format.accepted ? (
                    <FaCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <FaXmark className="w-3.5 h-3.5 text-red-400" />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {centre.disclosure_notes && (
        <div className="px-4 py-3 border-t border-slate-700/30">
          <p className="text-xs text-slate-500">{centre.disclosure_notes}</p>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface CorrectionDetailPageProps {
  centre: CorrectionalCentre;
  onBack?: () => void;
  onSearch?: (query: string) => void;
}

export function CorrectionDetailPage({ centre, onBack, onSearch }: CorrectionDetailPageProps) {
  const [expandedSections, setExpandedSections] = useState<Set<AccordionSection>>(
    new Set(['contact', 'callback', 'visits', 'disclosure'])
  );
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<HTMLDivElement>(null);
  const visitsRef = useRef<HTMLDivElement>(null);
  const disclosureRef = useRef<HTMLDivElement>(null);

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
    if (!section) return;
    
    // Ensure section is expanded
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
    
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      contact: contactRef, callback: callbackRef, visits: visitsRef, disclosure: disclosureRef,
    };
    
    const ref = refs[section];
    
    if (ref?.current) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      });
    }
  }, []);

  const toggleSection = useCallback((section: AccordionSection) => {
    if (!section) return;
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim());
    }
  };

  // Count callback windows
  const callbackCount = (centre.callback_1_start ? 1 : 0) + (centre.callback_2_start ? 1 : 0);

  const navButtons = [
    { key: 'contact', label: 'Contact', icon: <FaPhone className="w-4 h-4" />, count: '', show: true },
    { key: 'callback', label: 'Callback', icon: <FaClock className="w-4 h-4" />, count: callbackCount || '', show: true },
    { key: 'visits', label: 'Visits', icon: <FaUsers className="w-4 h-4" />, count: '', show: true },
    { key: 'disclosure', label: 'Disclosure', icon: <FaFolder className="w-4 h-4" />, count: '', show: true },
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
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
            placeholder="Search centres..."
            className="flex-1"
          />
        </div>
        
        {/* Centre header */}
        <CentreHeader centre={centre} collapsed={isHeaderCollapsed} />
        
        {/* Pill navigation */}
        <div className="flex gap-1.5 px-3 py-2 border-t border-slate-700/30">
          {navButtons.filter(btn => btn.show).map((btn) => (
            <PillButton 
              className="flex-1 justify-center" 
              key={btn.key} 
              isActive={expandedSections.has(btn.key as AccordionSection)} 
              onClick={() => navigateToSection(btn.key as AccordionSection)}
            >
              {btn.icon}
              <span>{btn.label}</span>
              {btn.count !== '' && (
                <span className={expandedSections.has(btn.key as AccordionSection) ? 'text-white/70' : 'text-slate-500'}>
                  {btn.count}
                </span>
              )}
            </PillButton>
          ))}
        </div>
      </StickyHeader>

      {/* Scrollable Content */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="p-3 space-y-2.5 pb-20">
          {/* Contact Section */}
          <Section
            ref={contactRef}
            title="Contact"
            color="blue"
            isExpanded={expandedSections.has('contact')}
            onToggle={() => toggleSection('contact')}
          >
            <ContactSection centre={centre} />
          </Section>

          {/* Callback Section */}
          <Section
            ref={callbackRef}
            title="Lawyer Callback"
            count={callbackCount || undefined}
            color="purple"
            isExpanded={expandedSections.has('callback')}
            onToggle={() => toggleSection('callback')}
          >
            <CallbackSection centre={centre} />
          </Section>

          {/* Visits Section */}
          <Section
            ref={visitsRef}
            title="Visits"
            color="amber"
            isExpanded={expandedSections.has('visits')}
            onToggle={() => toggleSection('visits')}
          >
            <VisitsSection centre={centre} />
          </Section>

          {/* Disclosure Section */}
          <Section
            ref={disclosureRef}
            title="Disclosure"
            color="cyan"
            isExpanded={expandedSections.has('disclosure')}
            onToggle={() => toggleSection('disclosure')}
          >
            <DisclosureSection centre={centre} />
          </Section>

          {/* Notes */}
          {centre.notes && (
            <div className="rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50 p-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes</h3>
              <p className="text-sm text-slate-400">{centre.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
