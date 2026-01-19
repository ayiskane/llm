# BC Legal Reference Database - Comprehensive Data Model

## Overview
This database aggregates all legal reference information for BC duty counsel, extracted from 204 source files including:
- 137 PDFs
- 43 Excel files  
- 21 Word documents

## Data Summary

| Table | Records | Description |
|-------|---------|-------------|
| courts | 82 | Courthouse locations with Crown/Registry contacts |
| police_cells | 106 | RCMP/Police jail cell phone numbers by region |
| correctional_facilities | 44 | Provincial & Federal corrections contacts |
| bail_contacts | 7 | Virtual bail team emails by region |
| bail_coordinators | 4 | Regional Administrative Bail Coordinators (RABCs) |
| crown_contacts | 10 | Individual Crown counsel contacts |
| labc_offices | 285 | Legal Aid BC offices, intake, navigators |
| labc_navigators | 8 | LABC court navigators with phone/email |
| forensic_clinics | 7 | Forensic Psychiatric Services regional clinics |
| indigenous_justice_centres | 10 | BC First Nations Justice Council IJCs |
| ms_teams_links | 405 | Virtual courtroom MS Teams conference IDs |
| programs | 18 | Bail supervision & treatment programs |
| access_codes | 18 | Courthouse barrister lounge codes |
| circuit_courts | 48 | Circuit court locations and contact hubs |

## Virtual Bail Regions

| Region | Name | Coverage | Contact Type |
|--------|------|----------|--------------|
| R1 | Island | Victoria, Duncan, Nanaimo, North Island | Daytime + Evening |
| R2 | Vancouver Coastal | 222 Main, North Van, Richmond | Daytime Only |
| R3 | Fraser | Abbotsford, Chilliwack, Surrey, PoCo, New West | Daytime Only |
| R4 | Interior | Kelowna, Penticton, Kamloops, Vernon, Kootenays | Daytime + Evening |
| R5 | North | Prince George, Quesnel, Williams Lake, Peace, Northwest | All Hours |

## Key Contact Information

### LABC Province-Wide
- **Call Centre**: 1-866-577-2525
- **Duty Counsel Priority Line**: 1-888-601-6076 (Option #3)
- **Duty Counsel Email**: DutyCounsel@legalaid.bc.ca

### Virtual Bail Team Emails
- **R1 Daytime**: Region1.virtualbail@gov.bc.ca
- **R1 Evening**: VictoriaCrown.Public@gov.bc.ca
- **R2**: 222MainCrownBail@gov.bc.ca
- **R3 Abbotsford**: Abbotsford.VirtualBail@gov.bc.ca
- **R3 Chilliwack**: Chilliwack.VirtualBail@gov.bc.ca
- **R4**: Region4.virtualbail@gov.bc.ca
- **R5**: Region5.virtualbail@gov.bc.ca

### MS Teams Phone Numbers (All Regions)
- **Local**: +1 778-725-6348
- **Toll-Free**: (844) 636-7837

### Corrections Caller ID
- **BC Corrections**: 1-844-369-7776

## Data Sources Processed

### Contact Information Folder (47 files)
- Crown contact lists by region (R1-R5, daytime/evening)
- Police jail cell numbers (Regions 1, 4, 5)
- RCMP detachment phone list
- Correctional centre details
- LABC contact lists (all regions)
- Federal Crown contacts
- Sheriff/Registry coordinators

### Forensic Liaison Program (6 files)
- FPS Regional Clinic list
- Notice 33 & 34
- Referral forms

### Indigenous Justice Programs (12 files)
- BC Indigenous Resources Guide
- IJC contacts
- FNHA mental health supports
- Restorative justice programs

### MS Teams Links (10 files)
- Virtual bail room links by region
- Justice Centre evening/weekend links
- PP Amalgamated live links (all courts)

### Legal Aid (16 files)
- Duty counsel cheat sheets (all regions)
- Emergency services for remote communities
- LABC intake contact information
- Navigator court location contacts

### Schedules (19 subfolders)
- Crown counsel schedules
- Judge schedules
- LABC duty counsel schedules
- Sheriff run schedules

## Search Recommendations

For optimal search functionality, implement:

1. **Fuse.js** for fuzzy text search across all tables
2. **Location-based filtering** using region codes
3. **Time-aware display** for daytime vs evening contacts
4. **Category filtering** (courts, police, corrections, etc.)

## Next Steps

1. Run `schema.sql` to create Supabase tables
2. Import `normalized_data.json` using the import script
3. Implement Fuse.js search in the frontend
4. Add PWA capabilities for offline courthouse access
