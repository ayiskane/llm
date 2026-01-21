-- =============================================
-- PROGRAMS SCHEMA
-- Recovery, Treatment, Forensic, and Indigenous Justice Programs
-- =============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS programs CASCADE;
DROP TABLE IF EXISTS program_types CASCADE;
DROP TABLE IF EXISTS program_contacts CASCADE;

-- =============================================
-- PROGRAM TYPES
-- =============================================
CREATE TABLE program_types (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO program_types (code, name, description) VALUES
('RECOVERY', 'Recovery House', 'Residential recovery and transitional housing'),
('TREATMENT', 'Treatment Centre', 'Substance use treatment programs'),
('DETOX', 'Detox Centre', 'Medical detoxification services'),
('FPS', 'Forensic Psychiatric Services', 'FPS Regional Clinics for court-ordered assessments'),
('IJC', 'Indigenous Justice Centre', 'BCFNJC legal representation and wrap-around services'),
('IJP', 'Indigenous Justice Program', 'Community-based Indigenous justice and restorative programs'),
('CORRECTIONAL', 'Correctional Program', 'Programs within correctional facilities');

-- =============================================
-- PROGRAMS
-- =============================================
CREATE TABLE programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type_id INTEGER REFERENCES program_types(id),
    
    -- Location
    location VARCHAR(100),                         -- City/Area
    region_id INTEGER,                             -- Matches region IDs (1=Island, 2=Vancouver, 3=Fraser, 4=Interior, 5=Northern)
    address VARCHAR(255),
    
    -- Contact
    phone VARCHAR(50),
    phone_secondary VARCHAR(50),
    fax VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    
    -- Eligibility
    gender VARCHAR(20),                            -- 'all', 'men', 'women', NULL if not specified
    indigenous_only BOOLEAN DEFAULT FALSE,
    accepts_sa_records BOOLEAN DEFAULT FALSE,      -- Accepts people with sexual assault records
    
    -- Program Details
    is_residential BOOLEAN DEFAULT FALSE,
    application_method VARCHAR(50),                -- 'phone', 'written', 'referral', etc.
    
    -- Organization
    parent_organization VARCHAR(255),              -- e.g., 'BCFNJC', 'PHSA', 'Connective'
    
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_programs_type ON programs(type_id);
CREATE INDEX idx_programs_region ON programs(region_id);
CREATE INDEX idx_programs_active ON programs(is_active);
CREATE INDEX idx_programs_residential ON programs(is_residential);

-- =============================================
-- PROGRAM CONTACTS (for programs with multiple contacts)
-- =============================================
CREATE TABLE program_contacts (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_program_contacts_program ON program_contacts(program_id);

-- =============================================
-- INSERT RECOVERY PROGRAMS (from cheatsheet)
-- =============================================

-- Talitha Koum
INSERT INTO programs (name, type_id, location, region_id, phone, gender, indigenous_only, is_residential, application_method)
VALUES ('Talitha Koum', (SELECT id FROM program_types WHERE code = 'RECOVERY'), 
        'Coquitlam', 3, '604-492-3393', 'all', FALSE, FALSE, 'phone');

-- Glory House
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Glory House', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Mission', 3, '604-380-3665', FALSE, FALSE, 'phone');

-- Lydia Home
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Lydia Home', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Mission', 3, '604-253-3323', FALSE, FALSE, 'phone');

-- Hannah House
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Hannah House', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Maple Ridge', 3, '866-466-4215', FALSE, FALSE, 'phone');

-- Night & Day
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Night & Day', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Surrey', 3, '778-317-4673', FALSE, FALSE, 'phone');

-- Vision Quest Hart House
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method, accepts_sa_records, notes)
VALUES ('Vision Quest Hart House', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Surrey', 3, '604-946-1841', FALSE, FALSE, 'phone', TRUE, 'Will take people with SA records');

-- Stepping Stone
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Stepping Stone', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Courtenay', 1, '250-897-0360', FALSE, FALSE, 'written');

-- Amethyst
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Amethyst', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Campbell River', 1, '250-870-2570', FALSE, FALSE, 'written');

