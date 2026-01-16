-- =====================================================
-- BC COURTS - COMPLETE DATA (90 Courts)
-- 43 Staffed Courthouses + 47 Circuit Courts
-- Source: https://www2.gov.bc.ca/gov/content/justice/courthouse-services/courthouse-locations
-- =====================================================

-- Clear existing data
DELETE FROM courts;

-- =====================================================
-- STAFFED COURTHOUSES (43)
-- =====================================================

-- ABBOTSFORD
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts, supreme_contacts) VALUES (
  'Abbotsford Law Courts',
  'Abbotsford',
  'Fraser',
  '32375 Veterans Way, Abbotsford, B.C. V2T 0K1',
  '604-855-3200',
  '604-855-3232',
  '604-855-3222',
  true,
  true,
  false,
  '{"crown_email": "BCPS.Abbotsford.Reception@gov.bc.ca", "jcm_scheduling_email": "Abbotsford.Scheduling@provincialcourt.bc.ca", "criminal_registry_email": "abbotsfordcriminalregistry@gov.bc.ca", "family_registry_email": "csbabbotsford.courtscheduling@gov.bc.ca", "small_claims_email": "CSBABBSC@gov.bc.ca", "traffic_email": "csbabbtr@gov.bc.ca"}',
  '{"registry_email": "ag.csb.abbotsford.supreme.court@gov.bc.ca"}'
);

-- BURNS LAKE
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Burns Lake Provincial Court',
  'Burns Lake',
  'North',
  'PO Box 251, 508 Yellowhead Hwy, Burns Lake, B.C. V0J 1E0',
  '250-692-7711',
  '250-692-7150',
  true,
  false,
  false,
  '{"registry_email": "Office15219@gov.bc.ca"}'
);

-- CAMPBELL RIVER
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Campbell River Law Courts',
  'Campbell River',
  'Vancouver Island',
  '500 - 13th Avenue, Campbell River, B.C. V9W 6P1',
  '250-286-7510',
  '250-286-7512',
  '250-286-7518',
  true,
  true,
  false,
  '{"registry_email": "CampbellRiverRegistry@gov.bc.ca"}'
);

-- CHILLIWACK
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Chilliwack Law Courts',
  'Chilliwack',
  'Fraser',
  '46085 Yale Road, Chilliwack, B.C. V2P 2L8',
  '604-795-8350',
  '604-795-8345',
  '604-795-8207',
  '512',
  true,
  true,
  false,
  '{"crown_email": "BCPS.Chilliwack.Reception@gov.bc.ca", "jcm_scheduling_email": "Chilliwack.Scheduling@provincialcourt.bc.ca", "criminal_registry_email": "CSBChilliwackCriminalRegistry@gov.bc.ca", "family_registry_email": "csbchilliwackprovincialcourt.familyregistry@gov.bc.ca", "small_claims_email": "CSBChilliwackProvincialCourt.SmallClaimsRegistry@gov.bc.ca", "bail_crown_email": "Chilliwack.VirtualBail@gov.bc.ca"}'
);

-- COURTENAY
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Courtenay Law Courts',
  'Courtenay',
  'Vancouver Island',
  'Rm. 100, 420 Cumberland Road, Courtenay, B.C. V9N 2C4',
  '250-334-1115',
  '250-334-1191',
  '250-334-1135',
  true,
  true,
  false,
  '{"registry_email": "CourtenayRegistry@gov.bc.ca"}'
);

-- CRANBROOK
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts, notes) VALUES (
  'Cranbrook Law Courts',
  'Cranbrook',
  'Interior',
  'Rm. 147, 102 - 11 Avenue South, Cranbrook, B.C. V1C 2P3',
  '250-426-1234',
  '250-426-1352',
  '250-426-1212',
  true,
  true,
  false,
  '{"registry_email": "cranbrookcourtregistry@gov.bc.ca"}',
  'Cranbrook observes Mountain Time (1 hour ahead of Pacific)'
);

