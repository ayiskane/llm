import { createClient } from './supabase';
import type {
  Court,
  CourtWithRegion,
  ContactWithRole,
  SheriffCell,
  TeamsLink,
  BailHub,
  BailContact,
  Program,
  CourtDetails,
  BailHubDetails,
  CorrectionalCentre,
  WeekendBailHubWithTeams,
  Schedule,
} from '@/types';

const supabase = createClient();

// =============================================================================
// CONSTANTS - Weekend bail hub mappings
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

  // If this is a circuit court with a parent_court_id, look up the parent court's name
  let parent_court: { id: number; name: string } | null = null;

  if (court.is_circuit && court.parent_court_id) {
    const { data: parentCourts } = await supabase
      .from('courts')
      .select('id, name')
      .eq('id', court.parent_court_id)
      .limit(1);

    const parentCourt = parentCourts?.[0];
    if (parentCourt) {
      parent_court = {
        id: parentCourt.id,
        name: parentCourt.name,
      };
    }
  }

  return {
    ...court,
    parent_court,
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
// CONTACTS (via entity_contacts junction table)
// =============================================================================

export async function fetchContactsByCourtId(courtId: number): Promise<ContactWithRole[]> {
  const { data, error } = await supabase
    .from('entity_contacts')
    .select(`
      id,
      role_id,
      notes,
      contact:contacts(id, name, title, phone, email),
      role:contact_roles(id, name)
    `)
    .eq('court_id', courtId);

  if (error) throw new Error(error.message);

  return (data || []).map((item: any) => ({
    id: item.contact?.id || item.id,
    name: item.contact?.name || '',
    title: item.contact?.title || null,
    email: item.contact?.email || null,
    phone: item.contact?.phone || null,
    role_id: item.role_id,
    role_name: item.role?.name || undefined,
    notes: item.notes || null,
  })).filter((c: ContactWithRole) => c.name);
}

// =============================================================================
// SHERIFF CELLS
// =============================================================================

export async function fetchCells(): Promise<SheriffCell[]> {
  const { data, error } = await supabase
    .from('sheriff_cells')
    .select(`
      *,
      type:sheriff_cell_types(id, name),
      region:regions(id, name)
    `)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((cell: any) => ({
    ...cell,
    type_name: cell.type?.name || undefined,
    region_name: cell.region?.name || undefined,
  }));
}

export async function fetchCellsByCourtId(courtId: number): Promise<SheriffCell[]> {
  // Fetch cells via junction table (sheriff_cells_courts)
  const { data, error } = await supabase
    .from('sheriff_cells_courts')
    .select(`
      cell:sheriff_cells(
        *,
        type:sheriff_cell_types(id, name),
        region:regions(id, name)
      )
    `)
    .eq('court_id', courtId);

  if (error) throw new Error(error.message);

  return (data || [])
    .map((item: any) => item.cell)
    .filter(Boolean)
    .map((cell: any) => ({
      ...cell,
      type_name: cell.type?.name || undefined,
      region_name: cell.region?.name || undefined,
    }));
}

// =============================================================================
// TEAMS LINKS
// =============================================================================

export async function fetchTeamsLinks(): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select(`
      *,
      type:teams_link_types(id, name)
    `)
    .order('courtroom');

  if (error) throw new Error(error.message);

  return (data || []).map((link: any) => ({
    ...link,
    type_name: link.type?.name || undefined,
  }));
}

export async function fetchTeamsLinksByCourtId(courtId: number): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select(`
      *,
      type:teams_link_types(id, name)
    `)
    .eq('court_id', courtId)
    .order('courtroom');

  if (error) throw new Error(error.message);

  return (data || []).map((link: any) => ({
    ...link,
    type_name: link.type?.name || undefined,
  }));
}

export async function fetchTeamsLinksByBailHubId(bailHubId: number): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select(`
      *,
      type:teams_link_types(id, name)
    `)
    .eq('bail_hub_id', bailHubId)
    .order('courtroom');

  if (error) throw new Error(error.message);

  return (data || []).map((link: any) => ({
    ...link,
    type_name: link.type?.name || undefined,
  }));
}

