import { createClient } from './supabase';
import type { CourtScheduleDate } from '@/types';

export type CourtTypeFilter = 'all' | 'staffed' | 'circuit';
export type CourtLevelFilter = 'all' | 'pc' | 'sc';

export interface CourtsIndexParams {
  q?: string;
  region?: number;
  courtType?: CourtTypeFilter;
  courtLevel?: CourtLevelFilter;
}

export interface CourtIndexItem {
  id: number;
  name: string;
  has_provincial: boolean;
  has_supreme: boolean;
  is_circuit: boolean;
  region_id: number | null;
  region_name: string;
  region_code: string;
}

const supabase = createClient();

export async function fetchCourtScheduleDates(courtId: number): Promise<CourtScheduleDate[]> {
  const { data, error } = await supabase
    .from('court_schedules')
    .select(`
      id,
      court_id,
      schedule_type,
      schedule_dates:court_schedule_dates(id, date_start, date_end, updated_at)
    `)
    .eq('court_id', courtId);

  if (error) throw new Error(error.message);

  const rows = (data || []) as Array<{
    id: number;
    court_id: number;
    schedule_type: string | null;
    schedule_dates?: Array<{
      id: number;
      date_start: string | null;
      date_end: string | null;
      notes: string | null;
      updated_at?: string | null;
    }> | null;
  }>;

  const flattened: CourtScheduleDate[] = [];
  for (const schedule of rows) {
    const dates = schedule.schedule_dates ?? [];
    for (const dateRow of dates) {
      if (!dateRow?.date_start) continue;
      flattened.push({
        id: dateRow.id,
        schedule_id: schedule.id,
        court_id: schedule.court_id,
        date_start: dateRow.date_start,
        date_end: dateRow.date_end ?? null,
        notes: dateRow.notes ?? null,
        schedule_type: schedule.schedule_type ?? null,
        schedule_label: schedule.schedule_type ?? null,
      });
    }
  }

  return flattened.sort((a, b) => {
    const aDate = new Date(a.date_start).getTime();
    const bDate = new Date(b.date_start).getTime();
    return aDate - bDate;
  });
}

export async function fetchCourtsIndexStamp(): Promise<string | null> {
  const { data, error } = await supabase
    .from('courts')
    .select('updated_at')
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error) throw new Error(error.message);
  return data?.[0]?.updated_at ?? null;
}

