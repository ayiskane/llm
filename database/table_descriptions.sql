-- TABLE AND COLUMN DESCRIPTIONS FOR BC LEGAL REFERENCE DATABASE
-- Run this in Supabase SQL Editor to add descriptions

-- ============================================
-- LOOKUP TABLES (Reference Data)
-- ============================================

-- REGIONS
COMMENT ON TABLE regions IS 'BC bail regions (R1-R5) used for organizing courts and contacts';
COMMENT ON COLUMN regions.id IS 'Primary key';
COMMENT ON COLUMN regions.code IS 'Region code (R1, R2, R3, R4, R5)';
COMMENT ON COLUMN regions.name IS 'Region name (Island, Vancouver Coastal, Fraser, Interior, Northern)';

-- CONTACT_ROLES
COMMENT ON TABLE contact_roles IS 'Types of contacts (Crown, JCM, Registry, Interpreter, etc.) used by contacts and vb_contacts tables';
COMMENT ON COLUMN contact_roles.id IS 'Primary key';
COMMENT ON COLUMN contact_roles.name IS 'Role name (e.g., Crown, JCM, Court Registry)';
COMMENT ON COLUMN contact_roles.description IS 'Human-readable description of the role';

-- AVAILABILITY
COMMENT ON TABLE availability IS 'Time availability options for virtual bail contacts (Daytime, Evening, Weekend, All Hours)';
COMMENT ON COLUMN availability.id IS 'Primary key';
COMMENT ON COLUMN availability.name IS 'Availability period name';
COMMENT ON COLUMN availability.description IS 'Description of the time period';

-- MS_TEAMS_TYPES (formerly link_types)
COMMENT ON TABLE ms_teams_types IS 'Types of MS Teams links (Courtroom, Triage, Justice Centre, Virtual Bail, Federal)';
COMMENT ON COLUMN ms_teams_types.id IS 'Primary key';
COMMENT ON COLUMN ms_teams_types.name IS 'Link type name';
COMMENT ON COLUMN ms_teams_types.description IS 'Description of what this link type is used for';

-- ============================================
-- CORE TABLES
-- ============================================

-- COURTS
COMMENT ON TABLE courts IS 'All BC courthouses and circuit courts (90 total: 42 staffed + 48 circuit)';
COMMENT ON COLUMN courts.id IS 'Primary key';
COMMENT ON COLUMN courts.name IS 'Court name (e.g., Surrey, Chilliwack, Daajing Giids)';
COMMENT ON COLUMN courts.region_id IS 'FK to regions - which bail region this court belongs to';
COMMENT ON COLUMN courts.address IS 'Street address';
COMMENT ON COLUMN courts.phone IS 'Main phone number';
COMMENT ON COLUMN courts.fax IS 'Main fax number';
COMMENT ON COLUMN courts.criminal_fax IS 'Criminal registry fax (if separate from main)';
COMMENT ON COLUMN courts.sheriff_phone IS 'Sheriff direct line';
COMMENT ON COLUMN courts.has_provincial IS 'TRUE if court has Provincial Court services';
COMMENT ON COLUMN courts.has_supreme IS 'TRUE if court has Supreme Court services';
COMMENT ON COLUMN courts.has_supreme_filing IS 'TRUE if Provincial-only court can file Supreme Court documents';
COMMENT ON COLUMN courts.is_staffed IS 'TRUE for staffed courthouses, FALSE for circuit courts';
COMMENT ON COLUMN courts.is_circuit IS 'TRUE for circuit courts (unstaffed, sit on specific dates)';
COMMENT ON COLUMN courts.contact_hub IS 'For circuit courts: name of the staffed court that handles admin';
COMMENT ON COLUMN courts.access_code IS 'Barrister lounge access code';
COMMENT ON COLUMN courts.access_code_notes IS 'Notes about access code (e.g., location, special instructions)';
COMMENT ON COLUMN courts.bail_hub_id IS 'FK to vb_courts - which virtual bail hub handles this courts bail matters';
COMMENT ON COLUMN courts.has_legal_aid IS 'TRUE if Legal Aid BC has an office at this court';
COMMENT ON COLUMN courts.supreme_scheduling_phone IS 'Supreme Court scheduling direct phone';
COMMENT ON COLUMN courts.supreme_scheduling_fax IS 'Supreme Court scheduling fax';
COMMENT ON COLUMN courts.supreme_toll_free IS 'Supreme Court toll-free number';
COMMENT ON COLUMN courts.notes IS 'Additional notes (e.g., Mountain Time zone)';

-- CONTACTS
COMMENT ON TABLE contacts IS 'Unique contact records (emails) for courts - deduplicated, linked via contacts_courts junction table';
COMMENT ON COLUMN contacts.id IS 'Primary key';
COMMENT ON COLUMN contacts.email IS 'Contact email address';
COMMENT ON COLUMN contacts.contact_type IS 'DEPRECATED - use contact_role_id instead. Type of contact (crown, jcm_scheduling, etc.)';
COMMENT ON COLUMN contacts.contact_role_id IS 'FK to contact_roles - type of contact';
COMMENT ON COLUMN contacts.notes IS 'Additional notes about this contact';

