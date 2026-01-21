-- UNIFIED CONTACT TYPES MIGRATION
-- Combines contact_roles with contact_type values from contacts table

-- Step 1: Add missing contact types to contact_roles
INSERT INTO contact_roles (name, description) VALUES
    ('Court Registry', 'General court registry contact'),
    ('Criminal Registry', 'Criminal registry contact'),
    ('Interpreter', 'Interpreter request contact'),
    ('Bail Crown', 'Virtual bail Crown counsel'),
    ('Bail JCM', 'Virtual bail JCM scheduling'),
    ('Transcripts', 'Transcript requests')
ON CONFLICT (name) DO NOTHING;

-- Step 2: Add contact_role_id column to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS contact_role_id INTEGER REFERENCES contact_roles(id);

-- Step 3: Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_contacts_role ON contacts(contact_role_id);

-- Step 4: Update contacts to use contact_role_id based on contact_type text
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Crown') WHERE contact_type = 'crown';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'JCM') WHERE contact_type = 'jcm_scheduling';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Scheduling') WHERE contact_type = 'supreme_scheduling';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Court Registry') WHERE contact_type = 'court_registry';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Criminal Registry') WHERE contact_type = 'criminal_registry';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Interpreter') WHERE contact_type = 'interpreter';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Bail Crown') WHERE contact_type = 'bail_crown';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Bail JCM') WHERE contact_type = 'bail_jcm';
UPDATE contacts SET contact_role_id = (SELECT id FROM contact_roles WHERE name = 'Transcripts') WHERE contact_type = 'transcripts';

-- Step 5: Verify all contacts have a role assigned
SELECT contact_type, COUNT(*) as count, 
       COUNT(contact_role_id) as has_role
FROM contacts 
GROUP BY contact_type;
