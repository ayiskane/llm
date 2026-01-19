-- BC Legal Reference Database Schema for Supabase
-- Version 1.0 - January 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- COURTS & REGISTRIES
-- ============================================

CREATE TABLE IF NOT EXISTS courts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    crown_email VARCHAR(255),
    jcm_scheduling_email VARCHAR(255),
    court_registry_email VARCHAR(255),
    criminal_registry_email VARCHAR(255),
    bail_crown_email VARCHAR(255),
    bail_jcm_email VARCHAR(255),
    interpreter_request_email VARCHAR(255),
    address TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courts_name ON courts(name);
CREATE INDEX idx_courts_region ON courts(region);

-- ============================================
-- POLICE CELLS / RCMP
-- ============================================

CREATE TABLE IF NOT EXISTS police_cells (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    phone1 VARCHAR(50),
    phone2 VARCHAR(50),
    phone3 VARCHAR(50),
    phone4 VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_police_cells_name ON police_cells(name);
CREATE INDEX idx_police_cells_region ON police_cells(region);

-- ============================================
-- CORRECTIONAL FACILITIES
-- ============================================

CREATE TABLE IF NOT EXISTS correctional_facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('provincial', 'federal')),
    region VARCHAR(50),
    phone VARCHAR(50),
    fax VARCHAR(50),
    email VARCHAR(255),
    unlock_hours VARCHAR(100),
    visit_hours VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_corrections_name ON correctional_facilities(name);
CREATE INDEX idx_corrections_type ON correctional_facilities(type);

-- ============================================
-- VIRTUAL BAIL CONTACTS
-- ============================================

CREATE TABLE IF NOT EXISTS bail_contacts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    type VARCHAR(50) CHECK (type IN ('daytime', 'evening', 'all_hours')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bail_region ON bail_contacts(region);
CREATE INDEX idx_bail_type ON bail_contacts(type);

-- ============================================
-- BAIL COORDINATORS (RABCs)
-- ============================================

CREATE TABLE IF NOT EXISTS bail_coordinators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    is_backup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CROWN COUNSEL CONTACTS
-- ============================================

CREATE TABLE IF NOT EXISTS crown_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    court VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    role VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_crown_region ON crown_contacts(region);
CREATE INDEX idx_crown_court ON crown_contacts(court);

-- ============================================
-- FEDERAL CROWN (PPSC)
-- ============================================

CREATE TABLE IF NOT EXISTS federal_crown_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    email VARCHAR(255),
    phone VARCHAR(50),
    area_of_responsibility TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- LEGAL AID BC OFFICES
-- ============================================

CREATE TABLE IF NOT EXISTS labc_offices (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    region VARCHAR(50),
    type VARCHAR(50) CHECK (type IN ('intake', 'call_centre', 'priority_line', 'email', 'navigator', 'local_agent')),
    phone VARCHAR(100),
    email VARCHAR(255),
    hours TEXT,
    local_agent VARCHAR(255),
    assistant VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_labc_location ON labc_offices(location);
CREATE INDEX idx_labc_type ON labc_offices(type);

-- ============================================
-- LABC NAVIGATORS
-- ============================================

CREATE TABLE IF NOT EXISTS labc_navigators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    courts TEXT,
    spare_for TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- FORENSIC CLINICS
-- ============================================

CREATE TABLE IF NOT EXISTS forensic_clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    city VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDIGENOUS JUSTICE CENTRES
-- ============================================

CREATE TABLE IF NOT EXISTS indigenous_justice_centres (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- MS TEAMS LINKS
-- ============================================

CREATE TABLE IF NOT EXISTS ms_teams_links (
    id SERIAL PRIMARY KEY,
    court VARCHAR(255),
    courtroom VARCHAR(50),
    region VARCHAR(50),
    function VARCHAR(100),
    teams_link TEXT,
    conference_id VARCHAR(50),
    phone VARCHAR(50) DEFAULT '+1 778-725-6348',
    toll_free VARCHAR(50) DEFAULT '(844) 636-7837',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_teams_court ON ms_teams_links(court);
CREATE INDEX idx_teams_region ON ms_teams_links(region);

-- ============================================
-- PROGRAMS (Bail Supervision, Treatment)
-- ============================================

CREATE TABLE IF NOT EXISTS programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    phone VARCHAR(50),
    gender VARCHAR(50),
    indigenous_only BOOLEAN DEFAULT FALSE,
    in_residence BOOLEAN DEFAULT FALSE,
    application_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_programs_location ON programs(location);

-- ============================================
-- ACCESS CODES (Barrister Lounges)
-- ============================================

CREATE TABLE IF NOT EXISTS access_codes (
    id SERIAL PRIMARY KEY,
    court VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- CIRCUIT COURTS
-- ============================================

CREATE TABLE IF NOT EXISTS circuit_courts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    contact_hub VARCHAR(255),
    schedule TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_circuit_region ON circuit_courts(region);

-- ============================================
-- FULL TEXT SEARCH INDEXES
-- ============================================

-- Create a unified search view
CREATE OR REPLACE VIEW search_all AS
SELECT 
    'court' as type,
    id,
    name as title,
    COALESCE(crown_email, '') || ' ' || COALESCE(court_registry_email, '') as details,
    region
FROM courts
UNION ALL
SELECT 
    'police_cell' as type,
    id,
    name as title,
    COALESCE(phone1, '') || ' ' || COALESCE(phone2, '') as details,
    region
FROM police_cells
UNION ALL
SELECT 
    'corrections' as type,
    id,
    name as title,
    COALESCE(phone, '') || ' ' || COALESCE(email, '') as details,
    region
FROM correctional_facilities
UNION ALL
SELECT 
    'forensic_clinic' as type,
    id,
    name as title,
    COALESCE(address, '') || ' ' || COALESCE(phone, '') as details,
    NULL as region
FROM forensic_clinics
UNION ALL
SELECT 
    'ijc' as type,
    id,
    location as title,
    COALESCE(phone, '') || ' ' || COALESCE(email, '') as details,
    NULL as region
FROM indigenous_justice_centres;

-- ============================================
-- ROW LEVEL SECURITY (Optional)
-- ============================================

-- ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Public read access" ON courts FOR SELECT USING (true);


-- ============================================
-- DUTY COUNSEL LAWYERS
-- ============================================

CREATE TABLE IF NOT EXISTS duty_counsel_lawyers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    labc_id VARCHAR(20),
    email VARCHAR(255),
    phone VARCHAR(50),
    location VARCHAR(255),
    region VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dc_lawyers_name ON duty_counsel_lawyers(name);
CREATE INDEX idx_dc_lawyers_region ON duty_counsel_lawyers(region);
CREATE INDEX idx_dc_lawyers_location ON duty_counsel_lawyers(location);
