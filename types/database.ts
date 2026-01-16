// Database types for BC Legal Directory

export type CourtRegion = 'Fraser' | 'Interior' | 'North' | 'Vancouver Island' | 'Vancouver Coastal';

export interface CourtContacts {
  crown_email?: string;
  jcm_scheduling_email?: string;
  registry_email?: string;
  criminal_registry_email?: string;
  civil_registry_email?: string;
  family_registry_email?: string;
  small_claims_email?: string;
  traffic_email?: string;
  bail_crown_email?: string;
  bail_jcm_email?: string;
  scheduling_email?: string;
  transcripts_email?: string;
}

export interface Court {
  id: string;
  name: string;
  city: string | null;
  region: CourtRegion;
  address: string | null;
  phone: string | null;
  fax: string | null;
  sheriff_phone: string | null;
  access_code: string | null;
  access_code_notes: string | null;
  has_provincial: boolean;
  has_supreme: boolean;
  provincial_contacts: CourtContacts | null;
  supreme_contacts: CourtContacts | null;
  virtual_courtroom_code: string | null;
  virtual_courtroom_phone: string | null;
  virtual_courtroom_toll_free: string | null;
  virtual_courtroom_conference_id: string | null;
  is_circuit: boolean;
  hub_court_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface RcmpContact {
  id: string;
  name: string;
  region: CourtRegion | null;
  location_type: 'rcmp' | 'police_dept' | 'courthouse' | 'youth_detention' | 'courtroom' | 'admin';
  cell_numbers: string[] | null;
  virtual_courts_email: string | null;
  courthouse_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CorrectionalFacility {
  id: string;
  name: string;
  abbreviation: string;
  facility_type: 'Provincial' | 'Federal';
  location: string | null;
  region: CourtRegion | null;
  street_address: string | null;
  mailing_address: string | null;
  general_phone: string | null;
  general_fax: string | null;
  visit_request_phone: string | null;
  visit_request_email: string | null;
  virtual_visit_email: string | null;
  cdn_fax: string | null;
  cdn_by_fax: boolean;
  e_particulars: {
    usb?: boolean;
    disc?: boolean;
    hard_drive?: boolean;
    padlock_required?: boolean;
    padlock_recommended?: boolean;
    delivery_mail?: boolean;
    delivery_courier?: boolean;
    mail_attention?: string;
    notes?: string[];
  } | null;
  notes: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface LegalAidOffice {
  id: string;
  name: string;
  region: CourtRegion | 'Province-wide' | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  intake_email: string | null;
  hours: string | null;
  locations_served: string[] | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessCode {
  id: string;
  courthouse_name: string;
  region: CourtRegion | null;
  code: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