-- DAWSON CREEK
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Dawson Creek Law Courts',
  'Dawson Creek',
  'North',
  '1201 - 103 Avenue, Dawson Creek, B.C. V1G 4J2',
  '250-784-2278',
  '250-784-2339',
  '250-784-2266',
  true,
  true,
  false,
  '{"registry_email": "office15226@gov.bc.ca"}'
);

-- DOWNTOWN COMMUNITY COURT (Vancouver)
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, notes) VALUES (
  'Downtown Community Court',
  'Vancouver',
  'Vancouver Coastal',
  '211 Gore Avenue, Vancouver, B.C. V6A 0B6',
  '604-660-8754',
  '604-660-9714',
  true,
  false,
  false,
  'Specialized court focusing on offenders with mental health and addiction issues'
);

-- DUNCAN
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Duncan Law Courts',
  'Duncan',
  'Vancouver Island',
  '238 Government Street, Duncan, B.C. V9L 1A5',
  '250-746-1258',
  '250-746-1244',
  '250-746-1233',
  true,
  true,
  false,
  '{"registry_email": "JAGCSBDuncanCourtScheduling@gov.bc.ca"}'
);

-- FORT NELSON
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, provincial_contacts, notes) VALUES (
  'Fort Nelson Law Courts',
  'Fort Nelson',
  'North',
  'Bag 1000, 5431 Airport Drive, Fort Nelson, B.C. V0C 1R0',
  '250-774-5999',
  '250-774-6904',
  true,
  false,
  false,
  '{"registry_email": "Office15229@gov.bc.ca"}',
  'Supreme Court filing available'
);

-- FORT ST. JOHN
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, access_code_notes, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Fort St. John Law Courts',
  'Fort St. John',
  'North',
  '10600 - 100 Street, Fort St. John, B.C. V1J 4L6',
  '250-787-3231',
  '250-787-3518',
  '250-787-3272',
  '2&4, 3',
  '2 & 4 together then 3',
  true,
  true,
  false,
  '{"registry_email": "Office15228@gov.bc.ca"}'
);

-- GOLDEN
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, provincial_contacts, notes) VALUES (
  'Golden Law Courts',
  'Golden',
  'Interior',
  'Temporary: 1104 9th St. South, Golden, B.C. Mailing: Box 1500, 837 Park Drive, Golden, B.C. V0A 1H0',
  '250-344-7581',
  '250-344-7715',
  true,
  true,
  false,
  '{"registry_email": "GoldenCourtRegistry@gov.bc.ca"}',
  'Golden observes Mountain Time (1 hour ahead of Pacific)'
);

-- KAMLOOPS
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Kamloops Law Courts',
  'Kamloops',
  'Interior',
  'Rm. 223, 455 Columbia Street, Kamloops, B.C. V2C 6K4',
  '250-828-4344',
  '250-828-4332',
  '250-828-4328',
  true,
  true,
  false,
  '{"registry_email": "KamloopsCourtRegistry@gov.bc.ca"}'
);

-- KELOWNA
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Kelowna Law Courts',
  'Kelowna',
  'Interior',
  '1 - 1355 Water Street, Kelowna, B.C. V1Y 9R3',
  '250-470-6900',
  '250-470-6939',
  '250-470-6846',
  true,
  true,
  false,
  '{"registry_email": "KelownaCourtRegistry@gov.bc.ca", "criminal_registry_email": "CSB.KelownaCriminal@gov.bc.ca", "family_registry_email": "CSBKelowna.familydesk@gov.bc.ca", "small_claims_email": "CSB.KelownaSmallClaims@gov.bc.ca", "traffic_email": "Kelowna.Trafficcourt@gov.bc.ca"}'
);

-- MACKENZIE
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Mackenzie Provincial Court',
  'Mackenzie',
  'North',
  'Box 2050, 64 Centennial Drive, Mackenzie, B.C. V0J 2C0',
  '250-997-3377',
  '250-997-5617',
  true,
  false,
  false,
  '{"registry_email": "Office15216@gov.bc.ca"}'
);

