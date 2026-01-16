-- =====================================================
-- BC COURTS - COMPREHENSIVE EMAIL CONTACT UPDATES
-- Source: Legal_Legends_Cheatsheet_v1.1.xlsx
-- Run this AFTER bc-courts-complete.sql
-- =====================================================

-- =====================================================
-- ACCESS CODES UPDATE
-- =====================================================

UPDATE courts SET access_code = '512' WHERE name ILIKE '%Chilliwack%';
UPDATE courts SET access_code = '2&4, 3', access_code_notes = '2 & 4 together then 3' WHERE name ILIKE '%Fort St. John%';
UPDATE courts SET access_code = '3179#' WHERE name ILIKE '%Nanaimo%';
UPDATE courts SET access_code = '2355' WHERE name ILIKE '%North Vancouver%';
UPDATE courts SET access_code = '1379' WHERE name ILIKE '%Port Coquitlam%';
UPDATE courts SET access_code = '9588*' WHERE name ILIKE '%Prince George%';
UPDATE courts SET access_code = '266266' WHERE name ILIKE '%Prince Rupert%';
UPDATE courts SET access_code = '235#' WHERE name ILIKE '%Richmond%';
UPDATE courts SET access_code = '35' WHERE name ILIKE '%Robson Square%';
UPDATE courts SET access_code = '36', access_code_notes = 'BC Sport Fishing Reg paper on the window' WHERE name ILIKE '%Sechelt%';
UPDATE courts SET access_code = '254' WHERE name ILIKE '%Terrace%';
UPDATE courts SET access_code = '235' WHERE name = 'Vancouver Provincial Court';
UPDATE courts SET access_code = '314' WHERE name = 'Vancouver Law Courts';

-- =====================================================
-- PROVINCIAL COURT CONTACTS
-- =====================================================

-- 100 Mile House
UPDATE courts SET provincial_contacts = '{
  "crown_email": "WilliamsLake.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Cariboo.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15231@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%100 Mile House%';

-- Abbotsford
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.Abbotsford.Reception@gov.bc.ca",
  "jcm_scheduling_email": "Abbotsford.CriminalScheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "AbbotsfordCriminalRegistry@gov.bc.ca",
  "bail_crown_email": "Abbotsford.VirtualBail@gov.bc.ca",
  "bail_jcm_email": "Abbotsford.VirtualHybridBail@provincialcourt.bc.ca",
  "interpreter_email": "Tina.Nguyen@gov.bc.ca, Sheila.Hedd@gov.bc.ca, Damaris.Stanciu@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Abbotsford%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ab@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Abbotsford%';

-- Burns Lake
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Smithers.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Smithers.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15219@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Burns Lake%';

-- Campbell River
UPDATE courts SET provincial_contacts = '{
  "crown_email": "CampbellRiver.CrownSchedule@gov.bc.ca",
  "jcm_scheduling_email": "CampbellRiver.Scheduling@provincialcourt.bc.ca",
  "registry_email": "CampbellRiverRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Campbell River%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_na@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Campbell River%';

-- Chilliwack
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.Chilliwack.Reception@gov.bc.ca",
  "jcm_scheduling_email": "Chilliwack.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "CSBChilliwackCriminalRegistry@gov.bc.ca",
  "bail_crown_email": "Chilliwack.VirtualBail@gov.bc.ca",
  "bail_jcm_email": "Abbotsford.VirtualHybridBail@provincialcourt.bc.ca"
}'::jsonb WHERE name ILIKE '%Chilliwack%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_cw@bccourts.ca",
  "fax_filing": "604-795-8397"
}'::jsonb WHERE name ILIKE '%Chilliwack%';

-- Western Communities (Colwood)
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Colwood.Crown@gov.bc.ca",
  "jcm_scheduling_email": "WestComm.CriminalScheduling@provincialcourt.bc.ca",
  "registry_email": "wccregistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Western Communities%';

-- Courtenay
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Courtenay.CrownSchedule@gov.bc.ca",
  "jcm_scheduling_email": "Courtenay.Scheduling@provincialcourt.bc.ca",
  "registry_email": "CourtenayRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Courtenay%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_na@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Courtenay%';

-- Cranbrook
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.CranbrookGen@gov.bc.ca",
  "jcm_scheduling_email": "EKootenays.Scheduling@provincialcourt.bc.ca",
  "registry_email": "cranbrookcourtregistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Cranbrook%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca",
  "fax_filing": "250-426-1498"
}'::jsonb WHERE name ILIKE '%Cranbrook%';