// =============================================================================
// BAIL HUBS
// =============================================================================

export async function fetchBailHubs(): Promise<BailHub[]> {
  const { data, error } = await supabase
    .from('bail_hubs')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((hub: any) => ({
    ...hub,
    region_name: hub.region?.name || undefined,
    region_code: hub.region?.code || undefined,
  }));
}

export interface BailHubWithRegion extends BailHub {
  region_name: string;
  region_code: string;
}

export async function fetchBailHubsWithRegion(): Promise<BailHubWithRegion[]> {
  const { data, error } = await supabase
    .from('bail_hubs')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((hub: any) => ({
    ...hub,
    region_name: hub.region?.name || 'Unknown',
    region_code: hub.region?.code || 'UNK',
  }));
}

export async function fetchBailHubById(id: number): Promise<BailHub | null> {
  const { data, error } = await supabase
    .from('bail_hubs')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);

  const hub = data?.[0];
  if (!hub) return null;

  return {
    ...hub,
    region_name: hub.region?.name || undefined,
    region_code: hub.region?.code || undefined,
  };
}

export async function fetchBailHubDetails(bailHubId: number): Promise<BailHubDetails | null> {
  // Fetch bail hub with region info
  const { data: bailHubData, error: bailError } = await supabase
    .from('bail_hubs')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .eq('id', bailHubId)
    .limit(1);

  if (bailError) throw new Error(bailError.message);
  const bailHub = bailHubData?.[0];
  if (!bailHub) return null;

  // Fetch bail teams, bail contacts, and linked courts in parallel
  const [teamsResult, contactsResult, linkedCourtsResult] = await Promise.all([
    supabase
      .from('teams_links')
      .select(`*, type:teams_link_types(id, name)`)
      .eq('bail_hub_id', bailHubId)
      .order('courtroom'),
    supabase
      .from('entity_contacts')
      .select(`
        id,
        role_id,
        notes,
        contact:contacts(id, name, title, phone, email),
        role:contact_roles(id, name)
      `)
      .eq('bail_hub_id', bailHubId),
    supabase
      .from('courts')
      .select('id, name')
      .eq('bail_hub_id', bailHubId)
      .order('name'),
  ]);

  if (teamsResult.error) throw new Error(teamsResult.error.message);
  if (contactsResult.error) throw new Error(contactsResult.error.message);

  // Map contacts to BailContact format
  const bailContacts: BailContact[] = (contactsResult.data || []).map((item: any) => ({
    id: item.contact?.id || item.id,
    name: item.contact?.name || '',
    email: item.contact?.email || null,
    phone: item.contact?.phone || null,
    role_id: item.role_id,
    role_name: item.role?.name || undefined,
    bail_hub_id: bailHubId,
    region_id: null,
  })).filter((c: BailContact) => c.name);

  // Map teams links
  const bailTeams: TeamsLink[] = (teamsResult.data || []).map((link: any) => ({
    ...link,
    type_name: link.type?.name || undefined,
  }));

  return {
    bailHub: {
      id: bailHub.id,
      name: bailHub.name,
      court_id: bailHub.court_id,
      region_id: bailHub.region_id,
      sheriff_coordinator_email: bailHub.sheriff_coordinator_email,
      sheriff_coordinator_phone: bailHub.sheriff_coordinator_phone,
      sheriff_coordinator_teams_chat: bailHub.sheriff_coordinator_teams_chat,
      region_name: bailHub.region?.name || undefined,
      region_code: bailHub.region?.code || undefined,
    },
    region: bailHub.region || null,
    bailTeams,
    bailContacts,
    linkedCourts: linkedCourtsResult.data || [],
  };
}

