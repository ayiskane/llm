'use client';

import { useState, useCallback, useMemo } from 'react';
import { FaCopy, FaClipboardCheck, FaEye, FaEyeSlash, FaPhoneSolid, FaCheck, FaFax } from '@/lib/icons';
import { Card, CardListItem } from '@/components/ui/card';
import { cn, formatEmailsForCopy, formatPhone, makeCall } from '@/lib/utils';
import { text, toggle, iconSize, getCategoryAccentClass, type ContactCategory } from '@/lib/config/theme';
import { UI_CONFIG } from '@/lib/config/constants';
import { useTruncationDetection } from '@/lib/hooks';
import type { CourtWithRegion } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

type CopyFunction = (text: string, fieldId: string) => void | Promise<boolean>;
type IsCopiedFunction = (fieldId: string) => boolean;

// ============================================================================
// COMPACT CONTACT ROW (for emails)
// ============================================================================

interface ContactRowProps {
  label: string;
  emails: string[];
  category?: ContactCategory;
  showFull: boolean;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
  fieldId: string;
  registerTruncationRef?: (element: HTMLElement | null) => void;
}

function ContactRow({
  label,
  emails,
  category = 'other',
  showFull,
  onCopy,
  isCopied,
  fieldId,
  registerTruncationRef,
}: ContactRowProps) {
  const copyText = formatEmailsForCopy(emails);
  const isFieldCopied = isCopied ? isCopied(fieldId) : false;

  const handleCopy = useCallback(() => {
    if (copyText && onCopy) {
      onCopy(copyText, fieldId);
    }
  }, [copyText, onCopy, fieldId]);

  // Get color bar class from category
  const accentClass = getCategoryAccentClass(category);

  return (
    <CardListItem
      onClick={handleCopy}
      className={cn(
        "flex items-stretch cursor-pointer group transition-colors p-0",
        isFieldCopied && "bg-emerald-500/10"
      )}
    >
      {/* Vertical color bar */}
      <div className={cn('w-1 shrink-0', accentClass)} />

      {/* Content: label + email stacked */}
      <div className="flex-1 py-2 px-3 min-w-0">
        <div className={text.roleLabel}>
          {label}
        </div>
        <div
          ref={!showFull ? registerTruncationRef : undefined}
          className={cn(
            text.monoValue,
            showFull ? 'break-all whitespace-normal' : 'truncate'
          )}
        >
          {emails.length > 1 ? (
            showFull ? emails.map((e, i) => <div key={i}>{e}</div>) : emails.join(', ')
          ) : (
            emails[0]
          )}
        </div>
      </div>

      {/* Copy icon */}
      <div className="flex items-center px-2">
        {isFieldCopied ? (
          <FaClipboardCheck className={cn(iconSize.sm, "text-emerald-400")} />
        ) : (
          <FaCopy className={cn(iconSize.sm, "text-slate-600 group-hover:text-slate-400 transition-colors")} />
        )}
      </div>
    </CardListItem>
  );
}

// ============================================================================
// PHONE ROW COMPONENT (for phone/fax numbers with call + copy)
// ============================================================================

interface PhoneRowProps {
  label: string;
  phone: string;
  isFax?: boolean;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
  fieldId: string;
}