-- NANAIMO
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Nanaimo Law Courts',
  'Nanaimo',
  'Vancouver Island',
  '35 Front Street, Nanaimo, B.C. V9R 5J1',
  '250-716-5918',
  '250-716-5911',
  '250-716-5926',
  '3179#',
  true,
  true,
  false,
  '{"registry_email": "Nanaimo.Registry@gov.bc.ca", "criminal_registry_email": "crimreg.nanaimo@gov.bc.ca"}'
);

-- NELSON
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Nelson Law Courts',
  'Nelson',
  'Interior',
  '320 Ward Street, Nelson, B.C. V1L 1S6',
  '250-354-6165',
  '250-354-6539',
  '250-354-6155',
  true,
  true,
  false,
  '{"registry_email": "NelsonCourtRegistry@gov.bc.ca"}'
);

-- NEW WESTMINSTER
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'New Westminster Law Courts',
  'New Westminster',
  'Fraser',
  'Law Courts, Begbie Square, 651 Carnarvon Street, New Westminster, B.C. V3M 1C9',
  '604-660-8522',
  '604-660-8512',
  '604-660-8538',
  true,
  true,
  false,
  '{"registry_email": "JAGCSBNWestminsterCourtScheduling@gov.bc.ca"}'
);

-- NORTH VANCOUVER
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'North Vancouver Provincial Court',
  'North Vancouver',
  'Vancouver Coastal',
  '200 East 23rd Street, North Vancouver, B.C. V7L 4R4',
  '604-981-0200',
  '604-981-0234',
  '604-981-0232',
  '2355',
  true,
  false,
  false,
  '{"registry_email": "NorthVancouverRegistry@gov.bc.ca"}'
);

-- PENTICTON
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Penticton Law Courts',
  'Penticton',
  'Interior',
  '100 Main Street, Penticton, B.C. V2A 5A5',
  '250-492-1231',
  '250-492-1378',
  '250-492-1234',
  true,
  true,
  false,
  '{"registry_email": "PentictonCourtRegistry@gov.bc.ca"}'
);

-- PORT ALBERNI
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Port Alberni Law Courts',
  'Port Alberni',
  'Vancouver Island',
  '2999 - 4th Avenue, Port Alberni, B.C. V9Y 8A5',
  '250-720-2424',
  '250-720-2419',
  '250-720-2415',
  true,
  true,
  false,
  '{"registry_email": "PortAlberniRegistry@gov.bc.ca"}'
);

-- PORT COQUITLAM
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Port Coquitlam Law Courts',
  'Port Coquitlam',
  'Fraser',
  'Unit A, 2620 Mary Hill Road, Port Coquitlam, B.C. V3C 3B2',
  '604-927-2100',
  '604-927-2222',
  '604-927-2120',
  '1379',
  true,
  true,
  false,
  '{"family_registry_email": "CSBPortCoquitlam.CourtScheduling@gov.bc.ca", "small_claims_email": "CSBPortCoquitlamProvincialCourtsmallclaims@gov.bc.ca", "criminal_registry_email": "csb.portcoquitlamprovcriminal@gov.bc.ca"}'
);

-- PORT HARDY
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Port Hardy Law Courts',
  'Port Hardy',
  'Vancouver Island',
  'Box 279, 9300 Trustee Road, Port Hardy, B.C. V0N 2P0',
  '250-949-6122',
  '250-949-9283',
  true,
  false,
  false,
  '{"registry_email": "porthardycourtregistry@gov.bc.ca"}'
);

-- POWELL RIVER
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Powell River Law Courts',
  'Powell River',
  'Vancouver Coastal',
  'Rm. 103, 6953 Alberni Street, Powell River, B.C. V8A 2B8',
  '604-485-3630',
  '604-485-3637',
  '604-485-3641',
  true,
  true,
  false,
  '{"registry_email": "powellriverregistry@gov.bc.ca"}'
);

-- PRINCE GEORGE
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Prince George Law Courts',
  'Prince George',
  'North',
  'J.O. Wilson Square, 250 George Street, Prince George, B.C. V2L 5S2',
  '250-614-2700',
  '250-614-2717',
  '250-614-2741',
  '9588*',
  true,
  true,
  false,
  '{"civil_registry_email": "Office15214@gov.bc.ca", "criminal_registry_email": "csbpg.criminalregistry@gov.bc.ca"}'
);

