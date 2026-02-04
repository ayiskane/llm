'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { StickyHeader } from '@/app/components/layouts/StickyHeader';

type AccordionSection = 'faxes' | null;

interface FAQItemProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FAQItem({ title, isExpanded, onToggle, children }: FAQItemProps) {
  return (
    <div className="rounded-lg overflow-hidden bg-slate-800/30 border border-slate-700/50">
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2.5 p-3 transition-colors border-b border-slate-700/30',
          isExpanded && 'bg-slate-800/50'
        )}
      >
        <span className="flex-1 text-left text-[13px] uppercase tracking-wider text-slate-200 font-medium">
          {title}
        </span>
        <FaChevronDown
          className={cn(
            'w-4 h-4 text-slate-500 transition-transform duration-200',
            isExpanded && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="bg-slate-900/20 p-4">{children}</div>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState<AccordionSection>('faxes');

  const toggleSection = (section: AccordionSection) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
      <StickyHeader>
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-1 text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">FAQ</h1>
        </div>
      </StickyHeader>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-3">
          <FAQItem
            title="Faxes"
            isExpanded={expandedSection === 'faxes'}
            onToggle={() => toggleSection('faxes')}
          >
            <div className="space-y-4 text-sm text-slate-300">
              <div>
                <h4 className="font-medium text-slate-200 mb-2">What is a CDN Fax?</h4>
                <p className="text-slate-400">
                  CDN (Crown Disclosure Network) fax numbers are dedicated lines for receiving disclosure materials from Crown counsel.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-slate-200 mb-2">When should I use the General Fax vs CDN Fax?</h4>
                <p className="text-slate-400">
                  Use the CDN fax for disclosure-related documents. Use the general fax for all other correspondence with the correctional centre.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-200 mb-2">What if a centre doesn&apos;t accept CDN by fax?</h4>
                <p className="text-slate-400">
                  Check the e-Disclosure section for alternative methods such as hard drive or CD/DVD delivery.
                </p>
              </div>
            </div>
          </FAQItem>

          {/* Placeholder for future FAQ sections */}
          {/* 
          <FAQItem
            title="Visits"
            isExpanded={expandedSection === 'visits'}
            onToggle={() => toggleSection('visits')}
          >
            <p className="text-slate-400">Visit information coming soon.</p>
          </FAQItem>
          */}
        </div>
      </div>
    </div>
  );
}

