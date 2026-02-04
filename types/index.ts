// ============================================================================
// LLM: LEGAL LEGENDS MANUAL - TYPE DEFINITIONS
// ============================================================================
// Updated to match v2 database schema
// ============================================================================

// ============================================================================
// COURT
// ============================================================================

export interface Court {
  id: number;
  name: string;
  code: string | null;
  region_id: number;
  address: string | null;
  has_provincial: boolean;
  has_supreme: boolean;
  is_circuit: boolean;
  parent_court_id: number | null;
  timezone: string | null;
  access_code: string | null;
  access_code_notes: string | null;
  notes: string | null;
  bail_hub_id: number | null;
  // Contact fields stored directly on court
  registry_phone: string | null;
  registry_fax: string | null;
  registry_email: string | null;
  criminal_fax: string | null;
  sheriff_phone: string | null;
  crown_office_email: string | null;
  crown_office_phone: string | null;
  jcm_email: string | null;
  jcm_phone: string | null;
  // Supreme-specific fields
  supreme_scheduling_phone: string | null;
  supreme_scheduling_fax: string | null;
  supreme_toll_free: string | null;
  // VB Lead fields
  registry_vb_lead_name: string | null;
  registry_vb_lead_email: string | null;
  registry_vb_lead_phone: string | null;
  // Joined/computed fields (not in DB)
  region_name?: string;
  region_code?: string;
  parent_court_name?: string;
}

// Court with joined region data
export interface CourtWithRegion extends Court {
  region?: Region;
  parent_court?: { id: number; name: string } | null;
}

// ============================================================================
// CONTACT
// ============================================================================

export interface Contact {
  id: number;
  name: string;
  title: string | null;
  phone: string | null;
  email: string | null;
}

export interface ContactRole {
  id: number;
  name: string;
}

// Entity contact - links contacts to entities (courts, bail hubs, etc.)
export interface EntityContact {
  id: number;
  contact_id: number;
  role_id: number;
  court_id: number | null;
  bail_hub_id: number | null;
  program_id: number | null;
  sheriff_cell_id: number | null;
  region_id: number | null;
  service_area_id: number | null;
  notes: string | null;
  // Joined data
  contact?: Contact;
  role?: ContactRole;
}

// Contact with role for display (flattened view)
export interface ContactWithRole {
  id: number;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  role_id: number;
  role_name?: string;
  notes?: string | null;
}

// ============================================================================
// SHERIFF CELL
// ============================================================================

export interface SheriffCellType {
  id: number;
  name: string;
}

export interface SheriffCell {
  id: number;
  name: string;
  type_id: number;
  region_id: number;
  phones: string[];
  catchment: string | null;
  // Joined data
  type_name?: string;
  region_name?: string;
}

// Legacy alias for compatibility
export type ShellCell = SheriffCell;

// ============================================================================
// TEAMS LINK
// ============================================================================

export interface TeamsLinkType {
  id: number;
  name: string;
}

export interface TeamsLink {
  id: number;
  type_id: number;
  url: string | null;
  phone_number: string | null;
  toll_free_number: string | null;
  conference_id: string | null;
  courtroom: string | null;
  court_id: number | null;
  bail_hub_id: number | null;
  notes: string | null;
  // Joined data
  type_name?: string;
}

// BailTeam is just a TeamsLink that has bail_hub_id set
export type BailTeam = TeamsLink;

// ============================================================================
// BAIL HUB (formerly bail_courts)
// ============================================================================

export interface BailHub {
  id: number;
  name: string;
  region_id: number;
  court_id: number | null;
  // Sheriff coordinator contact info (stored directly)
  sheriff_coordinator_email: string | null;
  sheriff_coordinator_phone: string | null;
  sheriff_coordinator_teams_chat: string | null;
  // Joined data
  region_name?: string;
  region_code?: string;
}

// Legacy alias for compatibility
export type BailCourt = BailHub;

// Bail contact - fetched via entity_contacts for bail_hub
export interface BailContact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role_id: number;
  role_name?: string;
  bail_hub_id: number | null;
  region_id: number | null;
}

// Weekend bail court with its associated teams links
export interface WeekendBailHubWithTeams {
  bailHub: BailHub;
  teams: TeamsLink[];
}

// Legacy alias
export type WeekendBailCourtWithTeams = WeekendBailHubWithTeams;

