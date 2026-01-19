-- BC Legal Directory Database Schema
-- For Supabase (PostgreSQL)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE court_region AS ENUM ('R1', 'R2', 'R3', 'R4', 'R5');
CREATE TYPE court_level AS ENUM ('provincial', 'supreme');
CREATE TYPE facility_type AS ENUM ('provincial', 'federal');
CREATE TYPE contact_time AS ENUM ('daytime', 'evening', 'weekend', 'all_hours');
CREATE TYPE location_type AS ENUM ('rcmp', 'police_dept', 'courthouse', 'youth_detention', 'courtroom', 'admin');
CREATE TYPE gender_type AS ENUM ('all', 'male', 'female');
CREATE TYPE application_method AS ENUM ('phone', 'written', 'referral');
CREATE TYPE link_type AS ENUM ('bail', 'remand', 'trial', 'custody', 'general');
CREATE TYPE resource_type AS ENUM ('justice_centre', 'counselling', 'program', 'support');

-- ============================================
-- 1. COURTS
-- ============================================

CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    region court_region,
    region_name VARCHAR(100), -- Full name: "Vancouver Island", "Fraser", etc.
    address TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    access_code VARCHAR(50),
    access_code_notes TEXT,
    has_provincial BOOLEAN DEFAULT false,
    has_supreme BOOLEAN DEFAULT false,
    is_circuit BOOLEAN DEFAULT false,
    hub_court_id UUID REFERENCES courts(id),
    hub_court_name VARCHAR(255), -- Denormalized for easy display
    virtual_courtroom_code VARCHAR(50),
    virtual_courtroom_phone VARCHAR(20),
    virtual_courtroom_toll_free VARCHAR(20),
    virtual_courtroom_conference_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_courts_name ON courts(name);
CREATE INDEX idx_courts_region ON courts(region);
CREATE INDEX idx_courts_city ON courts(city);
CREATE INDEX idx_courts_is_circuit ON courts(is_circuit);

-- ============================================
-- 2. COURT CONTACTS
-- ============================================

CREATE TABLE court_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
    court_level court_level NOT NULL,
    crown_email VARCHAR(255),
    jcm_scheduling_email VARCHAR(255),
    registry_email VARCHAR(255),
    criminal_registry_email VARCHAR(255),
    bail_crown_email VARCHAR(255),
    bail_jcm_email VARCHAR(255),
    interpreter_request_email TEXT, -- Can have multiple emails
    transcripts_email VARCHAR(255),
    scheduling_email VARCHAR(255),
    fax_filing VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(court_id, court_level)
);

CREATE INDEX idx_court_contacts_court_id ON court_contacts(court_id);

-- ============================================
-- 3. POLICE CELLS
-- ============================================