-- Dawson Creek
UPDATE courts SET provincial_contacts = '{
  "crown_email": "DawsonCreek.CrownCounsel@gov.bc.ca",
  "jcm_scheduling_email": "PeaceDistrict.CriminalScheduling@provincialcourt.bc.ca",
  "registry_email": "office15226@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Dawson Creek%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca",
  "fax_filing": "250-784-2218"
}'::jsonb WHERE name ILIKE '%Dawson Creek%';

-- Downtown Community Court
UPDATE courts SET provincial_contacts = '{
  "crown_email": "222MainCrownGeneral@gov.bc.ca",
  "jcm_scheduling_email": "Van.Scheduling@provincialcourt.bc.ca"
}'::jsonb WHERE name ILIKE '%Downtown Community Court%';

-- Duncan
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.Duncan.Reception@gov.bc.ca",
  "jcm_scheduling_email": "Dun.Scheduling@provincialcourt.bc.ca",
  "registry_email": "JAGCSBDuncanCourtScheduling@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Duncan%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_na@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Duncan%';

-- Fort Nelson
UPDATE courts SET provincial_contacts = '{
  "crown_email": "FortNelson.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Terrace.CriminalScheduling@provincialcourt.bc.ca",
  "registry_email": "Office15229@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Fort Nelson%';

-- Fort St. John
UPDATE courts SET provincial_contacts = '{
  "crown_email": "FtStJohn.Crown@gov.bc.ca",
  "jcm_scheduling_email": "PeaceDistrict.CriminalScheduling@provincialcourt.bc.ca",
  "registry_email": "Office15228@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Fort St. John%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Fort St. John%';

-- Golden
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.CranbrookGen@gov.bc.ca",
  "jcm_scheduling_email": "EKootenays.Scheduling@provincialcourt.bc.ca",
  "registry_email": "GoldenCourtRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Golden%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Golden%';

-- Kamloops
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.KamloopsGen@gov.bc.ca",
  "jcm_scheduling_email": "Kamloops.Scheduling@provincialcourt.bc.ca",
  "registry_email": "KamloopsCourtRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Kamloops%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca",
  "fax_filing": "250-828-4345"
}'::jsonb WHERE name ILIKE '%Kamloops%';

-- Kelowna
UPDATE courts SET provincial_contacts = '{
  "crown_email": "KelownaCrown@gov.bc.ca",
  "jcm_scheduling_email": "Kelowna.CriminalScheduling@provincialcourt.bc.ca",
  "registry_email": "KelownaCourtRegistry@gov.bc.ca",
  "criminal_registry_email": "CSB.KelownaCriminal@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Kelowna%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ok@bccourts.ca",
  "registry_email": "CSB.KelownaSupreme@gov.bc.ca",
  "fax_filing": "250-979-6768"
}'::jsonb WHERE name ILIKE '%Kelowna%';

-- Mackenzie
UPDATE courts SET provincial_contacts = '{
  "registry_email": "Office15216@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Mackenzie%';

-- Nanaimo
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Nanaimo.CrownSchedule@gov.bc.ca",
  "jcm_scheduling_email": "Nanaimo.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "crimreg.nanaimo@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Nanaimo%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_na@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Nanaimo%';

-- Nelson
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.NelsonGen@gov.bc.ca",
  "jcm_scheduling_email": "WKootenays.Scheduling@provincialcourt.bc.ca",
  "registry_email": "NelsonCourtRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Nelson%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca",
  "fax_filing": "250-354-6133"
}'::jsonb WHERE name ILIKE '%Nelson%';

-- New Westminster
UPDATE courts SET provincial_contacts = '{
  "crown_email": "NewWestminsterProvincial@gov.bc.ca",
  "jcm_scheduling_email": "NewWest.Scheduling@provincialcourt.bc.ca",
  "registry_email": "JAGCSBNWestminsterCourtScheduling@gov.bc.ca",
  "bail_crown_email": "NewWestProv.VirtualBail@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%New Westminster%';

UPDATE courts SET supreme_contacts = '{
  "crown_email": "CJB.NewWestRegionalCrown@gov.bc.ca",
  "scheduling_email": "sc.scheduling_nw@bccourts.ca"
}'::jsonb WHERE name ILIKE '%New Westminster%';

-- North Vancouver
UPDATE courts SET provincial_contacts = '{
  "crown_email": "NorthVanCrown@gov.bc.ca",
  "jcm_scheduling_email": "NVan.Scheduling@provincialcourt.bc.ca",
  "registry_email": "NorthVancouverRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%North Vancouver%';

