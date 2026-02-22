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
  bail_hub?: BailHub | null;
}

export interface BailHub {
  id: number;
  name: string;
  region_id?: number | null;
  court_id?: number | null;
  region_justice_centre_name?: string | null;
  sheriff_coordinator_email?: string | null;
  sheriff_coordinator_phone?: string | null;
  sheriff_coordinator_teams_chat?: string | null;
  triage_time?: string | null;
  triage_am?: number | null;
  triage_am_name?: string | null;
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
  times_text?: string | null;
  is_youth?: boolean | null;
  courtroom_type?: number | null;
  courtroom_type_name?: string | null;
  days_text?: string | null;
  notes?: string | null;
}

export interface CrownScheduleItem {
  id: number;
  schedule_date: string;
  courtroom?: number | null;
  crown_name: string;
  crown_role_code?: string | null;
  crown_role_label?: string | null;
}

export interface JudgeScheduleItem {
  id: number;
  schedule_date: string;
  judge_name: string;
  bail_hub_name?: string | null;
}

export interface ProvincialSchedules {
  crownSchedules: CrownScheduleItem[];
  judgeSchedules: JudgeScheduleItem[];
}

export interface BailCrownScheduleItem {
  id: number;
  schedule_date: string;
  court_id?: number | null;
  crown_name: string;
  crown_email?: string | null;
  crown_phone?: string | null;
  crown_role_code?: string | null;
  crown_role_label?: string | null;
  badge_label?: string | null;
}

export interface BailJudgeScheduleItem {
  id: number;
  schedule_date: string;
  judge_name: string;
  bail_hub_name?: string | null;
}

export interface DutyCounselScheduleItem {
  id: number;
  schedule_date: string;
  duty_counsel_name: string;
  duty_counsel_email?: string | null;
  duty_counsel_phone?: string | null;
  role?: string | null;
  is_am?: boolean | null;
  is_pm?: boolean | null;
}

export interface BailSchedules {
  crownSchedules: BailCrownScheduleItem[];
  judgeSchedules: BailJudgeScheduleItem[];
  dutyCounselSchedules: DutyCounselScheduleItem[];
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
  submitter_name?: string | null;
  status: 'open' | 'in_progress' | 'fixed' | 'wontfix';
  resolved_at?: string | null;
  resolved_by?: string | null;
}

export interface CorrectionalCentre {
  id: number;
  name: string;
  short_name?: string | null;
  type_id: number;
  type_name?: string | null;
  region_id?: number | null;
  region_name?: string | null;
  region_code?: string | null;
  address?: string | null;
  general_phone?: string | null;
  general_phone_option?: string | null;
  general_fax?: string | null;
  cdn_fax?: string | null;
  accepts_cdn_by_fax?: boolean | null;
  visit_request_phone?: string | null;
  visit_request_email?: string | null;
  virtual_visit_email?: string | null;
  lawyer_callback_email?: string | null;
  callback_1_start?: string | null;
  callback_1_end?: string | null;
  callback_2_start?: string | null;
  callback_2_end?: string | null;
  visit_hours_inperson?: string | null;
  visit_hours_virtual?: string | null;
  accepts_usb?: boolean | null;
  accepts_hard_drive?: boolean | null;
  accepts_cd_dvd?: boolean | null;
  disclosure_notes?: string | null;
  require_padlock?: boolean | null;
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
