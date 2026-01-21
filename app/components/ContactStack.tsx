'use client';

import { useState } from 'react';
import { Check, Clipboard } from 'react-bootstrap-icons';
import copy from 'copy-to-clipboard';
import type { Contact, BailContact } from '@/types';
import { CONTACT_ROLE_NAMES, CONTACT_ROLES } from '@/types';

interface ContactStackProps {
  contacts: Contact[];
  title?: string;
}

// Category colors for left border
type ContactCategory = 'court' | 'provincial' | 'supreme' | 'bail' | 'other';

const categoryColors: Record<ContactCategory, string> = {
  court: '#60a5fa',      // blue
  provincial: '#34d399', // emerald
  supreme: '#a78bfa',    // purple
  bail: '#fbbf24',       // amber
  other: '#71717a',      // zinc
};

// Single contact item - tap to copy with colored left border
function ContactItem({ label, email, category = 'other', onCopy }: { 
  label: string; 
  email: string; 
  category?: ContactCategory;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    copy(email);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      className="py-2.5 px-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer active:bg-slate-700/50"
      style={{ borderLeft: `3px solid ${categoryColors[category]}` }}
      onClick={handleCopy}
    >
      <div className="text-[9px] font-mono text-slate-400 mb-0.5 uppercase tracking-wide">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-slate-200 break-all">{email}</span>
        {copied ? (
          <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
        ) : (
          <Clipboard className="w-4 h-4 text-slate-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

// Court contacts (Registry, JCM, SC Scheduling, Bail JCM)
export function CourtContactsStack({ contacts, onCopy }: { contacts: Contact[]; onCopy?: () => void }) {
  // Define contact order and categories
  // Order: Court Registry, Criminal Registry, Provincial JCM, Bail JCM, Supreme Scheduling, Interpreter(s)
  const contactConfig: { roleId: number; category: ContactCategory; label: string }[] = [
    { roleId: CONTACT_ROLES.COURT_REGISTRY, category: 'court', label: 'Court Registry' },
    { roleId: CONTACT_ROLES.CRIMINAL_REGISTRY, category: 'court', label: 'Criminal Registry' },
    { roleId: CONTACT_ROLES.JCM, category: 'provincial', label: 'Provincial JCM' },
    { roleId: CONTACT_ROLES.BAIL_JCM, category: 'bail', label: 'Bail JCM' },
    { roleId: CONTACT_ROLES.SCHEDULING, category: 'supreme', label: 'Supreme Scheduling' },
    { roleId: CONTACT_ROLES.INTERPRETER, category: 'other', label: 'Interpreter' },
  ];

  // Build ordered contact list
  const orderedContacts: { label: string; email: string; category: ContactCategory }[] = [];
  
  // Track if we've added criminal registry (to potentially skip duplicate court registry)
  let criminalRegistryEmail: string | null = null;
  const criminalRegistry = contacts.find(c => c.contact_role_id === CONTACT_ROLES.CRIMINAL_REGISTRY);
  if (criminalRegistry) {
    criminalRegistryEmail = criminalRegistry.email || (criminalRegistry.emails && criminalRegistry.emails[0]) || null;
  }

  contactConfig.forEach(config => {
    const contact = contacts.find(c => c.contact_role_id === config.roleId);
    if (contact) {
      const email = contact.email || (contact.emails && contact.emails[0]);
      if (email) {
        // Skip court registry if it's the same as criminal registry
        if (config.roleId === CONTACT_ROLES.COURT_REGISTRY && criminalRegistryEmail && email === criminalRegistryEmail) {
          return;
        }
        orderedContacts.push({
          label: config.label,
          email,
          category: config.category,
        });
      }
    }
  });

  if (orderedContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">Court Contacts</h4>
      {orderedContacts.map((contact) => (
        <ContactItem 
          key={contact.label} 
          label={contact.label} 
          email={contact.email}
          category={contact.category}
          onCopy={onCopy || (() => {})} 
        />
      ))}
    </div>
  );
}

// Crown contacts (Provincial, Bail, Federal)
export function CrownContactsStack({ 
  contacts, 
  bailContacts,
  onCopy 
}: { 
  contacts: Contact[]; 
  bailContacts?: BailContact[];
  onCopy?: () => void;
}) {
  const crownContacts: { label: string; email: string; category: ContactCategory }[] = [];

  // Provincial Crown
  const provCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.CROWN);
  if (provCrown?.email) {
    crownContacts.push({
      label: 'Provincial Crown',
      email: provCrown.email,
      category: 'provincial'
    });
  }

  // Bail Crown (from bail contacts)
  if (bailContacts) {
    const bailCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN || bc.role_name === 'Crown');
    if (bailCrown?.email) {
      crownContacts.push({
        label: 'Bail Crown',
        email: bailCrown.email,
        category: 'bail'
      });
    }
  }

  // Federal Crown
  const fedCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FEDERAL_CROWN);
  if (fedCrown?.email) {
    crownContacts.push({
      label: 'Federal Crown',
      email: fedCrown.email,
      category: 'other'
    });
  }

  // First Nations Crown
  const fnCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FIRST_NATIONS_CROWN);
  if (fnCrown?.email) {
    crownContacts.push({
      label: 'First Nations Crown',
      email: fnCrown.email,
      category: 'other'
    });
  }

  if (crownContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-1">Crown Contacts</h4>
      {crownContacts.map((contact) => (
        <ContactItem 
          key={contact.label}
          label={contact.label}
          email={contact.email}
          category={contact.category}
          onCopy={onCopy || (() => {})}
        />
      ))}
    </div>
  );
}