-- Penticton
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.PentictonGen@gov.bc.ca",
  "jcm_scheduling_email": "Penticton.Scheduling@provincialcourt.bc.ca",
  "registry_email": "PentictonCourtRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Penticton%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ok@bccourts.ca",
  "fax_filing": "250-492-1290"
}'::jsonb WHERE name ILIKE '%Penticton%';

-- Port Alberni
UPDATE courts SET provincial_contacts = '{
  "crown_email": "PtAlberni.CrownSchedule@gov.bc.ca",
  "jcm_scheduling_email": "PortAlberni.Scheduling@provincialcourt.bc.ca",
  "registry_email": "PortAlberniRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Port Alberni%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_na@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Port Alberni%';

-- Port Coquitlam
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Poco.Crown@gov.bc.ca",
  "jcm_scheduling_email": "PoCo.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "csb.portcoquitlamprovcriminal@gov.bc.ca",
  "bail_crown_email": "Poco.VirtualBail@gov.bc.ca",
  "bail_jcm_email": "Poco.VirtualHybridBail@provincialcourt.bc.ca"
}'::jsonb WHERE name ILIKE '%Port Coquitlam%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pc@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Port Coquitlam%';

-- Port Hardy
UPDATE courts SET provincial_contacts = '{
  "crown_email": "PortHardy.CrownSchedule@gov.bc.ca",
  "jcm_scheduling_email": "PortHardy.Scheduling@provincialcourt.bc.ca",
  "registry_email": "porthardycourtregistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Port Hardy%';

-- Powell River
UPDATE courts SET provincial_contacts = '{
  "crown_email": "PowellRiver.CrownSchedule@gov.bc.ca",
  "jcm_scheduling_email": "PowellRiver.Scheduling@provincialcourt.bc.ca",
  "registry_email": "powellriverregistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Powell River%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_na@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Powell River%';

-- Prince George
UPDATE courts SET provincial_contacts = '{
  "crown_email": "PrGeorge.crown@gov.bc.ca",
  "jcm_scheduling_email": "PG.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "csbpg.criminalregistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Prince George%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca",
  "fax_filing": "250-614-7923"
}'::jsonb WHERE name ILIKE '%Prince George%';

-- Prince Rupert
UPDATE courts SET provincial_contacts = '{
  "crown_email": "PrinceRupert.Crown@gov.bc.ca",
  "jcm_scheduling_email": "PrinceRupert.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15220@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Prince Rupert%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Prince Rupert%';

-- Quesnel
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Quesnel.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Cariboo.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15230@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Quesnel%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Quesnel%';

-- Revelstoke
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.SalmonArmGen@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Revelstoke%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca"
}'::jsonb WHERE name ILIKE '%Revelstoke%';

-- Richmond
UPDATE courts SET provincial_contacts = '{
  "crown_email": "RichmondCrown@gov.bc.ca",
  "jcm_scheduling_email": "Richmond.Scheduling@provincialcourt.bc.ca",
  "registry_email": "RichmondCourtRegistry@gov.bc.ca",
  "interpreter_email": "AGCSBRichmondInterpreters@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Richmond%';

-- Rossland
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.NelsonGen@gov.bc.ca",
  "jcm_scheduling_email": "WKootenays.Scheduling@provincialcourt.bc.ca",
  "registry_email": "VCRosslandCrt@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Rossland%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca",
  "fax_filing": "250-362-7321"
}'::jsonb WHERE name ILIKE '%Rossland%';

-- Salmon Arm
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.SalmonArmGen@gov.bc.ca",
  "jcm_scheduling_email": "SalmonArm.Scheduling@provincialcourt.bc.ca",
  "registry_email": "SalmonArmRegistry@gov.bc.ca",
  "criminal_registry_email": "JAGCSBSalmonArmScheduling@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Salmon Arm%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ka@bccourts.ca",
  "fax_filing": "250-833-7401"
}'::jsonb WHERE name ILIKE '%Salmon Arm%';

-- Sechelt
UPDATE courts SET provincial_contacts = '{
  "crown_email": "SecheltCrown@gov.bc.ca",
  "jcm_scheduling_email": "NVan.Scheduling@provincialcourt.bc.ca",
  "registry_email": "SecheltRegistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Sechelt%';

-- Smithers
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Smithers.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Smithers.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15224@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Smithers%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca",
  "fax_filing": "250-847-7344"
}'::jsonb WHERE name ILIKE '%Smithers%';

