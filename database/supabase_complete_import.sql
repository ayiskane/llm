-- BC Legal Reference Database - Complete Data Import (UPDATED)
-- Generated: 2025-01-19
-- Total Records: 907+
-- 
-- HOW TO USE:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Click on "SQL Editor" in the left sidebar
-- 3. Create a new query
-- 4. Paste this entire file
-- 5. Click "Run" to execute

-- ============================================
-- ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- DROP AND RECREATE TABLES
-- ============================================

-- Bail Offices (NEW)
DROP TABLE IF EXISTS bail_offices CASCADE;
CREATE TABLE bail_offices (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    location VARCHAR(255),
    email VARCHAR(255),
    type VARCHAR(50),
    hours TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Federal Crown Contacts (NEW)
DROP TABLE IF EXISTS federal_crown_contacts CASCADE;
CREATE TABLE federal_crown_contacts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    area TEXT,
    firm VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Evening Crown Contacts (NEW)
DROP TABLE IF EXISTS evening_crown_contacts CASCADE;
CREATE TABLE evening_crown_contacts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    name VARCHAR(255),
    role VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    type VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crown Offices (NEW)
DROP TABLE IF EXISTS crown_offices CASCADE;
CREATE TABLE crown_offices (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    courtroom VARCHAR(20),
    location VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sheriff Cells Access (NEW)
DROP TABLE IF EXISTS sheriff_cells_access CASCADE;
CREATE TABLE sheriff_cells_access (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    location VARCHAR(255),
    phone VARCHAR(100),
    access TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Registry Contacts (NEW)
DROP TABLE IF EXISTS registry_contacts CASCADE;
CREATE TABLE registry_contacts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    court VARCHAR(255),
    code VARCHAR(10),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Justice Centre Links (NEW)
DROP TABLE IF EXISTS justice_centre_links CASCADE;
CREATE TABLE justice_centre_links (
    id SERIAL PRIMARY KEY,
    region VARCHAR(20),
    name VARCHAR(255),
    conference_id VARCHAR(50),
    phone VARCHAR(50),
    toll_free VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- VB Triage Links (NEW)
DROP TABLE IF EXISTS vb_triage_links CASCADE;
CREATE TABLE vb_triage_links (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10),
    location VARCHAR(255),
    conference_id VARCHAR(50),
    phone VARCHAR(50),
    toll_free VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Courts
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
    created_at TIMESTAMP DEFAULT NOW()
);

-- Police Cells
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

-- Correctional Facilities
CREATE TABLE IF NOT EXISTS correctional_facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    region VARCHAR(50),
    phone VARCHAR(50),
    fax VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bail Contacts
CREATE TABLE IF NOT EXISTS bail_contacts (
    id SERIAL PRIMARY KEY,
    region VARCHAR(10) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Bail Coordinators
CREATE TABLE IF NOT EXISTS bail_coordinators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    is_backup BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crown Contacts
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

-- LABC Offices
CREATE TABLE IF NOT EXISTS labc_offices (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255),
    region VARCHAR(50),
    type VARCHAR(50),
    phone VARCHAR(100),
    email VARCHAR(255),
    hours TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- LABC Navigators
CREATE TABLE IF NOT EXISTS labc_navigators (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    courts TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Forensic Clinics
CREATE TABLE IF NOT EXISTS forensic_clinics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indigenous Justice Centres
CREATE TABLE IF NOT EXISTS indigenous_justice_centres (
    id SERIAL PRIMARY KEY,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Programs
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

-- Access Codes
CREATE TABLE IF NOT EXISTS access_codes (
    id SERIAL PRIMARY KEY,
    court VARCHAR(255) NOT NULL,
    code VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Circuit Courts
CREATE TABLE IF NOT EXISTS circuit_courts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    region VARCHAR(50),
    contact_hub VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INSERT DATA
-- ============================================


-- BAIL OFFICES (17 records)
TRUNCATE TABLE bail_offices RESTART IDENTITY CASCADE;
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R3', 'Abbotsford', 'Abbotsford.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R3', 'Chilliwack', 'Chilliwack.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R3', 'New Westminster', 'NewWestProv.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R3', 'Port Coquitlam', 'PoCo.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R3', 'Surrey', 'Surrey.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R3', 'Fraser After-Hours', 'Surrey.VirtualBail@gov.bc.ca', 'after_hours', 'Evenings, weekends, holidays');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R4', 'Interior Daytime', 'Region4.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R4', 'Interior After-Hours', 'AGBCPSReg4BailKelownaGen@gov.bc.ca', 'after_hours', 'Evenings, weekends, holidays');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R1', 'Island Daytime', 'Region1.VirtualBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R1', 'Island After-Hours', 'VictoriaCrown.Public@gov.bc.ca', 'after_hours', 'Evenings, weekends, holidays');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R5', 'North All Hours', 'Region5.VirtualBail@gov.bc.ca', 'all_hours', 'All bail matters');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R2', '222 Main/DCC', '222MainCrownBail@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R2', 'North Vancouver', 'NorthVanCrown@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R2', 'Richmond', 'RichmondCrown@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R2', 'Sechelt', 'SecheltCrown@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R2', 'Vancouver Youth', 'VancouverYouthCrown@gov.bc.ca', 'daytime', 'Weekday daytime');
INSERT INTO bail_offices (region, location, email, type, hours) VALUES ('R2', 'Vancouver Coastal After-Hours', '222MainCrownBail@gov.bc.ca', 'after_hours', 'Evenings, weekends, holidays');

-- FEDERAL CROWN CONTACTS (13 records)
TRUNCATE TABLE federal_crown_contacts RESTART IDENTITY CASCADE;
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R1', 'Victoria & Colwood', 'Jones & Co', 'Vicinfo@joneslaw.ca', '250-220-6942');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R1', 'Nanaimo & Duncan', 'Jones & Co', 'Naninfo@joneslaw.ca', '250-714-1113');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R1', 'Campbell River, Courtenay, Port Alberni, Port Hardy, Tofino', 'Jones & Co', 'Naninfo@joneslaw.ca', '250-714-1113');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R3', 'Surrey, Langley, Delta, White Rock', 'PPSC Surrey Office', 'PPSC.SurreyInCustody-EnDetentionSurrey.SPPC@ppsc-sppc.gc.ca', '236-456-0015');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R3', 'Port Coquitlam & New Westminster', 'MTC Law', 'pbachra@mtclaw.ca', '604-590-8855');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R3', 'Chilliwack & Abbotsford', 'JM LeDressay & Associates', 'jir@jmldlaw.com', '604-514-8203');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R4', 'Kamloops, Ashcroft, Chase, Clearwater, Lillooet, Lytton, Merritt, Salmon Arm', 'MTC Law', 'pbachra@mtclaw.ca', '604-590-8855');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R4', 'Kelowna, Penticton, Oliver, Osoyoos, Summerland, Princeton, Vernon', 'JM LeDressay & Associates', 'jir@jmldlaw.com', '604-514-8203');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R4', 'Kootenays (Castlegar, Cranbrook, Creston, Fernie, Golden, Grand Forks, Invermere, Nakusp, Nelson, Rossland, Trail)', 'PPSC Surrey Office', 'VAN.Detention.VAN@ppsc-sppc.gc.ca', '604-354-9146');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R5', 'Prince George, Smithers, Terrace, Burns Lake, Vanderhoof, Hazelton, Houston, Kitimat', 'Yalowsky Sudeyko Lucky', 'Richard@luckylaw.ca', '250-562-2316');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R5', 'Peace Region (Dawson Creek, Fort Nelson, Fort St. John, Chetwynd)', 'PPSC Main Street', 'VAN.Detention.VAN@ppsc-sppc.gc.ca', '604-666-2141');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R5', 'Masset, Queen Charlotte', 'PPSC BCRO', 'Adrienne.Switzer@ppsc-sppc.gc.ca', '604-230-8632');
INSERT INTO federal_crown_contacts (region, area, firm, email, phone) VALUES ('R5', '100 Mile House, McBride, Valemount, Williams Lake', 'MTC Law', 'pbachra@mtclaw.ca', '604-590-8855');

