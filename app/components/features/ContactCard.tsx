'use client';

import { useState, useCallback, useMemo } from 'react';
import { FaCopy, FaClipboardCheck, FaEye, FaEyeSlash } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { card, text, toggle, iconSize, getCategoryAccentClass, type ContactCategory } from '@/lib/config/theme';
import { CONTACT_ROLES } from '@/lib/config/constants';
import type { ContactWithRole } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

type CopyFunction = (text: string, fieldId: string) => void | Promise<boolean>;
type IsCopiedFunction = (fieldId: string) => boolean;

// ============================================================================
// CONTACT ITEM (Single coupon-style card)
// ============================================================================

interface ContactItemProps {
  label: string;
  emails: string[];
  category?: ContactCategory;
  showFull: boolean;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
  fieldId: string;
}

function ContactItem({ 
  label, 
  emails, 
  category = 'other', 
  showFull,
  onCopy,
  isCopied,
  fieldId,
}: ContactItemProps) {
  const copyText = emails.join(', ');
  const isFieldCopied = isCopied ? isCopied(fieldId) : false;

  const handleCopy = useCallback(() => {
    if (copyText && onCopy) {
      onCopy(copyText, fieldId);
    }
  }, [copyText, onCopy, fieldId]);

  return (
    <div className={card.coupon} onClick={handleCopy}>
      {/* Color accent bar */}
      <div className={cn('w-1 flex-shrink-0', getCategoryAccentClass(category))} />
      
      {/* Content */}
      <div className="flex-1 py-2.5 px-3 min-w-0 overflow-hidden">
        <div className={text.roleLabel}>{label}</div>
        <div 
          className={cn(
            'text-[12px] text-slate-200 font-mono leading-relaxed',
            showFull ? 'break-all whitespace-normal' : 'whitespace-nowrap overflow-hidden text-ellipsis'
          )}
        >
          {emails.length > 1 ? (
            <div className={showFull ? 'space-y-1' : ''}>
              {showFull ? emails.map((email, i) => <div key={i}>{email}</div>) : emails.join(', ')}
            </div>
          ) : (
            emails[0]
          )}
        </div>
      </div>
      
      {/* Copy button area */}
      <div className={cn(card.couponDivider, 'flex items-center justify-center px-3 flex-shrink-0 transition-colors')}>
        {isFieldCopied ? (
          <FaClipboardCheck className={cn(iconSize.md, 'text-emerald-400')} />
        ) : (
          <FaCopy className={cn(iconSize.md, 'text-slate-500')} />
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

  const hasTruncation = orderedContacts.some(c => c.emails.join(', ').length > 40);

  if (orderedContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <SectionHeader 
        title="Court Contacts" 
        showFull={showFull} 
        onToggle={() => setShowFull(!showFull)}
        showToggle={hasTruncation || showFull}
      />
      <div className="space-y-2">
        {orderedContacts.map((contact) => (
          <ContactItem 
            key={contact.id}
            label={contact.label}
            emails={contact.emails}
            category={contact.category}
            showFull={showFull}
            onCopy={onCopy}
            isCopied={isCopied}
            fieldId={`court-contact-${contact.id}`}
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
        result.push({ label: 'Federal Crown', emails, category: 'other', id: `fed-crown-${fedCrown.id}` });
      }
    }

    const fnCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FIRST_NATIONS_CROWN);
    if (fnCrown) {
      const emails = fnCrown.emails?.length ? fnCrown.emails : (fnCrown.email ? [fnCrown.email] : []);
      if (emails.length > 0) {
        result.push({ label: 'First Nations Crown', emails, category: 'other', id: `fn-crown-${fnCrown.id}` });
      }
    }

    return result;
  }, [contacts]);

  const hasTruncation = crownContacts.some(c => c.emails.join(', ').length > 40);

  if (crownContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <SectionHeader 
        title="Crown Contacts" 
        showFull={showFull} 
        onToggle={() => setShowFull(!showFull)}
        showToggle={hasTruncation || showFull}
      />
      <div className="space-y-2">
        {crownContacts.map((contact) => (
          <ContactItem 
            key={contact.id}
            label={contact.label}
            emails={contact.emails}
            category={contact.category}
            showFull={showFull}
            onCopy={onCopy}
            isCopied={isCopied}
            fieldId={contact.id}
          />
        ))}
      </div>
    </div>
  );
}

export { ContactItem as ContactCard };

