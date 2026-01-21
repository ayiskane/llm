-- =============================================
-- RCC SUPPORT CONTACTS SCHEMA
-- =============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS rcc_support_contacts CASCADE;
DROP TABLE IF EXISTS rcc_support_roles CASCADE;
DROP TABLE IF EXISTS rcc_support_organizations CASCADE;

-- =============================================
-- SUPPORT ROLES
-- =============================================
CREATE TABLE rcc_support_roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,              -- e.g., 'CTT', 'CR', 'CIW'
    name VARCHAR(100) NOT NULL,                    -- e.g., 'Community Transition Team'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO rcc_support_roles (code, name, description) VALUES
('CTT', 'Community Transition Team', 'PHSA-run teams providing mental health and substance use support for up to 90 days post-release'),
('CR', 'Community Reintegration', 'Release planning, housing, ID, employment support'),
('CIW', 'Community Integration Worker', 'Community society workers assisting with release planning and reintegration'),
('ITRP', 'Integrated Transitional Release Planning', 'BC Corrections release planning program for high-risk individuals'),
('ICL', 'Indigenous Cultural Liaison', 'Cultural support and connection to Indigenous services and communities'),
('RPO', 'Release Planning Officer', 'BC Corrections staff coordinating release plans'),
('CDC', 'Concurrent Disorder Counsellor', 'Healthcare staff for mental health and substance use');

-- =============================================
-- SUPPORT ORGANIZATIONS
-- =============================================
CREATE TABLE rcc_support_organizations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(50),
    website VARCHAR(255),
    general_email VARCHAR(255),
    general_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO rcc_support_organizations (name, short_name, website, general_email, general_phone, notes) VALUES
('Provincial Health Services Authority', 'PHSA', 'https://www.bcmhsus.ca/correctional-health-services', 'CommunityTransitionTeams@phsa.ca', '1-855-524-7733', 'Operates CTT teams at all 10 provincial centres'),
('Connective Support Society', 'Connective', 'https://connective.ca', NULL, NULL, 'Serves NFPC, FRCC'),
('Elizabeth Fry Society', 'E Fry', 'https://www.elizabethfry.com', NULL, NULL, 'Serves ACCW (women''s centre)'),
('Pacific Women''s Society', 'PWS', NULL, NULL, NULL, 'Serves SPSC'),
('John Howard Society of BC', 'JHS', 'https://johnhowardbc.ca', NULL, NULL, 'Various correctional support services'),
('BC Corrections', 'BCC', 'https://www2.gov.bc.ca/gov/content/justice/criminal-justice/corrections', NULL, NULL, 'Provincial corrections branch');

-- =============================================
-- SUPPORT CONTACTS
-- =============================================
CREATE TABLE rcc_support_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,                    -- Contact name or office name
    is_individual BOOLEAN DEFAULT TRUE,           -- TRUE for person, FALSE for office/department
    role_id INTEGER REFERENCES rcc_support_roles(id),
    organization_id INTEGER REFERENCES rcc_support_organizations(id),
    
    -- Contact info
    email VARCHAR(255),
    email_secondary VARCHAR(255),                  -- Some have gov + org email
    phone VARCHAR(50),
    
    -- Centre assignment (NULL if serves multiple or all)
    centre_short_name VARCHAR(20),                 -- e.g., 'SPSC', 'NFPC' - matches correctional_centres.short_name
    centres_served VARCHAR(100),                   -- For contacts serving multiple centres, e.g., 'SPSC, NFPC'
    
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_rcc_contacts_centre ON rcc_support_contacts(centre_short_name);
CREATE INDEX idx_rcc_contacts_role ON rcc_support_contacts(role_id);
CREATE INDEX idx_rcc_contacts_org ON rcc_support_contacts(organization_id);
CREATE INDEX idx_rcc_contacts_active ON rcc_support_contacts(is_active);

-- =============================================
-- INSERT CONTACTS FROM CHEATSHEET
-- =============================================

-- Get role and org IDs for inserts
INSERT INTO rcc_support_contacts (name, is_individual, role_id, organization_id, email, phone, centre_short_name, centres_served) VALUES
-- CTT Contacts
('Maeve O''Sullivan', TRUE, 
    (SELECT id FROM rcc_support_roles WHERE code = 'CTT'),
    (SELECT id FROM rcc_support_organizations WHERE short_name = 'PHSA'),
    'Maeve.osullivan@phsa.ca', NULL, 'ACCW', NULL),

('Laura Burkholder', TRUE,
    (SELECT id FROM rcc_support_roles WHERE code = 'CTT'),
    (SELECT id FROM rcc_support_organizations WHERE short_name = 'PHSA'),
    'Laura.Burkholder@phsa.ca', NULL, 'NFPC', NULL),

('Ashley Lafortune', TRUE,
    (SELECT id FROM rcc_support_roles WHERE code = 'CTT'),
    (SELECT id FROM rcc_support_organizations WHERE short_name = 'PHSA'),
    'ashley.lafortune@phsa.ca', '236-994-7733', 'SPSC', NULL),

-- Community Reintegration Contacts
('Sean Perry', TRUE,
    (SELECT id FROM rcc_support_roles WHERE code = 'CR'),
    (SELECT id FROM rcc_support_organizations WHERE short_name = 'Connective'),
    'sean.perry@connective.ca', '604-468-3406', NULL, 'SPSC, NFPC'),

('SPSC Community Reintegration Office', FALSE,
    (SELECT id FROM rcc_support_roles WHERE code = 'CR'),
    (SELECT id FROM rcc_support_organizations WHERE short_name = 'BCC'),
    'SPSC.Reintegration@gov.bc.ca', '604-572-2170', 'SPSC', NULL);

-- Update Sean Perry with secondary email
UPDATE rcc_support_contacts 
SET email_secondary = 'Sean.Perry@gov.bc.ca' 
WHERE name = 'Sean Perry';

-- =============================================
-- SYSTEM-WIDE RCC CONSTANTS
-- =============================================
DROP TABLE IF EXISTS rcc_constants CASCADE;

CREATE TABLE rcc_constants (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO rcc_constants (key, value, description) VALUES
('ctt_general_email', 'CommunityTransitionTeams@phsa.ca', 'General CTT inquiries email'),
('ctt_toll_free_voicemail', '1-855-524-7733', 'CTT toll-free voicemail'),
('correctional_health_services_phone', '604-829-8657', 'Correctional Health Services administration'),
('bc_corrections_family_line', '1-888-952-7968', 'BC Corrections family message line');

-- =============================================
-- HELPFUL VIEWS
-- =============================================

-- View: Contacts with role and org names
CREATE OR REPLACE VIEW rcc_contacts_full AS
SELECT 
    c.id,
    c.name,
    c.is_individual,
    r.code AS role_code,
    r.name AS role_name,
    o.name AS organization_name,
    o.short_name AS organization_short_name,
    c.email,
    c.email_secondary,
    c.phone,
    c.centre_short_name,
    c.centres_served,
    c.notes,
    c.is_active
FROM rcc_support_contacts c
LEFT JOIN rcc_support_roles r ON c.role_id = r.id
LEFT JOIN rcc_support_organizations o ON c.organization_id = o.id
WHERE c.is_active = TRUE;

-- =============================================
-- VERIFY DATA
-- =============================================
SELECT 'Roles' as table_name, COUNT(*) as count FROM rcc_support_roles
UNION ALL
SELECT 'Organizations', COUNT(*) FROM rcc_support_organizations
UNION ALL
SELECT 'Contacts', COUNT(*) FROM rcc_support_contacts;

-- Show all contacts
SELECT * FROM rcc_contacts_full;