// ============================================================================
// SCHEDULE
// ============================================================================

export interface ScheduleType {
  id: number;
  name: string;
}

export interface Schedule {
  id: number;
  schedule_type_id: number;
  court_id: number | null;
  bail_hub_id: number | null;
  region_id: number | null;
  courtroom: string | null;
  date_start: string | null;
  date_end: string | null;
  day_of_week: string | null;
  time_start: string | null;
  time_end: string | null;
  notes: string | null;
  // Joined data
  type_name?: string;
}

// Legacy type alias for JCM fixed date schedule
export interface JcmFxdSchedule {
  id: number;
  court_id: number;
  schedule_type_id: number;
  day_of_week: string | null;
  time_start: string | null;
  notes: string | null;
  // For display
  days?: string | null;
  time?: string | null;
  teams_link?: TeamsLink | null;
}

// ============================================================================
// CORRECTIONS CENTRE
// ============================================================================

export interface CorrectionalCentreType {
  id: number;
  name: string;
}

export interface CorrectionalCentre {
  id: number;
  name: string;
  short_name: string | null;
  type_id: number;
  region_id: number | null;
  address: string | null;
  general_phone: string | null;
  general_phone_option: string | null;
  general_fax: string | null;
  cdn_fax: string | null;
  accepts_cdn_by_fax: boolean | null;
  visit_request_phone: string | null;
  visit_request_email: string | null;
  virtual_visit_email: string | null;
  lawyer_callback_email: string | null;
  callback_1_start: string | null;
  callback_1_end: string | null;
  callback_2_start: string | null;
  callback_2_end: string | null;
  visit_hours_inperson: string | null;
  visit_hours_virtual: string | null;
  accepts_usb: boolean | null;
  accepts_hard_drive: boolean | null;
  accepts_cd_dvd: boolean | null;
  disclosure_notes: string | null;
  require_padlock: boolean;
  // Joined data
  type_name?: string;
  region_name?: string;
}

// Legacy alias
export type CorrectionsCentre = CorrectionalCentre;
export type CorrectionsCentreWithRegion = CorrectionalCentre;

// ============================================================================
// REGION
// ============================================================================

export interface Region {
  id: number;
  code: string;
  name: string;
}

// ============================================================================
// PROGRAM
// ============================================================================

export interface ProgramType {
  id: number;
  name: string;
  code: string | null;
}

export interface Program {
  id: number;
  name: string;
  type_id: number | null;
  region_id: number | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
  // Joined data
  type_name?: string;
  type_code?: string;
  region_name?: string;
}

// ============================================================================
// SERVICE AREA
// ============================================================================

export interface ServiceArea {
  id: number;
  name: string;
  region_id: number;
}

// ============================================================================
// COMBINED QUERY RESULTS
// ============================================================================

export interface CourtDetails {
  court: CourtWithRegion;
  contacts: ContactWithRole[];
  cells: SheriffCell[];
  teamsLinks: TeamsLink[];
  bailHub: BailHub | null;
  bailTeams: TeamsLink[];
  bailContacts: BailContact[];
  programs: Program[];
  weekendBailHubs: WeekendBailHubWithTeams[];
  schedules: Schedule[];
}

// Legacy alias
export interface CourtDetailsLegacy extends CourtDetails {
  bailCourt: BailHub | null;
  weekendBailCourts: WeekendBailHubWithTeams[];
  jcmFxdSchedule: JcmFxdSchedule | null;
}

export interface BailHubDetails {
  bailHub: BailHub;
  region: Region | null;
  bailTeams: TeamsLink[];
  bailContacts: BailContact[];
  linkedCourts: { id: number; name: string }[];
}

// Legacy alias
export type BailCourtDetails = BailHubDetails;

// ============================================================================
// VIEW MODE
// ============================================================================

export type ViewMode = 'home' | 'results' | 'detail';

// ============================================================================
// CONTACT ROLE CONSTANTS
// ============================================================================

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
  SHERIFF_VB_COORDINATOR: 24,
} as const;

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
  11: 'Interpreter Request',
  12: 'Bail Crown',
  13: 'Bail JCM',
  14: 'Transcripts',
  21: 'Coordinator',
  23: 'First Nations Crown',
  24: 'Sheriff VB Coordinator',
};

// ============================================================================
// REGION CONSTANTS
// ============================================================================

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