// Top 3 contacts for search results preview
export function TopContactsPreview({ 
  contacts, 
  onCopy,
  showAll = false
}: { 
  contacts: Contact[]; 
  onCopy?: () => void;
  showAll?: boolean;
}) {
  // Map role IDs to categories
  const roleToCategory: Record<number, ContactCategory> = {
    [CONTACT_ROLES.COURT_REGISTRY]: 'court',
    [CONTACT_ROLES.CRIMINAL_REGISTRY]: 'court',
    [CONTACT_ROLES.JCM]: 'provincial',
    [CONTACT_ROLES.BAIL_JCM]: 'bail',
    [CONTACT_ROLES.SCHEDULING]: 'supreme',
    [CONTACT_ROLES.CROWN]: 'provincial',
    [CONTACT_ROLES.BAIL_CROWN]: 'bail',
    [CONTACT_ROLES.FEDERAL_CROWN]: 'other',
    [CONTACT_ROLES.INTERPRETER]: 'other',
  };

  if (showAll) {
    // Show all contacts grouped by type
    const allContacts = contacts
      .filter(c => c.email)
      .map(c => ({
        label: CONTACT_ROLE_NAMES[c.contact_role_id] || 'Unknown',
        email: c.email!,
        category: roleToCategory[c.contact_role_id] || 'other' as ContactCategory
      }));

    if (allContacts.length === 0) return null;

    return (
      <div className="space-y-1">
        {allContacts.map((contact, idx) => (
          <ContactItem 
            key={`${contact.label}-${idx}`}
            label={contact.label}
            email={contact.email}
            category={contact.category}
            onCopy={onCopy || (() => {})}
          />
        ))}
      </div>
    );
  }

  // Priority: Criminal Registry, JCM, Provincial Crown
  const priorityRoles: number[] = [
    CONTACT_ROLES.CRIMINAL_REGISTRY,
    CONTACT_ROLES.JCM,
    CONTACT_ROLES.CROWN
  ];

  const topContacts = priorityRoles
    .map(roleId => {
      const contact = contacts.find(c => c.contact_role_id === roleId);
      if (contact?.email) {
        return {
          label: CONTACT_ROLE_NAMES[roleId] || 'Unknown',
          email: contact.email,
          category: roleToCategory[roleId] || 'other' as ContactCategory
        };
      }
      return null;
    })
    .filter((c): c is { label: string; email: string; category: ContactCategory } => c !== null)
    .slice(0, 3);

  if (topContacts.length === 0) return null;

  return (
    <div className="space-y-1">
      {topContacts.map((contact) => (
        <ContactItem 
          key={contact.label}
          label={contact.label}
          email={contact.email}
          category={contact.category}
          onCopy={onCopy || (() => {})}
        />
      ))}
    </div>
  );
}