export async function fetchBailContactsByRegionId(regionId: number): Promise<BailContact[]> {
  try {
    const { data, error } = await supabase
      .from('entity_contacts')
      .select(`
        id,
        role_id,
        notes,
        contact:contacts(id, name, title, phone, email),
        role:contact_roles(id, name)
      `)
      .eq('region_id', regionId)
      .is('bail_hub_id', null)
      .is('court_id', null);

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      id: item.contact?.id || item.id,
      name: item.contact?.name || '',
      email: item.contact?.email || null,
      phone: item.contact?.phone || null,
      role_id: item.role_id,
      role_name: item.role?.name || undefined,
      bail_hub_id: null,
      region_id: regionId,
    })).filter((c: BailContact) => c.name);
  } catch (e) {
    console.warn('Bail contacts (region) query failed:', e);
    return [];
  }
}

export async function fetchBailContactsByBailHubId(bailHubId: number): Promise<BailContact[]> {
  try {
    const { data, error } = await supabase
      .from('entity_contacts')
      .select(`
        id,
        role_id,
        notes,
        contact:contacts(id, name, title, phone, email),
        role:contact_roles(id, name)
      `)
      .eq('bail_hub_id', bailHubId);

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      id: item.contact?.id || item.id,
      name: item.contact?.name || '',
      email: item.contact?.email || null,
      phone: item.contact?.phone || null,
      role_id: item.role_id,
      role_name: item.role?.name || undefined,
      bail_hub_id: bailHubId,
      region_id: null,
    })).filter((c: BailContact) => c.name);
  } catch (e) {
    console.warn('Bail contacts (hub) query failed:', e);
    return [];
  }
}

// Fetch weekend bail hub by region - handles Fraser's Surrey/non-Surrey split
export async function fetchWeekendBailForCourt(regionId: number, courtId: number): Promise<BailHub | null> {
  // Fraser region has split weekend bail
  if (regionId === FRASER_REGION_ID) {
    const bailId = courtId === SURREY_COURT_ID ? SURREY_WEEKEND_BAIL_ID : FRASER_WEEKEND_BAIL_ID;
    return fetchBailHubById(bailId);
  }

  // Other regions: find the bail hub for this region
  const { data, error } = await supabase
    .from('bail_hubs')
    .select(`
      *,
      region:regions(id, name, code)
    `)
    .eq('region_id', regionId)
    .is('court_id', null)
    .limit(1);

  if (error) throw new Error(error.message);

  const hub = data?.[0];
  if (!hub) return null;

  return {
    ...hub,
    region_name: hub.region?.name || undefined,
    region_code: hub.region?.code || undefined,
  };
}

// =============================================================================
// PROGRAMS
// =============================================================================

export async function fetchPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      type:program_types(id, name)
    `)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((program: any) => ({
    ...program,
    type_name: program.type?.name || undefined,
  }));
}

export async function fetchProgramsByRegionId(regionId: number): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select(`
      *,
      type:program_types(id, name)
    `)
    .eq('region_id', regionId)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((program: any) => ({
    ...program,
    type_name: program.type?.name || undefined,
  }));
}

// =============================================================================
// SCHEDULES
// =============================================================================

export async function fetchSchedulesByCourtId(courtId: number): Promise<Schedule[]> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        type:schedule_types(id, name)
      `)
      .eq('court_id', courtId);

    if (error) throw new Error(error.message);

    return (data || []).map((schedule: any) => ({
      ...schedule,
      type_name: schedule.type?.name || undefined,
    }));
  } catch (e) {
    console.warn('Schedule query failed:', e);
    return [];
  }
}

export async function fetchSchedulesByBailHubId(bailHubId: number): Promise<Schedule[]> {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select(`
        *,
        type:schedule_types(id, name)
      `)
      .eq('bail_hub_id', bailHubId);

    if (error) throw new Error(error.message);

    return (data || []).map((schedule: any) => ({
      ...schedule,
      type_name: schedule.type?.name || undefined,
    }));
  } catch (e) {
    console.warn('Schedule query failed:', e);
    return [];
  }
}

// =============================================================================
// COMBINED QUERIES - COURT DETAILS
// =============================================================================

