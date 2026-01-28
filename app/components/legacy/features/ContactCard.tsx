'use client';

import { useState, useCallback, useMemo } from 'react';
import { FaCopy, FaClipboardCheck, FaEye, FaEyeSlash } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, toggle, iconSize, getCategoryAccentClass, type ContactCategory } from '@/lib/config/theme';
import { CONTACT_ROLES } from '@/lib/config/constants';
import { useTruncationDetection } from '@/lib/hooks';
import type { ContactWithRole } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

type CopyFunction = (text: string, fieldId: string) => void | Promise<boolean>;
type IsCopiedFunction = (fieldId: string) => boolean;

// ============================================================================
// COMPACT CONTACT ROW (Option A - Tight Stack)
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
  const copyText = emails.join(', ');
  const isFieldCopied = isCopied ? isCopied(fieldId) : false;

  const handleCopy = useCallback(() => {
    if (copyText && onCopy) {
      onCopy(copyText, fieldId);
    }
  }, [copyText, onCopy, fieldId]);

  // Get color bar class from category
  const accentClass = getCategoryAccentClass(category);

  return (
    <div 
      onClick={handleCopy}
      className={cn(
        "flex items-stretch cursor-pointer group transition-colors",
        isFieldCopied ? "bg-emerald-500/10" : "hover:bg-slate-800/50"
      )}
    >
      {/* Vertical color bar */}
      <div className={cn('w-1 flex-shrink-0', accentClass)} />
      
      {/* Content: label + email stacked */}
      <div className="flex-1 py-2 px-3 min-w-0">
        <div className="text-[9px] text-slate-500 uppercase tracking-wider">
          {label}
        </div>
        <div 
          ref={!showFull ? registerTruncationRef : undefined}
          className={cn(
            "text-[11px] text-slate-300 font-mono",
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
          <FaClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
        ) : (
          <FaCopy className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
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
// COURT CONTACTS STACK
// ============================================================================

interface CourtContactsStackProps {
  contacts: ContactWithRole[];
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
}

export function CourtContactsStack({ contacts, onCopy, isCopied }: CourtContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  const contactConfig: { roleId: number; category: ContactCategory; label: string }[] = [
    { roleId: CONTACT_ROLES.CRIMINAL_REGISTRY, category: 'court', label: 'Criminal Registry' },
    { roleId: CONTACT_ROLES.COURT_REGISTRY, category: 'court', label: 'Court Registry' },
    { roleId: CONTACT_ROLES.JCM, category: 'provincial', label: 'Provincial JCM' },
    { roleId: CONTACT_ROLES.SCHEDULING, category: 'supreme', label: 'Supreme Scheduling' },
    { roleId: CONTACT_ROLES.INTERPRETER, category: 'other', label: 'Interpreter Request' },
  ];

  const orderedContacts = useMemo(() => {
    const result: { label: string; emails: string[]; category: ContactCategory; id: number }[] = [];
    
    let criminalRegistryEmails: string[] = [];
    const criminalRegistry = contacts.find(c => c.contact_role_id === CONTACT_ROLES.CRIMINAL_REGISTRY);
    if (criminalRegistry) {
      criminalRegistryEmails = criminalRegistry.emails || (criminalRegistry.email ? [criminalRegistry.email] : []);
    }

    contactConfig.forEach(config => {
      const contact = contacts.find(c => c.contact_role_id === config.roleId);
      if (contact) {
        const contactEmails = contact.emails?.length ? contact.emails : (contact.email ? [contact.email] : []);
        
        if (contactEmails.length > 0) {
          if (config.roleId === CONTACT_ROLES.COURT_REGISTRY && 
              criminalRegistryEmails.length > 0 && 
              contactEmails[0] === criminalRegistryEmails[0]) {
            return;
          }
          result.push({ label: config.label, emails: contactEmails, category: config.category, id: contact.id });
        }
      }
    });

    return result;
  }, [contacts]);

  if (orderedContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <SectionHeader 
        title="Court Contacts" 
        showFull={showFull} 
        onToggle={() => setShowFull(!showFull)}
        showToggle={!showFull ? hasTruncation : true}
      />
      <div className={card.divided}>
        {orderedContacts.map((contact) => (
          <ContactRow 
            key={contact.id}
            label={contact.label}
            emails={contact.emails}
            category={contact.category}
            showFull={showFull}
            onCopy={onCopy}
            isCopied={isCopied}
            fieldId={`court-contact-${contact.id}`}
            registerTruncationRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CROWN CONTACTS STACK
// ============================================================================

interface CrownContactsStackProps {
  contacts: ContactWithRole[];
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
}

export function CrownContactsStack({ contacts, onCopy, isCopied }: CrownContactsStackProps) {
  const [showFull, setShowFull] = useState(false);
  const { registerRef, hasTruncation } = useTruncationDetection();

  const crownContacts = useMemo(() => {
    const result: { label: string; emails: string[]; category: ContactCategory; id: string }[] = [];

    const provCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.CROWN);
    if (provCrown) {
      const emails = provCrown.emails?.length ? provCrown.emails : (provCrown.email ? [provCrown.email] : []);
      if (emails.length > 0) {
        result.push({ label: 'Provincial Crown', emails, category: 'provincial', id: `prov-crown-${provCrown.id}` });
      }
    }

    const fedCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FEDERAL_CROWN);
    if (fedCrown) {
      const emails = fedCrown.emails?.length ? fedCrown.emails : (fedCrown.email ? [fedCrown.email] : []);
      if (emails.length > 0) {
        result.push({ label: 'Federal Crown', emails, category: 'federal', id: `fed-crown-${fedCrown.id}` });
      }
    }

    const fnCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FIRST_NATIONS_CROWN);
    if (fnCrown) {
      const emails = fnCrown.emails?.length ? fnCrown.emails : (fnCrown.email ? [fnCrown.email] : []);
      if (emails.length > 0) {
        result.push({ label: 'First Nations Crown', emails, category: 'provincial', id: `fn-crown-${fnCrown.id}` });
      }
    }

    return result;
  }, [contacts]);

  if (crownContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <SectionHeader 
        title="Crown Contacts" 
        showFull={showFull} 
        onToggle={() => setShowFull(!showFull)}
        showToggle={!showFull ? hasTruncation : true}
      />
      <div className={card.divided}>
        {crownContacts.map((contact) => (
          <ContactRow 
            key={contact.id}
            label={contact.label}
            emails={contact.emails}
            category={contact.category}
            showFull={showFull}
            onCopy={onCopy}
            isCopied={isCopied}
            fieldId={contact.id}
            registerTruncationRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
}

export { ContactRow as ContactCard };




