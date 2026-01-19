# BC Legal Directory - Data Model

## Overview

This document describes the data model for the BC Legal Directory application, designed to help lawyers quickly access contact information for courts, police, corrections, and legal services across British Columbia.

## Data Sources

- **Primary**: `Legal Legends_ The LEGENDARY Cheatsheet to GLORY v.1.1.xlsx`
- **Supplementary**: 137 PDFs, 44 Excel files, 22 Word documents in `/database` folder

---

## Database Tables

### 1. `courts`
Main courthouse information with contact details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Court name (e.g., "Abbotsford") |
| city | VARCHAR(100) | City location |
| region | ENUM | R1-R5 region code |
| address | TEXT | Street address |
| phone | VARCHAR(20) | Main phone |
| fax | VARCHAR(20) | Main fax |
| access_code | VARCHAR(50) | Barrister lounge access code |
| access_code_notes | TEXT | Special instructions for access |
| has_provincial | BOOLEAN | Has Provincial Court |
| has_supreme | BOOLEAN | Has Supreme Court |
| is_circuit | BOOLEAN | Is a circuit court |
| hub_court_id | UUID | FK to hub court (if circuit) |
| virtual_courtroom_code | VARCHAR(50) | MS Teams code |
| notes | TEXT | General notes |

### 2. `court_contacts`
Detailed contact information per court per level.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| court_id | UUID | FK to courts |
| court_level | ENUM | 'provincial' or 'supreme' |
| crown_email | VARCHAR(255) | Crown counsel office |
| jcm_scheduling_email | VARCHAR(255) | JCM scheduling |
| registry_email | VARCHAR(255) | Court registry |
| criminal_registry_email | VARCHAR(255) | Criminal registry |
| bail_crown_email | VARCHAR(255) | Bail crown contact |
| bail_jcm_email | VARCHAR(255) | Bail JCM contact |
| interpreter_request_email | VARCHAR(255) | Interpreter services |
| transcripts_email | VARCHAR(255) | Transcripts office |
| scheduling_email | VARCHAR(255) | General scheduling (Supreme) |
| fax_filing | VARCHAR(20) | Fax for filing |

### 3. `police_cells`
RCMP and police department jail cell contact numbers for duty counsel.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Agency name (e.g., "Victoria RCMP") |
| region | ENUM | R1-R5 region |
| location_type | ENUM | 'rcmp', 'police_dept', 'courthouse', 'youth_detention' |
| phone_numbers | JSONB | Array of phone numbers |
| notes | TEXT | Special instructions |

### 4. `correctional_facilities`
Provincial and federal correctional centres.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Facility name |
| abbreviation | VARCHAR(20) | Short code (e.g., "ACCW", "SPSC") |
| facility_type | ENUM | 'provincial' or 'federal' |
| location | VARCHAR(100) | City |
| region | ENUM | R1-R5 region |
| general_phone | VARCHAR(20) | Main number |
| general_fax | VARCHAR(20) | General fax |
| visit_request_phone | VARCHAR(20) | Visit booking number |
| visit_request_email | VARCHAR(255) | Visit request email |
| virtual_visit_email | VARCHAR(255) | Virtual visit booking |
| cdn_fax | VARCHAR(20) | Counsel Designation Notice fax |
| cdn_by_fax | BOOLEAN | Accepts CDN by fax |
| unlock_hours | VARCHAR(100) | Approximate unlock times |
| visit_hours | TEXT | Visit availability |
| e_particulars | JSONB | Electronic disclosure delivery options |
| notes | TEXT[] | Array of notes |

### 5. `bail_contacts`
Virtual bail team contacts by region and time.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| region_code | VARCHAR(5) | R1, R2, R3, R4, R5 |
| region_name | VARCHAR(100) | Full region name |
| contact_type | ENUM | 'daytime', 'evening', 'weekend', 'all_hours' |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(20) | Contact phone |
| vr_code | VARCHAR(10) | VR code (VR1-VR9) |
| subject_line_template | TEXT | Recommended email subject format |
| notes | TEXT | Special instructions |

### 6. `bail_coordinators`
Regional Administrative Bail Coordinators (RABCs).

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| region_code | VARCHAR(5) | Region code |
| name | VARCHAR(255) | Coordinator name |
| email | VARCHAR(255) | Email |
| phone | VARCHAR(20) | Phone |