-- PRINCE RUPERT
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Prince Rupert Law Courts',
  'Prince Rupert',
  'North',
  '100 Market Place, Prince Rupert, B.C. V8J 1B8',
  '250-624-7525',
  '250-624-7538',
  '250-624-7528',
  '266266',
  true,
  true,
  false,
  '{"registry_email": "Office15220@gov.bc.ca"}'
);

-- QUESNEL
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Quesnel Law Courts',
  'Quesnel',
  'North',
  '350 Barlow Avenue, Quesnel, B.C. V2J 2C2',
  '250-992-4256',
  '250-992-4171',
  '250-992-4236',
  true,
  true,
  false,
  '{"registry_email": "Office15230@gov.bc.ca"}'
);

-- RICHMOND
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Richmond Provincial Court',
  'Richmond',
  'Vancouver Coastal',
  '7577 Elmbridge Way, Richmond, B.C. V6X 4J2',
  '604-660-6900',
  '604-660-1797',
  '604-660-3467',
  '235#',
  true,
  false,
  false,
  '{"registry_email": "RichmondCourtRegistry@gov.bc.ca"}'
);

-- ROBSON SQUARE (Vancouver)
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts, notes) VALUES (
  'Robson Square Provincial Court',
  'Vancouver',
  'Vancouver Coastal',
  'Box 21, 800 Hornby Street, Vancouver, B.C. V6Z 2C5',
  '604-660-8989',
  '604-660-8950',
  '604-660-7810',
  '35',
  true,
  false,
  false,
  '{"registry_email": "CSBRCS@gov.bc.ca"}',
  'Provincial small claims, family, youth courts & traffic'
);

-- ROSSLAND
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Rossland Law Courts',
  'Rossland',
  'Interior',
  'Box 639, 2288 Columbia Avenue, Rossland, B.C. V0G 1Y0',
  '250-362-7368',
  '250-362-9632',
  '250-362-7368',
  true,
  true,
  false,
  '{"registry_email": "VCRosslandCrt@gov.bc.ca"}'
);

-- SALMON ARM
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Salmon Arm Law Courts',
  'Salmon Arm',
  'Interior',
  'PO Box 100 Station Main, #550 - 2nd Avenue NE, Salmon Arm, B.C. V1E 4S4',
  '250-832-1610',
  '250-832-1749',
  '250-832-1615',
  true,
  true,
  false,
  '{"registry_email": "SalmonArmRegistry@gov.bc.ca"}'
);

-- SECHELT
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, access_code_notes, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Sechelt Provincial Court',
  'Sechelt',
  'Vancouver Coastal',
  'Box 160, 5480 Shorncliffe Avenue, Sechelt, B.C. V0N 3A0',
  '604-740-8929',
  '604-740-8924',
  '604-740-8933',
  '36',
  'BC Sport Fishing Reg paper on the window',
  true,
  false,
  false,
  '{"registry_email": "SecheltRegistry@gov.bc.ca"}'
);

-- SMITHERS
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Smithers Law Courts',
  'Smithers',
  'North',
  '#40 Bag 5000, 3793 Alfred Street, Smithers, B.C. V0J 2N0',
  '250-847-7376',
  '250-847-7710',
  '250-847-7372',
  true,
  true,
  false,
  '{"registry_email": "Office15224@gov.bc.ca"}'
);

-- SURREY
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Surrey Provincial Court',
  'Surrey',
  'Fraser',
  '14340 - 57 Avenue, Surrey, B.C. V3X 1B2',
  '604-572-2200',
  '604-572-2280',
  '604-572-2242',
  true,
  false,
  false,
  '{"family_registry_email": "CSBSurreyProvincialCourt.FamilyRegistry@gov.bc.ca", "small_claims_email": "CSBSurreyProvincialCourt.SmallClaimsRegistry@gov.bc.ca", "criminal_registry_email": "CSBSurreyProvincialCourt.CriminalRegistry@gov.bc.ca", "traffic_email": "CSBSurreyProvincialCourt.Traffic@gov.bc.ca"}'
);

