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
  type_name?: string | null;
  courtroom?: string | null;
  display_order?: number | null;
}

export interface CourtDetails {
  court: CourtWithRegion;
  cells: unknown[];
  teamsLinks: TeamsLink[];
  bailHub: unknown | null;
  bailTeams: unknown[];
  bailContacts: unknown[];
}
