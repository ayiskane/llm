// =============================================================================
// DATABASE TYPES - Match Supabase schema exactly
// =============================================================================

export interface Court {
  id: number;
  name: string;
  address: string | null;
  region_id: number | null;
  bail_hub_id: number | null;
  has_provincial: boolean;
  has_supreme: boolean;
  search_terms: string | null;
  phone: string | null;
  fax: string | null;
  sheriff_phone: string | null;
  created_at: string;
}

export interface Region {
  id: number;
  name: string;
  code: string;
  created_at: string;
}

export interface Contact {
  id: number;
  contact_role_id: number;
  email: string | null;
  emails: string[] | null;
  phone: string | null;
  fax: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContactRole {
  id: number;
  name: string;
  description: string | null;
}

export interface ContactCourt {
  id: number;
  contact_id: number;
  court_id: number;
  created_at: string;
}

export interface TeamsLink {
  id: number;
  court_id: number;
  name: string;
  url: string;
  phone_number: string | null;
  toll_free: string | null;
  conference_id: string | null;
  source_updated_at: string | null;
  created_at: string;
}

export interface ShellCell {
  id: number;
  name: string;
  phones: string[] | null;
  fax: string | null;
  notes: string | null;
  created_at: string;
}

export interface ShellCellCourt {
  id: number;
  cell_id: number;
  court_id: number;
  created_at: string;
}

export interface BailCourt {
  id: number;
  name: string;
  triage_time_am: string | null;
  triage_time_pm: string | null;
  court_time_am: string | null;
  court_time_pm: string | null;
  arrest_cutoff: string | null;
  youth_custody_day: string | null;
  youth_custody_time: string | null;
  source_updated_at: string | null;
  created_at: string;
}

export interface BailTeam {
  id: number;
  bail_court_id: number;
  name: string;
  url: string;
  phone_number: string | null;
  toll_free: string | null;
  conference_id: string | null;
  source_updated_at: string | null;
  created_at: string;
}

export interface BailContact {
  id: number;
  region_id: number;
  role: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
}

export interface Program {
  id: number;
  name: string;
  location: string | null;
  region_id: number | null;
  type: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

// =============================================================================
// EXTENDED TYPES - With joined data
// =============================================================================

export interface ContactWithRole extends Contact {
  contact_role: ContactRole;
}

export interface CourtWithRegion extends Court {
  region: Region | null;
}

export interface CourtDetails {
  court: CourtWithRegion;
  contacts: ContactWithRole[];
  cells: ShellCell[];
  teamsLinks: TeamsLink[];
  bailCourt: BailCourt | null;
  bailTeams: BailTeam[];
  bailContacts: BailContact[];
  programs: Program[];
}

// =============================================================================
// UI TYPES
// =============================================================================

export type ViewMode = 'home' | 'results' | 'detail';

export type AccordionId = 'contacts' | 'cells' | 'bail' | 'teams' | 'programs';

export interface SearchResult {
  courts: Court[];
  contacts: ContactWithRole[];
  cells: ShellCell[];
  teamsLinks: TeamsLink[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface SectionProps {
  title: string;
  count?: string | number;
  color?: 'blue' | 'purple' | 'teal' | 'amber' | 'slate';
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
