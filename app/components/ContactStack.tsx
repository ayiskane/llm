'use client';

import { useState } from 'react';
import { Check, Clipboard } from 'react-bootstrap-icons';
import { Badge } from '@/components/ui/badge';
import copy from 'copy-to-clipboard';
import type { Contact, BailContact } from '@/types';
import { CONTACT_ROLE_NAMES, CONTACT_ROLES } from '@/types';

interface ContactStackProps {
  contacts: Contact[];
  title?: string;
}

// Single contact item - tap to copy
function ContactItem({ label, email, onCopy }: { label: string; email: string; onCopy: () => void }) {
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
      onClick={handleCopy}
    >
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
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
  // Filter and sort contacts in hierarchy order
  const contactMap: Record<string, string> = {};
  
  // Priority order for court contacts
  const courtContactRoles: number[] = [
    CONTACT_ROLES.CRIMINAL_REGISTRY,
    CONTACT_ROLES.COURT_REGISTRY,
    CONTACT_ROLES.JCM,
    CONTACT_ROLES.SCHEDULING,
    CONTACT_ROLES.BAIL_JCM,
    CONTACT_ROLES.INTERPRETER,
  ];

  contacts.forEach(contact => {
    if (courtContactRoles.includes(contact.contact_role_id)) {
      const roleName = CONTACT_ROLE_NAMES[contact.contact_role_id] || 'Unknown';
      const email = contact.email || (contact.emails && contact.emails[0]);
      if (email) {
        // If criminal registry exists, skip court registry
        if (contact.contact_role_id === CONTACT_ROLES.COURT_REGISTRY) {
          const hasCriminalRegistry = contacts.some(c => 
            c.contact_role_id === CONTACT_ROLES.CRIMINAL_REGISTRY && 
            (c.email || (c.emails && c.emails[0]))
          );
          const criminalRegistryEmail = contacts.find(c => 
            c.contact_role_id === CONTACT_ROLES.CRIMINAL_REGISTRY
          )?.email;
          
          if (hasCriminalRegistry && criminalRegistryEmail === email) {
            return; // Skip if court registry == criminal registry
          }
        }
        contactMap[roleName] = email;
      }
    }
  });

  if (Object.keys(contactMap).length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1">Court Contacts</h4>
      {Object.entries(contactMap).map(([label, email]) => (
        <ContactItem 
          key={label} 
          label={label} 
          email={email} 
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
  const crownContacts: { category: string; label: string; email: string; color: string }[] = [];

  // Provincial Crown
  const provCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.CROWN);
  if (provCrown?.email) {
    crownContacts.push({
      category: 'Provincial',
      label: 'Provincial',
      email: provCrown.email,
      color: 'bg-blue-900/50 text-blue-300'
    });
  }

  // Bail Crown (from bail contacts)
  if (bailContacts) {
    const bailCrown = bailContacts.find(bc => bc.role_id === CONTACT_ROLES.CROWN || bc.role_name === 'Crown');
    if (bailCrown?.email) {
      crownContacts.push({
        category: 'Bail',
        label: 'Bail',
        email: bailCrown.email,
        color: 'bg-emerald-900/50 text-emerald-300'
      });
    }
  }

  // Federal Crown
  const fedCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FEDERAL_CROWN);
  if (fedCrown?.email) {
    crownContacts.push({
      category: 'Federal',
      label: 'Federal',
      email: fedCrown.email,
      color: 'bg-orange-900/50 text-orange-300'
    });
  }

  // First Nations Crown
  const fnCrown = contacts.find(c => c.contact_role_id === CONTACT_ROLES.FIRST_NATIONS_CROWN);
  if (fnCrown?.email) {
    crownContacts.push({
      category: 'First Nations',
      label: 'First Nations',
      email: fnCrown.email,
      color: 'bg-red-900/50 text-red-300'
    });
  }

  if (crownContacts.length === 0) return null;

  return (
    <div className="space-y-1.5">
      <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wide px-1">Crown Contacts</h4>
      {crownContacts.map((contact) => (
        <CrownContactItem 
          key={contact.category}
          category={contact.label}
          email={contact.email}
          badgeColor={contact.color}
          onCopy={onCopy || (() => {})}
        />
      ))}
    </div>
  );
}

function CrownContactItem({ 
  category, 
  email, 
  badgeColor,
  onCopy 
}: { 
  category: string; 
  email: string; 
  badgeColor: string;
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
      onClick={handleCopy}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <Badge className={`${badgeColor} text-[10px] px-1.5 py-0 mb-1`}>
            {category}
          </Badge>
          <div className="text-sm text-slate-200 break-all">{email}</div>
        </div>
        {copied ? (
          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-1" />
        ) : (
          <Clipboard className="w-4 h-4 text-slate-500 flex-shrink-0 mt-1" />
        )}
      </div>
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
  if (showAll) {
    // Show all contacts grouped by type
    const allContacts = contacts
      .filter(c => c.email)
      .map(c => ({
        label: CONTACT_ROLE_NAMES[c.contact_role_id] || 'Unknown',
        email: c.email!
      }));

    if (allContacts.length === 0) return null;

    return (
      <div className="space-y-1">
        {allContacts.map((contact, idx) => (
          <ContactItem 
            key={`${contact.label}-${idx}`}
            label={contact.label}
            email={contact.email}
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
          email: contact.email
        };
      }
      return null;
    })
    .filter((c): c is { label: string; email: string } => c !== null)
    .slice(0, 3);

  if (topContacts.length === 0) return null;

  return (
    <div className="space-y-1">
      {topContacts.map((contact) => (
        <ContactItem 
          key={contact.label}
          label={contact.label}
          email={contact.email}
          onCopy={onCopy || (() => {})}
        />
      ))}
    </div>
  );
}

