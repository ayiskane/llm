-- =============================================
-- CORRECTIONAL CENTRES SCHEMA
-- =============================================

-- Drop existing tables if they exist
DROP TABLE IF EXISTS corrections_constants CASCADE;
DROP TABLE IF EXISTS correctional_centres CASCADE;

-- Main correctional centres table
CREATE TABLE correctional_centres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,                    -- Full name (e.g., "Vancouver Island Regional Correctional Centre")
    short_name VARCHAR(20) NOT NULL,               -- Abbreviation (e.g., "VIRCC")
    location VARCHAR(100) NOT NULL,                -- City/Area (e.g., "Victoria")
    
    -- Classification
    is_federal BOOLEAN NOT NULL DEFAULT FALSE,     -- TRUE for CSC federal institutions
    centre_type VARCHAR(50),                       -- 'provincial', 'pretrial', 'women', 'federal'
    security_level VARCHAR(20),                    -- For federal: 'minimum', 'medium', 'maximum', 'multi'
    
    -- Contact Information
    general_phone VARCHAR(50),                     -- Main phone number
    general_phone_option VARCHAR(50),              -- Phone option to press (e.g., "option 8")
    general_fax VARCHAR(50),
    
    -- Counsel Designation Notice
    cdn_fax VARCHAR(50),                           -- Fax for CDN only
    accepts_cdn_by_fax BOOLEAN DEFAULT TRUE,
    
    -- Visit Requests
    visit_request_phone VARCHAR(50),
    visit_request_email VARCHAR(255),
    virtual_visit_email VARCHAR(255),
    lawyer_callback_email VARCHAR(255),
    
    -- Callback Windows (when inmates can call back)
    callback_window_1 VARCHAR(20),                 -- e.g., "1000-1035"
    callback_window_2 VARCHAR(20),                 -- e.g., "1730-1805"
    
    -- Visit Hours
    visit_hours_inperson VARCHAR(100),             -- e.g., "0650-21:30"
    visit_hours_virtual VARCHAR(100),              -- e.g., "0845-1115, 1315-1830"
    visit_notes TEXT,                              -- Special instructions
    
    -- eDisclosure Information
    disclosure_format VARCHAR(100),                -- e.g., "Hard drive", "USB", "Padlock Hard Drive"
    accepts_usb BOOLEAN DEFAULT FALSE,             -- USB permitted?
    accepts_hard_drive BOOLEAN DEFAULT TRUE,       -- External hard drive permitted?
    accepts_cd_dvd BOOLEAN DEFAULT TRUE,           -- CD/DVD permitted? (being phased out)
    disclosure_notes TEXT,                         -- Additional disclosure instructions
    
    -- Additional Info
    has_bc_gc_link BOOLEAN DEFAULT FALSE,          -- Has BC Government Corrections link
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cc_short_name ON correctional_centres(short_name);
CREATE INDEX idx_cc_location ON correctional_centres(location);
CREATE INDEX idx_cc_is_federal ON correctional_centres(is_federal);
CREATE INDEX idx_cc_centre_type ON correctional_centres(centre_type);

-- Full text search
CREATE INDEX idx_cc_search ON correctional_centres USING gin(
    to_tsvector('english', name || ' ' || short_name || ' ' || location || ' ' || COALESCE(centre_type, ''))
);

-- =============================================
-- INSERT PROVINCIAL CORRECTIONAL CENTRES
-- =============================================

INSERT INTO correctional_centres (
    name, short_name, location, is_federal, centre_type, security_level,
    general_phone, general_phone_option, general_fax, cdn_fax, accepts_cdn_by_fax,
    visit_request_phone, visit_request_email, virtual_visit_email, lawyer_callback_email,
    callback_window_1, callback_window_2,
    visit_hours_inperson, visit_hours_virtual, visit_notes,
    disclosure_format, accepts_usb, accepts_hard_drive, accepts_cd_dvd, disclosure_notes,
    has_bc_gc_link, notes
) VALUES
-- VIRCC - Vancouver Island Regional Correctional Centre
(
    'Vancouver Island Regional Correctional Centre', 'VIRCC', 'Victoria',
    FALSE, 'provincial', NULL,
    '250-953-4400', 'option 8', '250-953-4464', '250-953-4417', TRUE,
    '250-953-4433', NULL, NULL, NULL,
    '1000-1035', '1730-1805',
    '0650-21:30', 'Limited', NULL,
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended.',
    TRUE, NULL
),

-- NCC - Nanaimo Correctional Centre
(
    'Nanaimo Correctional Centre', 'NCC', 'Nanaimo',
    FALSE, 'provincial', NULL,
    '250-756-3300', 'ext. 3309', '250-729-7724', '250-756-3340', TRUE,
    '250-729-7721', NULL, NULL, NULL,
    '1035-1130', '1730-1805',
    '0800-2000', NULL, 'Visits only on weekends. Call 10am-12pm (Tue, Wed, Thu) to book.',
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended.',
    TRUE, NULL
),

