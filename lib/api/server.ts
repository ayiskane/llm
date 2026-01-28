import 'server-only';
import { createClient } from '@supabase/supabase-js';
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
  JcmFxdSchedule,
  WeekendBailCourtWithTeams,
} from '@/types';

// =============================================================================
// SERVER-SIDE SUPABASE CLIENT (uses service role for server components)
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// =============================================================================
// CONSTANTS
// =============================================================================

const FRASER_REGION_ID = 3;
const SURREY_COURT_ID = 18;
const SURREY_WEEKEND_BAIL_ID = 18;
const FRASER_WEEKEND_BAIL_ID = 19;

// =============================================================================
// COURT WITH REGION TYPE
// =============================================================================

export interface CourtWithRegionName extends Court {
  region_name: string;
  region_code: string;
}

// =============================================================================
// SERVER QUERIES - COURTS
// =============================================================================

export async function fetchCourtsServer(): Promise<CourtWithRegionName[]> {
  const { data, error } = await supabase
    .from('courts')
    .select(`*, region:regions(id, name, code)`)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((court: any) => ({
    ...court,
    region_name: court.region?.name ?? 'Unknown',
    region_code: court.region?.code ?? 'UNK',
  }));
}

export async function fetchCourtByIdServer(id: number): Promise<CourtWithRegion | null> {
  const { data, error } = await supabase
    .from('courts')
    .select(`*, region:regions(*)`)
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  const court = data?.[0];
  if (!court) return null;

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

  return { ...court, contact_hub_id, contact_hub_name };
}

export async function fetchCourtDetailsServer(courtId: number): Promise<CourtDetails | null> {
  // Single query with nested selects - fetches court and all related data in one round trip
  const { data: courtData, error } = await supabase
    .from('courts')
    .select(`
      *,
      region:regions(*),
      contacts_courts(contact:contacts(*, contact_role:contact_roles(*))),
      sheriff_cells_courts(cell:sheriff_cells(*)),
      direct_cells:sheriff_cells(*),
      teams_links(*),
      jcm_fxd_schedules(*, teams_link:teams_links(*))
    `)
    .eq('id', courtId)
    .limit(1)
    .single();

  if (error || !courtData) return null;

  // Build court object with contact hub info
  let contact_hub_id: number | null = null;
  let contact_hub_name: string | null = courtData.contact_hub;

  // If circuit court, we need one extra query for contact hub
  let contactSourceId = courtId;
  if (courtData.is_circuit && courtData.contact_hub) {
    const { data: hubCourts } = await supabase
      .from('courts')
      .select('id, name, contacts_courts(contact:contacts(*, contact_role:contact_roles(*)))')
      .eq('name', courtData.contact_hub)
      .limit(1);

    const hubCourt = hubCourts?.[0];
    if (hubCourt) {
      contact_hub_id = hubCourt.id;
      contact_hub_name = `${hubCourt.name} Law Courts`;
      contactSourceId = hubCourt.id;
    }
  }

  const court: CourtWithRegion = {
    ...courtData,
    contact_hub_id,
    contact_hub_name,
  };

  // Extract contacts from nested data (use hub contacts if circuit)
  const contacts = contactSourceId === courtId
    ? (courtData.contacts_courts?.map((item: any) => item.contact).filter(Boolean) as ContactWithRole[] || [])
    : (await supabase.from('contacts_courts').select('contact:contacts(*, contact_role:contact_roles(*))').eq('court_id', contactSourceId))
        .data?.map((item: any) => item.contact).filter(Boolean) as ContactWithRole[] || [];

  // Combine and dedupe cells from junction table and direct relation
  const junctionCells = courtData.sheriff_cells_courts?.map((item: any) => item.cell).filter(Boolean) as ShellCell[] || [];
  const directCells = courtData.direct_cells || [];
  const cellMap = new Map<number, ShellCell>();
  [...junctionCells, ...directCells].forEach(cell => { if (cell?.id) cellMap.set(cell.id, cell); });
  const cells = Array.from(cellMap.values());

  const teamsLinks = courtData.teams_links || [];
  const jcmFxdSchedule = courtData.jcm_fxd_schedules?.[0] || null;

  // Fetch bail-related data in one query if bail_hub_id exists
  let bailCourt: BailCourt | null = null;
  let bailTeams: TeamsLink[] = [];
  let bailContacts: BailContact[] = [];

  if (court.bail_hub_id) {
    const { data: bailData } = await supabase
      .from('bail_courts')
      .select(`
        *,
        teams_links(*),
        bail_contacts(*)
      `)
      .eq('id', court.bail_hub_id)
      .limit(1)
      .single();

    if (bailData) {
      bailCourt = bailData;
      bailTeams = bailData.teams_links || [];
      bailContacts = bailData.bail_contacts || [];
    }
  }

  // Fetch region-related data in one round trip
  let programs: Program[] = [];
  let weekendBailCourts: WeekendBailCourtWithTeams[] = [];

  if (court.region_id) {
    // Parallel fetch for region data
    const [weekendBailRes, regionDataRes] = await Promise.all([
      fetchWeekendBailForCourtServer(court.region_id, court.id),
      supabase.from('bail_contacts').select('*').eq('region_id', court.region_id).is('bail_court_id', null).order('role_id'),
    ]);

    // Get programs
    const { data: programsData } = await supabase.from('programs').select('*').eq('region_id', court.region_id).order('name');
    programs = programsData || [];

    bailContacts = [...bailContacts, ...(regionDataRes.data || [])];

    if (weekendBailRes) {
      const { data: teams } = await supabase.from('teams_links').select('*').eq('bail_court_id', weekendBailRes.id).order('name');
      weekendBailCourts = [{ court: weekendBailRes, teams: teams || [] }];
    }
  }

  return { court, contacts, cells, teamsLinks, bailCourt, bailTeams, bailContacts, programs, weekendBailCourts, jcmFxdSchedule };
}