-- Surrey
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Surrey.Intake@gov.bc.ca",
  "jcm_scheduling_email": "Surrey.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "CSBSurreyProvincialCourt.CriminalRegistry@gov.bc.ca",
  "bail_crown_email": "Surrey.VirtualBail@gov.bc.ca",
  "bail_jcm_email": "Surrey.CriminalScheduling@provincialcourt.bc.ca",
  "interpreter_email": "CSBSurreyProvincialCourt.AccountingandInterpreters@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Surrey%';

-- Terrace
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Terrace.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Terrace.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15222@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Terrace%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca",
  "fax_filing": "250-638-2143"
}'::jsonb WHERE name ILIKE '%Terrace%';

-- Valemount
UPDATE courts SET provincial_contacts = '{
  "crown_email": "PrGeorge.crown@gov.bc.ca",
  "jcm_scheduling_email": "PG.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15215@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Valemount%';

-- Vancouver Provincial Court (222 Main)
UPDATE courts SET provincial_contacts = '{
  "crown_email": "222MainCrownGeneral@gov.bc.ca",
  "jcm_scheduling_email": "Van.Scheduling@provincialcourt.bc.ca",
  "registry_email": "222MainCS@gov.bc.ca",
  "transcripts_email": "222MainTranscripts@gov.bc.ca",
  "interpreter_email": "CSB222.InterpreterRequests@gov.bc.ca"
}'::jsonb WHERE name = 'Vancouver Provincial Court';

-- Vancouver Law Courts (Supreme)
UPDATE courts SET supreme_contacts = '{
  "crown_email": "VancouverRegionalCrown@gov.bc.ca",
  "scheduling_email": "sc.criminal_va@bccourts.ca",
  "registry_email": "VancouverLawCourtsRegistry@gov.bc.ca",
  "criminal_registry_email": "Vlc.criminal@gov.bc.ca"
}'::jsonb WHERE name = 'Vancouver Law Courts';

-- Robson Square (Youth)
UPDATE courts SET provincial_contacts = '{
  "crown_email": "VancouverYouthCrown@gov.bc.ca",
  "jcm_scheduling_email": "Robson.Scheduling@provincialcourt.bc.ca",
  "registry_email": "CSBRCS@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Robson Square%';

-- Vanderhoof
UPDATE courts SET provincial_contacts = '{
  "crown_email": "Vanderhoof.Crown@gov.bc.ca",
  "jcm_scheduling_email": "PG.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "csbpg.criminalregistry@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Vanderhoof%';

-- Vernon
UPDATE courts SET provincial_contacts = '{
  "crown_email": "BCPS.VernonGen@gov.bc.ca",
  "jcm_scheduling_email": "Vernon.Scheduling@provincialcourt.bc.ca",
  "registry_email": "VernonRegistry@gov.bc.ca",
  "criminal_registry_email": "JAGCSBVernonScheduling@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Vernon%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_ok@bccourts.ca",
  "fax_filing": "250-549-5461"
}'::jsonb WHERE name ILIKE '%Vernon%';

-- Victoria
UPDATE courts SET provincial_contacts = '{
  "crown_email": "VictoriaCrown.Public@gov.bc.ca",
  "jcm_scheduling_email": "Vic.Scheduling@provincialcourt.bc.ca",
  "criminal_registry_email": "vicprovincialreg@gov.bc.ca",
  "interpreter_email": "victoria.finance@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Victoria Law Courts%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_vi@bccourts.ca",
  "criminal_registry_email": "vicsupremereg@gov.bc.ca",
  "interpreter_email": "victoria.finance@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Victoria Law Courts%';

-- Williams Lake
UPDATE courts SET provincial_contacts = '{
  "crown_email": "WilliamsLake.Crown@gov.bc.ca",
  "jcm_scheduling_email": "Cariboo.Scheduling@provincialcourt.bc.ca",
  "registry_email": "Office15231@gov.bc.ca"
}'::jsonb WHERE name ILIKE '%Williams Lake%';

UPDATE courts SET supreme_contacts = '{
  "scheduling_email": "sc.scheduling_pg@bccourts.ca",
  "fax_filing": "250-398-4264"
}'::jsonb WHERE name ILIKE '%Williams Lake%';

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Count courts with contacts
SELECT 
  COUNT(*) as total_courts,
  SUM(CASE WHEN provincial_contacts IS NOT NULL THEN 1 ELSE 0 END) as with_provincial_contacts,
  SUM(CASE WHEN supreme_contacts IS NOT NULL THEN 1 ELSE 0 END) as with_supreme_contacts,
  SUM(CASE WHEN access_code IS NOT NULL THEN 1 ELSE 0 END) as with_access_codes
FROM courts;
