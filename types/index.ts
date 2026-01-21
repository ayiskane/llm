// Court Types
export interface Court {
  id: number;
  name: string;
  region_id: number;
  region_name?: string;
  region_code?: string;
  has_provincial: boolean;
  has_supreme: boolean;
  is_circuit: boolean;
  is_staffed: boolean;
  contact_hub: string | null;
  contact_hub_name?: string;
  address: string | null;
  phone: string | null;
  fax: string | null;
  sheriff_phone: string | null;
  supreme_scheduling_phone: string | null;
  access_code: string | null;
  bail_hub_id: number | null;
}

export interface Contact {
  court_id?: number;  // Which court this contact belongs to
  id: number;
  email: string | null;
  emails: string[] | null;
  contact_role_id: number;
  role_name?: string;
}

export interface ShellCell {
  court_name?: string;  // Court name for CH cells display
  id: number;
  name: string;
  cell_type: string;
  phones: string[];
  catchment: string | null;
  court_id: number | null;
  region_id: number | null;
}

export interface TeamsLink {
  id: number;
  name: string | null;
  courtroom: string | null;
  conference_id: string | null;
  phone: string | null;
  phone_toll_free: string | null;
  teams_link: string | null;
  teams_link_type_id: number | null;
  type_name?: string;
  bail_court_id?: number | null;
}

export interface BailCourt {
  id: number;
  name: string;
  court_id: number | null;
  region_id: number;
  is_hybrid: boolean;
  is_daytime: boolean;
  triage_time_am: string | null;
  triage_time_pm: string | null;
  court_start_am: string | null;
  court_start_pm: string | null;
  court_end: string | null;
  cutoff_new_arrests: string | null;
}

export interface BailContact {
  id: number;
  email: string | null;
  bail_court_id: number | null;
  region_id: number | null;
  role_id: number;
  availability_id: number | null;
  role_name?: string;
  availability_name?: string;
}

// Search intent types
export type SearchIntent = 'court_lookup' | 'contact_lookup' | 'cell_lookup' | 'teams_lookup' | 'bail_lookup' | 'general';

export interface SearchResults {
  courts: Court[];
  contacts: Contact[];
  sheriffCells: ShellCell[];
  teamsLinks: TeamsLink[];
  bailCourt: BailCourt | null;
  bailContacts: BailContact[];
  bailTeamsLinks: TeamsLink[];
  
  // Filter metadata from parsed query
  courtroomFilter?: string | null;      // "204" from "abby 204"
  contactTypeFilter?: string | null;    // "crown" from "abby crown"
  contactTypeLabel?: string | null;     // "Crown" display label
  cellTypeFilter?: string | null;       // "RCMP" from "abby rcmp"
  regionFilter?: number | null;         // 3 from "r3 jcm"
  searchIntent?: SearchIntent;          // What the user is looking for
}

// Region info
export interface Region {
  id: number;
  code: string;
  name: string;
}

// Contact Roles
export const CONTACT_ROLES = {
  CROWN: 1,
  JCM: 2,
  SHERIFF_QB: 3,
  REGISTRY_QB: 4,
  LABC_NAVIGATOR: 5,
  FEDERAL_CROWN: 6,
  SCHEDULING: 8,
  COURT_REGISTRY: 9,
  CRIMINAL_REGISTRY: 10,
  INTERPRETER: 11,
  BAIL_CROWN: 12,
  BAIL_JCM: 13,
  TRANSCRIPTS: 14,
  COORDINATOR: 21,
  FIRST_NATIONS_CROWN: 23,
} as const;

// Contact role display names
export const CONTACT_ROLE_NAMES: Record<number, string> = {
  1: 'Crown',
  2: 'JCM',
  3: 'Sheriff QB',
  4: 'Registry QB',
  5: 'LABC Navigator',
  6: 'Federal Crown',
  8: 'SC Scheduling',
  9: 'Court Registry',
  10: 'Criminal Registry',
  11: 'Interpreter',
  12: 'Bail Crown',
  13: 'Bail JCM',
  14: 'Transcripts',
  21: 'Coordinator',
  23: 'First Nations Crown',
};