async function fetchWeekendBailForCourtServer(regionId: number, courtId: number): Promise<BailCourt | null> {
  if (regionId === FRASER_REGION_ID) {
    const bailId = courtId === SURREY_COURT_ID ? SURREY_WEEKEND_BAIL_ID : FRASER_WEEKEND_BAIL_ID;
    const { data } = await supabase.from('bail_courts').select('*').eq('id', bailId).limit(1);
    return data?.[0] || null;
  }

  const { data } = await supabase
    .from('bail_courts')
    .select('*')
    .eq('region_id', regionId)
    .eq('is_daytime', false)
    .is('court_id', null)
    .limit(1);

  return data?.[0] || null;
}

// =============================================================================
// SERVER QUERIES - BAIL HUBS
// =============================================================================

export interface BailCourtWithRegion extends BailCourt {
  region_name: string;
  region_code: string;
}

export async function fetchBailCourtsServer(): Promise<BailCourtWithRegion[]> {
  const { data, error } = await supabase
    .from('bail_courts')
    .select(`*, region:regions(id, name, code)`)
    .order('name');

  if (error) throw new Error(error.message);

  return (data || []).map((court: any) => ({
    ...court,
    region_name: court.region?.name || 'Unknown',
    region_code: court.region?.code || 'UNK',
  }));
}

export async function fetchBailHubDetailsServer(bailCourtId: number): Promise<BailHubDetails | null> {
  const { data: bailCourtData, error } = await supabase
    .from('bail_courts')
    .select(`*, region:regions(id, name, code)`)
    .eq('id', bailCourtId)
    .limit(1);

  if (error) throw new Error(error.message);
  const bailCourt = bailCourtData?.[0];
  if (!bailCourt) return null;

  const [teamsRes, contactsRes, regionContactsRes, linkedCourtsRes] = await Promise.all([
    supabase.from('teams_links').select('*').eq('bail_court_id', bailCourtId).order('name'),
    supabase.from('bail_contacts').select('*').eq('bail_court_id', bailCourtId).order('role_id'),
    supabase.from('bail_contacts').select('*').eq('region_id', bailCourt.region_id).is('bail_court_id', null).order('role_id'),
    supabase.from('courts').select('id, name').eq('bail_hub_id', bailCourtId).order('name'),
  ]);

  const allContacts = [...(contactsRes.data || []), ...(regionContactsRes.data || [])];

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
    bailTeams: teamsRes.data || [],
    bailContacts: allContacts,
    linkedCourts: linkedCourtsRes.data || [],
  };
}

// =============================================================================
// SERVER QUERIES - CORRECTIONS
// =============================================================================

export async function fetchCorrectionalCentresServer(): Promise<CorrectionalCentre[]> {
  const { data, error } = await supabase
    .from('correctional_centres')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchCorrectionalCentreByIdServer(id: number): Promise<CorrectionalCentre | null> {
  const { data, error } = await supabase
    .from('correctional_centres')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0] || null;
}

// =============================================================================
// STATIC PARAMS GENERATORS
// =============================================================================

export async function getAllCourtIds(): Promise<number[]> {
  const { data } = await supabase.from('courts').select('id');
  return data?.map(c => c.id) || [];
}

export async function getAllBailCourtIds(): Promise<number[]> {
  const { data } = await supabase.from('bail_courts').select('id');
  return data?.map(c => c.id) || [];
}

export async function getAllCorrectionalCentreIds(): Promise<number[]> {
  const { data } = await supabase.from('correctional_centres').select('id');
  return data?.map(c => c.id) || [];
}