### 7. `federal_crown_contacts`
PPSC (Public Prosecution Service of Canada) contacts for federal charges.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| region | VARCHAR(100) | Coverage area |
| organization | VARCHAR(100) | Firm/agency name |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(20) | Phone |
| areas_served | TEXT[] | List of areas/courts served |

### 8. `sheriff_contacts`
Sheriff virtual bail coordinators.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| area | VARCHAR(255) | Coverage area |
| email | VARCHAR(255) | Contact email |
| phone | VARCHAR(20) | Phone |

### 9. `legal_aid_offices`
Legal Aid BC office locations and contacts.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Office name |
| region | VARCHAR(100) | Region/area served |
| address | TEXT | Address |
| phone | VARCHAR(20) | Phone |
| fax | VARCHAR(20) | Fax |
| intake_email | VARCHAR(255) | Intake email |
| hours | VARCHAR(100) | Office hours |

### 10. `programs`
Bail supervision and treatment programs.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Program name |
| location | VARCHAR(100) | City/area |
| phone | VARCHAR(20) | Contact phone |
| gender | ENUM | 'all', 'male', 'female' |
| indigenous_only | BOOLEAN | Indigenous-specific |
| in_residence | BOOLEAN | Residential program |
| application_method | ENUM | 'phone', 'written', 'referral' |
| notes | TEXT | Additional info |

### 11. `ms_teams_links`
Virtual courtroom MS Teams links.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| court_id | UUID | FK to courts |
| courtroom | VARCHAR(50) | Courtroom number/name |
| link_type | ENUM | 'bail', 'remand', 'trial', 'custody' |
| teams_link | TEXT | Full MS Teams URL |
| dial_in_number | VARCHAR(20) | Phone dial-in |
| conference_id | VARCHAR(50) | Conference ID |

### 12. `indigenous_resources`
Indigenous justice programs and support services.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Resource name |
| type | ENUM | 'justice_centre', 'counselling', 'program' |
| region | VARCHAR(100) | Service area |
| phone | VARCHAR(20) | Phone |
| email | VARCHAR(255) | Email |
| address | TEXT | Address |
| services | TEXT[] | List of services offered |

### 13. `forensic_clinics`
Forensic Liaison Program clinics.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(255) | Clinic name |
| region | VARCHAR(100) | Region |
| address | TEXT | Address |
| phone | VARCHAR(20) | Phone |
| fax | VARCHAR(20) | Fax |
| email | VARCHAR(255) | Email |

---

## Region Codes

| Code | Name | VR Codes |
|------|------|----------|
| R1 | Vancouver Island | VR8 (South), VR9 (North) |
| R2 | Vancouver Coastal | Court-specific |
| R3 | Fraser | Court-specific |
| R4 | Interior | VR3, VR4 |
| R5 | North | VR1, VR2 |

---

## Data Counts (from Master Cheatsheet)

| Table | Records |
|-------|---------|
| Courts & Contacts | 82 |
| Access Codes | 18 |
| Circuit Courts | 48 |
| Police/RCMP Cells | 106 |
| Correctional Centres | 42 |
| Programs | 18 |

---

## Relationships

```
courts
  │
  ├── court_contacts (1:N)
  ├── ms_teams_links (1:N)
  └── circuit courts point to hub_court_id

bail_contacts
  └── bail_coordinators (N:1 via region)

correctional_facilities
  └── standalone with e_particulars JSONB

police_cells
  └── standalone, searchable by name/region
```

---

## Search Strategy

For the app's fuzzy search (using Fuse.js), these fields should be indexed:

1. **Courts**: name, city, region
2. **Police Cells**: name, region
3. **Corrections**: name, abbreviation, location
4. **Programs**: name, location
5. **All contacts**: email addresses (for quick lookup)

---

## Files Processed

### Contact Information (47 files)
- Regional bail office contacts (R1-R5)
- Police jail cell numbers
- Correctional centre details
- Legal Aid contacts
- Federal Crown contacts
- Sheriff contacts

### Schedules (60+ files)
- Crown counsel schedules
- Judge rotas
- LABC duty counsel schedules
- Sheriff run schedules

### Resources (30+ files)
- MS Teams links
- Virtual bail protocols
- Indigenous justice programs
- Forensic liaison forms

---

## Next Steps

1. Run SQL migrations to create tables
2. Import extracted JSON data
3. Process remaining PDFs for supplementary data
4. Add Fuse.js search indexing
5. Build API endpoints
