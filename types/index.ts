export interface Region {
  id: number;
  name: string;
  code: string;
}

export interface CourtContact {
  id: number;
  court_id: number;
  contact_type: string;
  email?: string | null;
  emails?: string[] | null;
  emails_all?: string[] | null;
  phone?: string | null;
  phones?: string[] | null;
  provincial_fax_filing?: string | null;
  supreme_fax_filing?: string | null;
  is_provincial?: boolean;
  is_supreme?: boolean;
  is_appeals?: boolean;
}

export interface CourtBase {
  id: number;
  name: string;
  has_provincial: boolean;
  has_supreme: boolean;
  is_circuit: boolean;
  address?: string | null;
  mailing_address?: string | null;
  fnc_address?: string | null;
  region_id?: number | null;
  region_name?: string | null;
  region_code?: string | null;
  region?: Region | null;
  parent_court?: { id: number; name: string } | null;
  is_mst?: boolean | null;
  is_fnc?: boolean | null;
  registry_email?: string | null;
  registry_phone?: string | null;
  registry_phones?: string[] | null;
  criminal_registry_email?: string | null;
  criminal_registry_phone?: string | null;
  provincial_fax_filing?: string | null;
  crown_office_email?: string | null;
  crown_office_phone?: string | null;
  jcm_email?: string | null;
  jcm_phone?: string | null;
  jcm_phones?: string[] | null;
  supreme_scheduling_email?: string | null;
  supreme_scheduling_phone?: string | null;
  supreme_fax_filing?: string | null;
  contacts?: CourtContact[];
}

export interface Court extends CourtBase {}

export interface CourtWithRegion extends CourtBase {
  region: Region | null;
  region_id: number | null;
  region_name: string | null;
  region_code: string | null;
}

export interface TeamsLink {
  id?: number;
  court_id?: number;
  url?: string | null;
  title?: string | null;
  schedule?: string | null;
  notes?: string | null;
  type_name?: string | null;
  type_id?: number | null;
  courtroom_type_id?: number | null;
  courtroom_type_name?: string | null;
  courtroom_type_full_name?: string | null;
  courtroom?: string | null;
  display_order?: number | null;
  phone_number?: string | null;
  toll_free_number?: string | null;
  conference_id?: string | null;
  bail_hub_id?: number | null;
}

export interface BailHub {
  id: number;
  name: string;
  region_id?: number | null;
  court_id?: number | null;
  sheriff_coordinator_email?: string | null;
  sheriff_coordinator_phone?: string | null;
  sheriff_coordinator_teams_chat?: string | null;
}

export interface BailContact {
  id: number;
  bail_hub_id?: number | null;
  contact_type?: string | null;
  label?: string | null;
  email?: string | null;
  phone?: string | null;
  is_daytime?: boolean | null;
}

export interface SheriffCell {
  id: number;
  name: string;
  type_id?: number | null;
  type_name?: string | null;
  region_id?: number | null;
  phones?: string[] | null;
  catchment?: string | null;
}

export interface WeekendBailHubWithTeams {
  bailHub: BailHub;
  teams: TeamsLink[];
}

export interface CourtScheduleDate {
  id: number;
  schedule_id?: number | null;
  court_id?: number | null;
  date_start: string;
  date_end?: string | null;
  notes?: string | null;
  schedule_type?: string | null;
  schedule_label?: string | null;
}

export interface CourtroomSchedule {
  id: number;
  court_id?: number | null;
  courtroom?: string | null;
  weekdays?: string[] | null;
  nth_week?: number[] | null;
  times_text?: string | null;
  is_youth?: boolean | null;
  courtroom_type?: number[] | null;
  days_text?: string | null;
  notes?: string | null;
}

export interface BugReport {
  id: string;
  created_at: string;
  kind: 'bug' | 'inaccurate_info' | 'general_feedback' | 'other';
  title?: string | null;
  details: string;
  url?: string | null;
  path?: string | null;
  page_title?: string | null;
  status: 'open' | 'in_progress' | 'fixed' | 'wontfix';
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface CourtDetails {
  court: CourtWithRegion;
  teamsLinks: TeamsLink[];
  courtroomSchedules: CourtroomSchedule[];
  scheduleDates: CourtScheduleDate[];
  bailHub: BailHub | null;
}

export interface BailDetails {
  bailHub: BailHub | null;
  bailTeams: TeamsLink[];
  bailContacts: BailContact[];
  cells: SheriffCell[];
}
