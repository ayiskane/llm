import { useMemo } from 'react';
import type { CourtContact, CourtWithRegion } from '@/types';
import type { ContactCategory } from '@/lib/config/theme';

export type CourtViewMode = 'provincial' | 'supreme';

export type ContactEmailItem = {
  id: string;
  label: string;
  emails: string[];
  category: ContactCategory;
};

export type ContactEmailGroup = {
  id: string;
  label: string;
  items: ContactEmailItem[];
};

export type ContactPhoneItem = {
  id: string;
  label: string;
  phone: string;
  isFax: boolean;
};

export type CourtContactSections = {
  emailGroups: ContactEmailGroup[];
  phones: ContactPhoneItem[];
  count: number;
};

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

function collectEmails(contact: CourtContact): string[] {
  const emailList = [
    ...(contact.email ? [contact.email] : []),
    ...((contact.emails as string[] | null) ?? []),
  ];
  const emailsAll = contact.emails_all ?? emailList;
  return Array.from(new Set((emailsAll || []).filter(Boolean)));
}

function collectPhones(contact: CourtContact): string[] {
  return [
    ...(contact.phone ? [contact.phone] : []),
    ...((contact.phones as string[] | null) ?? []),
  ].filter(Boolean);
}

export function useCourtSections(
  court: CourtWithRegion,
  viewMode: CourtViewMode
): { contacts: CourtContactSections } {
  const contacts = useMemo(() => {
    const registryEmails: ContactEmailItem[] = [];
    const crownEmails: ContactEmailItem[] = [];
    const jcmEmails: ContactEmailItem[] = [];
    const jpEmails: ContactEmailItem[] = [];
    const otherEmails: ContactEmailItem[] = [];
    const phones: ContactPhoneItem[] = [];

    if (court.registry_email) {
      registryEmails.push({
        id: 'court-registry-email',
        label: 'Court Registry',
        emails: [court.registry_email],
        category: 'court',
      });
    }
    if (court.criminal_registry_email && court.criminal_registry_email !== court.registry_email) {
      registryEmails.push({
        id: 'criminal-registry-email',
        label: 'Criminal Registry',
        emails: [court.criminal_registry_email],
        category: 'court',
      });
    }
    if (court.crown_office_email) {
      crownEmails.push({
        id: 'crown-office-email',
        label: 'Crown Office',
        emails: [court.crown_office_email],
        category: 'court',
      });
    }

    if (court.registry_phone) {
      phones.push({
        id: 'court-registry-phone',
        label: 'Court Registry',
        phone: court.registry_phone,
        isFax: false,
      });
    }
    if (court.criminal_registry_phone && court.criminal_registry_phone !== court.registry_phone) {
      phones.push({
        id: 'criminal-registry-phone',
        label: 'Criminal Registry',
        phone: court.criminal_registry_phone,
        isFax: false,
      });
    }
    if (viewMode === 'provincial' && court.provincial_fax_filing) {
      phones.push({
        id: 'provincial-fax',
        label: 'Provincial Fax Filing',
        phone: court.provincial_fax_filing,
        isFax: true,
      });
    }
    if (court.crown_office_phone) {
      phones.push({
        id: 'crown-office-phone',
        label: 'Crown Office',
        phone: court.crown_office_phone,
        isFax: false,
      });
    }

    if (viewMode === 'provincial') {
      if (court.jcm_email) {
        jcmEmails.push({
          id: 'jcm-email',
          label: 'JCM',
          emails: [court.jcm_email],
          category: 'provincial',
        });
      }
      if (court.jcm_phone) {
        phones.push({
          id: 'jcm-phone',
          label: 'JCM',
          phone: court.jcm_phone,
          isFax: false,
        });
      }
    }

    if (viewMode === 'supreme') {
      if (court.supreme_scheduling_email) {
        jcmEmails.push({
          id: 'supreme-email',
          label: 'Supreme Scheduling',
          emails: [court.supreme_scheduling_email],
          category: 'supreme',
        });
      }
      if (court.supreme_scheduling_phone) {
        phones.push({
          id: 'supreme-phone',
          label: 'Supreme Scheduling',
          phone: court.supreme_scheduling_phone,
          isFax: false,
        });
      }
      if (court.supreme_fax_filing) {
        phones.push({
          id: 'supreme-fax',
          label: 'Supreme Fax Filing',
          phone: court.supreme_fax_filing,
          isFax: true,
        });
      }
    }

    const interpreterContact = (court.contacts ?? []).find(
      (contact) =>
        contact.contact_type === 'interpreter_request' &&
        contactVisibleForViewMode(contact, viewMode)
    );
    if (interpreterContact) {
      const emails = collectEmails(interpreterContact);
      if (emails.length > 0) {
        otherEmails.push({
          id: 'interpreter-request-email',
          label: 'Interpreter Request',
          emails,
          category: 'court',
        });
      }
      const contactPhones = collectPhones(interpreterContact);
      contactPhones.forEach((phone, index) => {
        const suffix = contactPhones.length > 1 ? ` ${index + 1}` : '';
        phones.push({
          id: `interpreter-request-phone-${index + 1}`,
          label: `Interpreter Request${suffix}`,
          phone,
          isFax: false,
        });
      });
    }

    const transcriptContact = (court.contacts ?? []).find(
      (contact) =>
        contact.contact_type === 'transcript_request' &&
        contactVisibleForViewMode(contact, viewMode)
    );
    if (transcriptContact) {
      const emails = collectEmails(transcriptContact);
      if (emails.length > 0) {
        otherEmails.push({
          id: 'transcript-request-email',
          label: 'Transcript Request',
          emails,
          category: 'court',
        });
      }
      const contactPhones = collectPhones(transcriptContact);
      contactPhones.forEach((phone, index) => {
        const suffix = contactPhones.length > 1 ? ` ${index + 1}` : '';
        phones.push({
          id: `transcript-request-phone-${index + 1}`,
          label: `Transcript Request${suffix}`,
          phone,
          isFax: false,
        });
      });
    }

    const extraContacts = (court.contacts ?? []).filter(
      (contact) =>
        !CONTACT_TYPES_HANDLED_BY_FIELDS.has(contact.contact_type) &&
        contactVisibleForViewMode(contact, viewMode)
    );

    for (const contact of extraContacts) {
      const label = formatContactLabel(contact.contact_type);
      const category = getContactCategory(contact.contact_type, contact);
      const emails = collectEmails(contact);
      const targetList = contact.contact_type === 'jp' ? jpEmails : otherEmails;

      if (emails.length > 0) {
        targetList.push({
          id: `contact-${contact.contact_type}-emails`,
          label,
          emails,
          category,
        });
      }

      const contactPhones = collectPhones(contact);
      contactPhones.forEach((phone, index) => {
        const suffix = contactPhones.length > 1 ? ` ${index + 1}` : '';
        phones.push({
          id: `contact-${contact.contact_type}-phone-${index + 1}`,
          label: `${label}${suffix}`,
          phone,
          isFax: false,
        });
      });

      if (viewMode === 'provincial' && contact.provincial_fax_filing) {
        phones.push({
          id: `contact-${contact.contact_type}-provincial-fax`,
          label: `${label} Fax Filing`,
          phone: contact.provincial_fax_filing,
          isFax: true,
        });
      }
      if (viewMode === 'supreme' && contact.supreme_fax_filing) {
        phones.push({
          id: `contact-${contact.contact_type}-supreme-fax`,
          label: `${label} Fax Filing`,
          phone: contact.supreme_fax_filing,
          isFax: true,
        });
      }
    }

    const emailGroups: ContactEmailGroup[] = [];
    if (registryEmails.length > 0) {
      emailGroups.push({
        id: 'registry',
        label: 'Court / Criminal Registry',
        items: registryEmails,
      });
    }
    if (crownEmails.length > 0) {
      emailGroups.push({
        id: 'crown',
        label: 'Crown Office',
        items: crownEmails,
      });
    }
    if (jcmEmails.length > 0) {
      emailGroups.push({
        id: 'jcm',
        label: 'JCM / Supreme Scheduling',
        items: jcmEmails,
      });
    }
    if (jpEmails.length > 0) {
      emailGroups.push({
        id: 'jp',
        label: 'Justice of the Peace',
        items: jpEmails,
      });
    }
    if (otherEmails.length > 0) {
      emailGroups.push({
        id: 'other',
        label: 'Other Contacts',
        items: otherEmails,
      });
    }

    const count =
      emailGroups.reduce((sum, group) => sum + group.items.length, 0) +
      phones.length;

    return {
      emailGroups,
      phones,
      count,
    };
  }, [court, viewMode]);

  return { contacts };
}