// Region codes
export const REGION_CODES: Record<number, string> = {
  1: 'R1',
  2: 'R2',
  3: 'R3',
  4: 'R4',
  5: 'R5',
  6: 'FED',
};

export const REGION_NAMES: Record<number, string> = {
  1: 'Island',
  2: 'Vancouver Coastal',
  3: 'Fraser',
  4: 'Interior',
  5: 'Northern',
  6: 'Federal',
};




// RCC Support Contact Types
export interface RccSupportRole {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface RccSupportOrganization {
  id: number;
  name: string;
  short_name: string | null;
  website: string | null;
  general_email: string | null;
  general_phone: string | null;
  notes: string | null;
}

export interface RccSupportContact {
  id: number;
  name: string;
  is_individual: boolean;
  role_id: number | null;
  organization_id: number | null;
  email: string | null;
  email_secondary: string | null;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
  // Joined fields from view
  role_code?: string;
  role_name?: string;
  organization_name?: string;
  organization_short_name?: string;
  centre_ids?: number[];  // Array of centre IDs from correctional-centres.ts
}

// RCC Support role codes
export const RCC_ROLE_CODES = {
  CTT: 'CTT',   // Community Transition Team
  CR: 'CR',     // Community Reintegration
  CIW: 'CIW',   // Community Integration Worker
  ITRP: 'ITRP', // Integrated Transitional Release Planning
  ICL: 'ICL',   // Indigenous Cultural Liaison
  RPO: 'RPO',   // Release Planning Officer
  CDC: 'CDC',   // Concurrent Disorder Counsellor
} as const;

export const RCC_ROLE_NAMES: Record<string, string> = {
  CTT: 'Community Transition Team',
  CR: 'Community Reintegration',
  CIW: 'Community Integration Worker',
  ITRP: 'Integrated Transitional Release Planning',
  ICL: 'Indigenous Cultural Liaison',
  RPO: 'Release Planning Officer',
  CDC: 'Concurrent Disorder Counsellor',
};



// Program Types
export interface ProgramType {
  id: number;
  code: string;
  name: string;
  description: string | null;
}

export interface Program {
  id: number;
  name: string;
  type_id: number | null;
  location: string | null;
  region_id: number | null;
  address: string | null;
  phone: string | null;
  phone_secondary: string | null;
  fax: string | null;
  email: string | null;
  website: string | null;
  gender: 'all' | 'men' | 'women' | null;
  indigenous_only: boolean;
  accepts_sa_records: boolean;
  is_residential: boolean;
  application_method: 'phone' | 'written' | 'referral' | null;
  parent_organization: string | null;
  notes: string | null;
  is_active: boolean;
  // Joined fields from view
  type_code?: string;
  type_name?: string;
  region_name?: string;
}

export interface ProgramContact {
  id: number;
  program_id: number;
  name: string;
  role: string | null;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
}

// Program type codes
export const PROGRAM_TYPE_CODES = {
  RECOVERY: 'RECOVERY',
  TREATMENT: 'TREATMENT',
  DETOX: 'DETOX',
  FPS: 'FPS',
  IJC: 'IJC',
  IJP: 'IJP',
  CORRECTIONAL: 'CORRECTIONAL',
} as const;

export const PROGRAM_TYPE_NAMES: Record<string, string> = {
  RECOVERY: 'Recovery House',
  TREATMENT: 'Treatment Centre',
  DETOX: 'Detox Centre',
  FPS: 'Forensic Psychiatric Services',
  IJC: 'Indigenous Justice Centre',
  IJP: 'Indigenous Justice Program',
  CORRECTIONAL: 'Correctional Program',
};

export const APPLICATION_METHODS = {
  phone: 'Phone Call',
  written: 'Written Application',
  referral: 'Referral Required',
} as const;