function PhoneRow({ label, phone, isFax = false, onCopy, isCopied, fieldId }: PhoneRowProps) {
  const [localCopied, setLocalCopied] = useState(false);
  const isFieldCopied = isCopied ? isCopied(fieldId) : localCopied;
  const displayPhone = formatPhone(phone);

  const handleCopy = useCallback(async () => {
    if (onCopy) {
      onCopy(phone, fieldId);
    } else {
      try {
        await navigator.clipboard.writeText(phone);
        setLocalCopied(true);
        setTimeout(() => setLocalCopied(false), UI_CONFIG.COPY_FEEDBACK_MS);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  }, [phone, onCopy, fieldId]);

  const handleCall = useCallback(() => {
    makeCall(phone);
  }, [phone]);

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-list-item-hover active:bg-list-item-active transition-colors">
      {/* Icon */}
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        isFax ? "bg-slate-600/30" : "bg-blue-500/15"
      )}>
        {isFax ? (
          <FaFax className={cn(iconSize.sm, "text-slate-400")} />
        ) : (
          <FaPhoneSolid className={cn(iconSize.sm, "text-blue-400")} />
        )}
      </div>

      {/* Label and number */}
      <div className="flex-1 min-w-0">
        <div className={text.roleLabel}>{label}</div>
        <div className={cn(text.monoValue, "text-blue-400")}>{displayPhone}</div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCopy}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-700/50 active:bg-slate-600/50 transition-colors"
          title="Copy to clipboard"
        >
          {isFieldCopied ? (
            <FaCheck className={cn(iconSize.sm, "text-green-400")} />
          ) : (
            <FaCopy className={cn(iconSize.sm, "text-slate-400")} />
          )}
        </button>
        {!isFax && (
          <button
            onClick={handleCall}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20 active:bg-green-500/30 transition-colors"
            title="Call"
          >
            <FaPhoneSolid className={cn(iconSize.sm, "text-green-400")} />
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION HEADER WITH TOGGLE
// ============================================================================

function SectionHeader({
  title,
  showFull,
  onToggle,
  showToggle
}: {
  title: string;
  showFull: boolean;
  onToggle: () => void;
  showToggle: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <h4 className={text.sectionHeader}>{title}</h4>
      {showToggle && (
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className={cn(toggle.base, showFull ? toggle.active : toggle.inactive)}
        >
          {showFull ? <FaEyeSlash className={iconSize.xs} /> : <FaEye className={iconSize.xs} />}
          <span>{showFull ? 'Truncate' : 'Show full'}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE SECTION HEADER (without toggle)
// ============================================================================

function SimpleSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2 px-1">
      <h4 className={text.sectionHeader}>{title}</h4>
    </div>
  );
}

// ============================================================================
// COURT FIELD CONTACTS - Direct from court table fields
// ============================================================================

type CourtViewMode = 'provincial' | 'supreme';

interface CourtFieldContactsProps {
  court: CourtWithRegion;
  viewMode: CourtViewMode;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
}

const CONTACT_LABELS: Record<string, string> = {
  court_registry: 'Court Registry',
  criminal_registry: 'Criminal Registry',
  crown_general: 'Crown Office',
  crown_federal: 'Federal Crown',
  crown_fnc: 'FNC Crown',
  crown_reception: 'Crown Reception',
  interpreter_request: 'Interpreter Request',
  scheduling: 'Supreme Scheduling',
  jcm: 'JCM',
  jp: 'Justice of the Peace',
  transcript_request: 'Transcript Request',
  criminal_supreme: 'Criminal Supreme',
};

const CONTACT_TYPES_HANDLED_BY_FIELDS = new Set([
  'court_registry',
  'criminal_registry',
  'crown_general',
  'interpreter_request',
  'transcript_request',
  'jcm',
  'scheduling',
]);

function formatContactLabel(contactType: string): string {
  const mapped = CONTACT_LABELS[contactType];
  if (mapped) return mapped;
  return contactType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function getContactCategory(
  contactType: string,
  contact: { is_provincial?: boolean; is_supreme?: boolean; is_appeals?: boolean }
): ContactCategory {
  const lower = contactType.toLowerCase();
  if (lower.includes('federal')) return 'federal';
  if (contact.is_supreme || contact.is_appeals || lower.includes('supreme') || lower.includes('appeals')) {
    return 'supreme';
  }
  if (contact.is_provincial) return 'provincial';
  if (lower.includes('bail')) return 'bail';
  return 'court';
}

function contactVisibleForViewMode(
  contact: { is_provincial?: boolean; is_supreme?: boolean; is_appeals?: boolean },
  viewMode: CourtViewMode
) {
  const isProvincial = contact.is_provincial ?? false;
  const isSupreme = contact.is_supreme ?? false;
  if (contact.is_appeals) return viewMode === 'supreme';
  if (isProvincial && !isSupreme) return viewMode === 'provincial';
  if (isSupreme && !isProvincial) return viewMode === 'supreme';
  return true;
}

export function CourtFieldContacts({ court, viewMode, onCopy, isCopied }: CourtFieldContactsProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  // Separate emails from phone/fax numbers
  const { emails, phones } = useMemo(() => {
    const registryEmails: { label: string; value: string; category: ContactCategory; id: string }[] = [];
    const crownEmails: { label: string; value: string; category: ContactCategory; id: string }[] = [];
    const jcmEmails: { label: string; value: string; category: ContactCategory; id: string }[] = [];
    const jpEmails: { label: string; value: string; category: ContactCategory; id: string }[] = [];
    const otherEmails: { label: string; value: string; category: ContactCategory; id: string }[] = [];
    const phoneList: { label: string; value: string; isFax: boolean; id: string }[] = [];

    // Common contacts (both Provincial & Supreme)
    if (court.registry_email) {
      registryEmails.push({ label: 'Court Registry', value: court.registry_email, category: 'court', id: 'court-registry-email' });
    }
    if (court.criminal_registry_email && court.criminal_registry_email !== court.registry_email) {
      registryEmails.push({ label: 'Criminal Registry', value: court.criminal_registry_email, category: 'court', id: 'criminal-registry-email' });
    }
    if (court.crown_office_email) {
      crownEmails.push({ label: 'Crown Office', value: court.crown_office_email, category: 'provincial', id: 'crown-office-email' });
    }
    const interpreterContact = (court.contacts ?? []).find(
      (contact) =>
        contact.contact_type === 'interpreter_request' &&
        contactVisibleForViewMode(contact, viewMode)
    );
    if (interpreterContact) {
      const emailsAll =
        interpreterContact.emails_all ??
        [
          ...(interpreterContact.email ? [interpreterContact.email] : []),
          ...((interpreterContact.emails as string[] | null) ?? []),
        ];
      const uniqueEmails = Array.from(new Set(emailsAll.filter(Boolean)));
      if (uniqueEmails.length > 0) {
        otherEmails.push({
          label: 'Interpreter Request',
          value: uniqueEmails.join(', '),
          category: 'court',
          id: 'interpreter-request-email',
        });
      }
      const phones = [
        ...(interpreterContact.phone ? [interpreterContact.phone] : []),
        ...((interpreterContact.phones as string[] | null) ?? []),
      ].filter(Boolean);
      phones.forEach((phone, index) => {
        const suffix = phones.length > 1 ? ` ${index + 1}` : '';
        phoneList.push({
          label: `Interpreter Request${suffix}`,
          value: phone,
          isFax: false,
          id: `interpreter-request-phone-${index + 1}`,
        });
      });
    }

    // Common phone numbers
    if (court.registry_phone) {
      phoneList.push({ label: 'Court Registry', value: court.registry_phone, isFax: false, id: 'court-registry-phone' });
    }
    if (court.criminal_registry_phone && court.criminal_registry_phone !== court.registry_phone) {
      phoneList.push({ label: 'Criminal Registry', value: court.criminal_registry_phone, isFax: false, id: 'criminal-registry-phone' });
    }
    if (court.crown_office_phone) {
      phoneList.push({ label: 'Crown Office', value: court.crown_office_phone, isFax: false, id: 'crown-office-phone' });
    }
    if (viewMode === 'provincial' && court.provincial_fax_filing) {
      phoneList.push({ label: 'Provincial Fax Filing', value: court.provincial_fax_filing, isFax: true, id: 'provincial-fax' });
    }

    // Provincial-specific: JCM
    if (viewMode === 'provincial') {
      if (court.jcm_email) {
        jcmEmails.push({ label: 'JCM', value: court.jcm_email, category: 'provincial', id: 'jcm-email' });
      }
      if (court.jcm_phone) {
        phoneList.push({ label: 'JCM', value: court.jcm_phone, isFax: false, id: 'jcm-phone' });
      }
    }
    const transcriptContact = (court.contacts ?? []).find(
      (contact) =>
        contact.contact_type === 'transcript_request' &&
        contactVisibleForViewMode(contact, viewMode)
    );
    if (transcriptContact) {
      const emailsAll =
        transcriptContact.emails_all ??
        [
          ...(transcriptContact.email ? [transcriptContact.email] : []),
          ...((transcriptContact.emails as string[] | null) ?? []),
        ];
      const uniqueEmails = Array.from(new Set(emailsAll.filter(Boolean)));
      if (uniqueEmails.length > 0) {
        otherEmails.push({
          label: 'Transcript Request',
          value: uniqueEmails.join(', '),
          category: 'court',
          id: 'transcript-request-email',
        });
      }
      const phones = [
        ...(transcriptContact.phone ? [transcriptContact.phone] : []),
        ...((transcriptContact.phones as string[] | null) ?? []),
      ].filter(Boolean);
      phones.forEach((phone, index) => {
        const suffix = phones.length > 1 ? ` ${index + 1}` : '';
        phoneList.push({
          label: `Transcript Request${suffix}`,
          value: phone,
          isFax: false,
          id: `transcript-request-phone-${index + 1}`,
        });
      });
    }

    // Supreme-specific: Scheduling (same tier as JCM)
    if (viewMode === 'supreme') {
      if (court.supreme_scheduling_email) {
        jcmEmails.push({ label: 'Supreme Scheduling', value: court.supreme_scheduling_email, category: 'supreme', id: 'supreme-email' });
      }
      if (court.supreme_scheduling_phone) {
        phoneList.push({ label: 'Supreme Scheduling', value: court.supreme_scheduling_phone, isFax: false, id: 'supreme-phone' });
      }
      if (court.supreme_fax_filing) {
        phoneList.push({ label: 'Supreme Fax Filing', value: court.supreme_fax_filing, isFax: true, id: 'supreme-fax' });
      }
    }

    const extraContacts = (court.contacts ?? []).filter(
      (contact) =>
        !CONTACT_TYPES_HANDLED_BY_FIELDS.has(contact.contact_type) &&
        contactVisibleForViewMode(contact, viewMode)
    );

    for (const contact of extraContacts) {
      const label = formatContactLabel(contact.contact_type);
      const category = getContactCategory(contact.contact_type, contact);
      const emailsAll =
        contact.emails_all ??
        [
          ...(contact.email ? [contact.email] : []),
          ...((contact.emails as string[] | null) ?? []),
        ];
      const uniqueEmails = Array.from(new Set(emailsAll.filter(Boolean)));

      if (uniqueEmails.length > 0) {
        const targetList =
          contact.contact_type === 'jp' ? jpEmails : otherEmails;
        targetList.push({
          label,
          value: uniqueEmails.join(', '),
          category,
          id: `contact-${contact.contact_type}-emails`,
        });
      }

      const phones = [
        ...(contact.phone ? [contact.phone] : []),
        ...((contact.phones as string[] | null) ?? []),
      ].filter(Boolean);
      phones.forEach((phone, index) => {
        const suffix = phones.length > 1 ? ` ${index + 1}` : '';
        phoneList.push({
          label: `${label}${suffix}`,
          value: phone,
          isFax: false,
          id: `contact-${contact.contact_type}-phone-${index + 1}`,
        });
      });

      if (viewMode === 'provincial' && contact.provincial_fax_filing) {
        phoneList.push({
          label: `${label} Fax Filing`,
          value: contact.provincial_fax_filing,
          isFax: true,
          id: `contact-${contact.contact_type}-provincial-fax`,
        });
      }
      if (viewMode === 'supreme' && contact.supreme_fax_filing) {
        phoneList.push({
          label: `${label} Fax Filing`,
          value: contact.supreme_fax_filing,
          isFax: true,
          id: `contact-${contact.contact_type}-supreme-fax`,
        });
      }
    }

    const emailList = [
      ...registryEmails,
      ...crownEmails,
      ...jcmEmails,
      ...jpEmails,
      ...otherEmails,
    ];

    return { emails: emailList, phones: phoneList };
  }, [court, viewMode]);

  if (emails.length === 0 && phones.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Court Contacts (Emails) */}
      {emails.length > 0 && (
        <div>
          <SectionHeader
            title="Court Contacts"
            showFull={showFull}
            onToggle={() => setShowFull(!showFull)}
            showToggle={!showFull ? hasTruncation : true}
          />
          <Card variant="list">
            {emails.map((contact) => (
              <ContactRow
                key={contact.id}
                label={contact.label}
                emails={[contact.value]}
                category={contact.category}
                showFull={showFull}
                onCopy={onCopy}
                isCopied={isCopied}
                fieldId={`court-field-${contact.id}`}
                registerTruncationRef={registerRef}
              />
            ))}
          </Card>
        </div>
      )}

      {/* Court Numbers (Phones/Fax) */}
      {phones.length > 0 && (
        <div>
          <SimpleSectionHeader title="Court Numbers" />
          <Card variant="list">
            {phones.map((phone) => (
              <PhoneRow
                key={phone.id}
                label={phone.label}
                phone={phone.value}
                isFax={phone.isFax}
                onCopy={onCopy}
                isCopied={isCopied}
                fieldId={`court-field-${phone.id}`}
              />
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}

export { ContactRow as ContactCard };