export async function fetchCourtsIndex(
  params: CourtsIndexParams = {}
): Promise<CourtIndexItem[]> {
  const {
    q = '',
    region = 0,
    courtType = 'all',
    courtLevel = 'all',
  } = params;

  let query = supabase
    .from('courts')
    .select(
      `
        id,
        court_name,
        has_provincial,
        has_supreme,
        is_circuit,
        region_id,
        updated_at,
        region:regions(id, name, code)
      `
    )
    .order('court_name');

  if (region !== 0) {
    query = query.eq('region_id', region);
  }

  if (courtType === 'staffed') {
    query = query.eq('is_circuit', false);
  } else if (courtType === 'circuit') {
    query = query.eq('is_circuit', true);
  }

  if (courtLevel === 'pc') {
    query = query.eq('has_provincial', true);
  } else if (courtLevel === 'sc') {
    query = query.eq('has_supreme', true);
  }

  const trimmed = q.trim();
  if (trimmed) {
    const like = `%${trimmed}%`;
    query = query.or(`court_name.ilike.${like},regions.name.ilike.${like}`);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  return (data || []).map((court: any) => ({
    id: court.id,
    name: court.court_name,
    has_provincial: court.has_provincial,
    has_supreme: court.has_supreme,
    is_circuit: court.is_circuit,
    region_id: court.region_id,
    region_name: court.region?.name ?? 'Unknown',
    region_code: court.region?.code ?? 'UNK',
  }));
}

export async function fetchCourtDetails(courtId: number) {
  const { data: publicCourts, error: publicError } = await supabase
    .from('courts')
    .select(`
      id,
      court_name,
      region_id,
      has_provincial,
      has_supreme,
      is_circuit,
      address,
      mailing_address,
      fnc_address,
      is_mst,
      is_fnc,
      circuit_contact_court_id,
      region:regions(id, name, code)
    `)
    .eq('id', courtId)
    .limit(1);

  if (publicError) throw new Error(publicError.message);
  const publicCourt = publicCourts?.[0];
  if (!publicCourt) return null;

  const parentCourtId = publicCourt.circuit_contact_court_id as number | null;

  const contactCourtIds = parentCourtId
    ? [publicCourt.id, parentCourtId]
    : [publicCourt.id];

  const contactsPromise = supabase
    .from('courts_contacts')
    .select(`
      id,
      court_id,
      contact_type,
      email,
      emails,
      phone,
      provincial_fax_filing,
      supreme_fax_filing,
      type:courts_contact_types(contact_type, is_provincial, is_supreme, is_appeals)
    `)
    .in('court_id', contactCourtIds);

  const teamsPromise = supabase
    .from('teams_links')
    .select(`*, type:teams_link_types(name), courtroom_type:courtroom_types(name)`)
    .eq('court_id', publicCourt.id);

  const courtroomSchedulePromise = supabase
    .from('courtroom_schedules')
    .select(
      `id, court_id, courtroom, weekdays, nth_week, times_text, is_youth, courtroom_type, days_text, notes`
    )
    .eq('court_id', publicCourt.id);

  const parentPromise = parentCourtId
    ? supabase
        .from('courts')
        .select('id, court_name')
        .eq('id', parentCourtId)
        .limit(1)
    : Promise.resolve({ data: null, error: null });

  const [
    { data: contactRows, error: contactError },
    { data: teamsRows, error: teamsError },
    { data: courtroomScheduleRows, error: courtroomScheduleError },
    { data: parentData, error: parentError },
  ] = await Promise.all([
    contactsPromise,
    teamsPromise,
    courtroomSchedulePromise,
    parentPromise,
  ]);

  if (contactError) throw new Error(contactError.message);
  if (teamsError) throw new Error(teamsError.message);
  if (courtroomScheduleError) throw new Error(courtroomScheduleError.message);
  if (parentError) throw new Error(parentError.message);

  let parentCourt: { id: number; name: string } | null = null;
  const parent = parentData?.[0];
  if (parent) {
    parentCourt = { id: parent.id, name: parent.court_name };
  }

  const mergedContacts = new Map<string, any>();
  for (const row of contactRows || []) {
    const existing = mergedContacts.get(row.contact_type);
    if (!existing || row.court_id === publicCourt.id) {
      mergedContacts.set(row.contact_type, row);
    }
  }

  const contactList = Array.from(mergedContacts.values()).map((row) => {
    const emailList = [
      ...(row.email ? [row.email] : []),
      ...((row.emails as string[] | null) ?? []),
    ];
    return {
      ...row,
      emails_all: emailList,
      is_provincial: row.type?.is_provincial ?? false,
      is_supreme: row.type?.is_supreme ?? false,
      is_appeals: row.type?.is_appeals ?? false,
    };
  });

  const getPrimaryEmail = (type: string) => {
    const row = mergedContacts.get(type);
    if (!row) return null;
    return row.email ?? row.emails?.[0] ?? null;
  };

  const registryContact = mergedContacts.get('court_registry');
  const criminalRegistryContact = mergedContacts.get('criminal_registry');
  const crownGeneralContact = mergedContacts.get('crown_general');
  const jcmContact = mergedContacts.get('jcm');
  const supremeSchedulingContact = mergedContacts.get('scheduling');

  const court = {
    id: publicCourt.id,
    name: publicCourt.court_name,
    region_id: publicCourt.region_id,
    region_name: publicCourt.region?.name ?? null,
    region_code: publicCourt.region?.code ?? null,
    region: publicCourt.region ?? null,
    has_provincial: publicCourt.has_provincial,
    has_supreme: publicCourt.has_supreme,
    is_circuit: publicCourt.is_circuit,
    is_mst: publicCourt.is_mst,
    is_fnc: publicCourt.is_fnc,
    address: publicCourt.address,
    mailing_address: publicCourt.mailing_address,
    fnc_address: publicCourt.fnc_address,
    parent_court: parentCourt,
    registry_email: getPrimaryEmail('court_registry'),
    registry_phone: registryContact?.phone ?? null,
    criminal_registry_email: getPrimaryEmail('criminal_registry'),
    criminal_registry_phone: criminalRegistryContact?.phone ?? null,
    provincial_fax_filing: registryContact?.provincial_fax_filing ?? null,
    crown_office_email: getPrimaryEmail('crown_general'),
    crown_office_phone: crownGeneralContact?.phone ?? null,
    jcm_email: getPrimaryEmail('jcm'),
    jcm_phone: jcmContact?.phone ?? null,
    supreme_scheduling_email: getPrimaryEmail('scheduling'),
    supreme_scheduling_phone: supremeSchedulingContact?.phone ?? null,
    supreme_fax_filing: registryContact?.supreme_fax_filing ?? null,
    contacts: contactList,
  };

  const teamsLinks =
    (teamsRows || []).map((row: any) => ({
      id: row.id,
      court_id: row.court_id ?? null,
      url: row.url ?? null,
      title: row.title ?? null,
      schedule: row.schedule ?? null,
      notes: row.notes ?? null,
      type_id: row.type_id ?? null,
      type_name: row.type?.name ?? row.type_name ?? null,
      courtroom_type_id: row.courtroom_type_id ?? null,
      courtroom_type_name: row.courtroom_type?.name ?? null,
      courtroom: row.courtroom ?? null,
      display_order: row.display_order ?? null,
      phone_number: row.phone_number ?? null,
      toll_free_number: row.toll_free_number ?? null,
      conference_id: row.conference_id ?? null,
      bail_hub_id: row.bail_hub_id ?? null,
    })) ?? [];

  const courtroomSchedules =
    (courtroomScheduleRows || []).map((row: any) => ({
      id: row.id,
      court_id: row.court_id ?? null,
      courtroom: row.courtroom ?? null,
      weekdays: row.weekdays ?? null,
      nth_week: row.nth_week ?? null,
      times_text: row.times_text ?? null,
      is_youth: row.is_youth ?? null,
      courtroom_type: row.courtroom_type ?? null,
      days_text: row.days_text ?? null,
      notes: row.notes ?? null,
    })) ?? [];

  return {
    court,
    cells: [],
    teamsLinks,
    courtroomSchedules,
    scheduleDates: [],
    bailHub: null,
    bailTeams: [],
    bailContacts: [],
  };
}
