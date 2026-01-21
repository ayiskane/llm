'use client';

import { use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { 
  ArrowLeft, 
  Telephone, 
  Envelope, 
  Clock, 
  Clipboard, 
  Check,
  HddFill,
  UsbDrive,
  Disc,
  XCircle,
  CheckCircle,
  People,
  GeoAlt,
  Building
} from 'react-bootstrap-icons';
import { useState, useCallback } from 'react';
import copy from 'copy-to-clipboard';

import { 
  ALL_CORRECTIONAL_CENTRES,
  CENTRE_TYPE_LABELS,
  SECURITY_LEVEL_LABELS,
  type CorrectionalCentre 
} from '@/lib/constants/correctional-centres';

interface PageProps {
  params: Promise<{ shortName: string }>;
}

// Copy button component
function CopyButton({ value, field, copiedField, onCopy }: {
  value: string;
  field: string;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
}) {
  const isCopied = copiedField === field;
  return (
    <button onClick={() => onCopy(value, field)} className="p-1 hover:bg-zinc-800 rounded">
      {isCopied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Clipboard className="w-4 h-4 text-zinc-500" />
      )}
    </button>
  );
}

// Section component
function Section({ title, children, color = 'zinc' }: { 
  title: string; 
  children: React.ReactNode;
  color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'zinc';
}) {
  const colorClasses = {
    emerald: 'border-emerald-500/30',
    blue: 'border-blue-500/30',
    amber: 'border-amber-500/30',
    purple: 'border-purple-500/30',
    zinc: 'border-zinc-800',
  };
  
  return (
    <div className={`bg-zinc-900 border ${colorClasses[color]} rounded-xl p-4`}>
      <h2 className="text-sm font-medium text-zinc-400 mb-3">{title}</h2>
      {children}
    </div>
  );
}

// Contact row component
function ContactRow({ label, value, copyField, copiedField, onCopy, subtext }: {
  label: string;
  value: string;
  copyField: string;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
  subtext?: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
      <div>
        <span className="text-zinc-500 text-sm">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-white font-mono">{value}</span>
          {subtext && <span className="text-zinc-600 text-sm">{subtext}</span>}
        </div>
      </div>
      <CopyButton value={value} field={copyField} copiedField={copiedField} onCopy={onCopy} />
    </div>
  );
}