-- EVENING CROWN CONTACTS (9 records)
TRUNCATE TABLE evening_crown_contacts RESTART IDENTITY CASCADE;
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R1', 'Island Evening Team', NULL, 'VictoriaCrown.Public@gov.bc.ca', NULL, NULL, 'team_email');
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R1', 'Megan Saben', 'Legal Assistant', 'Megan.saben@gov.bc.ca', '236-748-1481', NULL, NULL);
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R1', 'Jillian Pawlow', 'Crown Counsel', 'Jillian.Pawlow@gov.bc.ca', '236-478-3732', NULL, NULL);
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R1', 'Mark Halston', 'Crown Counsel (Backup)', 'Mark.Halston@gov.bc.ca', '778-405-1775', '250-507-9104', NULL);
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R4', 'Interior Evening Team', NULL, 'AGBCPSReg4BailKelownaGen@gov.bc.ca', NULL, NULL, 'team_email');
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R4', 'Izabel Bonilla', 'Legal Assistant', 'izabel.bonilla@gov.bc.ca', '778-943-7129', NULL, NULL);
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R4', 'Traci Denman', 'Legal Assistant (Backup)', 'Traci.denman@gov.bc.ca', '778-943-0176', NULL, NULL);
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R4', 'Sheron O''Connor', 'Crown Counsel', 'Sheron.oconnor@gov.bc.ca', '250-645-9160', '250-570-1422', NULL);
INSERT INTO evening_crown_contacts (region, name, role, email, phone, mobile, type) VALUES ('R4', 'Bill Hilderman', 'Crown Counsel (Backup)', 'Bill.hilderman@gov.bc.ca', '778-824-0097', NULL, NULL);

-- CROWN OFFICES (26 records)
TRUNCATE TABLE crown_offices RESTART IDENTITY CASCADE;
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR9', 'Campbell River', 'CampbellRiver.CrownSchedule@gov.bc.ca', '250-286-7544');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR9', 'Courtenay', 'Courtenay.CrownSchedule@gov.bc.ca', '250-334-1120');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR9', 'Nanaimo', 'Nanaimo.CrownSchedule@gov.bc.ca', '250-741-3711');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR9', 'Port Alberni', 'PtAlberni.CrownSchedule@gov.bc.ca', '250-720-2433');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR9', 'Port Hardy', 'PortHardy.CrownSchedule@gov.bc.ca', '250-949-8644');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR9', 'Powell River', 'PowellRiver.Crown@gov.bc.ca', '604-485-3645');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR8', 'Colwood', 'Colwood.Crown@gov.bc.ca', '250-391-2866');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR8', 'Duncan', 'BCPS.Duncan.Reception@gov.bc.ca', '250-746-1229');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R1', 'VR8', 'Victoria', 'VictoriaCrown.Public@gov.bc.ca', '250-387-4481');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR3', 'Kelowna', 'BCPS.KelownaGen@gov.bc.ca', '250-470-6822');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR3', 'Cranbrook', 'BCPS.CranbrookGen@gov.bc.ca', '250-426-1525');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR3', 'Nelson', 'BCPS.NelsonGen@gov.bc.ca', '250-354-6511');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR3', 'Penticton', 'BCPS.PentictonGen@gov.bc.ca', '250-487-4455');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR4', 'Kamloops', 'BCPS.KamloopsGen@gov.bc.ca', '250-828-4021');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR4', 'Salmon Arm', 'BCPS.SalmonArmGen@gov.bc.ca', '250-832-1651');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R4', 'VR4', 'Vernon', 'BCPS.VernonGen@gov.bc.ca', '250-503-3643');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR1', 'Prince George', 'PrGeorge.Crown@gov.bc.ca', '250-614-2601');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR1', 'Quesnel', 'Quesnel.Crown@gov.bc.ca', '250-992-4262');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR1', 'Vanderhoof', 'Vanderhoof.Crown@gov.bc.ca', '250-567-6835');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR1', 'Williams Lake', 'WilliamsLake.Crown@gov.bc.ca', '250-398-4473');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR2', 'Dawson Creek', 'DawsonCreek.CrownCounsel@gov.bc.ca', '250-784-2290');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR2', 'Fort Nelson', 'FortNelson.Crown@gov.bc.ca', '250-774-5984');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR2', 'Fort St. John', 'FtStJohn.Crown@gov.bc.ca', '250-787-3276');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR2', 'Prince Rupert', 'PrinceRupert.Crown@gov.bc.ca', '250-624-7440');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR2', 'Smithers', 'Smithers.Crown@gov.bc.ca', '250-847-7364');
INSERT INTO crown_offices (region, courtroom, location, email, phone) VALUES ('R5', 'VR2', 'Terrace', 'Terrace.Crown@gov.bc.ca', '250-638-2131');

-- SHERIFF CELLS ACCESS (8 records)
TRUNCATE TABLE sheriff_cells_access RESTART IDENTITY CASCADE;
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R3', 'Abbotsford', '604-855-3239', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R3', 'Chilliwack', '604-795-8328', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R3', 'New Westminster', '604-660-8545', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R3', 'Port Coquitlam', '604-927-2195', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R3', 'Surrey', '236-455-1797 or 604-572-2194', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R2', 'Vancouver Provincial (Level 0)', '604-775-2522', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R2', 'North Vancouver', '604-981-0236', 'Virtual, In-person, Telephone');
INSERT INTO sheriff_cells_access (region, location, phone, access) VALUES ('R2', 'Richmond', '604-660-7769 (QB) or 604-660-3467', 'Virtual, In-person, Telephone');

