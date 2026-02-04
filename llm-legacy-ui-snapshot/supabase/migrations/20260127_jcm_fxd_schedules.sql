-- JCM Fixed Date Schedules - Links courts to their JCM FXD Teams link
-- If teams_link_id is set → Teams-based (may also accept email)
-- If teams_link_id is NULL → Email only
-- If days/time set → Has scheduled appearances
-- If days/time NULL + teams_link_id NULL → Email only, no schedule

CREATE TABLE IF NOT EXISTS jcm_fxd_schedules (
  id SERIAL PRIMARY KEY,
  court_id INTEGER NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
  teams_link_id INTEGER REFERENCES teams_links(id) ON DELETE SET NULL,
  days TEXT,                    -- e.g., "Monday, Thursday"
  time TEXT,                    -- e.g., "1:30 PM"
  email_acceptable BOOLEAN DEFAULT true,  -- can submit via email (most courts allow this)
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

-- Logic:
-- teams_link_id NOT NULL + days/time SET = Teams appearances on schedule, email may be acceptable
-- teams_link_id NOT NULL + days/time NULL = Teams only (anytime)
-- teams_link_id NULL + email_acceptable = Email only