-- CONTACTS_COURTS (Junction Table)
COMMENT ON TABLE contacts_courts IS 'Junction table linking contacts to courts (many-to-many) - one contact can serve multiple courts';
COMMENT ON COLUMN contacts_courts.id IS 'Primary key';
COMMENT ON COLUMN contacts_courts.contact_id IS 'FK to contacts';
COMMENT ON COLUMN contacts_courts.court_id IS 'FK to courts';

-- CELLS
COMMENT ON TABLE cells IS 'Police/RCMP cells and courthouse sheriff cells - where arrested persons are held';
COMMENT ON COLUMN cells.id IS 'Primary key';
COMMENT ON COLUMN cells.name IS 'Cell location name (e.g., Surrey RCMP, Abbotsford CH)';
COMMENT ON COLUMN cells.cell_type IS 'Type: police, courthouse, youth, justice_centre, federal';
COMMENT ON COLUMN cells.phones IS 'JSONB array of phone numbers for this location';
COMMENT ON COLUMN cells.court_id IS 'FK to courts - for courthouse cells, which court this is attached to';
COMMENT ON COLUMN cells.catchment IS 'Areas/communities this detachment serves';

-- CELLS_COURTS (Junction Table)
COMMENT ON TABLE cells_courts IS 'Junction table linking police cells to courts they send arrests to (many-to-many)';
COMMENT ON COLUMN cells_courts.id IS 'Primary key';
COMMENT ON COLUMN cells_courts.cell_id IS 'FK to cells';
COMMENT ON COLUMN cells_courts.court_id IS 'FK to courts';

-- MS_TEAMS
COMMENT ON TABLE ms_teams IS 'All BC courtroom MS Teams links (337 entries) - master table for all Teams meetings';
COMMENT ON COLUMN ms_teams.id IS 'Primary key';
COMMENT ON COLUMN ms_teams.court_id IS 'FK to courts - which courthouse this link belongs to';
COMMENT ON COLUMN ms_teams.courtroom IS 'Courtroom identifier (e.g., CR 101, CR 204)';
COMMENT ON COLUMN ms_teams.conference_id IS 'Phone conference ID (e.g., 512 863 082#)';
COMMENT ON COLUMN ms_teams.phone IS 'Local dial-in phone number';
COMMENT ON COLUMN ms_teams.phone_toll_free IS 'Toll-free dial-in number';
COMMENT ON COLUMN ms_teams.teams_link IS 'Full MS Teams meeting URL';
COMMENT ON COLUMN ms_teams.notes IS 'Additional notes';
COMMENT ON COLUMN ms_teams.source_updated_at IS 'Date when the source document was last updated';

-- ============================================
-- VIRTUAL BAIL TABLES
-- ============================================

-- VB_COURTS
COMMENT ON TABLE vb_courts IS 'Virtual bail courts and Justice Centres (24 total) - includes daytime hybrid courts and evening/weekend Justice Centres';
COMMENT ON COLUMN vb_courts.id IS 'Primary key';
COMMENT ON COLUMN vb_courts.court_id IS 'FK to courts - for daytime bail courts, which physical courthouse';
COMMENT ON COLUMN vb_courts.region_id IS 'FK to regions';
COMMENT ON COLUMN vb_courts.name IS 'Virtual bail court name';
COMMENT ON COLUMN vb_courts.is_hybrid IS 'TRUE if this is a hybrid courtroom (physical + virtual)';
COMMENT ON COLUMN vb_courts.is_daytime IS 'TRUE for daytime courts, FALSE for Justice Centres (evening/weekend)';
COMMENT ON COLUMN vb_courts.triage_time_am IS 'Morning triage time (e.g., 9:00-9:30 AM)';
COMMENT ON COLUMN vb_courts.triage_time_pm IS 'Afternoon triage time (e.g., 1:15-1:30 PM)';
COMMENT ON COLUMN vb_courts.court_start_am IS 'Morning court session start time';
COMMENT ON COLUMN vb_courts.court_start_pm IS 'Afternoon court session start time';
COMMENT ON COLUMN vb_courts.court_end IS 'Court end time';
COMMENT ON COLUMN vb_courts.cutoff_new_arrests IS 'Cutoff time for new arrests to be heard same day';
COMMENT ON COLUMN vb_courts.notes IS 'Additional notes (e.g., courtroom number, special instructions)';

-- VB_CONTACTS
COMMENT ON TABLE vb_contacts IS 'Virtual bail contacts - Crown counsel, JCM, and LABC Navigators by region/court';
COMMENT ON COLUMN vb_contacts.id IS 'Primary key';
COMMENT ON COLUMN vb_contacts.vb_court_id IS 'FK to vb_courts - for court-specific contacts';
COMMENT ON COLUMN vb_contacts.region_id IS 'FK to regions - for region-wide contacts';
COMMENT ON COLUMN vb_contacts.role_id IS 'FK to contact_roles';
COMMENT ON COLUMN vb_contacts.availability_id IS 'FK to availability - when this contact is available';
COMMENT ON COLUMN vb_contacts.name IS 'Contact person name (for navigators)';
COMMENT ON COLUMN vb_contacts.email IS 'Primary email';
COMMENT ON COLUMN vb_contacts.emails IS 'Array of additional emails';
COMMENT ON COLUMN vb_contacts.phone IS 'Phone number';
COMMENT ON COLUMN vb_contacts.cell IS 'Cell phone number';
COMMENT ON COLUMN vb_contacts.notes IS 'Additional notes';