-- OCC - Okanagan Correctional Centre
(
    'Okanagan Correctional Centre', 'OCC', 'Oliver',
    FALSE, 'provincial', NULL,
    '236-216-2000', 'option 3', '250-485-0875', '250-485-0725', TRUE,
    '236-216-2000', NULL, NULL, NULL,
    '1140-1340', '1645-1735',
    '0900-2000', NULL, 'Visit request: ext. 4',
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended.',
    TRUE, NULL
),

-- KRCC - Kamloops Regional Correctional Centre
(
    'Kamloops Regional Correctional Centre', 'KRCC', 'Kamloops',
    FALSE, 'provincial', NULL,
    '250-571-2200', 'option 5', '250-571-2205', '250-571-2222', TRUE,
    '250-571-2207', NULL, NULL, NULL,
    '1145-1330', '1800-1830',
    '1230-2100', '1230-2100', 'Virtual visits: Call 12:30-1:30pm or 6:45-7:45pm to book.',
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended.',
    TRUE, NULL
),

-- PGRCC - Prince George Regional Correctional Centre
(
    'Prince George Regional Correctional Centre', 'PGRCC', 'Prince George',
    FALSE, 'provincial', NULL,
    '250-960-3001', NULL, '250-960-3021', '250-960-3044', TRUE,
    '250-564-0465', NULL, 'pgrcc.virtualvisits@gov.bc.ca', NULL,
    '1300-1430', NULL,
    '0930-1900', '0930-1900', 'If general fax is down, use CDN line. Records for VB: 250-960-3009',
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended.',
    TRUE, NULL
),

-- SPSC - Surrey Pretrial Services Centre
(
    'Surrey Pretrial Services Centre', 'SPSC', 'Surrey',
    FALSE, 'pretrial', NULL,
    '604-599-4110', 'option 4', '604-572-2101', '604-572-2182', TRUE,
    '604-572-2165', 'SPSC.Visits@gov.bc.ca', 'SPSC.Visits@gov.bc.ca', 'legalaccessspsc@gov.bc.ca',
    '1200-1300', '1730-1800',
    '1300-1900', '0845-1115, 1315-1830', NULL,
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended. CD drives being phased out.',
    TRUE, NULL
),

-- NFPC - North Fraser Pretrial Centre
(
    'North Fraser Pretrial Centre', 'NFPC', 'Port Coquitlam',
    FALSE, 'pretrial', NULL,
    '604-468-3500', 'press 0', '604-468-3556', '604-468-3495', TRUE,
    '604-468-3566', NULL, NULL, NULL,
    '1120-1330', '1730-1810',
    '0830-2020', '1220-1330', 'Limited virtual availability',
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended. CD drives being phased out.',
    TRUE, NULL
),

-- FRCC - Fraser Regional Correctional Centre
(
    'Fraser Regional Correctional Centre', 'FRCC', 'Maple Ridge',
    FALSE, 'provincial', NULL,
    '604-462-9313', 'option 8', '604-462-5186', '604-462-5187', TRUE,
    '604-462-8865', NULL, 'FRCC.virtualvisits@gov.bc.ca', NULL,
    '1130-1330', '1700-1830',
    'Mon-Fri 1300-1500, 1600-1800', 'Limited', 'Call 1-2pm (Mon-Fri) for visit requests.',
    'Padlock Hard Drive', FALSE, TRUE, TRUE, 'USB not permitted. Padlock encrypted hard drives required. CD drives being phased out.',
    TRUE, NULL
),

-- ACCW - Alouette Correctional Centre for Women
(
    'Alouette Correctional Centre for Women', 'ACCW', 'Maple Ridge',
    FALSE, 'women', NULL,
    '604-476-2660', 'option 3', '604-476-2981', '604-476-2677', TRUE,
    '604-476-2688', 'ACCWAdmin@gov.bc.ca', NULL, NULL,
    '1200-1300', '1830-1900',
    '0945-1900 (varies daily)', 'Weekdays 0945-1145', 'Press 0 for reception, option 3 for message.',
    'Hard drive', FALSE, TRUE, TRUE, 'USB not permitted. Hard drives required. CD drives being phased out.',
    TRUE, NULL
),

-- FMCC / Ford Mountain / Xàws Schó:lha
(
    'Xàws Schó:lha Correctional Centre', 'FMCC', 'Chilliwack',
    FALSE, 'provincial', NULL,
    '604-824-5350', NULL, '604-824-5369', '604-824-5369', TRUE,
    '604-824-5373', NULL, NULL, NULL,
    NULL, NULL,
    'Mon-Fri 0700-1700', 'Mon-Fri 0700-1700', 'Previously known as Ford Mountain Correctional Centre',
    NULL, FALSE, TRUE, TRUE, 'USB not permitted. Password-protected hard drives recommended.',
    TRUE, 'Also known as FORD'
);