export default function CentreDetailPage({ params }: PageProps) {
  const { shortName } = use(params);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Find centre (case insensitive)
  const centre = ALL_CORRECTIONAL_CENTRES.find(
    c => c.shortName.toLowerCase() === shortName.toLowerCase()
  );

  if (!centre) {
    notFound();
  }

  const handleCopy = useCallback((text: string, field: string) => {
    copy(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const typeLabel = CENTRE_TYPE_LABELS[centre.centreType] || centre.centreType;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link 
              href="/correctional-centres" 
              className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold">{centre.shortName}</h1>
              <p className="text-xs text-zinc-500">{centre.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Overview */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs px-2 py-1 rounded ${
            centre.isFederal 
              ? 'bg-purple-500/20 text-purple-400' 
              : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {centre.isFederal ? 'Federal' : 'Provincial'}
          </span>
          <span className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400">
            {typeLabel}
          </span>
          {centre.securityLevel && (
            <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
              {SECURITY_LEVEL_LABELS[centre.securityLevel]}
            </span>
          )}
          <span className="text-xs text-zinc-500 flex items-center gap-1">
            <GeoAlt className="w-3 h-3" />
            {centre.location} · R{centre.regionId} {centre.regionName}
          </span>
        </div>

        {/* Contact */}
        <Section title="Contact" color="emerald">
          {centre.generalPhone && (
            <ContactRow 
              label="General" 
              value={centre.generalPhone}
              subtext={centre.generalPhoneOption}
              copyField="phone"
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          )}
          {centre.generalFax && (
            <ContactRow 
              label="Fax" 
              value={centre.generalFax}
              copyField="fax"
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          )}
          {centre.cdnFax && (
            <ContactRow 
              label="CDN Fax" 
              value={centre.cdnFax}
              copyField="cdnFax"
              copiedField={copiedField}
              onCopy={handleCopy}
            />
          )}
        </Section>

        {/* Visits */}
        {(centre.visitRequestPhone || centre.visitRequestEmail || centre.visitHoursInperson) && (
          <Section title="Visits" color="blue">
            {centre.visitRequestPhone && (
              <ContactRow 
                label="Book Visit" 
                value={centre.visitRequestPhone}
                copyField="visitPhone"
                copiedField={copiedField}
                onCopy={handleCopy}
              />
            )}
            {centre.visitRequestEmail && (
              <ContactRow 
                label="Visit Email" 
                value={centre.visitRequestEmail}
                copyField="visitEmail"
                copiedField={copiedField}
                onCopy={handleCopy}
              />
            )}
            {centre.virtualVisitEmail && centre.virtualVisitEmail !== centre.visitRequestEmail && (
              <ContactRow 
                label="Virtual Visit Email" 
                value={centre.virtualVisitEmail}
                copyField="virtualEmail"
                copiedField={copiedField}
                onCopy={handleCopy}
              />
            )}
            {centre.visitHoursInperson && (
              <div className="py-2 border-b border-zinc-800">
                <span className="text-zinc-500 text-sm">In-Person Hours</span>
                <p className="text-white">{centre.visitHoursInperson}</p>
              </div>
            )}
            {centre.visitHoursVirtual && (
              <div className="py-2 border-b border-zinc-800">
                <span className="text-zinc-500 text-sm">Virtual Hours</span>
                <p className="text-white">{centre.visitHoursVirtual}</p>
              </div>
            )}
            {centre.visitNotes && (
              <p className="text-sm text-zinc-500 mt-2">{centre.visitNotes}</p>
            )}
          </Section>
        )}

        {/* Callback Windows */}
        {(centre.callback1Start || centre.lawyerCallbackEmail) && (
          <Section title="Callback Windows" color="amber">
            {centre.callback1Start && centre.callback1End && (
              <div className="py-2 border-b border-zinc-800">
                <span className="text-zinc-500 text-sm">Window 1</span>
                <p className="text-white font-mono">{centre.callback1Start} - {centre.callback1End}</p>
              </div>
            )}
            {centre.callback2Start && centre.callback2End && (
              <div className="py-2 border-b border-zinc-800">
                <span className="text-zinc-500 text-sm">Window 2</span>
                <p className="text-white font-mono">{centre.callback2Start} - {centre.callback2End}</p>
              </div>
            )}
            {centre.lawyerCallbackEmail && (
              <ContactRow 
                label="Callback Email" 
                value={centre.lawyerCallbackEmail}
                copyField="callbackEmail"
                copiedField={copiedField}
                onCopy={handleCopy}
              />
            )}
          </Section>
        )}

        {/* eDisclosure */}
        <Section title="eDisclosure">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <HddFill className={`w-4 h-4 ${centre.acceptsHardDrive ? 'text-emerald-500' : 'text-zinc-600'}`} />
              <span className={centre.acceptsHardDrive ? 'text-white' : 'text-zinc-600'}>Hard Drive</span>
              {centre.acceptsHardDrive ? (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <Disc className={`w-4 h-4 ${centre.acceptsCdDvd ? 'text-emerald-500' : 'text-zinc-600'}`} />
              <span className={centre.acceptsCdDvd ? 'text-white' : 'text-zinc-600'}>CD/DVD</span>
              {centre.acceptsCdDvd ? (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
            </div>
            <div className="flex items-center gap-2">
              <UsbDrive className={`w-4 h-4 ${centre.acceptsUsb ? 'text-emerald-500' : 'text-zinc-600'}`} />
              <span className={centre.acceptsUsb ? 'text-white' : 'text-zinc-600'}>USB</span>
              {centre.acceptsUsb ? (
                <CheckCircle className="w-3 h-3 text-emerald-500" />
              ) : (
                <XCircle className="w-3 h-3 text-red-500" />
              )}
            </div>
          </div>
          {centre.disclosureFormat && (
            <p className="text-sm text-amber-400 mb-2">Preferred: {centre.disclosureFormat}</p>
          )}
          {centre.disclosureNotes && (
            <p className="text-sm text-zinc-500">{centre.disclosureNotes}</p>
          )}
        </Section>

        {/* Support Contacts (placeholder - will connect to database) */}
        {centre.ciwOrganization && (
          <Section title="Support" color="purple">
            <div className="py-2">
              <span className="text-zinc-500 text-sm">Community Integration Worker</span>
              <p className="text-white">{centre.ciwOrganization}</p>
            </div>
            <p className="text-xs text-zinc-600 mt-2">
              Additional support contacts available in database
            </p>
          </Section>
        )}

        {/* Notes */}
        {centre.notes && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <p className="text-sm text-zinc-400">{centre.notes}</p>
          </div>
        )}

        {/* Quick Links */}
        <div className="pt-4 border-t border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-500 mb-3">Related</h2>
          <div className="flex gap-2">
            <Link
              href={`/programs?region=${centre.regionId}`}
              className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors text-center"
            >
              <span className="text-sm text-zinc-400">Programs in {centre.regionName}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
