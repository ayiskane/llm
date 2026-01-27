-- Create JCM Fixed Date Schedules table
CREATE TABLE IF NOT EXISTS jcm_fxd_schedules (
  id SERIAL PRIMARY KEY,
  court_id INTEGER NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  days TEXT,                    -- e.g., "Monday, Thursday" or null for non-scheduled
  time TEXT,                    -- e.g., "1:30 PM" or null for non-scheduled
  email_acceptable BOOLEAN DEFAULT false,  -- has schedule + email option
  email_only BOOLEAN DEFAULT false,        -- email only, no appearances
  teams_only BOOLEAN DEFAULT false,        -- must appear via Teams
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(court_id)
);

-- Enable RLS
ALTER TABLE jcm_fxd_schedules ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow read access" ON jcm_fxd_schedules
  FOR SELECT USING (true);

-- Sample data:
-- Abbotsford (court_id = 3): Monday and Thursday 1:30 PM, email acceptable
INSERT INTO jcm_fxd_schedules (court_id, days, time, email_acceptable, email_only, teams_only)
VALUES (3, 'Monday, Thursday', '1:30 PM', true, false, false)
ON CONFLICT (court_id) DO UPDATE SET 
  days = EXCLUDED.days,
  time = EXCLUDED.time,
  email_acceptable = EXCLUDED.email_acceptable,
  email_only = EXCLUDED.email_only,
  teams_only = EXCLUDED.teams_only;

-- Chilliwack (court_id = 6): email only
INSERT INTO jcm_fxd_schedules (court_id, days, time, email_acceptable, email_only, teams_only, notes)
VALUES (6, NULL, NULL, false, true, false, 'All JCM FXD matters handled via email')
ON CONFLICT (court_id) DO UPDATE SET 
  days = EXCLUDED.days,
  time = EXCLUDED.time,
  email_acceptable = EXCLUDED.email_acceptable,
  email_only = EXCLUDED.email_only,
  teams_only = EXCLUDED.teams_only,
  notes = EXCLUDED.notes;
