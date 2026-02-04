-- Add teams_chat column to bail_contacts table
ALTER TABLE bail_contacts ADD COLUMN IF NOT EXISTS teams_chat TEXT;

-- Update sheriff coordinators with Teams chat usernames
-- Island (Victoria id=1, Nanaimo id=2) - both use Island.Sheriff
UPDATE bail_contacts 
SET teams_chat = 'Island.Sheriff@provincialcourt.bc.ca'
WHERE role_id = 22 AND bail_court_id IN (1, 2);

-- 222 Main Street (bail_court_id=3) and Downtown Community Court (bail_court_id=23)
UPDATE bail_contacts 
SET teams_chat = '222Main.Sheriff@virtualcourts.ca'
WHERE role_id = 22 AND bail_court_id IN (3, 23);

-- Vancouver Coastal regional (North Van id=4, Richmond id=5, Sechelt id=6)
UPDATE bail_contacts 
SET teams_chat = 'VancouverCoastal.Sheriff@virtualcourts.ca'
WHERE role_id = 22 AND bail_court_id IN (4, 5, 6);

-- Fraser region (Abbotsford id=7, Chilliwack id=8, New Westminster id=9, Port Coquitlam id=10)
UPDATE bail_contacts 
SET teams_chat = 'Fraser.Sheriff@virtualcourts.ca'
WHERE role_id = 22 AND bail_court_id IN (7, 8, 9, 10);

-- Surrey (bail_court_id=11)
UPDATE bail_contacts 
SET teams_chat = 'Surrey.Sheriff@virtualcourts.ca'
WHERE role_id = 22 AND bail_court_id = 11;

-- Verify updates
SELECT id, bail_court_id, email, teams_chat 
FROM bail_contacts 
WHERE role_id = 22 
ORDER BY bail_court_id;