-- The Farm
INSERT INTO programs (name, type_id, location, region_id, indigenous_only, is_residential, application_method)
VALUES ('The Farm', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Port Alberni', 1, FALSE, FALSE, 'written');

-- Sancta Marie
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Sancta Marie', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Vancouver', 2, '604-731-5550', FALSE, FALSE, 'written');

-- Turning Point (North Van)
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Turning Point (North Van)', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'North Vancouver', 2, '604-971-0111', FALSE, FALSE, 'written');

-- Turning Point (Vancouver)
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Turning Point (Vancouver)', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Vancouver', 2, '604-875-1710', FALSE, FALSE, 'written');

-- Back On Track
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Back On Track', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Surrey', 3, '778-316-2625', FALSE, FALSE, 'phone');

-- Raven's Moon
INSERT INTO programs (name, type_id, location, region_id, indigenous_only, is_residential, application_method, notes)
VALUES ('Raven''s Moon', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Abbotsford', 3, FALSE, TRUE, 'phone', 'Multiple contacts - see program_contacts');

INSERT INTO program_contacts (program_id, name, phone, is_primary)
VALUES 
    ((SELECT id FROM programs WHERE name = 'Raven''s Moon'), 'Jeanette', '604-751-4631', TRUE),
    ((SELECT id FROM programs WHERE name = 'Raven''s Moon'), 'Tina', '604-308-1767', FALSE);

-- Ann Elmore House
INSERT INTO programs (name, type_id, location, region_id, phone, indigenous_only, is_residential, application_method)
VALUES ('Ann Elmore House', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        'Campbell River', 1, '250-286-3666', FALSE, TRUE, 'phone');

-- Phoenix
INSERT INTO programs (name, type_id, indigenous_only, is_residential, accepts_sa_records, notes)
VALUES ('Phoenix', (SELECT id FROM program_types WHERE code = 'RECOVERY'),
        FALSE, FALSE, TRUE, 'Will take people with SA records');

-- =============================================
-- INSERT FPS REGIONAL CLINICS
-- =============================================

INSERT INTO programs (name, type_id, location, region_id, address, phone, email, parent_organization)
VALUES 
('Kamloops Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Kamloops', 4, '5-1315 Summit Drive, Kamloops, BC V2C 5R9', '250-377-2660', 'KamloopsAdmitting@phsa.ca', 'PHSA'),

('Kelowna Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Kelowna', 4, '#115-1835 Gordon Drive, Kelowna, BC V1Y 3H5', '778-940-2100', 'KelownaAdmitting@phsa.ca', 'PHSA'),

('Nanaimo Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Nanaimo', 1, '101-190 Wallace Street, Nanaimo, BC V9R 5B1', '250-739-5000', 'NanaimoAdmitting@phsa.ca', 'PHSA'),

('Prince George Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Prince George', 5, '2nd Floor, 1584 7th Avenue, Prince George, BC V2L 3P4', '250-561-8060', 'PrinceGeorgeAdmitting@phsa.ca', 'PHSA'),

('Surrey Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Surrey', 3, '10022 King George Boulevard, Surrey, BC V3T 2W4', '604-529-3300', 'SurreyAdmitting@phsa.ca', 'PHSA'),

('Vancouver Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Vancouver', 2, '300-307 West Broadway, Vancouver, BC V5Y 1P9', '604-529-3350', 'VancouverAdmitting@phsa.ca', 'PHSA'),

('Victoria Forensic Regional Clinic', (SELECT id FROM program_types WHERE code = 'FPS'),
 'Victoria', 1, '2840 Nanaimo Street, Victoria, BC V8T 4W9', '250-213-4500', 'VictoriaAdmitting@phsa.ca', 'PHSA');

-- =============================================
-- INSERT INDIGENOUS JUSTICE CENTRES (BCFNJC)
-- =============================================

INSERT INTO programs (name, type_id, location, region_id, phone, email, website, parent_organization, indigenous_only)
VALUES 
('Chilliwack Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Chilliwack', 3, '778-704-1355', 'chilliwackinfo@bcfnjc.com', 'https://bcfnjc.com/chilliwack-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Kelowna Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Kelowna', 4, '236-763-6881', 'kelownainfo@bcfnjc.com', 'https://bcfnjc.com/kelowna-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Merritt Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Merritt', 4, '236-575-3004', 'merrittinfo@bcfnjc.com', 'https://bcfnjc.com/merritt-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Nanaimo Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Nanaimo', 1, '778-762-4061', 'nanaimoinfo@bcfnjc.com', 'https://bcfnjc.com/nanaimo-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Prince George Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Prince George', 5, '250-645-5519', 'pginfo@bcfnjc.com', 'https://bcfnjc.com/prince-george-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Prince Rupert Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Prince Rupert', 5, '778-622-3563', 'prinfo@bcfnjc.com', 'https://bcfnjc.com/prince-rupert-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Surrey Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Surrey', 3, '236-947-6777', 'surreyinfo@bcfnjc.com', 'https://bcfnjc.com/surrey-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Vancouver Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Vancouver', 2, '236-455-6565', 'vancouverinfo@bcfnjc.com', 'https://bcfnjc.com/vancouver-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Victoria Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Victoria', 1, '250-419-9665', 'victoriainfo@bcfnjc.com', 'https://bcfnjc.com/victoria-indigenous-justice-centre/', 'BCFNJC', TRUE),

('Virtual Indigenous Justice Centre', (SELECT id FROM program_types WHERE code = 'IJC'),
 'Virtual', NULL, '1-866-786-0081', 'virtual@bcfnjc.com', 'https://bcfnjc.com/virtual-indigenous-justice-centre/', 'BCFNJC', TRUE);

-- =============================================
-- PROGRAM CONSTANTS
-- =============================================
DROP TABLE IF EXISTS program_constants CASCADE;

CREATE TABLE program_constants (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO program_constants (key, value, description) VALUES
('bcfnjc_toll_free', '1-877-602-4858', 'BC First Nations Justice Council toll-free'),
('bcfnjc_virtual_toll_free', '1-866-786-0081', 'Virtual Indigenous Justice Centre toll-free'),
('bcfnjc_website', 'https://bcfnjc.com', 'BCFNJC website'),
('fps_vancouver_overnight', '604-529-3350', 'Vancouver Forensic Regional Clinic - contact for overnight assessments'),
('fraser_health_referral_fax', '604-519-8538', 'Fraser Health Substance Use Referral Coordination Service fax');

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Programs with type name and region
CREATE OR REPLACE VIEW programs_full AS
SELECT 
    p.id,
    p.name,
    pt.code AS type_code,
    pt.name AS type_name,
    p.location,
    p.region_id,
    CASE p.region_id
        WHEN 1 THEN 'Island'
        WHEN 2 THEN 'Vancouver'
        WHEN 3 THEN 'Fraser'
        WHEN 4 THEN 'Interior'
        WHEN 5 THEN 'Northern'
        ELSE NULL
    END AS region_name,
    p.address,
    p.phone,
    p.phone_secondary,
    p.email,
    p.website,
    p.gender,
    p.indigenous_only,
    p.accepts_sa_records,
    p.is_residential,
    p.application_method,
    p.parent_organization,
    p.notes,
    p.is_active
FROM programs p
LEFT JOIN program_types pt ON p.type_id = pt.id
WHERE p.is_active = TRUE;

-- View: Recovery programs only
CREATE OR REPLACE VIEW recovery_programs AS
SELECT * FROM programs_full 
WHERE type_code IN ('RECOVERY', 'TREATMENT', 'DETOX');

-- View: Forensic clinics only
CREATE OR REPLACE VIEW forensic_clinics AS
SELECT * FROM programs_full WHERE type_code = 'FPS';

-- View: Indigenous justice programs only
CREATE OR REPLACE VIEW indigenous_justice_programs AS
SELECT * FROM programs_full WHERE type_code IN ('IJC', 'IJP');

-- =============================================
-- VERIFY DATA
-- =============================================
SELECT 'Program Types' as table_name, COUNT(*) as count FROM program_types
UNION ALL
SELECT 'Programs', COUNT(*) FROM programs
UNION ALL
SELECT 'Program Contacts', COUNT(*) FROM program_contacts
UNION ALL
SELECT 'Constants', COUNT(*) FROM program_constants;

-- Show programs by type
SELECT type_code, type_name, COUNT(*) as count 
FROM programs_full 
GROUP BY type_code, type_name 
ORDER BY count DESC;
