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
} from '@/types';

const supabase = createClient();

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

  if (error) throw error;
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
    .single();

  if (error) throw error;
  if (!data) return null;

  // If this is a circuit court with a contact_hub, look up the hub court's ID and name
  let contact_hub_id: number | null = null;
  let contact_hub_name: string | null = data.contact_hub;

  if (data.is_circuit && data.contact_hub) {
    const { data: hubCourt } = await supabase
      .from('courts')
      .select('id, name')
      .eq('name', data.contact_hub)
      .single();
    
    if (hubCourt) {
      contact_hub_id = hubCourt.id;
      contact_hub_name = `${hubCourt.name} Law Courts`;
    }
  }

  return {
    ...data,
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

  if (error) throw error;
  
  // Map the joined data to a flat structure
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

  if (error) throw error;
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

  if (error) throw error;
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

  if (error) throw error;
  return data || [];
}

export async function fetchCellsByCourtId(courtId: number): Promise<ShellCell[]> {
  const { data, error } = await supabase
    .from('sheriff_cells_courts')
    .select(`
      cell:sheriff_cells(*)
    `)
    .eq('court_id', courtId);

  if (error) throw error;
  return data?.map((item: { cell: ShellCell }) => item.cell).filter(Boolean) as ShellCell[] || [];
}

// =============================================================================
// TEAMS LINKS
// =============================================================================

export async function fetchTeamsLinks(): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function fetchTeamsLinksByCourtId(courtId: number): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select('*')
    .eq('court_id', courtId)
    .order('name');

  if (error) throw error;
  return data || [];
}

// Fetch bail teams - these are teams_links with bail_court_id set
export async function fetchBailTeamsLinksByBailCourtId(bailCourtId: number): Promise<TeamsLink[]> {
  const { data, error } = await supabase
    .from('teams_links')
    .select('*')
    .eq('bail_court_id', bailCourtId)
    .order('name');

  if (error) throw error;
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

  if (error) throw error;
  return data || [];
}

export async function fetchBailCourtById(id: number): Promise<BailCourt | null> {
  const { data, error } = await supabase
    .from('bail_courts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function fetchBailContactsByRegionId(regionId: number): Promise<BailContact[]> {
  const { data, error } = await supabase
    .from('bail_contacts')
    .select('*')
    .eq('region_id', regionId)
    .order('role_id');

  if (error) throw error;
  return data || [];
}

// =============================================================================
// PROGRAMS
// =============================================================================

export async function fetchPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function fetchProgramsByRegionId(regionId: number): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('region_id', regionId)
    .order('name');

  if (error) throw error;
  return data || [];
}

// =============================================================================
// COMBINED QUERIES
// =============================================================================

export async function fetchCourtDetails(courtId: number): Promise<CourtDetails | null> {
  const court = await fetchCourtById(courtId);
  if (!court) return null;

  const [contacts, cells, teamsLinks] = await Promise.all([
    fetchContactsByCourtId(courtId),
    fetchCellsByCourtId(courtId),
    fetchTeamsLinksByCourtId(courtId),
  ]);

  let bailCourt: BailCourt | null = null;
  let bailTeams: TeamsLink[] = [];
  let bailContacts: BailContact[] = [];
  let programs: Program[] = [];

  if (court.bail_hub_id) {
    bailCourt = await fetchBailCourtById(court.bail_hub_id);
    if (bailCourt) {
      bailTeams = await fetchBailTeamsLinksByBailCourtId(bailCourt.id);
    }
  }

  if (court.region_id) {
    [bailContacts, programs] = await Promise.all([
      fetchBailContactsByRegionId(court.region_id),
      fetchProgramsByRegionId(court.region_id),
    ]);
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