-- TERRACE
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Terrace Law Courts',
  'Terrace',
  'North',
  '3408 Kalum Street, Terrace, B.C. V8G 2N6',
  '250-638-2111',
  '250-638-2123',
  '250-638-2121',
  '254',
  true,
  true,
  false,
  '{"registry_email": "Office15222@gov.bc.ca"}'
);

-- VALEMOUNT
INSERT INTO courts (name, city, region, address, phone, fax, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Valemount Provincial Court',
  'Valemount',
  'North',
  '1300 - 4th Avenue, P.O Box 125, Valemount, B.C. V0E 2Z0',
  '250-566-4652',
  '250-566-4620',
  true,
  false,
  false,
  '{"registry_email": "Office15215@gov.bc.ca"}'
);

-- VANCOUVER LAW COURTS (Supreme)
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, supreme_contacts) VALUES (
  'Vancouver Law Courts',
  'Vancouver',
  'Vancouver Coastal',
  'Law Courts, 800 Smithe Street, Vancouver, B.C. V6Z 2E1',
  '604-660-2847',
  '604-660-2420',
  '604-660-2601',
  '235',
  false,
  true,
  false,
  '{"registry_email": "VancouverLawCourtsRegistry@gov.bc.ca"}'
);

-- VANCOUVER PROVINCIAL (222 Main)
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, access_code, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Vancouver Provincial Court',
  'Vancouver',
  'Vancouver Coastal',
  '222 Main Street, Vancouver, B.C. V6A 2S8',
  '604-660-4200',
  '604-775-1134',
  '604-660-4200',
  '314',
  true,
  false,
  false,
  '{"registry_email": "222MainCS@gov.bc.ca", "transcripts_email": "222MainTranscripts@gov.bc.ca"}'
);

-- VERNON
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Vernon Law Courts',
  'Vernon',
  'Interior',
  '3001 - 27 Street, Vernon, B.C. V1T 4W5',
  '250-549-5422',
  '250-549-5621',
  '250-549-5410',
  true,
  true,
  false,
  '{"registry_email": "VernonRegistry@gov.bc.ca"}'
);

-- VICTORIA
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts, supreme_contacts) VALUES (
  'Victoria Law Courts',
  'Victoria',
  'Vancouver Island',
  '850 Burdett Avenue, Victoria, B.C. V8W 9J2',
  '250-356-1478',
  '250-387-3061',
  '250-387-6811',
  true,
  true,
  false,
  '{"criminal_registry_email": "vicprovincialreg@gov.bc.ca", "family_registry_email": "csbvictoria.registryfamilydesk@gov.bc.ca"}',
  '{"criminal_registry_email": "vicsupremereg@gov.bc.ca", "civil_registry_email": "victoria.civilregistry@gov.bc.ca", "scheduling_email": "victoria.courtscheduling@gov.bc.ca"}'
);

-- WESTERN COMMUNITIES
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Western Communities Provincial Court',
  'Victoria',
  'Vancouver Island',
  '1756 Island Hwy, P.O. Box 9269, Victoria, B.C. V8W 9J5',
  '250-391-2888',
  '250-391-2877',
  '250-391-2873',
  true,
  false,
  false,
  '{"registry_email": "wccregistry@gov.bc.ca"}'
);

-- WILLIAMS LAKE
INSERT INTO courts (name, city, region, address, phone, fax, sheriff_phone, has_provincial, has_supreme, is_circuit, provincial_contacts) VALUES (
  'Williams Lake Law Courts',
  'Williams Lake',
  'North',
  '540 Borland Street, Williams Lake, B.C. V2G 1R8',
  '250-398-4301',
  '250-398-4459',
  '250-398-4292',
  true,
  true,
  false,
  '{"registry_email": "Office15231@gov.bc.ca"}'
);

-- =====================================================
-- CIRCUIT COURTS (47)
-- =====================================================