export async function fetchCourtDetails(courtId: number): Promise<CourtDetails | null> {
  const court = await fetchCourtById(courtId);
  if (!court) return null;

  // For circuit courts, fetch contacts from their parent court
  const contactSourceId = (court.is_circuit && court.parent_court_id)
    ? court.parent_court_id
    : courtId;

  const [contacts, cells, teamsLinks, schedules] = await Promise.all([
    fetchContactsByCourtId(contactSourceId),
    fetchCellsByCourtId(courtId),
    fetchTeamsLinksByCourtId(courtId),
    fetchSchedulesByCourtId(courtId),
  ]);

  let bailHub: BailHub | null = null;
  let bailTeams: TeamsLink[] = [];
  let bailContacts: BailContact[] = [];
  let programs: Program[] = [];
  let weekendBailHubs: WeekendBailHubWithTeams[] = [];

  if (court.bail_hub_id) {
    bailHub = await fetchBailHubById(court.bail_hub_id);
    if (bailHub) {
      // Fetch bail teams and bail hub-specific contacts in parallel
      const [teams, hubContacts] = await Promise.all([
        fetchTeamsLinksByBailHubId(bailHub.id),
        fetchBailContactsByBailHubId(bailHub.id),
      ]);
      bailTeams = teams;
      bailContacts = hubContacts;
    }
  }

  if (court.region_id) {
    // Fetch weekend bail (smart routing for Fraser), region-wide bail contacts, and programs in parallel
    const [weekendBail, regionContacts, progs] = await Promise.all([
      fetchWeekendBailForCourt(court.region_id, court.id),
      fetchBailContactsByRegionId(court.region_id),
      fetchProgramsByRegionId(court.region_id),
    ]);

    // Merge bail hub-specific contacts with region-wide contacts
    bailContacts = [...bailContacts, ...regionContacts];
    programs = progs;

    // Fetch teams for the weekend bail hub
    if (weekendBail) {
      const teams = await fetchTeamsLinksByBailHubId(weekendBail.id);
      weekendBailHubs = [{ bailHub: weekendBail, teams }];
    }
  }

  return {
    court,
    contacts,
    cells,
    teamsLinks,
    bailHub,
    bailTeams,
    bailContacts,
    programs,
    weekendBailHubs,
    schedules,
  };
}

// =============================================================================
// BULK FETCH FOR SEARCH INDEX
// =============================================================================

export interface SearchIndexData {
  courts: Court[];
  cells: SheriffCell[];
  teamsLinks: TeamsLink[];
}

export async function fetchSearchIndexData(): Promise<SearchIndexData> {
  const [courts, cells, teamsLinks] = await Promise.all([
    fetchCourts(),
    fetchCells(),
    fetchTeamsLinks(),
  ]);

  return { courts, cells, teamsLinks };
}

// =============================================================================
// CORRECTIONAL CENTRES
// =============================================================================

export async function fetchCorrectionalCentres(): Promise<CorrectionalCentre[]> {
  const { data, error } = await supabase
    .from('correctional_centres')
    .select(`
      *,
      type:correctional_centre_types(id, name),
      region:regions(id, name)
    `)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((centre: any) => ({
    ...centre,
    type_name: centre.type?.name || undefined,
    region_name: centre.region?.name || undefined,
  }));
}

export async function fetchCorrectionalCentreById(id: number): Promise<CorrectionalCentre | null> {
  const { data, error } = await supabase
    .from('correctional_centres')
    .select(`
      *,
      type:correctional_centre_types(id, name),
      region:regions(id, name)
    `)
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);

  const centre = data?.[0];
  if (!centre) return null;

  return {
    ...centre,
    type_name: centre.type?.name || undefined,
    region_name: centre.region?.name || undefined,
  };
}

// =============================================================================
// LEGACY ALIASES (for backwards compatibility)
// =============================================================================

// Bail Courts -> Bail Hubs
export const fetchBailCourts = fetchBailHubs;
export const fetchBailCourtsWithRegion = fetchBailHubsWithRegion;
export const fetchBailCourtById = fetchBailHubById;
export const fetchBailTeamsLinksByBailCourtId = fetchTeamsLinksByBailHubId;
export type BailCourtWithRegion = BailHubWithRegion;
