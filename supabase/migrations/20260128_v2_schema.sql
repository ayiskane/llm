-- =============================================================================
-- V2 SCHEMA (PARALLEL) - OPTIMIZED FOR MSVB DATA
-- This creates a new schema alongside existing tables to enable safe migration.
-- =============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- ENUMS (guarded to allow re-run)
-- =============================================================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'v2_entity_type') THEN
    CREATE TYPE v2_entity_type AS ENUM (
      'region', 'court', 'bail_hub', 'correctional_centre', 'sheriff_cell', 'program'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'v2_channel_type') THEN
    CREATE TYPE v2_channel_type AS ENUM ('phone','fax','email','teams','chat','url');
  END IF;
END $$;

-- =============================================================================
-- ENTITY REGISTRY (eliminates polymorphic FKs)
-- =============================================================================
CREATE TABLE IF NOT EXISTS v2_entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type v2_entity_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_v2_entities_type ON v2_entities(type);

-- =============================================================================
-- CORE TABLES
-- =============================================================================
CREATE TABLE IF NOT EXISTS v2_regions (
  entity_id UUID PRIMARY KEY REFERENCES v2_entities(id) ON DELETE CASCADE,
  code TEXT UNIQUE,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS v2_courts (
  entity_id UUID PRIMARY KEY REFERENCES v2_entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  region_entity_id UUID NOT NULL REFERENCES v2_regions(entity_id),
  address TEXT,
  is_circuit BOOLEAN DEFAULT false,
  parent_court_entity_id UUID REFERENCES v2_courts(entity_id),
  has_supreme_filing BOOLEAN DEFAULT false,
  criminal_fax TEXT,
  supreme_scheduling_phone TEXT,
  supreme_scheduling_fax TEXT,
  supreme_toll_free TEXT,
  access_code TEXT,
  access_code_notes TEXT,
  UNIQUE (name, region_entity_id)
);

CREATE TABLE IF NOT EXISTS v2_bail_hubs (
  entity_id UUID PRIMARY KEY REFERENCES v2_entities(id) ON DELETE CASCADE,
  court_entity_id UUID NOT NULL REFERENCES v2_courts(entity_id) ON DELETE CASCADE,
  region_entity_id UUID NOT NULL REFERENCES v2_regions(entity_id),
  is_weekend_hub BOOLEAN DEFAULT false,
  is_hybrid BOOLEAN DEFAULT false,
  is_daytime BOOLEAN DEFAULT true,
  coverage_areas TEXT,
  vr_courtroom TEXT,
  morning_triage_room TEXT,
  afternoon_triage_room TEXT,
  youth_custody_day TEXT,
  youth_custody_time TEXT,
  triage_schedule JSONB,
  notes TEXT,
  UNIQUE (court_entity_id)
);

CREATE TABLE IF NOT EXISTS v2_sheriff_cell_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS v2_sheriff_cells (
  entity_id UUID PRIMARY KEY REFERENCES v2_entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type_id INTEGER NOT NULL REFERENCES v2_sheriff_cell_types(id),
  region_entity_id UUID NOT NULL REFERENCES v2_regions(entity_id),
  catchment TEXT,
  UNIQUE (name, region_entity_id)
);

CREATE TABLE IF NOT EXISTS v2_sheriff_cells_courts (
  sheriff_cell_entity_id UUID REFERENCES v2_sheriff_cells(entity_id) ON DELETE CASCADE,
  court_entity_id UUID REFERENCES v2_courts(entity_id) ON DELETE CASCADE,
  PRIMARY KEY (sheriff_cell_entity_id, court_entity_id)
);

CREATE TABLE IF NOT EXISTS v2_correctional_centres (
  entity_id UUID PRIMARY KEY REFERENCES v2_entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT,
  location TEXT,
  type TEXT NOT NULL, -- provincial | federal
  region_entity_id UUID NOT NULL REFERENCES v2_regions(entity_id),
  security_level TEXT,
  general_phone TEXT,
  general_phone_option TEXT,
  general_fax TEXT,
  cdn_fax TEXT,
  accepts_cdn_by_fax BOOLEAN DEFAULT false,
  visit_request_phone TEXT,
  visit_request_email TEXT,
  virtual_visit_email TEXT,
  lawyer_callback_email TEXT,
  callback_1_start TIME,
  callback_1_end TIME,
  callback_2_start TIME,
  callback_2_end TIME,
  visit_hours_inperson TEXT,
  visit_hours_virtual TEXT,
  visit_notes TEXT,
  disclosure_format TEXT,
  disclosure_notes TEXT,
  accepts_usb BOOLEAN DEFAULT false,
  accepts_hard_drive BOOLEAN DEFAULT false,
  accepts_cd_dvd BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE (name, region_entity_id)
);

CREATE TABLE IF NOT EXISTS v2_program_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS v2_programs (
  entity_id UUID PRIMARY KEY REFERENCES v2_entities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type_id INTEGER REFERENCES v2_program_types(id),
  region_entity_id UUID NOT NULL REFERENCES v2_regions(entity_id),
  address TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  UNIQUE (name, region_entity_id)
);

-- =============================================================================
-- CONTACTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS v2_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  organization TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS v2_contact_roles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS v2_availability (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

CREATE TABLE IF NOT EXISTS v2_contact_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES v2_contacts(id) ON DELETE CASCADE,
  type v2_channel_type NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  UNIQUE (contact_id, type, value)
);

CREATE INDEX IF NOT EXISTS idx_v2_contact_channels_contact ON v2_contact_channels(contact_id);

CREATE TABLE IF NOT EXISTS v2_entity_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES v2_entities(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES v2_contacts(id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES v2_contact_roles(id),
  availability_id INTEGER REFERENCES v2_availability(id),
  priority INTEGER DEFAULT 0,
  UNIQUE (entity_id, contact_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_v2_entity_contacts_entity ON v2_entity_contacts(entity_id);
CREATE INDEX IF NOT EXISTS idx_v2_entity_contacts_role ON v2_entity_contacts(role_id);

-- =============================================================================
-- MS TEAMS LINKS
-- =============================================================================
CREATE TABLE IF NOT EXISTS v2_ms_teams_link_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE -- courtroom | triage | justice_centre | federal | virtual_bail
);

CREATE TABLE IF NOT EXISTS v2_ms_teams_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id INTEGER NOT NULL REFERENCES v2_ms_teams_link_types(id),
  name TEXT,
  url TEXT,
  conference_id TEXT,
  phone TEXT,
  phone_toll_free TEXT,
  source_updated_at DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS v2_entity_ms_teams_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES v2_entities(id) ON DELETE CASCADE,
  ms_teams_link_id UUID NOT NULL REFERENCES v2_ms_teams_links(id) ON DELETE CASCADE,
  UNIQUE (entity_id, ms_teams_link_id)
);

CREATE INDEX IF NOT EXISTS idx_v2_entity_ms_teams_links_entity ON v2_entity_ms_teams_links(entity_id);

-- =============================================================================
-- SCHEDULES
-- =============================================================================
CREATE TABLE IF NOT EXISTS v2_schedule_types (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE -- crown | judge | duty_counsel_in_custody | duty_counsel_out_of_custody | jcm_fxd | visitation
);

CREATE TABLE IF NOT EXISTS v2_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_type_id INTEGER NOT NULL REFERENCES v2_schedule_types(id),
  entity_id UUID NOT NULL REFERENCES v2_entities(id) ON DELETE CASCADE,
  days JSONB,              -- ["Monday","Thursday"] or null for date-specific
  date_range_start DATE,
  date_range_end DATE,
  time_start TIME,
  time_end TIME,
  courtroom TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_v2_schedules_entity ON v2_schedules(entity_id);
CREATE INDEX IF NOT EXISTS idx_v2_schedules_type ON v2_schedules(schedule_type_id);

CREATE TABLE IF NOT EXISTS v2_schedule_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES v2_schedules(id) ON DELETE CASCADE,
  contact_id UUID NOT NULL REFERENCES v2_contacts(id) ON DELETE CASCADE,
  UNIQUE (schedule_id, contact_id)
);

-- =============================================================================
-- SOURCES (optional but recommended)
-- =============================================================================
CREATE TABLE IF NOT EXISTS v2_source_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  category TEXT,
  version_date DATE,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS v2_entity_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL REFERENCES v2_entities(id) ON DELETE CASCADE,
  source_document_id UUID NOT NULL REFERENCES v2_source_documents(id) ON DELETE CASCADE,
  notes TEXT,
  UNIQUE (entity_id, source_document_id)
);