-- 100 Mile House
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('100 Mile House Law Courts', '100 Mile House', 'North', true, false, true, 'Williams Lake Law Courts');

-- Ahousaht
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Ahousaht Provincial Court', 'Ahousaht', 'Vancouver Island', true, false, true, 'Port Alberni Law Courts');

-- Alexis Creek
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Alexis Creek Provincial Court', 'Alexis Creek', 'North', true, false, true, 'Williams Lake Law Courts');

-- Anahim Lake
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Anahim Lake Provincial Court', 'Anahim Lake', 'North', true, false, true, 'Williams Lake Law Courts');

-- Ashcroft
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Ashcroft Provincial Court', 'Ashcroft', 'Interior', true, false, true, 'Kamloops Law Courts');

-- Atlin
INSERT INTO courts (name, city, region, address, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Atlin Provincial Court', 'Atlin', 'North', 'PO Box 100, 170 3rd St., Atlin, B.C. V0W 1A0', true, false, true, 'Fort St. John Law Courts');

-- Bella Bella
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name, notes) VALUES
('Bella Bella Provincial Court', 'Bella Bella', 'Vancouver Coastal', true, false, true, 'Vancouver Provincial Court', 'Contact Vancouver Provincial for criminal, Robson Square for family');

-- Bella Coola
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name, notes) VALUES
('Bella Coola Provincial Court', 'Bella Coola', 'Vancouver Coastal', true, false, true, 'Vancouver Provincial Court', 'Contact Vancouver Provincial for criminal, Robson Square for family');

-- Castlegar
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Castlegar Provincial Court', 'Castlegar', 'Interior', true, false, true, 'Nelson Law Courts');

-- Chase
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Chase Provincial Court', 'Chase', 'Interior', true, false, true, 'Kamloops Law Courts');

-- Chetwynd
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Chetwynd Provincial Court', 'Chetwynd', 'North', true, false, true, 'Dawson Creek Law Courts');

-- Clearwater
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Clearwater Provincial Court', 'Clearwater', 'Interior', true, false, true, 'Kamloops Law Courts');

-- Creston
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Creston Law Courts', 'Creston', 'Interior', true, false, true, 'Cranbrook Law Courts');

-- Daajing Giids (formerly Queen Charlotte)
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name, notes) VALUES
('Daajing Giids Provincial Court', 'Daajing Giids', 'North', true, false, true, 'Prince Rupert Law Courts', 'Formerly Queen Charlotte');

-- Dease Lake
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Dease Lake Provincial Court', 'Dease Lake', 'North', true, false, true, 'Terrace Law Courts');

-- Fernie
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Fernie Law Courts', 'Fernie', 'Interior', true, false, true, 'Cranbrook Law Courts');

-- Fort St. James
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Fort St. James Provincial Court', 'Fort St. James', 'North', true, false, true, 'Prince George Law Courts');

-- Fraser Lake
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Fraser Lake Provincial Court', 'Fraser Lake', 'North', true, false, true, 'Prince George Law Courts');

-- Ganges
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Ganges Provincial Court', 'Ganges', 'Vancouver Island', true, false, true, 'Duncan Law Courts');

-- Gold River
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Gold River Provincial Court', 'Gold River', 'Vancouver Island', true, false, true, 'Campbell River Law Courts');

-- Good Hope Lake
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Good Hope Lake Provincial Court', 'Good Hope Lake', 'North', true, false, true, 'Fort St. John Law Courts');

-- Grand Forks
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Grand Forks Law Courts', 'Grand Forks', 'Interior', true, false, true, 'Rossland Law Courts');

-- Hazelton
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Hazelton Provincial Court', 'Hazelton', 'North', true, false, true, 'Smithers Law Courts');

-- Houston
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Houston Provincial Court', 'Houston', 'North', true, false, true, 'Smithers Law Courts');

-- Hudson's Hope
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Hudson''s Hope Provincial Court', 'Hudson''s Hope', 'North', true, false, true, 'Fort St. John Law Courts');

