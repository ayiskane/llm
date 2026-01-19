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
| duty_counsel_lawyers | 262 | LABC duty counsel lawyers by region |
| ms_teams_links | 405 | Virtual courtroom MS Teams conference IDs |
| circuit_courts | 48 | Circuit court locations and contact hubs |
| programs | 18 | Bail supervision & treatment programs |
| access_codes | 18 | Courthouse barrister lounge codes |
| labc_offices | 11 | Legal Aid BC offices & intake contacts |
| crown_contacts | 10 | Individual Crown counsel contacts |
| indigenous_justice_centres | 10 | BC First Nations Justice Council IJCs |
| labc_navigators | 8 | LABC court navigators |
| bail_contacts | 7 | Virtual bail team emails by region |
| forensic_clinics | 7 | Forensic Psychiatric Services regional clinics |
| bail_coordinators | 4 | Regional Administrative Bail Coordinators (RABCs) |

**Total: 1,040 records**

## Virtual Bail Regions

| Region | Name | Coverage | Contact Type |
|--------|------|----------|--------------|
| R1 | Island | Victoria, Duncan, Nanaimo, North Island | Daytime + Evening |
| R2 | Vancouver Coastal | 222 Main, North Van, Richmond | Daytime Only |
| R3 | Fraser | Abbotsford, Chilliwack, Surrey, PoCo, New West | Daytime Only |
| R4 | Interior | Kelowna, Penticton, Kamloops, Vernon, Kootenays | Daytime + Evening |
| R5 | North | Prince George, Quesnel, Williams Lake, Peace, Northwest | All Hours |

## Duty Counsel Lawyers by Region

| Region | Count |
|--------|-------|
| Island | 84 |
| Fraser | 58 |
| Vancouver Coastal | 51 |
| Interior | 46 |
| Interior Evening | 19 |
| Northern | 4 |

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

## Database Schema

The schema includes:
- Full-text search indexes on key fields
- A unified `search_all` view for cross-table searching
- Proper foreign key relationships where applicable

## Files

- `normalized_data.json` - All extracted data (1,040 records)
- `schema.sql` - PostgreSQL/Supabase schema
- `types.ts` - TypeScript interfaces
- `import_data.js` - Supabase import script
