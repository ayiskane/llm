'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPhone, FaClock, FaUsers, FaCheck, FaXmark, FaCopy, FaLocationDot, FaFax, FaPenLine } from '@/lib/icons';
import { cn, openInMaps } from '@/lib/utils';
import { StickyHeader } from '../layouts/StickyHeader';
import { Section, PillButton } from '../ui';
import { Tag } from '../ui/Tag';
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

type AccordionSection = 'contact' | 'callback' | 'visits' | null;

// =============================================================================
// COPY BUTTON COMPONENT
// =============================================================================

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-center rounded bg-slate-700/50 active:bg-slate-600/50 transition-colors",
        className
      )}
      title="Copy to clipboard"
    >
      {copied ? (
        <FaCheck className="w-4 h-4 text-green-400" />
      ) : (
        <FaCopy className="w-4 h-4 text-slate-400" />
      )}
    </button>
  );
}

// =============================================================================
// CALL BUTTON COMPONENT
// =============================================================================

function CallButton({ phone, className }: { phone: string; className?: string }) {
  const handleCall = () => {
    window.open(`tel:${phone.replace(/\D/g, '')}`, '_self');
  };

  return (
    <button
      onClick={handleCall}
      className={cn(
        "flex items-center justify-center rounded bg-green-500/20 active:bg-green-500/30 transition-colors",
        className
      )}
      title="Call"
    >
      <FaPhone className="w-4 h-4 text-green-400" />
    </button>
  );
}

// =============================================================================
// CENTRE HEADER - Matching Court Header Style
// =============================================================================

