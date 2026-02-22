import "server-only";

import type {
  BailHub,
  CourtDetails,
  CourtroomSchedule,
  TeamsLink,
} from "@/types";
import { createServerClient } from "./supabase";

type CourtTypeFilter = "all" | "staffed" | "circuit";
type CourtLevelFilter = "all" | "pc" | "sc";

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

const supabase = createServerClient();

async function withTriageAmName(hub: BailHub | null): Promise<BailHub | null> {
  if (!hub) return hub;
  const [updated] = await attachTriageAmNames([hub]);
  return updated ?? hub;
}

async function withRegionJusticeCentreName(
  hub: BailHub | null,
): Promise<BailHub | null> {
  if (!hub?.region_id) return hub;
  const { data, error } = await supabase
    .from("bail_hubs")
    .select("name")
    .eq("region_id", hub.region_id)
    .ilike("name", "%Region Justice Centre%")
    .limit(1);
  if (error) throw new Error(error.message);
  const regionName = data?.[0]?.name ?? null;
  return { ...hub, region_justice_centre_name: regionName };
}

async function attachTriageAmNames(hubs: BailHub[]): Promise<BailHub[]> {
  const triageIds = Array.from(
    new Set(hubs.map((hub) => hub.triage_am).filter(Boolean)) as Set<number>,
  );
  if (triageIds.length === 0) return hubs;

  const { data, error } = await supabase
    .from("bail_hubs")
    .select("id, name")
    .in("id", triageIds);

  if (error) throw new Error(error.message);
  const nameMap = new Map<number, string>();
  (data || []).forEach((row: any) => {
    if (row?.id != null) nameMap.set(row.id, row.name ?? "");
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
  teams: TeamsLink[],
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
  regionId: number | null,
): Promise<BailHub | null> {
  const { data: mappingRows, error: mappingError } = await supabase
    .from("bail_hub_courts")
    .select("bail_hub_id")
    .eq("court_id", courtId)
    .limit(1);

  const mappedHubId = mappingError
    ? null
    : mappingRows?.[0]?.bail_hub_id ?? null;

  const selectHubFields =
    "id, name, region_id, court_id, sheriff_coordinator_email, sheriff_coordinator_phone, sheriff_coordinator_teams_chat, triage_time, triage_am";

  if (mappedHubId) {
    const { data: hubRows, error: hubError } = await supabase
      .from("bail_hubs")
      .select(selectHubFields)
      .eq("id", mappedHubId)
      .limit(1);
    if (hubError) throw new Error(hubError.message);
    const enriched = await withTriageAmName((hubRows?.[0] as BailHub) ?? null);
    return withRegionJusticeCentreName(enriched);
  }

  const { data: directHubRows, error: directHubError } = await supabase
    .from("bail_hubs")
    .select(selectHubFields)
    .eq("court_id", courtId)
    .limit(1);

  if (directHubError) throw new Error(directHubError.message);
  const directHub = directHubRows?.[0] as BailHub | undefined;
  if (directHub) {
    const enriched = await withTriageAmName(directHub);
    return withRegionJusticeCentreName(enriched);
  }

  if (!regionId) return null;

  const { data: regionHubs, error: regionError } = await supabase
    .from("bail_hubs")
    .select(selectHubFields)
    .eq("region_id", regionId);

  if (regionError) throw new Error(regionError.message);

  const hubs = (regionHubs || []) as BailHub[];
  const selected =
    hubs.find((hub) => /region justice centre/i.test(hub.name ?? "")) ??
    hubs.find((hub) => hub.court_id == null) ??
    hubs[0] ??
    null;
  const enriched = await withTriageAmName(selected);
  return withRegionJusticeCentreName(enriched);
}

export async function fetchCourtsIndexServer(
  params: CourtsIndexParams = {},
): Promise<CourtIndexItem[]> {
  const {
    q = "",
    region = 0,
    courtType = "all",
    courtLevel = "all",
  } = params;

  let query = supabase
    .from("courts")
    .select(
      `
        id,
        court_name,
        has_provincial,
        has_supreme,
        is_circuit,
        region_id,
        region:regions(id, name, code)
      `,
    )
    .order("court_name");

  if (region !== 0) {
    query = query.eq("region_id", region);
  }

  if (courtType === "staffed") {
    query = query.eq("is_circuit", false);
  } else if (courtType === "circuit") {
    query = query.eq("is_circuit", true);
  }

  if (courtLevel === "pc") {
    query = query.eq("has_provincial", true);
  } else if (courtLevel === "sc") {
    query = query.eq("has_supreme", true);
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
    region_name: court.region?.name ?? "Unknown",
    region_code: court.region?.code ?? "UNK",
  }));
}

export async function fetchCourtDetailsServer(
  courtId: number,
): Promise<CourtDetails | null> {
  const { data: publicCourts, error: publicError } = await supabase
    .from("courts")
    .select(
      `
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
    `,
    )
    .eq("id", courtId)
    .limit(1);

  if (publicError) throw new Error(publicError.message);
  const publicCourt = publicCourts?.[0];
  if (!publicCourt) return null;

  const parentCourtId = publicCourt.circuit_contact_court_id as number | null;

  const contactCourtIds = parentCourtId
    ? [publicCourt.id, parentCourtId]
    : [publicCourt.id];

  const contactsPromise = supabase
    .from("courts_contacts")
    .select(
      `
      id,
      court_id,
      contact_type,
      email,
      emails,
      phone,
      provincial_fax_filing,
      supreme_fax_filing,
      type:courts_contact_types(contact_type, is_provincial, is_supreme, is_appeals)
    `,
    )
    .in("court_id", contactCourtIds);

  const teamsPromise = supabase
    .from("teams_links")
    .select(
      `*, type:teams_link_types(name), courtroom_type:courtroom_types(name, full_name), bail_hub:bail_hubs(id, name, triage_time, triage_am)`,
    )
    .eq("court_id", publicCourt.id);

  const courtroomSchedulePromise = supabase
    .from("courtroom_schedules")
    .select(
      `id, court_id, courtroom, weekdays, times_text, is_youth, courtroom_type, days_text, courtroom_type_ref:courtroom_types(id, name, full_name)`,
    )
    .eq("court_id", publicCourt.id);

  const bailHubSummaryPromise = resolveBailHubForCourt(
    publicCourt.id,
    publicCourt.region_id ?? null,
  );

  const parentPromise = parentCourtId
    ? supabase
        .from("courts")
        .select("id, court_name")
        .eq("id", parentCourtId)
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

  const registryContact = mergedContacts.get("court_registry");
  const criminalRegistryContact = mergedContacts.get("criminal_registry");
  const crownGeneralContact = mergedContacts.get("crown_general");
  const jcmContact = mergedContacts.get("jcm");
  const supremeSchedulingContact = mergedContacts.get("scheduling");

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
    registry_email: getPrimaryEmail("court_registry"),
    registry_phone: registryContact?.phone ?? null,
    criminal_registry_email: getPrimaryEmail("criminal_registry"),
    criminal_registry_phone: criminalRegistryContact?.phone ?? null,
    provincial_fax_filing: registryContact?.provincial_fax_filing ?? null,
    crown_office_email: getPrimaryEmail("crown_general"),
    crown_office_phone: crownGeneralContact?.phone ?? null,
    jcm_email: getPrimaryEmail("jcm"),
    jcm_phone: jcmContact?.phone ?? null,
    supreme_scheduling_email: getPrimaryEmail("scheduling"),
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

  const courtroomSchedules: CourtroomSchedule[] =
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
