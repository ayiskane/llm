import { createClient } from './supabase';
import type {
  Court,
  CourtWithRegion,
  ContactWithRole,
  ShellCell,
  TeamsLink,
  BailCourt,
  BailContact,
  Program,
  CourtDetails,
  BailHubDetails,
  CorrectionalCentre,
  WeekendBailCourtWithTeams,
  JcmFxdSchedule,
} from '@/types';

const supabase = createClient();

// =============================================================================
// CONSTANTS - Weekend bail court mappings
// =============================================================================

// Fraser region has split weekend bail - Surrey vs rest of Fraser
const FRASER_REGION_ID = 3;
const SURREY_COURT_ID = 18;
const SURREY_WEEKEND_BAIL_ID = 18;  // Surrey Region Justice Centre
const FRASER_WEEKEND_BAIL_ID = 19;  // Fraser Region Justice Centre (excl. Surrey)

// =============================================================================
// TYPE FOR COURTS WITH REGION INFO
// =============================================================================

export interface CourtWithRegionName extends Court {
  region_name: string;
  region_code: string;
}

// =============================================================================
// COURTS
// =============================================================================

export async function fetchCourts(): Promise<Court[]> {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCourtById(id: number): Promise<CourtWithRegion | null> {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      *,
      region:regions(*)
    `)
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  const court = data?.[0];
  if (!court) return null;

  // If this is a circuit court with a contact_hub, look up the hub court's ID and name
  let contact_hub_id: number | null = null;
  let contact_hub_name: string | null = court.contact_hub;

  if (court.is_circuit && court.contact_hub) {
    const { data: hubCourts } = await supabase
      .from('courts')
      .select('id, name')
      .eq('name', court.contact_hub)
      .limit(1);
    
    const hubCourt = hubCourts?.[0];
    if (hubCourt) {
      contact_hub_id = hubCourt.id;
      contact_hub_name = `${hubCourt.name} Law Courts`;
    }
  }

  return {
    ...court,
    contact_hub_id,
    contact_hub_name,
  };
}

export async function fetchCourtsWithRegions(): Promise<CourtWithRegionName[]> {
  const { data, error } = await supabase
    .from('courts')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .order('name');

  if (error) throw new Error(error.message);
  
  return (data || []).map((court: any) => ({
    ...court,
    region_name: court.region?.name ?? 'Unknown',
    region_code: court.region?.code ?? 'UNK',
  }));
}

// =============================================================================
// CONTACTS
// =============================================================================

export async function fetchContacts(): Promise<ContactWithRole[]> {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      contact_role:contact_roles(*)
    `)
    .order('contact_role_id');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchContactsByCourtId(courtId: number): Promise<ContactWithRole[]> {
  const { data, error } = await supabase
    .from('contacts_courts')
    .select(`
      contact:contacts(
        *,
        contact_role:contact_roles(*)
      )
    `)
    .eq('court_id', courtId);

  if (error) throw new Error(error.message);
  return data?.map((item: { contact: ContactWithRole }) => item.contact).filter(Boolean) as ContactWithRole[] || [];
}

// =============================================================================
// CELLS
// =============================================================================

export async function fetchCells(): Promise<ShellCell[]> {
  const { data, error } = await supabase
    .from('sheriff_cells')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCellsByCourtId(courtId: number): Promise<ShellCell[]> {
  // Fetch cells from both sources in parallel:
  // 1. Junction table (sheriff_cells_courts) - for police cells linked to courts
  // 2. Direct court_id on sheriff_cells - for courthouse cells
  const [junctionResult, directResult] = await Promise.all([
    supabase
      .from('sheriff_cells_courts')
      .select(`cell:sheriff_cells(*)`)
      .eq('court_id', courtId),
    supabase
      .from('sheriff_cells')
      .select('*')
      .eq('court_id', courtId)
  ]);

  if (junctionResult.error) throw new Error(junctionResult.error.message);
  if (directResult.error) throw new Error(directResult.error.message);

  // Combine and deduplicate by cell ID
  const junctionCells = junctionResult.data?.map((item: { cell: ShellCell }) => item.cell).filter(Boolean) as ShellCell[] || [];
  const directCells = directResult.data || [];
  
  const cellMap = new Map<number, ShellCell>();
  [...junctionCells, ...directCells].forEach(cell => {
    if (cell && cell.id) cellMap.set(cell.id, cell);
  });
  
  return Array.from(cellMap.values());
}

// =============================================================================
// TEAMS LINKS
// =============================================================================

export async function fetchTeamsLinks(): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchTeamsLinksByCourtId(courtId: number): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select('*')
    .eq('court_id', courtId)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchBailTeamsLinksByBailCourtId(bailCourtId: number): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select('*')
    .eq('bail_court_id', bailCourtId)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

// =============================================================================
// BAIL
// =============================================================================

export async function fetchBailCourts(): Promise<BailCourt[]> {
  const { data, error } = await supabase
    .from('bail_courts')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export interface BailCourtWithRegion extends BailCourt {
  region_name: string;
  region_code: string;
}

export async function fetchBailCourtsWithRegion(): Promise<BailCourtWithRegion[]> {
  const { data, error } = await supabase
    .from('bail_courts')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .order('name');

  if (error) throw new Error(error.message);
  
  return (data || []).map((court: any) => ({
    ...court,
    region_name: court.region?.name || 'Unknown',
    region_code: court.region?.code || 'UNK',
  }));
}

export async function fetchBailCourtById(id: number): Promise<BailCourt | null> {
  const { data, error } = await supabase
    .from('bail_courts')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0] || null;
}

export async function fetchBailHubDetails(bailCourtId: number): Promise<BailHubDetails | null> {
  // Fetch bail court with region info
  const { data: bailCourtData, error: bailError } = await supabase
    .from('bail_courts')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .eq('id', bailCourtId)
    .limit(1);

  if (bailError) throw new Error(bailError.message);
  const bailCourt = bailCourtData?.[0];
  if (!bailCourt) return null;

  // Fetch bail teams, bail contacts, and linked courts in parallel
  const [teamsResult, contactsResult, regionContactsResult, linkedCourtsResult] = await Promise.all([
    supabase.from('teams_links').select('*').eq('bail_court_id', bailCourtId).order('name'),
    supabase.from('bail_contacts').select('*').eq('bail_court_id', bailCourtId).order('role_id'),
    supabase.from('bail_contacts').select('*').eq('region_id', bailCourt.region_id).is('bail_court_id', null).order('role_id'),
    supabase.from('courts').select('id, name').eq('bail_hub_id', bailCourtId).order('name'),
  ]);

  if (teamsResult.error) throw new Error(teamsResult.error.message);
  if (contactsResult.error) throw new Error(contactsResult.error.message);

  // Merge bail court-specific contacts with region-wide contacts
  const allContacts = [...(contactsResult.data || []), ...(regionContactsResult.data || [])];

  return {
    bailCourt: {
      id: bailCourt.id,
      name: bailCourt.name,
      court_id: bailCourt.court_id,
      region_id: bailCourt.region_id,
      is_hybrid: bailCourt.is_hybrid,
      is_daytime: bailCourt.is_daytime,
      triage_time_am: bailCourt.triage_time_am,
      triage_time_pm: bailCourt.triage_time_pm,
      court_start_am: bailCourt.court_start_am,
      court_start_pm: bailCourt.court_start_pm,
      court_end: bailCourt.court_end,
      cutoff_new_arrests: bailCourt.cutoff_new_arrests,
      youth_custody_day: bailCourt.youth_custody_day,
      youth_custody_time: bailCourt.youth_custody_time,
      notes: bailCourt.notes,
    },
    region: bailCourt.region || null,
    bailTeams: teamsResult.data || [],
    bailContacts: allContacts,
    linkedCourts: linkedCourtsResult.data || [],
  };
}

export async function fetchBailContactsByRegionId(regionId: number): Promise<BailContact[]> {
  try {
    const { data, error } = await supabase
      .from('bail_contacts')
      .select('*')
      .eq('region_id', regionId)
      .is('bail_court_id', null)
      .order('role_id');

    if (error) throw new Error(error.message);
    return data || [];
  } catch (e) {
    console.warn('Bail contacts (region) query failed:', e);
    return [];
  }
}

export async function fetchBailContactsByBailCourtId(bailCourtId: number): Promise<BailContact[]> {
  try {
    const { data, error } = await supabase
      .from('bail_contacts')
      .select('*')
      .eq('bail_court_id', bailCourtId)
      .order('role_id');

    if (error) throw new Error(error.message);
    return data || [];
  } catch (e) {
    console.warn('Bail contacts (court) query failed:', e);
    return [];
  }
}

// Fetch weekend bail court by region - handles Fraser's Surrey/non-Surrey split
export async function fetchWeekendBailForCourt(regionId: number, courtId: number): Promise<BailCourt | null> {
  // Fraser region has split weekend bail
  if (regionId === FRASER_REGION_ID) {
    const bailId = courtId === SURREY_COURT_ID ? SURREY_WEEKEND_BAIL_ID : FRASER_WEEKEND_BAIL_ID;
    return fetchBailCourtById(bailId);
  }
  
  // Other regions: single weekend bail court (exclude court-specific ones)
  const { data, error } = await supabase
    .from('bail_courts')
    .select('*')
    .eq('region_id', regionId)
    .eq('is_daytime', false)
    .is('court_id', null)
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0] || null;
}

// =============================================================================
// PROGRAMS
// =============================================================================

export async function fetchPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchProgramsByRegionId(regionId: number): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('region_id', regionId)
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

// =============================================================================
// =============================================================================
// JCM FIXED DATE SCHEDULES
// =============================================================================

export async function fetchJcmFxdScheduleByCourtId(courtId: number): Promise<JcmFxdSchedule | null> {
  try {
    const { data, error } = await supabase
      .from('jcm_fxd_schedules')
      .select(`
        *,
        teams_link:teams_links(*)
      `)
      .eq('court_id', courtId)
      .limit(1);

    if (error) {
      // If table doesn't exist yet, return null gracefully
      if (error.code === '42P01') return null;
      throw new Error(error.message);
    }
    return data?.[0] || null;
  } catch (e) {
    // If table doesn't exist or other error, return null gracefully
    console.warn('JCM FXD schedule query failed:', e);
    return null;
  }
}

// COMBINED QUERIES
// =============================================================================

export async function fetchCourtDetails(courtId: number): Promise<CourtDetails | null> {
  const court = await fetchCourtById(courtId);
  if (!court) return null;

  // For circuit courts, fetch contacts from their contact hub
  const contactSourceId = (court.is_circuit && court.contact_hub_id) 
    ? court.contact_hub_id 
    : courtId;

  const [contacts, cells, teamsLinks, jcmFxdSchedule] = await Promise.all([
    fetchContactsByCourtId(contactSourceId),
    fetchCellsByCourtId(courtId),
    fetchTeamsLinksByCourtId(courtId),
    fetchJcmFxdScheduleByCourtId(courtId),
  ]);

  let bailCourt: BailCourt | null = null;
  let bailTeams: TeamsLink[] = [];
  let bailContacts: BailContact[] = [];
  let programs: Program[] = [];
  let weekendBailCourts: WeekendBailCourtWithTeams[] = [];

  if (court.bail_hub_id) {
    bailCourt = await fetchBailCourtById(court.bail_hub_id);
    if (bailCourt) {
      // Fetch bail teams and bail court-specific contacts in parallel
      const [teams, courtSpecificContacts] = await Promise.all([
        fetchBailTeamsLinksByBailCourtId(bailCourt.id),
        fetchBailContactsByBailCourtId(bailCourt.id),
      ]);
      bailTeams = teams;
      bailContacts = courtSpecificContacts;
    }
  }

  if (court.region_id) {
    // Fetch weekend bail (smart routing for Fraser), region-wide bail contacts, and programs in parallel
    const [weekendBail, regionContacts, progs] = await Promise.all([
      fetchWeekendBailForCourt(court.region_id, court.id),
      fetchBailContactsByRegionId(court.region_id),
      fetchProgramsByRegionId(court.region_id),
    ]);
    
    // Merge bail court-specific contacts with region-wide contacts
    bailContacts = [...bailContacts, ...regionContacts];
    programs = progs;
    
    // Fetch teams for the weekend bail court
    if (weekendBail) {
      const teams = await fetchBailTeamsLinksByBailCourtId(weekendBail.id);
      weekendBailCourts = [{ court: weekendBail, teams }];
    }
  }

  return {
    court,
    contacts,
    cells,
    teamsLinks,
    bailCourt,
    bailTeams,
    bailContacts,
    programs,
    weekendBailCourts,
    jcmFxdSchedule,
  };
}

// =============================================================================
// BULK FETCH FOR SEARCH INDEX
// =============================================================================

export interface SearchIndexData {
  courts: Court[];
  contacts: ContactWithRole[];
  cells: ShellCell[];
  teamsLinks: TeamsLink[];
}

export async function fetchSearchIndexData(): Promise<SearchIndexData> {
  const [courts, contacts, cells, teamsLinks] = await Promise.all([
    fetchCourts(),
    fetchContacts(),
    fetchCells(),
    fetchTeamsLinks(),
  ]);

  return { courts, contacts, cells, teamsLinks };
}

// =============================================================================
// CORRECTIONAL CENTRES
// =============================================================================

export async function fetchCorrectionalCentres(): Promise<CorrectionalCentre[]> {
  const { data, error } = await supabase
    .from('correctional_centres')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCorrectionalCentreById(id: number): Promise<CorrectionalCentre | null> {
  const { data, error } = await supabase
    .from('correctional_centres')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0] || null;
}