CREATE TABLE police_cells (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region court_region,
    location_type location_type DEFAULT 'rcmp',
    phone_numbers TEXT[], -- Array of phone numbers
    primary_phone VARCHAR(20),
    courthouse_name VARCHAR(255), -- If associated with a courthouse
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_police_cells_name ON police_cells(name);
CREATE INDEX idx_police_cells_region ON police_cells(region);

-- ============================================
-- 4. CORRECTIONAL FACILITIES
-- ============================================

CREATE TABLE correctional_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    abbreviation VARCHAR(20),
    facility_type facility_type,
    location VARCHAR(100),
    region court_region,
    street_address TEXT,
    mailing_address TEXT,
    general_phone VARCHAR(20),
    general_fax VARCHAR(20),
    visit_request_phone VARCHAR(20),
    visit_request_email VARCHAR(255),
    virtual_visit_email VARCHAR(255),
    cdn_fax VARCHAR(20), -- Counsel Designation Notice
    cdn_by_fax BOOLEAN DEFAULT false,
    unlock_hours VARCHAR(100),
    visit_hours TEXT,
    e_particulars JSONB, -- Electronic disclosure delivery options
    notes TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_corrections_name ON correctional_facilities(name);
CREATE INDEX idx_corrections_abbreviation ON correctional_facilities(abbreviation);
CREATE INDEX idx_corrections_location ON correctional_facilities(location);

-- ============================================
-- 5. BAIL CONTACTS
-- ============================================

CREATE TABLE bail_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(5) NOT NULL, -- R1, R2, etc.
    region_name VARCHAR(100),
    vr_code VARCHAR(10), -- VR1-VR9
    contact_type contact_time NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    contact_name VARCHAR(255),
    subject_line_template TEXT,
    notes TEXT,
    is_court_specific BOOLEAN DEFAULT false,
    court_name VARCHAR(255), -- For R2/R3 court-specific contacts
    areas_served TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bail_contacts_region ON bail_contacts(region_code);
CREATE INDEX idx_bail_contacts_type ON bail_contacts(contact_type);

-- ============================================
-- 6. BAIL COORDINATORS (RABCs)
-- ============================================

CREATE TABLE bail_coordinators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_code VARCHAR(5) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(100) DEFAULT 'RABC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. FEDERAL CROWN CONTACTS
-- ============================================

CREATE TABLE federal_crown_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region VARCHAR(100),
    organization VARCHAR(255), -- PPSC, Jones & Co., MTC Law, etc.
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    fax VARCHAR(20),
    areas_served TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_federal_crown_region ON federal_crown_contacts(region);

-- ============================================
-- 8. SHERIFF CONTACTS
-- ============================================

CREATE TABLE sheriff_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    area VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 9. LEGAL AID OFFICES
-- ============================================

CREATE TABLE legal_aid_offices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    intake_email VARCHAR(255),
    hours VARCHAR(255),
    locations_served TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 10. PROGRAMS
-- ============================================

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    gender gender_type DEFAULT 'all',
    indigenous_only BOOLEAN DEFAULT false,
    in_residence BOOLEAN DEFAULT false,
    application_method application_method,
    capacity INTEGER,
    services TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_programs_name ON programs(name);
CREATE INDEX idx_programs_location ON programs(location);

-- ============================================
-- 11. MS TEAMS LINKS
-- ============================================

CREATE TABLE ms_teams_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    court_name VARCHAR(255), -- Denormalized
    courtroom VARCHAR(50),
    link_type link_type DEFAULT 'general',
    description VARCHAR(255),
    teams_link TEXT,
    dial_in_number VARCHAR(20),
    conference_id VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_teams_links_court_id ON ms_teams_links(court_id);

-- ============================================
-- 12. INDIGENOUS RESOURCES
-- ============================================

CREATE TABLE indigenous_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    resource_type resource_type,
    region VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    services TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 13. FORENSIC CLINICS
-- ============================================

CREATE TABLE forensic_clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    fax VARCHAR(20),
    email VARCHAR(255),
    services TEXT[],
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 14. ACCESS CODES (separate table for quick lookup)
-- ============================================

CREATE TABLE access_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    courthouse_name VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VIEWS
-- ============================================

-- Combined search view for courts
CREATE VIEW courts_search AS
SELECT 
    c.id,
    c.name,
    c.city,
    c.region,
    c.region_name,
    c.address,
    c.access_code,
    c.has_provincial,
    c.has_supreme,
    c.is_circuit,
    c.hub_court_name,
    cc_prov.crown_email as provincial_crown_email,
    cc_prov.bail_crown_email as provincial_bail_email,
    cc_sup.crown_email as supreme_crown_email,
    COALESCE(c.city, '') || ' ' || COALESCE(c.name, '') || ' ' || COALESCE(c.region_name, '') as search_text
FROM courts c
LEFT JOIN court_contacts cc_prov ON c.id = cc_prov.court_id AND cc_prov.court_level = 'provincial'
LEFT JOIN court_contacts cc_sup ON c.id = cc_sup.court_id AND cc_sup.court_level = 'supreme';

-- ============================================
-- ROW LEVEL SECURITY (optional for Supabase)
-- ============================================

-- Enable RLS on all tables (read-only for anonymous)
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE police_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE correctional_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bail_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bail_coordinators ENABLE ROW LEVEL SECURITY;
ALTER TABLE federal_crown_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sheriff_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_aid_offices ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ms_teams_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE indigenous_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON courts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON court_contacts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON police_cells FOR SELECT USING (true);
CREATE POLICY "Public read access" ON correctional_facilities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bail_contacts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON bail_coordinators FOR SELECT USING (true);
CREATE POLICY "Public read access" ON federal_crown_contacts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sheriff_contacts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON legal_aid_offices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON ms_teams_links FOR SELECT USING (true);
CREATE POLICY "Public read access" ON indigenous_resources FOR SELECT USING (true);
CREATE POLICY "Public read access" ON forensic_clinics FOR SELECT USING (true);
CREATE POLICY "Public read access" ON access_codes FOR SELECT USING (true);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_courts_updated_at BEFORE UPDATE ON courts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_court_contacts_updated_at BEFORE UPDATE ON court_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_police_cells_updated_at BEFORE UPDATE ON police_cells FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_corrections_updated_at BEFORE UPDATE ON correctional_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bail_contacts_updated_at BEFORE UPDATE ON bail_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_programs_updated_at BEFORE UPDATE ON programs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