-- =============================================
-- INSERT FEDERAL INSTITUTIONS
-- =============================================

INSERT INTO correctional_centres (
    name, short_name, location, is_federal, centre_type, security_level,
    general_phone, general_phone_option, general_fax, cdn_fax, accepts_cdn_by_fax,
    visit_request_phone, visit_request_email, virtual_visit_email, lawyer_callback_email,
    callback_window_1, callback_window_2,
    visit_hours_inperson, visit_hours_virtual, visit_notes,
    disclosure_format, accepts_usb, accepts_hard_drive, accepts_cd_dvd, disclosure_notes,
    has_bc_gc_link, notes
) VALUES
-- Fraser Valley Institution (Women's Federal)
(
    'Fraser Valley Institution', 'FVI', 'Abbotsford',
    TRUE, 'federal', 'multi',
    '604-851-6000', NULL, '604-851-6039', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, 'Federal women''s institution',
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
),

-- Kent Institution
(
    'Kent Institution', 'KENT', 'Agassiz',
    TRUE, 'federal', 'maximum',
    '604-796-2121', NULL, '604-796-4500', NULL, TRUE,
    '604-796-9131', NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, 'Call 1:45-2:45pm for visit requests',
    'USB', TRUE, TRUE, TRUE, 'USB permitted for eDisclosure.',
    FALSE, NULL
),

-- Matsqui Institution
(
    'Matsqui Institution', 'MATSQUI', 'Abbotsford',
    TRUE, 'federal', 'medium',
    '604-859-4841', NULL, '604-850-8228', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
),

-- Mission Institution (Medium)
(
    'Mission Institution (Medium)', 'MISSION-MED', 'Mission',
    TRUE, 'federal', 'medium',
    '604-826-1231', NULL, '604-820-5801', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
),

-- Mission Institution (Minimum)
(
    'Mission Institution (Minimum)', 'MISSION-MIN', 'Mission',
    TRUE, 'federal', 'minimum',
    '604-820-5720', NULL, '604-820-5730', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
),

-- Mountain Institution
(
    'Mountain Institution', 'MOUNTAIN', 'Agassiz',
    TRUE, 'federal', 'medium',
    '604-796-2231', NULL, '604-796-1450', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, NULL,
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
),

-- Pacific Institution
(
    'Pacific Institution', 'PACIFIC', 'Abbotsford',
    TRUE, 'federal', 'maximum',
    '604-870-7700', NULL, '604-870-7746', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, 'Multi-level: Maximum and Medium security',
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
),

-- William Head Institution
(
    'William Head Institution', 'WILLIAM-HEAD', 'Victoria',
    TRUE, 'federal', 'minimum',
    '250-391-7000', NULL, '250-391-7005', NULL, FALSE,
    NULL, NULL, NULL, NULL,
    NULL, NULL,
    NULL, NULL, 'Located in Metchosin area',
    NULL, TRUE, TRUE, TRUE, 'Contact institution for specific disclosure requirements.',
    FALSE, NULL
);

-- =============================================
-- SYSTEM-WIDE CONSTANTS TABLE
-- =============================================

CREATE TABLE corrections_constants (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) NOT NULL UNIQUE,
    value VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO corrections_constants (key, value, description) VALUES
('corrections_caller_id', '844-369-7776', 'Caller ID shown when inmates call from correctional centres'),
('register_as_lawyer_phone', '236-478-0284', 'Call Cindy to register as lawyer for BC Corrections'),
('unknown_inmate_location_phone', '250-387-1605', 'Call to locate unknown inmate location (Mon-Fri 8AM-4PM)'),
('business_hours', '0800-1600', 'Normal business hours for correctional centres'),
('unlock_hours_weekday', '0700-0730', 'Approximate unlock time on weekdays'),
('unlock_hours_weekend', '1000', 'Approximate unlock time on weekends'),
('evening_lock', '2145-2200', 'Evening lock time nightly'),
('disclosure_general_provincial', 'External hard drives (password-protected), CD/DVD (being phased out). USB NOT permitted. Paper problematic.', 'General eDisclosure rules for provincial centres');

-- =============================================
-- VERIFY DATA
-- =============================================

SELECT 
    'Provincial' as type, 
    COUNT(*) as count 
FROM correctional_centres 
WHERE is_federal = FALSE
UNION ALL
SELECT 
    'Federal' as type, 
    COUNT(*) as count 
FROM correctional_centres 
WHERE is_federal = TRUE;

-- Show disclosure info
SELECT short_name, name, disclosure_format, accepts_usb, disclosure_notes
FROM correctional_centres
ORDER BY is_federal, short_name;