-- REGISTRY CONTACTS (33 records)
TRUNCATE TABLE registry_contacts RESTART IDENTITY CASCADE;
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Prince George Provincial Court', 'PG', 'csbpg.criminalregistry@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Anahim Lake Provincial Court', 'AL', 'Office15231@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', '100 Mile House Law Courts', 'OMH', 'Office15231@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Fort St James Provincial Court', 'FSJ', 'csbpg.criminalregistry@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Fraser Lake Provincial Court', 'FL', 'csbpg.criminalregistry@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Kwadacha Provincial Court', 'KWA', 'Office15216@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Mackenzie Provincial Court', 'MAC', 'Office15216@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'McBride Provincial Court', 'MCB', 'Office15215@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Quesnel Law Courts', 'QUE', 'Office15230@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Tsay Keh Dene Provincial Court', 'TKD', 'csbpg.criminalregistry@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Valemount Provincial Court', 'VAL', 'Office15215@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Vanderhoof Law Courts', 'VHF', 'csbpg.criminalregistry@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Williams Lake Law Courts', 'WL', 'Office15231@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Atlin Provincial Court', 'ATL', 'Office15228@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Burns Lake Provincial Court', 'BL', 'Office15219@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Dease Lake Provincial Court', 'DL', 'Office15222@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Good Hope Lake Provincial Court', 'GHL', 'Office15228@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Hazelton Provincial Court', 'HAZ', 'Office15224@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Houston Provincial Court', 'HOU', 'Office15224@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Kitimat Law Courts', 'KIT', 'Office15222@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Lower Post Provincial Court', 'LP', 'Office15228@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Masset Provincial Court', 'MAS', 'VCMassetCrt@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'New Aiyansh Provincial Court', 'NEA', 'Office15222@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Prince Rupert Law Courts', 'PR', 'Office15220@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Queen Charlotte Provincial Court', 'QCC', 'Office15220@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Smithers Law Courts', 'SMI', 'Office15224@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Stewart Law Courts', 'STE', 'Office15222@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Terrace Law Courts', 'TER', 'Office15222@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Chetwynd Provincial Court', 'CHE', 'Office15226@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Dawson Creek Law Courts', 'DC', 'Office15226@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Fort Nelson Law Courts', 'FN', 'Office15229@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Fort St John Law Courts', 'FOS', 'Office15228@gov.bc.ca');
INSERT INTO registry_contacts (region, court, code, email) VALUES ('R5', 'Tumbler Ridge Provincial Court', 'TR', 'Office15226@gov.bc.ca');