-- VB_MS_TEAMS
COMMENT ON TABLE vb_ms_teams IS 'Virtual bail specific MS Teams links - triage rooms, Justice Centre links, bail courtrooms';
COMMENT ON COLUMN vb_ms_teams.id IS 'Primary key';
COMMENT ON COLUMN vb_ms_teams.vb_court_id IS 'FK to vb_courts';
COMMENT ON COLUMN vb_ms_teams.region_id IS 'FK to regions - for region-wide links like Justice Centres';
COMMENT ON COLUMN vb_ms_teams.link_type_id IS 'FK to ms_teams_types (Courtroom, Triage, Justice Centre, etc.)';
COMMENT ON COLUMN vb_ms_teams.ms_teams_id IS 'FK to ms_teams - links to master MS Teams table for shared courtroom links';
COMMENT ON COLUMN vb_ms_teams.name IS 'Link name (e.g., VR8 & Afternoon Triage)';
COMMENT ON COLUMN vb_ms_teams.courtroom IS 'Courtroom number if applicable';
COMMENT ON COLUMN vb_ms_teams.conference_id IS 'Phone conference ID';
COMMENT ON COLUMN vb_ms_teams.phone IS 'Local dial-in';
COMMENT ON COLUMN vb_ms_teams.toll_free IS 'Toll-free dial-in';
COMMENT ON COLUMN vb_ms_teams.teams_link IS 'Full MS Teams URL';
COMMENT ON COLUMN vb_ms_teams.notes IS 'Additional notes (e.g., which courts this serves)';

-- VB_COURT_MS_TEAMS (Junction Table)
COMMENT ON TABLE vb_court_ms_teams IS 'Junction table linking vb_courts to vb_ms_teams (many-to-many) - allows multiple courts to share the same Teams link';
COMMENT ON COLUMN vb_court_ms_teams.id IS 'Primary key';
COMMENT ON COLUMN vb_court_ms_teams.vb_court_id IS 'FK to vb_courts';
COMMENT ON COLUMN vb_court_ms_teams.vb_ms_teams_id IS 'FK to vb_ms_teams';

-- ============================================
-- SECTION 525 DETENTION REVIEW TABLES
-- ============================================

-- S525_CONTACTS
COMMENT ON TABLE s525_contacts IS 'Section 525 Detention Review contacts - Coordinator, Crown counsel by region, Legal Aid';
COMMENT ON COLUMN s525_contacts.id IS 'Primary key';
COMMENT ON COLUMN s525_contacts.contact_type IS 'Type of contact (Coordinator, Provincial Crown, Federal Crown, Generic - Provincial Crown, etc.)';
COMMENT ON COLUMN s525_contacts.region_id IS 'FK to regions - for regional Crown contacts';
COMMENT ON COLUMN s525_contacts.name IS 'Contact person name';
COMMENT ON COLUMN s525_contacts.email IS 'Contact email';
COMMENT ON COLUMN s525_contacts.phone IS 'Phone number';
COMMENT ON COLUMN s525_contacts.phone_toll_free IS 'Toll-free number';
COMMENT ON COLUMN s525_contacts.address IS 'Physical address';
COMMENT ON COLUMN s525_contacts.schedule IS 'When 525 hearings are held (Tuesdays only)';
COMMENT ON COLUMN s525_contacts.notes IS 'Additional notes';

-- S525_FORMS
COMMENT ON TABLE s525_forms IS 'Section 525 forms and their submission deadlines';
COMMENT ON COLUMN s525_forms.id IS 'Primary key';
COMMENT ON COLUMN s525_forms.form_name IS 'Form name (e.g., Adjournment Form, Waiver Form)';
COMMENT ON COLUMN s525_forms.form_code IS 'Form code if applicable';
COMMENT ON COLUMN s525_forms.deadline_time IS 'Submission deadline time (e.g., 3:00 PM)';
COMMENT ON COLUMN s525_forms.deadline_description IS 'Description of when deadline applies';
COMMENT ON COLUMN s525_forms.submit_to IS 'Where to submit the form';
COMMENT ON COLUMN s525_forms.form_url IS 'URL to download the form';
COMMENT ON COLUMN s525_forms.notes IS 'Additional notes';

-- ============================================
-- VIEWS (Virtual Tables)
-- ============================================

COMMENT ON VIEW virtual_bail_courts_full IS 'View joining vb_courts with regions for easier querying';
COMMENT ON VIEW virtual_bail_ms_teams_full IS 'View joining vb_ms_teams with vb_courts, regions, and link types';