function CentreHeader({ centre, collapsed }: { centre: CorrectionalCentre; collapsed: boolean }) {
  const region = LOCATION_TO_REGION[centre.location];
  
  return (
    <div className="px-4 py-2">
      {/* Title row - always visible, changes size */}
      <div className="flex items-center gap-2">
        <h1 
          className={cn(
            'font-semibold text-white uppercase tracking-wide flex-1 truncate text-left',
            'transition-all duration-300 ease-out',
            collapsed ? 'text-sm' : 'text-lg'
          )}
        >
          {centre.name}
        </h1>
        
        {/* Tags - compact when collapsed */}
        <div className={cn(
          'flex items-center gap-1 shrink-0 transition-opacity duration-300',
          collapsed ? 'opacity-100' : 'opacity-0 hidden'
        )}>
          {centre.short_name && <Tag color="slate" size="sm">{centre.short_name}</Tag>}
          {centre.centre_type && centre.centre_type !== 'provincial' && centre.centre_type !== 'federal' && (
            <Tag color="slate" size="sm">{centre.centre_type.toUpperCase()}</Tag>
          )}
          <Tag color={centre.is_federal ? 'purple' : 'emerald'} size="sm">
            {centre.is_federal ? 'FED' : 'PROV'}
          </Tag>
        </div>
        
        {/* Map button - only in collapsed */}
        {collapsed && (
          <button
            onClick={() => centre.address && openInMaps(centre.address)}
            className="p-1.5 rounded-md bg-slate-800/50 hover:bg-slate-700/50 transition-colors shrink-0"
          >
            <FaLocationDot className="w-4 h-4 text-blue-400" />
          </button>
        )}
      </div>
      
      {/* Expandable content - uses grid for smooth height animation */}
      <div 
        className={cn(
          'grid transition-all duration-300 ease-out',
          collapsed ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr] opacity-100'
        )}
      >
        <div className="overflow-hidden text-left">
          {/* Address - explicitly left aligned */}
          {centre.address && (
            <button
              onClick={() => openInMaps(centre.address)}
              className="flex items-center justify-start gap-1 text-xs mt-1 text-slate-500 hover:text-blue-400 transition-colors text-left"
            >
              <FaLocationDot className="w-3 h-3 shrink-0" />
              <span className="text-left">{centre.address}</span>
            </button>
          )}
          
          {/* Tags row: [Short form][Women] | [Region][Provincial] */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {centre.short_name && (
              <Tag color="slate">{centre.short_name}</Tag>
            )}
            {centre.centre_type && centre.centre_type !== 'provincial' && centre.centre_type !== 'federal' && (
              <Tag color="slate">{centre.centre_type.toUpperCase()}</Tag>
            )}
            <span className="text-slate-600">|</span>
            {region && (
              <span className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                <span>{region.code}</span>
                <span className="text-slate-600">|</span>
                <span>{region.name}</span>
              </span>
            )}
            <Tag color={centre.is_federal ? 'purple' : 'emerald'}>
              {centre.is_federal ? 'FEDERAL' : 'PROVINCIAL'}
            </Tag>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CONTACT SECTION - Matching Sheriff Cells Style + GC Link
// =============================================================================

function ContactSection({ centre }: { centre: CorrectionalCentre }) {
  const phone = centre.general_phone;
  const phoneDisplay = centre.general_phone_option 
    ? `${phone} (${centre.general_phone_option})`
    : phone;

  return (
    <div className="bg-slate-900/20">
      {/* GC Link Row - if available */}
      {centre.has_bc_gc_link && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/30">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200">BC Government Calling Link</div>
            <div className="text-xs text-blue-400">Available for this centre</div>
          </div>
          <Tag color="blue" size="sm">GC LINK</Tag>
        </div>
      )}

      {/* Phone Row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/30">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <FaPhone className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-slate-200">Phone</div>
          <div className="text-xs text-blue-400 font-mono">{phoneDisplay}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton text={phone} className="w-9 h-9 rounded-lg" />
          <CallButton phone={phone} className="w-9 h-9 rounded-lg" />
        </div>
      </div>

      {/* CDN Fax Row - uses FaPenLine icon */}
      {centre.cdn_fax && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/30">
          <div className="w-10 h-10 rounded-lg bg-slate-500/20 flex items-center justify-center">
            <FaPenLine className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200">
              <Link href="/faq" className="text-slate-400 hover:text-slate-300 hover:underline">
                Fax
              </Link>
              <span className="text-slate-400"> (CDN)</span>
            </div>
            <div className="text-xs text-slate-300 font-mono">{centre.cdn_fax}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <CopyButton text={centre.cdn_fax} className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      )}

      {/* General Fax Row - uses FaFax icon */}
      {centre.general_fax && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-700/30">
          <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center">
            <FaFax className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-200 flex items-center gap-2">
              <span>
                <Link href="/faq" className="text-slate-400 hover:text-slate-300 hover:underline">
                  Fax
                </Link>
                <span className="text-slate-500"> (General)</span>
              </span>
              {/* Show CDN tag if accepts CDN but no dedicated CDN fax number */}
              {!centre.cdn_fax && centre.accepts_cdn_by_fax && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 inline-flex items-center gap-1">
                  CDN
                  <FaCheck className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
            <div className="text-xs text-slate-300 font-mono">{centre.general_fax}</div>
          </div>
          <div className="flex items-center gap-1.5">
            <CopyButton text={centre.general_fax} className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      )}

      {/* Mailing Address Box - Similar to Conference ID box */}
      {centre.mailing_address && (
        <div className="p-4">
          <div
            className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:bg-slate-800/50 transition-colors"
            onClick={() => navigator.clipboard.writeText(centre.mailing_address!)}
          >
            <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 mb-1">
              Mailing Address
            </div>
            <div className="text-sm text-slate-300 whitespace-pre-line">
              {centre.mailing_address}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// CALLBACK SECTION
// =============================================================================

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

// =============================================================================
// VISITS SECTION
// =============================================================================

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

// =============================================================================
// E-DISCLOSURE SECTION - 3-Column Table, Always Open
// =============================================================================

function EDisclosureSection({ centre }: { centre: CorrectionalCentre }) {
  const formats = [
    { label: 'USB', accepted: centre.accepts_usb },
    { label: 'Hard Drive', accepted: centre.accepts_hard_drive },
    { label: 'CD/DVD', accepted: centre.accepts_cd_dvd },
  ];

  return (
    <div className="rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50">
      {/* Header - not clickable, always open */}
      <div className="flex items-center gap-2.5 p-3 border-b border-slate-700/30 bg-slate-800/50">
        <span className="flex-1 text-left text-[13px] uppercase tracking-wider text-slate-200 font-medium">
          e-Disclosure
        </span>
      </div>
      
      {/* 3-Column Table */}
      <div className="bg-slate-900/20 p-4">
        <table className="w-full">
          <thead>
            <tr>
              {formats.map((format) => (
                <th key={format.label} className="text-center pb-2">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                    {format.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {formats.map((format) => (
                <td key={format.label} className="text-center py-2">
                  <span className={cn(
                    'inline-flex items-center justify-center w-8 h-8 rounded-full',
                    format.accepted ? 'bg-emerald-500/15' : 'bg-red-500/15'
                  )}>
                    {format.accepted ? (
                      <FaCheck className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FaXmark className="w-4 h-4 text-red-400" />
                    )}
                  </span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
        
        {centre.disclosure_notes && (
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-700/30">
            {centre.disclosure_notes}
          </p>
        )}
      </div>
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
    new Set(['contact', 'callback', 'visits'])
  );
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef<HTMLDivElement>(null);
  const visitsRef = useRef<HTMLDivElement>(null);

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
    
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });
    
    const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {
      contact: contactRef, callback: callbackRef, visits: visitsRef,
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

  const callbackCount = (centre.callback_1_start ? 1 : 0) + (centre.callback_2_start ? 1 : 0);

  const navButtons = [
    { key: 'contact', label: 'Contact', icon: <FaPhone className="w-4 h-4" />, count: '', show: true },
    { key: 'callback', label: 'Callback', icon: <FaClock className="w-4 h-4" />, count: callbackCount || '', show: true },
    { key: 'visits', label: 'Visits', icon: <FaUsers className="w-4 h-4" />, count: '', show: true },
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
        className="flex-1 min-h-0 overflow-y-auto scroll-smooth"
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

          {/* e-Disclosure Section - Always Open, No Accordion */}
          <EDisclosureSection centre={centre} />

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



