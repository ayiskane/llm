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

// Type IDs from correctional_centre_types table
const CENTRE_TYPE = {
  PROVINCIAL: 1,
  FEDERAL: 2,
  YOUTH: 3,
} as const;

const REGION_CODE: Record<number, string> = { 1: 'R1', 2: 'R2', 3: 'R3', 4: 'R4', 5: 'R5' };

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
  const isFederal = centre.type_id === CENTRE_TYPE.FEDERAL;
  const isYouth = centre.type_id === CENTRE_TYPE.YOUTH;
  const regionCode = centre.region_id ? REGION_CODE[centre.region_id] : undefined;

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
          {isYouth && <Tag color="slate" size="sm">YOUTH</Tag>}
          <Tag color={isFederal ? 'purple' : 'emerald'} size="sm">
            {isFederal ? 'FED' : 'PROV'}
          </Tag>
        </div>

        {/* Map button - only in collapsed */}
        {collapsed && centre.address && (
          <button
            onClick={() => openInMaps(centre.address!)}
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
              onClick={() => openInMaps(centre.address!)}
              className="flex items-center justify-start gap-1 text-xs mt-1 text-slate-500 hover:text-blue-400 transition-colors text-left"
            >
              <FaLocationDot className="w-3 h-3 shrink-0" />
              <span className="text-left">{centre.address}</span>
            </button>
          )}

          {/* Tags row: [Short form][Youth] | [Region][Provincial/Federal] */}
          <div className="flex flex-wrap items-center justify-start gap-1.5 mt-2 pb-1">
            {centre.short_name && (
              <Tag color="slate">{centre.short_name}</Tag>
            )}
            {isYouth && (
              <Tag color="slate">YOUTH</Tag>
            )}
            <span className="text-slate-600">|</span>
            {(regionCode || centre.region_name) && (
              <span className="px-2 py-1.5 rounded text-[9px] font-mono leading-none inline-flex items-center gap-1 uppercase bg-white/5 border border-slate-700/50 text-slate-400 tracking-widest">
                {regionCode && <span>{regionCode}</span>}
                {regionCode && centre.region_name && <span className="text-slate-600">|</span>}
                {centre.region_name && <span>{centre.region_name}</span>}
              </span>
            )}
            <Tag color={isFederal ? 'purple' : 'emerald'}>
              {isFederal ? 'FEDERAL' : 'PROVINCIAL'}
            </Tag>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CONTACT SECTION - Matching Sheriff Cells Style
// =============================================================================

function ContactSection({ centre }: { centre: CorrectionalCentre }) {
  const phone = centre.general_phone;
  const phoneDisplay = centre.general_phone_option
    ? `${phone} (${centre.general_phone_option})`
    : phone;

  return (
    <div className="bg-slate-900/20">
      {/* Phone Row */}
      {phone && (
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
      )}

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
        {centre.require_padlock && (
          <Tag color="amber" size="sm">PADLOCK REQ</Tag>
        )}
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
        </div>
      </div>
    </div>
  );
}