-- JUSTICE CENTRE LINKS (7 records)
TRUNCATE TABLE justice_centre_links RESTART IDENTITY CASCADE;
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('R2', 'Vancouver Coastal Evening & Weekend', '732 076 358', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('R5', 'Northern Region Evening & Weekend', '365 751 988', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('R3', 'Surrey Region Evening & Weekend', '618 706 537', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('R4', 'Interior Region Evening & Weekend', '453 417 829', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('R3', 'Fraser Region Evening & Weekend', '938 770 945', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('R1', 'Island Region Evening & Weekend', '210 409 821', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO justice_centre_links (region, name, conference_id, phone, toll_free) VALUES ('Federal', 'Federal 24 Hours', '634 183 845', '+1 778-725-6348', '(844) 636-7837');

-- VB TRIAGE LINKS (16 records)
TRUNCATE TABLE vb_triage_links RESTART IDENTITY CASCADE;
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R3', 'Abbotsford Triage', '414 202 059', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R3', 'Abbotsford CR204', '342 802 541', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R3', 'Port Coquitlam Triage', '131 566 11', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R3', 'Port Coquitlam CR001', '679 788 260', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R3', 'Surrey Triage', '136 442 754', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R3', 'Surrey CR108', '409 841 398', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R2', 'Vancouver Provincial Triage', '157 117 369', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R2', 'Vancouver Provincial CR101', '181 066 25', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R2', 'North Vancouver Triage', '657 198 089', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R2', 'North Vancouver CR1', '698 136 48', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R2', 'Richmond Triage', '300 911 530', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R2', 'Richmond CR107', '438 499 544', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R4', 'VR3 (Kelowna, Penticton, Kootenays)', '787 097 137', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R4', 'VR4 (Kamloops, Vernon, Salmon Arm)', '450 095 994', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R1', 'VR8 (South Island - Victoria, Duncan)', '929 176 188', '+1 778-725-6348', '(844) 636-7837');
INSERT INTO vb_triage_links (region, location, conference_id, phone, toll_free) VALUES ('R1', 'VR9 (Nanaimo, North Island)', '893 653 923', '+1 778-725-6348', '(844) 636-7837');

-- COURTS (82 records)
TRUNCATE TABLE courts RESTART IDENTITY CASCADE;
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('100 Mile House', 'WilliamsLake.Crown@gov.bc.ca', 'Cariboo.Scheduling@provincialcourt.bc.ca', 'Office15231@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Abbotsford (Provincial)', 'BCPS.Abbotsford.Reception@gov.bc.ca', 'Abbotsford.CriminalScheduling@provincialcourt.bc.ca', '', 'AbbotsfordCriminalRegistry@gov.bc.ca', 'Abbotsford.VirtualBail@gov.bc.ca', 'Abbotsford.VirtualHybridBail@provincialcourt.bc.ca', 'Tina.Nguyen@gov.bc.ca
Sheila.Hedd@gov.bc.ca
Damaris.Stanciu@gov.bc.ca');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Abbotsford (Supreme)', '', 'sc.scheduling_ab@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Burns Lake (Provincial)', 'Smithers.Crown@gov.bc.ca', 'Smithers.Scheduling@provincialcourt.bc.ca', 'Office15219@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Campbell River (Provincial)', 'CampbellRiver.CrownSchedule@gov.bc.ca', 'CampbellRiver.Scheduling@provincialcourt.bc.ca', 'CampbellRiverRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Campbell River (Supreme)', '', 'sc.scheduling_na@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Cariboo', '', 'Cariboo.Scheduling@provincialcourt.bc.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Chilliwack (Provincial)', 'BCPS.Chilliwack.Reception@gov.bc.ca', 'Chilliwack.Scheduling@provincialcourt.bc.ca', '', 'CSBChilliwackCriminalRegistry@gov.bc.ca', 'Chilliwack.VirtualBail@gov.bc.ca', 'Abbotsford.VirtualHybridBail@provincialcourt.bc.ca', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Chilliwack (Supreme)', '', 'sc.scheduling_cw@bccourts.ca', '[Fax Filing: 604-795-8397]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Colwood/Western Communities', 'Colwood.Crown@gov.bc.ca', 'WestComm.CriminalScheduling@provincialcourt.bc.ca', 'wccregistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Courtenay (Provincial)', 'Courtenay.CrownSchedule@gov.bc.ca', 'Courtenay.Scheduling@provincialcourt.bc.ca', 'CourtenayRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Courtenay (Supreme)', '', 'sc.scheduling_na@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Cranbrook (Provincial)', 'BCPS.CranbrookGen@gov.bc.ca', 'EKootenays.Scheduling@provincialcourt.bc.ca', 'cranbrookcourtregistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Cranbrook (Supreme)', '', 'sc.scheduling_ka@bccourts.ca', '[Fax Filing: 250-426-1498]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Criminal Appeals & Special Prosecutions', 'BCPS.CASPGen@gov.bc.ca', '', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Dawson Creek (Provincial)', 'DawsonCreek.CrownCounsel@gov.bc.ca', 'PeaceDistrict.CriminalScheduling@provincialcourt.bc.ca', 'office15226@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Dawson Creek (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '[Fax Filing: 250-784-2218]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Duncan (Provincial)', 'BCPS.Duncan.Reception@gov.bc.ca', 'Dun.Scheduling@provincialcourt.bc.ca', 'JAGCSBDuncanCourtScheduling@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Duncan (Supreme)', '', 'sc.scheduling_na@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('East Kootenays', '', 'EKootenays.Scheduling@provincialcourt.bc.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Federal Crown (General)', 'VAN.Detention.VAN@ppsc-sppc.gc.ca', '', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Federal Crown (Prince George)', 'susan@luckylaw.ca', '', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('First Nations Court (New West)', 'Lena.DalSanto@gov.bc.ca', '', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Fort Nelson', 'FortNelson.Crown@gov.bc.ca', 'Terrace.CriminalScheduling@provincialcourt.bc.ca', 'Office15229@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Fort St. John (Provincial)', 'FtStJohn.Crown@gov.bc.ca', 'PeaceDistrict.CriminalScheduling@provincialcourt.bc.ca', 'Office15228@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Fort St. John (Supreme)', '', 'sc.scheduling_pg@BCCourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Golden (Provincial)', 'BCPS.CranbrookGen@gov.bc.ca', 'EKootenays.Scheduling@provincialcourt.bc.ca', 'GoldenCourtRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Golden (Supreme)', '', 'sc.scheduling_ka@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Kamloops (Provincial)', 'BCPS.KamloopsGen@gov.bc.ca', 'Kamloops.Scheduling@provincialcourt.bc.ca', 'KamloopsCourtRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Kamloops (Supreme)', '', 'sc.scheduling_ka@bccourts.ca', '[Fax Filing: 250-828-4345]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Kelowna (Provincial)', 'KelownaCrown@gov.bc.ca', 'Kelowna.CriminalScheduling@provincialcourt.bc.ca', 'KelownaCourtRegistry@gov.bc.ca', 'CSB.KelownaCriminal@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Kelowna (Supreme)', '', 'sc.scheduling_ok@bccourts.ca', '[Fax Filing: 250-979-6768]', 'CSB.KelownaSupreme@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('MacKenzie', '', '', 'Office15216@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Nanaimo (Provincial)', 'Nanaimo.CrownSchedule@gov.bc.ca', 'Nanaimo.Scheduling@provincialcourt.bc.ca', '', 'crimreg.nanaimo@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Nanaimo (Supreme)', '', 'sc.scheduling_na@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Nelson (Provincial)', 'BCPS.NelsonGen@gov.bc.ca', 'WKootenays.Scheduling@provincialcourt.bc.ca', 'NelsonCourtRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Nelson (Supreme)', '', 'sc.scheduling_ka@bccourts.ca', '[Fax Filing: 250-354-6133]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('New Westminster (Provincial)', 'NewWestminsterProvincial@gov.bc.ca', 'NewWest.Scheduling@provincialcourt.bc.ca', 'JAGCSBNWestminsterCourtScheduling@gov.bc.ca', '', 'NewWestProv.VirtualBail@gov.bc.ca', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('New Westminster (Supreme)', 'CJB.NewWestRegionalCrown@gov.bc.ca', 'sc.scheduling_nw@BCCourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('North Vancouver', 'NorthVanCrown@gov.bc.ca', 'NVan.Scheduling@provincialcourt.bc.ca', 'NorthVancouverRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Peace District', '', 'Peace.District.Scheduling@provincialcourt.bc.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Penticton (Provincial)', 'BCPS.PentictonGen@gov.bc.ca', 'Penticton.Scheduling@provincialcourt.bc.ca', 'PentictonCourtRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Penticton (Supreme)', '', 'sc.scheduling_ok@bccourts.ca', '[Fax Filing: 250-492-1290]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Port Alberni (Provincial)', 'PtAlberni.CrownSchedule@gov.bc.ca', 'PortAlberni.Scheduling@provincialcourt.bc.ca', 'PortAlberniRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Port Alberni (Supreme)', '', 'sc.scheduling_na@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Port Coquitlam (Provincial)', 'Poco.Crown@gov.bc.ca', 'PoCo.Scheduling@provincialcourt.bc.ca', '', 'csb.portcoquitlamprovcriminal@gov.bc.ca', 'Poco.VirtualBail@gov.bc.ca', 'Poco.VirtualHybridBail@provincialcourt.bc.ca', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Port Coquitlam (Supreme)', '', 'sc.scheduling_pc@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Port Hardy', 'PortHardy.CrownSchedule@gov.bc.ca', 'PortHardy.Scheduling@provincialcourt.bc.ca', 'porthardycourtregistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Powell River (Provincial)', 'PowellRiver.CrownSchedule@gov.bc.ca', 'PowellRiver.Scheduling@provincialcourt.bc.ca', 'powellriverregistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Powell River (Supreme)', '', 'sc.scheduling_na@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Prince George (Provincial)', 'PrGeorge.crown@gov.bc.ca', 'PG.Scheduling@provincialcourt.bc.ca', '', 'csbpg.criminalregistry@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Prince George (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '[Fax Filing: 250-614-7923]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Prince Rupert (Provincial)', 'PrinceRupert.Crown@gov.bc.ca', 'PrinceRupert.Scheduling@provincialcourt.bc.ca', 'Office15220@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Prince Rupert (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Quesnel (Provincial)', 'Quesnel.Crown@gov.bc.ca', 'Cariboo.Scheduling@provincialcourt.bc.ca', 'Office15230@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Quesnel (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Revelstoke (Supreme)', 'BCPS.SalmonArmGen@gov.bc.ca', 'sc.scheduling_ka@bccourts.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Richmond (Provincial)', 'RichmondCrown@gov.bc.ca', 'Richmond.Scheduling@provincialcourt.bc.ca', 'RichmondCourtRegistry@gov.bc.ca', '', '', '', 'AGCSBRichmondInterpreters@gov.bc.ca');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Richmond (Federal)', 'ppscsupportstaff@mtclaw.ca', '', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Rossland (Provincial)', 'BCPS.NelsonGen@gov.bc.ca', 'WKootenays.Scheduling@provincialcourt.bc.ca', 'VCRosslandCrt@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Rossland (Supreme)', '', 'sc.scheduling_ka@bccourts.ca', '[Fax Filing: 250-362-7321]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Salmon Arm (Provincial)', 'BCPS.SalmonArmGen@gov.bc.ca', 'SalmonArm.Scheduling@provincialcourt.bc.ca', 'SalmonArmRegistry@gov.bc.ca', 'JAGCSBSalmonArmScheduling@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Salmon Arm (Supreme)', '', 'sc.scheduling_ka@bccourts.ca', '[Fax Filing: 250-833-7401]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Sechelt', 'SecheltCrown@gov.bc.ca', 'NVan.Scheduling@provincialcourt.bc.ca', 'SecheltRegistry@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Smithers (Provincial)', 'Smithers.Crown@gov.bc.ca', 'Smithers.Scheduling@provincialcourt.bc.ca', 'Office15224@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Smithers (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '[Fax Filing: 250-847-7344]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Surrey', 'Surrey.Intake@gov.bc.ca', 'Surrey.Scheduling@provincialcourt.bc.ca', '', 'CSBSurreyProvincialCourt.CriminalRegistry@gov.bc.ca', 'Surrey.VirtualBail@gov.bc.ca', 'Surrey.CriminalScheduling@provincialcourt.bc.ca', 'CSBSurreyProvincialCourt.AccountingandInterpreters@gov.bc.ca');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Surrey (Federal)', 'ppsc.surreyincustody-endetentionsurrey.sppc@ppsc-sppc.gc.ca', '', '', '', 'PPSC.SurreyInCustody-EnDetentionSurrey.SPPC@ppsc-sppc.gc.ca', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Terrace (Provincial)', 'Terrace.Crown@gov.bc.ca', 'Terrace.Scheduling@provincialcourt.bc.ca', 'Office15222@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Terrace (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '[Fax Filing: 250-638-2143]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Valemount', 'PrGeorge.crown@gov.bc.ca', 'PG.Scheduling@provincialcourt.bc.ca', 'Office15215@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Vancouver 222 Main Street & DCC', '222MainCrownGeneral@gov.bc.ca', 'Van.Scheduling@provincialcourt.bc.ca', '222MainCS@gov.bc.ca
222MainTranscripts@gov.bc.ca', '', '', '', 'CSB222.InterpreterRequests@gov.bc.ca');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Vancouver Law Courts (Supreme)', 'VancouverRegionalCrown@gov.bc.ca', 'sc.criminal_va@BCcourts.ca', 'VancouverLawCourtsRegistry@gov.bc.ca', 'Vlc.criminal@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Vancouver Youth (Robson)', 'VancouverYouthCrown@gov.bc.ca', 'Robson.Scheduling@provincialcourt.bc.ca', 'CSBRCS@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Vanderhoof', 'Vanderhoof.Crown@gov.bc.ca', 'PG.Scheduling@provincialcourt.bc.ca', '', 'csbpg.criminalregistry@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Vernon (Provincial)', 'BCPS.VernonGen@gov.bc.ca', 'Vernon.Scheduling@provincialcourt.bc.ca', 'VernonRegistry@gov.bc.ca', 'JAGCSBVernonScheduling@gov.bc.ca', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Vernon (Supreme)', '', 'sc.scheduling_ok@bccourts.ca', '[Fax Filing: 250-549-5461]', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Victoria (Provincial)', 'VictoriaCrown.Public@gov.bc.ca', 'Vic.Scheduling@provincialcourt.bc.ca', '', 'vicprovincialreg@gov.bc.ca', '', '', 'victoria.finance@gov.bc.ca');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Victoria (Supreme)', '', 'sc.scheduling_vi@bccourts.ca', '', 'vicsupremereg@gov.bc.ca', '', '', 'victoria.finance@gov.bc.ca');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('West Kootenays', '', 'WKootenays.Scheduling@provincialcourt.bc.ca', '', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Williams Lake (Provincial)', 'WilliamsLake.Crown@gov.bc.ca', 'Cariboo.Scheduling@provincialcourt.bc.ca', 'Office15231@gov.bc.ca', '', '', '', '');
INSERT INTO courts (name, crown_email, jcm_scheduling_email, court_registry_email, criminal_registry_email, bail_crown_email, bail_jcm_email, interpreter_request_email) VALUES ('Williams Lake (Supreme)', '', 'sc.scheduling_pg@bccourts.ca', '[Fax Filing: 250-398-4264]', '', '', '', '');

-- POLICE CELLS (106 records)
TRUNCATE TABLE police_cells RESTART IDENTITY CASCADE;
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('100 Mile House RCMP', '7783329565.0', '7783329520.0', '2503952456.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Abbotsford CH', '6048553239.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Abbotsford PD', '6048644773.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Agassiz RCMP', '6047961618.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Alexis Creek RCMP', '2503944632.0', '2503944683.0', '2503944211.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Anahim Lake RCMP', '2507423214.0', '2507423509.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Armstrong RCMP', '2505463822.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Ashcroft RCMP', '2504532217.0', '2504532216.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Atlin RCMP', '2506517511.0', '2506517693.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Barriere RCMP', '2506729919.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Bella Bella RCMP', '2509572389.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Bella Coola RCMP', '2507995374.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Burnaby RCMP', '6046469633.0', '6046469986.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Burnaby YDC', '7784522050.0', '7784522051.0', '7784522110.0', '7784522111.0');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Burns Lake RCMP', '2506927171.0', '2506923905.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Castlegar RCMP', '2503653272.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Chase RCMP', '2506793912.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Chetwynd RCMP', '2507888181.0', '2507889221.0', '2507889111.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Chilliwack CH', '6047958328.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Chilliwack RCMP', '6047024199.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Clearwater RCMP', '2506742100.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Clinton RCMP', '2504592203.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Columbia Valley RCMP', '2503426266.0', '2503426769.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Coquitlam RCMP', '6049451565.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Cranbrook RCMP', '2504174207.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Creston RCMP', '2504280960.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Dawson Creek RCMP', '2507843715.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Dease Lake RCMP', '2507714603.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Duncan RCMP', '2507462109.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Elk Valley (Elkford, Fernie, Sparwood) RCMP', '2504252296.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Enderby RCMP', '2508389397.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Federal Crown In-Custody Clerk', '6046662141.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Federal Crown Office', '6046663033.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Fort Nelson RCMP', '2507744980.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Fort St. James RCMP', '2509968269.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Fort St. John RCMP', '2507878124.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Fraser Lake RCMP', '2506996215.0', '2506997777.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Golden RCMP', '2503444000.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Grand Forks RCMP', '2504423919.0', '2504428566.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Houston RCMP', '2508452868.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Hudson’s Hope RCMP', '2507835242.0', '2507839480.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Justice Centre', '6046604134.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Kamloops RCMP', '2508283094.0', '2508283270.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Kaslo RCMP', '2503532242.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Kelowna CH', '2504706841.0', '2504706816.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Kelowna RCMP', '2504706297.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Keremeos RCMP', '2504992500.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Kitimat RCMP', '2506392115.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Klemtu RCMP', '2508391247.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Langley RCMP', '6045323202.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Lillooet RCMP', '2502564722.0', '2502564244.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Lisims/Nass Valley RCMP', '2506332230.0', '2506332222.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Logan Lake RCMP', '2505236222.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Mackenzie RCMP', '2509973447.0', '2506263991.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Masset RCMP', '2506263697.0', '2506263991.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('McBride RCMP', '2505692255.0', '2505692260.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Merritt RCMP', '2503154623.0', '2503784262.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Midway RCMP', '2504428566.0', '2504423919.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Mission RCMP', '6048203543.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('New Hazelton RCMP', '2508424835.0', '2508425244.0', '2508426351.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('New West CH', '6046608545.0', '6046608543.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('New Westminster PD', '6045292469.0', '6045292470.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('North Vancouver CH', '6049810236.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('North Vancouver RCMP', '6049697487.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Pemberton RCMP', '6048946127.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Penticton RCMP', '2507704719.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('POCO CH', '6049272195.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('POCO RCMP', '6049451565.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Port Moody PD', '6049371325.0', '6049371333.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Prince George CH', '2367650633.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Prince George RCMP', '2502778950.0', '2505613300.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Prince Rupert RCMP', '2506270755.0', '2506270700.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Queen Charlotte RCMP', '2505594421.0', '2505594268.0', '2505594785.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Quesnel/Wells RCMP', '2509920500.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Richmond CH', '6046603467.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Richmond RCMP', '6042074894.0', '6042074785.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Ridge Meadows RCMP', '6044677680.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Saanich RCMP', '2504754270.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Smithers RCMP', '2508473233.0', '2508470238.0', '2508764034.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Squamish RCMP', '6048926124.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Stewart RCMP', '2506362865.0', '2508764034.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Sunshine Coast RCMP', '6047403204.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Surrey CH', '6045722270.0', '6045722156.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Surrey RCMP', '6045997765.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Takla Landing RCMP', '2509968574.0', '2509967847.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Terrace CH', '2506382121.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Terrace RCMP', '2506387431.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Tsay Keh Dene RCMP', '2509930000.0', '2509930001.0', '2509932185.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Tumbler Ridge RCMP', '2502425648.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('UFVRD/Hope/Boston Bar RCMP', '6048697772.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('University RCMP', '6042246981.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Valemount RCMP', '2505664457.0', '2505664466.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vancouver 222 Cr 101', '6047752506.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vancouver 222 Cr 102', '6047752508.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vancouver 222 Sheriffs', '6047752522.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vancouver PD', '6047179966.0', '6047173958.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vancouver Youth', '6046608870.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vanderhoof RCMP', '2505679228.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Vernon CH', '2502607185.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Victoria CH', '2503876571.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Victoria/Sechelt RCMP', '2504754321.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Watson Lake, Yukon Territory/Lower Post BC', '8675362677.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('West Vancouver PD', '6049277308.0', '6049257306.0', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Whistler RCMP', '6048946127.0', '6049051966.0', '6049320568.0', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('White Rock RCMP', '7785454780.0', '', '', '');
INSERT INTO police_cells (name, phone1, phone2, phone3, phone4) VALUES ('Williams Lake RCMP', '2503928728.0', '2503928737.0', '', '');

-- CORRECTIONAL FACILITIES (44 records)
TRUNCATE TABLE correctional_facilities RESTART IDENTITY CASCADE;
INSERT INTO correctional_facilities (name, type) VALUES ('*** CALL CINDY TO REGISTER AS LAWYER FOR BC CORRECTIONS:', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('Name', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('ACCW (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('ACCW (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('ACCW (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('FMCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('FMCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('Fraser Valley Institution', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('FRCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('FRCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('Kent Institution', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('Kent Institution (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('KRCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('KRCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('KRCC (Virtual Visits)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('KRCC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('Matsqui Institution', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('Mission Institution (Medium)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('Mission Institution (Minimum)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('Mountain Institution', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('NCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('NCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('NCC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('NFPC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('NFPC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('NFPC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('OCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('OCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('OCC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('Pacific Institution', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('PGRCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('PGRCC (Virtual Visit)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('PGRCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('PGRCC (Records - for VB)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('PGRCC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('SPSC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('SPSC (Lawyer Callback Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('SPSC (Virtual Visit)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('SPSC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('SPSC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('VIRCC (General)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('VIRCC (Visit Request)', 'federal');
INSERT INTO correctional_facilities (name, type) VALUES ('VIRCC (CDN)', 'provincial');
INSERT INTO correctional_facilities (name, type) VALUES ('William Head Institution', 'federal');

-- BAIL CONTACTS (7 records)
TRUNCATE TABLE bail_contacts RESTART IDENTITY CASCADE;
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R1', 'Region 1 Virtual Bail', 'Region1.virtualbail@gov.bc.ca', 'daytime', NULL);
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R1', 'Victoria Crown', 'VictoriaCrown.Public@gov.bc.ca', 'evening', NULL);
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R2', '222 Main Crown Bail', '222MainCrownBail@gov.bc.ca', 'daytime', NULL);
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R3', 'Abbotsford Virtual Bail', 'Abbotsford.VirtualBail@gov.bc.ca', 'daytime', NULL);
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R3', 'Chilliwack Virtual Bail', 'Chilliwack.VirtualBail@gov.bc.ca', 'daytime', NULL);
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R4', 'Region 4 Virtual Bail', 'Region4.virtualbail@gov.bc.ca', 'daytime', NULL);
INSERT INTO bail_contacts (region, name, email, type, notes) VALUES ('R5', 'Region 5 Virtual Bail', 'Region5.virtualbail@gov.bc.ca', 'all_hours', NULL);

-- BAIL COORDINATORS (4 records)
TRUNCATE TABLE bail_coordinators RESTART IDENTITY CASCADE;
INSERT INTO bail_coordinators (name, region, email, phone, is_backup) VALUES ('Chloe Rathjen', 'R1 Island', 'chloe.rathjen@gov.bc.ca', '250-940-8522', FALSE);
INSERT INTO bail_coordinators (name, region, email, phone, is_backup) VALUES ('Pamela Robertson', 'R4 Interior', 'pamela.robertson@gov.bc.ca', '778-940-0050', FALSE);
INSERT INTO bail_coordinators (name, region, email, phone, is_backup) VALUES ('Angie Fryer', 'R4 Interior (Backup)', 'angie.fryer@gov.bc.ca', '250-312-511', FALSE);
INSERT INTO bail_coordinators (name, region, email, phone, is_backup) VALUES ('Jacqueline Ettinger', 'R5 North', 'jacqueline.ettinger@gov.bc.ca', '250-570-0422', FALSE);

-- CROWN CONTACTS (10 records)
TRUNCATE TABLE crown_contacts RESTART IDENTITY CASCADE;
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Jennifer Watkins', 'R1_daytime', 'jennifer.watkins@gov.bc.ca', '250-739-8644');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Rebecca Sutherland', 'R1_daytime', 'rebecca.sutherland@gov.bc.ca', '778-974-5159');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Custody
Bryan Pankoff', 'R4_daytime', 'bryan.pankoff@gov.bc.ca', '250-505-8081');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Izabel Bonilla', 'R4_daytime', 'izabel.bonilla@gov.bc.ca', '778-943-7129');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Winona Yeung', 'R4_daytime', 'winona.yeung@gov.bc.ca', '236-766-7004');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Cecilia Mayer', 'R4_daytime', 'cecilia.mayer@gov.bc.ca', '236-455-4397');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Remand
Garry Hansen', 'R4_daytime', 'garry.hansen@gov.bc.ca', '250-487-4463');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Custody
Bonnie Macdonald', 'R4_daytime', 'bonnie.macdonald@gov.bc.ca', '250-371-7624 250-312-6522');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Robyn Sampson', 'R4_daytime', 'robyn.sampson@gov.bc.ca', '778-362-4993');
INSERT INTO crown_contacts (name, region, email, phone) VALUES ('Marie Lafrance', 'R4_daytime', 'marie.lafrance@gov.bc.ca', '250-312-6519');

-- LABC OFFICES (11 records)
TRUNCATE TABLE labc_offices RESTART IDENTITY CASCADE;
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Dawson Creek', 'intake', '250-782-7366', 'Intake.DawsonCreek@legalaid.bc.ca', 'Mon,Tue,Thurs: 8:30am-12pm, 1pm-3:30pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Fort St James', 'intake', '1-866-614-6999', 'Intake.Vanderhoof.FtStJames@legalaid.bc.ca', 'Alternating Mondays 9am-4pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Fort St John', 'intake', '250-785-8089', 'Intake.FtStJohn@legalaid.bc.ca', 'Mon,Wed: 8:30am-12pm, 1pm-4:30pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Hazelton', 'intake', '250-842-5218', 'Intake.Hazelton@legalaid.bc.ca', 'Mon,Wed,Thurs: 9am-12pm, 1pm-4pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Prince George', 'intake', '250-564-9717', 'Intake.PrinceGeorge@legalaid.bc.ca', 'Mon-Thurs: 9am-12:30pm, 1:30pm-4pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Prince Rupert', 'intake', '250-627-7788', 'Intake.PrinceRupert@legalaid.bc.ca', 'Mon,Tue,Wed: 8:30am-12pm, 1pm-4:30pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Vanderhoof', 'intake', '250-567-2800', 'Intake.Vanderhoof.FtStJames@legalaid.bc.ca', 'Mon-Fri: 8:30am-12:30pm, 1:30pm-5:30pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Williams Lake', 'intake', '250-267-9154', 'Intake.WilliamsLake@legalaid.bc.ca', 'Wed,Thurs: 9am-12pm, 1pm-3pm');
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Province Wide Call Centre', 'call_centre', '1-866-577-2525', NULL, NULL);
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Duty Counsel Priority Line', 'priority_line', '1-888-601-6076 (Option #3)', NULL, NULL);
INSERT INTO labc_offices (location, type, phone, email, hours) VALUES ('Duty Counsel Team', 'email', NULL, 'DutyCounsel@legalaid.bc.ca', NULL);

-- LABC NAVIGATORS (8 records)
TRUNCATE TABLE labc_navigators RESTART IDENTITY CASCADE;
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Conor', '236-333-1260', 'conor.navigator@legalaid.bc.ca', 'Victoria, Nanaimo, VR8, VR9');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Courtney', '236-788-7372', 'courtney.navigator@legalaid.bc.ca', 'Surrey');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Hana', '604-364-6541', 'hana.navigator@legalaid.bc.ca', 'VR4, VR2, Kamloops');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Imtaj', '236-818-7616', 'imtaj.navigator@legalaid.bc.ca', 'North Vancouver, Richmond');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Jennifer', '236-788-5291', 'jennifer.navigator@legalaid.bc.ca', 'Vancouver, DCC');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Naomi', '604-364-5873', 'naomi.navigator@legalaid.bc.ca', 'VR3, Penticton');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Navneet', '236-808-8931', 'navneet.navigator@legalaid.bc.ca', 'Abbotsford, Chilliwack');
INSERT INTO labc_navigators (name, phone, email, courts) VALUES ('Shewaye', '236-788-9268', 'shewaye.navigator@legalaid.bc.ca', 'PoCo, New Westminster');

-- FORENSIC CLINICS (7 records)
TRUNCATE TABLE forensic_clinics RESTART IDENTITY CASCADE;
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Kamloops Forensic Regional Clinic', '5-1315 Summit Drive, Kamloops, BC V2C 5R9', '250-377-2660', 'KamloopsAdmitting@phsa.ca');
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Kelowna Forensic Regional Clinic', '#115-1835 Gordon Drive, Kelowna, BC V1Y 3H5', '778-940-2100', 'KelownaAdmitting@phsa.ca');
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Nanaimo Forensic Regional Clinic', '101-190 Wallace Street, Nanaimo, BC V9R 5B1', '250-739-5000', 'NanaimoAdmitting@phsa.ca');
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Prince George Forensic Regional Clinic', '2nd Floor, 1584 7th Avenue, Prince George, BC V2L 3P4', '250-561-8060', 'PrinceGeorgeAdmitting@phsa.ca');
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Surrey Forensic Regional Clinic', '10022 King George Boulevard, Surrey, BC V3T 2W4', '604-529-3300', 'SurreyAdmitting@phsa.ca');
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Vancouver Forensic Regional Clinic', '300-307 West Broadway, Vancouver, BC V5Y 1P9', '604-529-3350', 'VancouverAdmitting@phsa.ca');
INSERT INTO forensic_clinics (name, address, phone, email) VALUES ('Victoria Forensic Regional Clinic', '2840 Nanaimo Street, Victoria, BC V8T 4W9', '250-213-4500', 'VictoriaAdmitting@phsa.ca');

-- INDIGENOUS JUSTICE CENTRES (10 records)
TRUNCATE TABLE indigenous_justice_centres RESTART IDENTITY CASCADE;
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Chilliwack', '778-704-1355', 'chilliwackinfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Kelowna', '236-763-6881', 'kelownainfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Merritt', '236-575-3004', 'merrittinfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Nanaimo', '778-762-4061', 'nanaimoinfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Prince George', '250-645-5519', 'pginfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Prince Rupert', '778-622-3563', 'prinfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Surrey', '236-947-6777', 'surreyinfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Vancouver', '236-455-6565', 'vancouverinfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Victoria', '250-419-9665', 'victoriainfo@bcfnjc.com', NULL);
INSERT INTO indigenous_justice_centres (location, phone, email, website) VALUES ('Virtual', '1-866-786-0081', 'virtual@bcfnjc.com', NULL);

-- PROGRAMS (18 records)
TRUNCATE TABLE programs RESTART IDENTITY CASCADE;
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Talitha Koum', 'Coquitlam', '6044923393.0', 'All', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Glory House', 'Mission', '6043803665.0', '', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Lydia Home', 'Mission', '6042533323.0', '', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Hannah House', 'Maple Ridge', '8664664215.0', '', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Night & Day', 'Surrey', '7783174673.0', '', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Vision Quest Hart House', 'Surrey', '6049461841.0', '', FALSE, FALSE, 'Phone Call', 'Will take people with SA records');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Stepping Stone', 'Courtenay', '2508970360.0', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Amethyst', 'Campbell River', '2508702570.0', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('The Farm', 'Port Alberni', '', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Sancta Marie', 'Vancouver', '6047315550.0', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Turning Point (North Van)', 'North Van', '6049710111.0', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Turning Point (Van)', 'Vancouver', '6048751710.0', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Back On Track', 'Surrey', '7783162625.0', '', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Raven’s Moon', 'Abbotsford', '', '', FALSE, TRUE, 'Phone Call', 'Jeanette 6047514631
Tina 6043081767');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Ann Elmore House', 'Campbell River', '2502863666.0', '', FALSE, TRUE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('STAR Program', 'Pre-Treatment', '', '', FALSE, FALSE, 'Written', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Riceblock', 'Post Treatment', '6042532553.0', '', FALSE, FALSE, 'Phone Call', '');
INSERT INTO programs (name, location, phone, gender, indigenous_only, in_residence, application_by, notes) VALUES ('Phoenix', '', '', '', FALSE, FALSE, '', 'Will take people with SA records');

-- ACCESS CODES (18 records)
TRUNCATE TABLE access_codes RESTART IDENTITY CASCADE;
INSERT INTO access_codes (court, code, notes) VALUES ('Chilliwack', '512.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Court of Appeal', '', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Cranbrook', '', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Duncan', '', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Fort St. John', '2&4, 3', '2 & 4 together🤘then 3 🖕');
INSERT INTO access_codes (court, code, notes) VALUES ('Nanaimo', '3179#', '');
INSERT INTO access_codes (court, code, notes) VALUES ('North Vancouver', '2355.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Penticton', '', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Port Coquitlam (Library)', '1379.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Prince George (1st Floor)', '9588*', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Prince Rupert', '266266.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Richmond', '235#', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Robson Square', '35.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Sechelt', '36.0', 'BC Sport Fishing Reg paper on the window');
INSERT INTO access_codes (court, code, notes) VALUES ('Smithers', '', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Terrace (Library and Lounge)', '254.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Vancouver 222 Main', '235.0', '');
INSERT INTO access_codes (court, code, notes) VALUES ('Vancouver Supreme', '314.0', '');

-- CIRCUIT COURTS (48 records)
TRUNCATE TABLE circuit_courts RESTART IDENTITY CASCADE;
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('100 Mile House', '', 'Williams Lake');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Ahousaht', 'R1 - Island', 'Port Alberni');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Alexis Creek', '', 'Williams Lake');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Anahim Lake', '', 'Williams Lake');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Ashcroft', 'R4 - Interior', 'Kamloops');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Atlin', '', 'Fort St. John');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Bella Bella', '', 'Vancouver 222');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Bella Coola', '', 'Vancouver 222');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Castlegar', 'R4 - Interior', 'Nelson');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Chase', 'R4 - Interior', 'Kamloops');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Chetwynd', '', 'Dawson Creek');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Clearwater', 'R4 - Interior', 'Kamloops');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Creston', 'R4 - Interior', 'Cranbrook');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Daajing Giids/Queen Charlotte', '', 'Prince Rupert');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Dease Lake', '', 'Terrace');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Fernie', 'R4 - Interior', 'Cranbrook');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Fort St. James', '', 'Prince George');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Fraser Lake', '', 'Prince George');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Ganges', 'R1 - Island', 'Duncan');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Gold River', '', 'Campbell River');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Good Hope Lake', '', 'Fort St. John');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Grand Forks', '', 'Rossland');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Hazelton', '', 'Smithers');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Houston', '', 'Smithers');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Hudson''s Hope', '', 'Fort St. John');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Invermere', 'R4 - Interior', 'Cranbrook');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Kitimat', '', 'Terrace');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Klemtu', '', 'Vancouver 222');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Kwadacha/Fort Ware', '', 'Prince George');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Lillooet', 'R4 - Interior', 'Kamloops');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Lower Post', '', 'Fort St. John');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Masset', '', 'Prince Rupert');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('McBride', '', 'Valemount');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Merritt', 'R4 - Interior', 'Kamloops');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Nakusp', 'R4 - Interior', 'Nelson');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('New Aiyansh', '', 'Terrace');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Pemberton', '', 'North Vancouver');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Princeton', 'R4 - Interior', 'Penticton');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Revelstoke', 'R4 - Interior', 'Salmon Arm');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Sidney', 'R1 - Island', 'Victoria');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Sparwood', 'R4 - Interior', 'Cranbrook');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Stewart', '', 'Terrace');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Tahsis', 'R1 - Island', 'Campbell River');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Tofino', 'R1 - Island', 'Port Alberni');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Tsay Keh Dene (Ingenika)', '', 'Prince George');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Tumbler Ridge', '', 'Dawson Creek');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Ucluelet', 'R1 - Island', 'Port Alberni');
INSERT INTO circuit_courts (name, region, contact_hub) VALUES ('Vanderhoof', '', 'Prince George');

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_courts_name_trgm ON courts USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_police_cells_name_trgm ON police_cells USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_crown_offices_location_trgm ON crown_offices USING gin (location gin_trgm_ops);

-- ============================================
-- VERIFY IMPORT
-- ============================================

SELECT 'bail_offices' as table_name, COUNT(*) as records FROM bail_offices
UNION ALL SELECT 'federal_crown_contacts', COUNT(*) FROM federal_crown_contacts
UNION ALL SELECT 'evening_crown_contacts', COUNT(*) FROM evening_crown_contacts
UNION ALL SELECT 'crown_offices', COUNT(*) FROM crown_offices
UNION ALL SELECT 'sheriff_cells_access', COUNT(*) FROM sheriff_cells_access
UNION ALL SELECT 'registry_contacts', COUNT(*) FROM registry_contacts
UNION ALL SELECT 'justice_centre_links', COUNT(*) FROM justice_centre_links
UNION ALL SELECT 'vb_triage_links', COUNT(*) FROM vb_triage_links
UNION ALL SELECT 'courts', COUNT(*) FROM courts
UNION ALL SELECT 'police_cells', COUNT(*) FROM police_cells
UNION ALL SELECT 'correctional_facilities', COUNT(*) FROM correctional_facilities
UNION ALL SELECT 'bail_contacts', COUNT(*) FROM bail_contacts
UNION ALL SELECT 'bail_coordinators', COUNT(*) FROM bail_coordinators
UNION ALL SELECT 'crown_contacts', COUNT(*) FROM crown_contacts
UNION ALL SELECT 'labc_offices', COUNT(*) FROM labc_offices
UNION ALL SELECT 'labc_navigators', COUNT(*) FROM labc_navigators
UNION ALL SELECT 'forensic_clinics', COUNT(*) FROM forensic_clinics
UNION ALL SELECT 'indigenous_justice_centres', COUNT(*) FROM indigenous_justice_centres
UNION ALL SELECT 'programs', COUNT(*) FROM programs
UNION ALL SELECT 'access_codes', COUNT(*) FROM access_codes
UNION ALL SELECT 'circuit_courts', COUNT(*) FROM circuit_courts
ORDER BY table_name;