-- Invermere
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Invermere Law Courts', 'Invermere', 'Interior', true, false, true, 'Cranbrook Law Courts');

-- Kitimat
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Kitimat Law Courts', 'Kitimat', 'North', true, false, true, 'Terrace Law Courts');

-- Klemtu
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name, notes) VALUES
('Klemtu Provincial Court', 'Klemtu', 'Vancouver Coastal', true, false, true, 'Vancouver Provincial Court', 'Contact Vancouver Provincial for criminal, Robson Square for family');

-- Kwadacha (formerly Fort Ware)
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name, notes) VALUES
('Kwadacha Provincial Court', 'Kwadacha', 'North', true, false, true, 'Prince George Law Courts', 'Formerly Fort Ware');

-- Lillooet
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Lillooet Law Courts', 'Lillooet', 'Interior', true, false, true, 'Kamloops Law Courts');

-- Lower Post
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Lower Post Provincial Court', 'Lower Post', 'North', true, false, true, 'Fort St. John Law Courts');

-- Masset
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Masset Provincial Court', 'Masset', 'North', true, false, true, 'Prince Rupert Law Courts');

-- McBride
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('McBride Provincial Court', 'McBride', 'North', true, false, true, 'Valemount Provincial Court');

-- Merritt
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Merritt Law Courts', 'Merritt', 'Interior', true, false, true, 'Kamloops Law Courts');

-- Nakusp
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Nakusp Provincial Court', 'Nakusp', 'Interior', true, false, true, 'Nelson Law Courts');

-- New Aiyansh
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('New Aiyansh Provincial Court', 'New Aiyansh', 'North', true, false, true, 'Terrace Law Courts');

-- Pemberton
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Pemberton Provincial Court', 'Pemberton', 'Vancouver Coastal', true, false, true, 'North Vancouver Provincial Court');

-- Princeton
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Princeton Law Courts', 'Princeton', 'Interior', true, false, true, 'Penticton Law Courts');

-- Revelstoke
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Revelstoke Law Courts', 'Revelstoke', 'Interior', true, false, true, 'Salmon Arm Law Courts');

-- Sidney
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Sidney Provincial Court', 'Sidney', 'Vancouver Island', true, false, true, 'Victoria Law Courts');

-- Sparwood
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Sparwood Provincial Court', 'Sparwood', 'Interior', true, false, true, 'Cranbrook Law Courts');

-- Stewart
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Stewart Provincial Court', 'Stewart', 'North', true, false, true, 'Terrace Law Courts');

-- Tahsis
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Tahsis Provincial Court', 'Tahsis', 'Vancouver Island', true, false, true, 'Campbell River Law Courts');

-- Tofino
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Tofino Provincial Court', 'Tofino', 'Vancouver Island', true, false, true, 'Port Alberni Law Courts');

-- Tsay Keh Dene (formerly Ingenika)
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name, notes) VALUES
('Tsay Keh Dene Provincial Court', 'Tsay Keh Dene', 'North', true, false, true, 'Prince George Law Courts', 'Formerly Ingenika');

-- Tumbler Ridge
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Tumbler Ridge Provincial Court', 'Tumbler Ridge', 'North', true, false, true, 'Dawson Creek Law Courts');

-- Ucluelet
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Ucluelet Provincial Court', 'Ucluelet', 'Vancouver Island', true, false, true, 'Port Alberni Law Courts');

-- Vanderhoof
INSERT INTO courts (name, city, region, has_provincial, has_supreme, is_circuit, hub_court_name) VALUES
('Vanderhoof Law Courts', 'Vanderhoof', 'North', true, false, true, 'Prince George Law Courts');

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Count by type
SELECT 
  COUNT(*) as total_courts,
  SUM(CASE WHEN is_circuit = false THEN 1 ELSE 0 END) as staffed_courts,
  SUM(CASE WHEN is_circuit = true THEN 1 ELSE 0 END) as circuit_courts
FROM courts;

-- Should show: total=90, staffed=43, circuit=47

-- Count by region
SELECT region, COUNT(*) as count
FROM courts
GROUP BY region
ORDER BY region;
