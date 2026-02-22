import { createClient } from './supabase';
import type {
  BailHub,
  BailDetails,
  BailSchedules,
  BailCrownScheduleItem,
  BailJudgeScheduleItem,
  CourtScheduleDate,
  CourtroomSchedule,
  CrownScheduleItem,
  DutyCounselScheduleItem,
  JudgeScheduleItem,
  ProvincialSchedules,
  SheriffCell,
  TeamsLink,
} from '@/types';

type CourtTypeFilter = 'all' | 'staffed' | 'circuit';
type CourtLevelFilter = 'all' | 'pc' | 'sc';

interface CourtsIndexParams {
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

const BAIL_CONTACT_LABELS: Record<string, string> = {
  crown_bail: 'Bail Crown',
  crown_525: '525 Crown',
  crown_remand: 'Remand Crown',
  jcm_bail: 'Bail JCM',
  crown_youth_bail: "Bail Crown (Youth)",
};

function formatBailContactLabel(contactType: string | null): string | null {
  if (!contactType) return null;
  const mapped = BAIL_CONTACT_LABELS[contactType];
  if (mapped) return mapped;
  return contactType
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

async function withTriageAmName(hub: BailHub | null): Promise<BailHub | null> {
  if (!hub) return hub;
  const [updated] = await attachTriageAmNames([hub]);
  return updated ?? hub;
}

async function withRegionJusticeCentreName(
  hub: BailHub | null
): Promise<BailHub | null> {
  if (!hub?.region_id) return hub;
  const { data, error } = await supabase
    .from('bail_hubs')
    .select('name')
    .eq('region_id', hub.region_id)
    .ilike('name', '%Region Justice Centre%')
    .limit(1);
  if (error) throw new Error(error.message);
  const regionName = data?.[0]?.name ?? null;
  return { ...hub, region_justice_centre_name: regionName };
}

async function attachTriageAmNames(hubs: BailHub[]): Promise<BailHub[]> {
  const triageIds = Array.from(
    new Set(hubs.map((hub) => hub.triage_am).filter(Boolean)) as Set<number>
  );
  if (triageIds.length === 0) return hubs;

  const { data, error } = await supabase
    .from('bail_hubs')
    .select('id, name')
    .in('id', triageIds);

  if (error) throw new Error(error.message);
  const nameMap = new Map<number, string>();
  (data || []).forEach((row: any) => {
    if (row?.id != null) nameMap.set(row.id, row.name ?? '');
  });

  return hubs.map((hub) => {
    if (!hub.triage_am) return hub;
    return {
      ...hub,
      triage_am_name: nameMap.get(hub.triage_am) ?? null,
    };
  });
}

async function attachTriageAmNamesToTeams(
  teams: TeamsLink[]
): Promise<TeamsLink[]> {
  const hubs = teams
    .map((team) => team.bail_hub)
    .filter(Boolean) as BailHub[];
  if (hubs.length === 0) return teams;

  const unique = new Map<number, BailHub>();
  hubs.forEach((hub) => unique.set(hub.id, hub));
  const enriched = await attachTriageAmNames(Array.from(unique.values()));
  const byId = new Map(enriched.map((hub) => [hub.id, hub]));

  return teams.map((team) => {
    if (!team.bail_hub_id) return team;
    const nextHub = byId.get(team.bail_hub_id);
    if (!nextHub) return team;
    return { ...team, bail_hub: nextHub };
  });
}

async function resolveBailHubForCourt(
  courtId: number,
  regionId: number | null
): Promise<BailHub | null> {
  const { data: mappingRows, error: mappingError } = await supabase
    .from('bail_hub_courts')
    .select('bail_hub_id')
    .eq('court_id', courtId)
    .limit(1);

  const mappedHubId = mappingError ? null : mappingRows?.[0]?.bail_hub_id ?? null;

  const selectHubFields =
    'id, name, region_id, court_id, sheriff_coordinator_email, sheriff_coordinator_phone, sheriff_coordinator_teams_chat, triage_time, triage_am';

  if (mappedHubId) {
    const { data: hubRows, error: hubError } = await supabase
      .from('bail_hubs')
      .select(selectHubFields)
      .eq('id', mappedHubId)
      .limit(1);
    if (hubError) throw new Error(hubError.message);
    const enriched = await withTriageAmName(
      (hubRows?.[0] as BailHub) ?? null
    );
    return withRegionJusticeCentreName(enriched);
  }

  const { data: directHubRows, error: directHubError } = await supabase
    .from('bail_hubs')
    .select(selectHubFields)
    .eq('court_id', courtId)
    .limit(1);

  if (directHubError) throw new Error(directHubError.message);
  const directHub = directHubRows?.[0] as BailHub | undefined;
  if (directHub) {
    const enriched = await withTriageAmName(directHub);
    return withRegionJusticeCentreName(enriched);
  }

  if (!regionId) return null;

  const { data: regionHubs, error: regionError } = await supabase
    .from('bail_hubs')
    .select(selectHubFields)
    .eq('region_id', regionId);

  if (regionError) throw new Error(regionError.message);

  const hubs = (regionHubs || []) as BailHub[];
  const selected =
    hubs.find((hub) => /region justice centre/i.test(hub.name ?? '')) ??
    hubs.find((hub) => hub.court_id == null) ??
    hubs[0] ??
    null
  ;
  const enriched = await withTriageAmName(selected);
  return withRegionJusticeCentreName(enriched);
}

export async function fetchCourtScheduleDates(courtId: number): Promise<CourtScheduleDate[]> {
  const { data, error } = await supabase
    .from('court_schedules')
    .select(`
      id,
      court_id,
      schedule_type,
      schedule_dates:court_schedule_dates(id, date_start, date_end)
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
        schedule_type: schedule.schedule_type ?? null,
      });
    }
  }

  return flattened.sort((a, b) => {
    const aDate = new Date(a.date_start).getTime();
    const bDate = new Date(b.date_start).getTime();
    return aDate - bDate;
  });
}

export async function fetchProvincialSchedules(
  courtId: number
): Promise<ProvincialSchedules> {
  const crownPromise = supabase
    .from('courtroom_crown_schedules')
    .select(
      `
        id,
        schedule_date,
        courtroom,
        crown_role_code,
        crown_contact:crown_contacts(id, full_name, email, phone),
        crown_role:crown_roles(id, code, full_name)
      `
    )
    .eq('court_id', courtId);

  const judgePromise = supabase
    .from('bail_judge_schedules')
    .select(
      `
        id,
        schedule_date,
        judge:judge_contacts(id, full_name),
        bail_hub:bail_hubs(id, name)
      `
    )
    .eq('court_id', courtId);

  const [
    { data: crownRows, error: crownError },
    { data: judgeRows, error: judgeError },
  ] = await Promise.all([crownPromise, judgePromise]);

  if (crownError) throw new Error(crownError.message);
  if (judgeError) throw new Error(judgeError.message);

  const crownSchedules: CrownScheduleItem[] = (crownRows || []).map(
    (row: any) => ({
      id: row.id,
      schedule_date: row.schedule_date,
      courtroom: row.courtroom ?? null,
      crown_name: row.crown_contact?.full_name ?? 'Unknown',
      crown_role_code: row.crown_role_code ?? row.crown_role?.code ?? null,
      crown_role_label: row.crown_role?.full_name ?? null,
    })
  );

  crownSchedules.sort((a, b) => {
    const aDate = new Date(a.schedule_date).getTime();
    const bDate = new Date(b.schedule_date).getTime();
    if (aDate !== bDate) return aDate - bDate;
    const aRoom = a.courtroom ?? 0;
    const bRoom = b.courtroom ?? 0;
    if (aRoom !== bRoom) return aRoom - bRoom;
    return a.crown_name.localeCompare(b.crown_name);
  });

  const judgeSchedules: JudgeScheduleItem[] = (judgeRows || []).map(
    (row: any) => ({
      id: row.id,
      schedule_date: row.schedule_date,
      judge_name: row.judge?.full_name ?? 'Unknown',
      bail_hub_name: row.bail_hub?.name ?? null,
    })
  );

  judgeSchedules.sort((a, b) => {
    const aDate = new Date(a.schedule_date).getTime();
    const bDate = new Date(b.schedule_date).getTime();
    if (aDate !== bDate) return aDate - bDate;
    return a.judge_name.localeCompare(b.judge_name);
  });

  return { crownSchedules, judgeSchedules };
}

export async function fetchBailSchedules(
  bailHubId: number
): Promise<BailSchedules> {
  const crownPromise = supabase
    .from('bail_crown_schedules')
    .select(
      `
          id,
          schedule_date,
          bail_hub_id,
          bail_crown_role_code,
          crown_contact:crown_contacts(id, full_name, email, phone),
          crown_role:crown_roles(code, full_name)
        `
    )
    .eq('bail_hub_id', bailHubId);
  const badgePromise = supabase
    .from('bail_crown_schedule_view')
    .select('id, badge_label')
    .eq('bail_hub_id', bailHubId);

  const judgePromise = supabase
    .from('bail_judge_schedules')
    .select(
      `
        id,
        schedule_date,
        judge:judge_contacts(id, full_name),
        bail_hub:bail_hubs(id, name)
      `
    )
    .eq('bail_hub_id', bailHubId);

  const dutyCounselPromise = supabase
    .from('dc_schedules')
    .select(
      `
        id,
        schedule_date,
        role,
        is_am,
        is_pm,
        dc_contact:dc_contacts(id, full_name, email, phone)
      `
    )
    .eq('bail_hub_id', bailHubId);

    const [
      { data: crownRows, error: crownError },
      { data: judgeRows, error: judgeError },
      { data: dutyCounselRows, error: dutyCounselError },
      { data: badgeRows, error: badgeError },
    ] = await Promise.all([
      crownPromise,
      judgePromise,
      dutyCounselPromise,
      badgePromise,
    ]);

    if (crownError) throw new Error(crownError.message);
    if (badgeError) throw new Error(badgeError.message);
  if (judgeError) throw new Error(judgeError.message);
  if (dutyCounselError) throw new Error(dutyCounselError.message);

    const badgeMap = new Map<number, string | null>();
    (badgeRows || []).forEach((row: any) => {
      badgeMap.set(row.id, row.badge_label ?? null);
    });

    const crownSchedules: BailCrownScheduleItem[] = (crownRows || []).map(
      (row: any) => ({
        id: row.id,
        schedule_date: row.schedule_date,
        crown_name: row.crown_contact?.full_name ?? 'Unknown',
        crown_email: row.crown_contact?.email ?? null,
        crown_phone: row.crown_contact?.phone ?? null,
        crown_role_code: row.bail_crown_role_code ?? row.crown_role?.code ?? null,
        crown_role_label: row.crown_role?.full_name ?? null,
        badge_label: badgeMap.get(row.id) ?? null,
      })
    );

  crownSchedules.sort((a, b) => {
    const aDate = new Date(a.schedule_date).getTime();
    const bDate = new Date(b.schedule_date).getTime();
    if (aDate !== bDate) return aDate - bDate;
    return a.crown_name.localeCompare(b.crown_name);
  });

  const judgeSchedules: BailJudgeScheduleItem[] = (judgeRows || []).map(
    (row: any) => ({
      id: row.id,
      schedule_date: row.schedule_date,
      judge_name: row.judge?.full_name ?? 'Unknown',
      bail_hub_name: row.bail_hub?.name ?? null,
    })
  );

  judgeSchedules.sort((a, b) => {
    const aDate = new Date(a.schedule_date).getTime();
    const bDate = new Date(b.schedule_date).getTime();
    if (aDate !== bDate) return aDate - bDate;
    return a.judge_name.localeCompare(b.judge_name);
  });

  const dutyCounselSchedules: DutyCounselScheduleItem[] = (
    dutyCounselRows || []
  ).map((row: any) => ({
      id: row.id,
      schedule_date: row.schedule_date,
      duty_counsel_name: row.dc_contact?.full_name ?? 'Unknown',
      duty_counsel_email: row.dc_contact?.email ?? null,
      duty_counsel_phone: row.dc_contact?.phone ?? null,
      role: row.role ?? null,
      is_am: row.is_am ?? null,
      is_pm: row.is_pm ?? null,
    }));

  dutyCounselSchedules.sort((a, b) => {
    const aDate = new Date(a.schedule_date).getTime();
    const bDate = new Date(b.schedule_date).getTime();
    if (aDate !== bDate) return aDate - bDate;
    return a.duty_counsel_name.localeCompare(b.duty_counsel_name);
  });

  return { crownSchedules, judgeSchedules, dutyCounselSchedules };
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
    .select(
      `*, type:teams_link_types(name), courtroom_type:courtroom_types(name, full_name), bail_hub:bail_hubs(id, name, triage_time, triage_am)`
    )
    .eq('court_id', publicCourt.id);

  const courtroomSchedulePromise = supabase
    .from('courtroom_schedules')
    .select(
      `id, court_id, courtroom, weekdays, times_text, is_youth, courtroom_type, days_text, courtroom_type_ref:courtroom_types(id, name, full_name)`
    )
    .eq('court_id', publicCourt.id);

  const bailHubSummaryPromise = resolveBailHubForCourt(
    publicCourt.id,
    publicCourt.region_id ?? null
  );

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
    bailHubSummary,
  ] = await Promise.all([
    contactsPromise,
    teamsPromise,
    courtroomSchedulePromise,
    parentPromise,
    bailHubSummaryPromise,
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

  let teamsLinks =
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
      courtroom_type_full_name: row.courtroom_type?.full_name ?? null,
      courtroom: row.courtroom ?? null,
      display_order: row.display_order ?? null,
      phone_number: row.phone_number ?? null,
      toll_free_number: row.toll_free_number ?? null,
      conference_id: row.conference_id ?? null,
      bail_hub_id: row.bail_hub_id ?? null,
      bail_hub: row.bail_hub
        ? {
            id: row.bail_hub.id,
            name: row.bail_hub.name,
            triage_time: row.bail_hub.triage_time ?? null,
            triage_am: row.bail_hub.triage_am ?? null,
          }
        : null,
    })) ?? [];

  teamsLinks = await attachTriageAmNamesToTeams(teamsLinks);

    const courtroomSchedules =
      (courtroomScheduleRows || []).map((row: any) => ({
        id: row.id,
        court_id: row.court_id ?? null,
        courtroom: row.courtroom ?? null,
        weekdays: row.weekdays ?? null,
        times_text: row.times_text ?? null,
        is_youth: row.is_youth ?? null,
        courtroom_type: row.courtroom_type ?? null,
        courtroom_type_name:
          row.courtroom_type_ref?.name ??
          row.courtroom_type_ref?.full_name ??
          null,
        days_text: row.days_text ?? null,
      })) ?? [];

  return {
    court,
    teamsLinks,
    courtroomSchedules,
    scheduleDates: [],
    bailHub: bailHubSummary ?? null,
  };
}

export async function fetchBailDetails(
  courtId: number,
  regionId: number | null
): Promise<BailDetails> {
  const bailHub = await resolveBailHubForCourt(courtId, regionId);

  let bailTeams: TeamsLink[] = [];
  let bailContacts: BailDetails['bailContacts'] = [];
  if (bailHub) {
    const { data: bailTeamRows, error: bailTeamError } = await supabase
      .from('teams_links')
      .select(
        `*, type:teams_link_types(name), courtroom_type:courtroom_types(name, full_name), bail_hub:bail_hubs(id, name, triage_time, triage_am)`
      )
      .eq('bail_hub_id', bailHub.id);

    if (bailTeamError) throw new Error(bailTeamError.message);
    bailTeams =
      (bailTeamRows || []).map((row: any) => ({
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
        courtroom_type_full_name: row.courtroom_type?.full_name ?? null,
        courtroom: row.courtroom ?? null,
        display_order: row.display_order ?? null,
        phone_number: row.phone_number ?? null,
        toll_free_number: row.toll_free_number ?? null,
        conference_id: row.conference_id ?? null,
        bail_hub_id: row.bail_hub_id ?? null,
        bail_hub: row.bail_hub
          ? {
              id: row.bail_hub.id,
              name: row.bail_hub.name,
              triage_time: row.bail_hub.triage_time ?? null,
              triage_am: row.bail_hub.triage_am ?? null,
            }
          : null,
      })) ?? [];

    bailTeams = await attachTriageAmNamesToTeams(bailTeams);

    const { data: bailContactRows, error: bailContactError } = await supabase
      .from('bail_hub_contacts')
      .select(
        'id, bail_hub_id, contact_type, is_daytime, contact:bail_contacts(id, email, phone)'
      )
      .eq('bail_hub_id', bailHub.id);

    if (bailContactError) throw new Error(bailContactError.message);
    bailContacts =
      (bailContactRows || []).map((row: any) => ({
        id: row.id,
        bail_hub_id: row.bail_hub_id ?? null,
        contact_type: row.contact_type ?? null,
        email: row.contact?.email ?? null,
        phone: row.contact?.phone ?? null,
        is_daytime: row.is_daytime ?? null,
        label: formatBailContactLabel(row.contact_type ?? null),
      })) ?? [];
  }

  let cells: SheriffCell[] = [];
  const { data: sheriffCellRows, error: sheriffCellError } = await supabase
    .from('sheriff_cells_courts')
    .select(
      `sheriff_cell:sheriff_cells(id, name, type_id, region_id, phones, catchment, type:sheriff_cell_types(name))`
    )
    .eq('court_id', courtId);

  if (sheriffCellError) throw new Error(sheriffCellError.message);
  const mappedCells =
    (sheriffCellRows || [])
      .map((row: any) => row.sheriff_cell)
      .filter(Boolean)
      .map((row: any) => ({
        id: row.id,
        name: row.name,
        type_id: row.type_id ?? null,
        type_name: row.type?.name ?? null,
        region_id: row.region_id ?? null,
        phones: row.phones ?? null,
        catchment: row.catchment ?? null,
      })) ?? [];

  cells = mappedCells;

  return {
    bailHub,
    bailTeams,
    bailContacts,
    cells,
  };
}

export async function fetchBailHubDetails(
  bailHubId: number
): Promise<{
  bailHub: BailHub | null;
  bailTeams: TeamsLink[];
  bailContacts: BailDetails['bailContacts'];
  cells: SheriffCell[];
  courtroomSchedules: CourtroomSchedule[];
}> {
  const { data: hubRows, error: hubError } = await supabase
    .from('bail_hubs')
    .select(
      'id, name, region_id, court_id, sheriff_coordinator_email, sheriff_coordinator_phone, sheriff_coordinator_teams_chat, triage_time, triage_am'
    )
    .eq('id', bailHubId)
    .limit(1);

  if (hubError) throw new Error(hubError.message);
  let bailHub: BailHub | null = (hubRows?.[0] as BailHub) ?? null;
  bailHub = await withTriageAmName(bailHub);
  bailHub = await withRegionJusticeCentreName(bailHub);
  if (!bailHub) {
    return {
      bailHub: null,
      bailTeams: [],
      bailContacts: [],
      cells: [],
      courtroomSchedules: [],
    };
  }

  const { data: bailTeamRows, error: bailTeamError } = await supabase
    .from('teams_links')
    .select(
      `*, type:teams_link_types(name), courtroom_type:courtroom_types(name, full_name), bail_hub:bail_hubs(id, name, triage_time, triage_am)`
    )
    .eq('bail_hub_id', bailHub.id);

  if (bailTeamError) throw new Error(bailTeamError.message);
  let bailTeams =
    (bailTeamRows || []).map((row: any) => ({
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
      courtroom_type_full_name: row.courtroom_type?.full_name ?? null,
      courtroom: row.courtroom ?? null,
      display_order: row.display_order ?? null,
      phone_number: row.phone_number ?? null,
      toll_free_number: row.toll_free_number ?? null,
      conference_id: row.conference_id ?? null,
      bail_hub_id: row.bail_hub_id ?? null,
      bail_hub: row.bail_hub
        ? {
            id: row.bail_hub.id,
            name: row.bail_hub.name,
            triage_time: row.bail_hub.triage_time ?? null,
            triage_am: row.bail_hub.triage_am ?? null,
          }
        : null,
    })) ?? [];

  bailTeams = await attachTriageAmNamesToTeams(bailTeams);

  const { data: bailContactRows, error: bailContactError } = await supabase
    .from('bail_hub_contacts')
    .select(
      'id, bail_hub_id, contact_type, is_daytime, contact:bail_contacts(id, email, phone)'
    )
    .eq('bail_hub_id', bailHub.id);

  if (bailContactError) throw new Error(bailContactError.message);
  const bailContacts =
    (bailContactRows || []).map((row: any) => ({
      id: row.id,
      bail_hub_id: row.bail_hub_id ?? null,
      contact_type: row.contact_type ?? null,
      email: row.contact?.email ?? null,
      phone: row.contact?.phone ?? null,
      is_daytime: row.is_daytime ?? null,
      label: formatBailContactLabel(row.contact_type ?? null),
    })) ?? [];

  let cells: SheriffCell[] = [];
  const isVr9Hub =
    bailHub.id === 3 || bailHub.name?.trim().toUpperCase() === 'VR9';
  if (isVr9Hub) {
    const { data: hubCourts, error: hubCourtsError } = await supabase
      .from('bail_hub_courts')
      .select('court_id')
      .eq('bail_hub_id', bailHub.id);

    if (hubCourtsError) throw new Error(hubCourtsError.message);
    const courtIds =
      (hubCourts || [])
        .map((row: any) => row.court_id)
        .filter((id: number | null) => id != null) ?? [];

    if (courtIds.length > 0) {
      const { data: sheriffCellRows, error: sheriffCellError } =
        await supabase
          .from('sheriff_cells_courts')
          .select(
            `sheriff_cell:sheriff_cells(id, name, type_id, region_id, phones, catchment, type:sheriff_cell_types(name))`
          )
          .in('court_id', courtIds);

      if (sheriffCellError) throw new Error(sheriffCellError.message);
      const mapped =
        (sheriffCellRows || [])
          .map((row: any) => row.sheriff_cell)
          .filter(Boolean)
          .map((row: any) => ({
            id: row.id,
            name: row.name,
            type_id: row.type_id ?? null,
            type_name: row.type?.name ?? null,
            region_id: row.region_id ?? null,
            phones: row.phones ?? null,
            catchment: row.catchment ?? null,
          })) ?? [];
      const unique = new Map<number, SheriffCell>();
      mapped.forEach((cell: SheriffCell) => {
        unique.set(cell.id, cell);
      });
      cells = Array.from(unique.values());
    }
  } else if (bailHub.court_id != null) {
    const { data: sheriffCellRows, error: sheriffCellError } = await supabase
      .from('sheriff_cells_courts')
      .select(
        `sheriff_cell:sheriff_cells(id, name, type_id, region_id, phones, catchment, type:sheriff_cell_types(name))`
      )
      .eq('court_id', bailHub.court_id);

    if (sheriffCellError) throw new Error(sheriffCellError.message);
    cells =
      (sheriffCellRows || [])
        .map((row: any) => row.sheriff_cell)
        .filter(Boolean)
        .map((row: any) => ({
          id: row.id,
          name: row.name,
          type_id: row.type_id ?? null,
          type_name: row.type?.name ?? null,
          region_id: row.region_id ?? null,
          phones: row.phones ?? null,
          catchment: row.catchment ?? null,
        })) ?? [];
  }

  let courtroomSchedules: CourtroomSchedule[] = [];
  if (bailHub.court_id != null) {
    const { data: scheduleRows, error: scheduleError } = await supabase
      .from('courtroom_schedules')
      .select(
        `id, court_id, courtroom, weekdays, times_text, is_youth, courtroom_type, days_text, courtroom_type_ref:courtroom_types(id, name, full_name)`
      )
      .eq('court_id', bailHub.court_id);

    if (scheduleError) throw new Error(scheduleError.message);
    courtroomSchedules =
      (scheduleRows || []).map((row: any) => ({
        id: row.id,
        court_id: row.court_id ?? null,
        courtroom: row.courtroom ?? null,
        weekdays: row.weekdays ?? null,
        times_text: row.times_text ?? null,
        is_youth: row.is_youth ?? null,
        courtroom_type: row.courtroom_type ?? null,
        courtroom_type_name:
          row.courtroom_type_ref?.name ??
          row.courtroom_type_ref?.full_name ??
          null,
        days_text: row.days_text ?? null,
      })) ?? [];
  }

  return {
    bailHub,
    bailTeams,
    bailContacts,
    cells,
    courtroomSchedules,
  };
}
