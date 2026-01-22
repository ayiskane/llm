'use client';

import { useState } from 'react';
import { Clipboard, ClipboardCheck, Eye, EyeSlash } from 'react-bootstrap-icons';
import { 
  cn, 
  textClasses, 
  iconClasses, 
  cardClasses,
  couponCardStyles,
  inlineStyles,
  getContactCategoryColor,
  getToggleButtonStyles,
  getSectionHeaderProps,
} from '@/lib/config/theme';
import type { ContactCategory } from '@/lib/config/theme';
import { formatEmailsForCopy } from '@/lib/utils';
import { ROLE_DISPLAY_NAMES, COURT_CONTACT_ROLE_IDS, CROWN_CONTACT_ROLE_IDS } from '@/lib/config/constants';
import type { ContactWithRole } from '@/types';

// Map role IDs to categories
function getContactCategory(roleId: number): ContactCategory {
  if (CROWN_CONTACT_ROLE_IDS.includes(roleId)) return 'provincial';
  if (COURT_CONTACT_ROLE_IDS.includes(roleId)) return 'court';
  return 'other';
}

// ============================================================================
// COPY FUNCTION TYPES - Consistent interface for all components
// ============================================================================

type CopyFunction = (text: string, fieldId: string) => void | Promise<boolean>;
type IsCopiedFunction = (fieldId: string) => boolean;

// ============================================================================
// CONTACT CARD
// ============================================================================

interface ContactCardProps {
  contact: ContactWithRole;
  category?: ContactCategory;
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
}

export function ContactCard({ contact, category, onCopy, isCopied }: ContactCardProps) {
  const roleDisplayName = ROLE_DISPLAY_NAMES[contact.contact_role_id] || contact.contact_role?.name || 'Contact';
  
  // Get all emails
  const emails = contact.emails?.length ? contact.emails : (contact.email ? [contact.email] : []);
  const copyText = formatEmailsForCopy(emails);
  const fieldId = `contact-${contact.id}`;
  
  // Determine category from role if not provided
  const contactCategory = category || getContactCategory(contact.contact_role_id);

  // Check if this specific field is copied
  const isFieldCopied = isCopied ? isCopied(fieldId) : false;

  const handleCopy = () => {
    if (copyText && onCopy) {
      onCopy(copyText, fieldId);
    }
  };

  if (emails.length === 0) return null;

  return (
    <div 
      className={cardClasses.coupon}
      style={couponCardStyles.container}
      onClick={handleCopy}
    >
      {/* Color accent bar */}
      <div 
        className="w-1 shrink-0"
        style={{ background: getContactCategoryColor(contactCategory) }}
      />
      
      {/* Content */}
      <div className="flex-1 py-2.5 px-3 min-w-0 overflow-hidden">
        <div 
          className={textClasses.roleLabel}
          style={inlineStyles.letterSpacing.wide}
        >
          {roleDisplayName}
        </div>
        <div className="text-[12px] text-slate-200 font-mono leading-relaxed whitespace-nowrap overflow-hidden text-ellipsis">
          {emails.join(', ')}
        </div>
      </div>
      
      {/* Copy button area */}
      <div 
        className="flex items-center justify-center px-3 shrink-0 transition-colors"
        style={{ 
          ...couponCardStyles.divider,
          color: isFieldCopied ? '#34d399' : '#52525b',
        }}
      >
        {isFieldCopied ? (
          <ClipboardCheck className={cn(iconClasses.sm, 'text-emerald-400')} />
        ) : (
          <Clipboard className={iconClasses.sm} />
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
  const headerProps = getSectionHeaderProps();
  
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <h4 {...headerProps}>
        {title}
      </h4>
      {showToggle && (
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-xs tracking-wide transition-all"
          style={getToggleButtonStyles(showFull)}
        >
          {showFull ? (
            <EyeSlash className={iconClasses.xs} />
          ) : (
            <Eye className={iconClasses.xs} />
          )}
          <span>{showFull ? 'Truncate' : 'Show full'}</span>
        </button>
      )}
    </div>
  );
}

// ============================================================================
// CONTACT STACK
// ============================================================================

interface ContactStackProps {
  contacts: ContactWithRole[];
  category: 'court' | 'crown';
  onCopy?: CopyFunction;
  isCopied?: IsCopiedFunction;
}

export function ContactStack({ contacts, category, onCopy, isCopied }: ContactStackProps) {
  const [showFull, setShowFull] = useState(false);
  const roleIds = category === 'court' ? COURT_CONTACT_ROLE_IDS : CROWN_CONTACT_ROLE_IDS;
  
  // Filter and sort contacts by role order
  const filteredContacts = contacts
    .filter(c => roleIds.includes(c.contact_role_id))
    .sort((a, b) => {
      const aIndex = roleIds.indexOf(a.contact_role_id);
      const bIndex = roleIds.indexOf(b.contact_role_id);
      return aIndex - bIndex;
    });

  if (filteredContacts.length === 0) return null;

  const title = category === 'court' ? 'COURT CONTACTS' : 'CROWN CONTACTS';
  const contactCategory: ContactCategory = category === 'crown' ? 'provincial' : 'court';

  // Check if any contact has truncated emails
  const hasTruncation = filteredContacts.some(c => {
    const emails = c.emails?.length ? c.emails : (c.email ? [c.email] : []);
    return emails.join(', ').length > 40;
  });

  return (
    <div className="space-y-1.5">
      <SectionHeader 
        title={title} 
        showFull={showFull} 
        onToggle={() => setShowFull(!showFull)}
        showToggle={hasTruncation || showFull}
      />
      <div className="space-y-2">
        {filteredContacts.map(contact => (
          <ContactCard
            key={contact.id}
            contact={contact}
            category={contactCategory}
            onCopy={onCopy}
            isCopied={isCopied}
          />
        ))}
      </div>
    </div>
  );
}
