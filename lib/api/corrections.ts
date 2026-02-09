import { createClient } from "./supabase";
import type { CorrectionalCentre } from "@/types";

const supabase = createClient();

function mapCorrectionalRow(row: any): CorrectionalCentre {
  return {
    id: row.id,
    name: row.name,
    short_name: row.short_name ?? null,
    type_id: row.type_id,
    type_name: row.type?.name ?? null,
    region_id: row.region_id ?? null,
    region_name: row.region?.name ?? null,
    region_code: row.region?.code ?? null,
    address: row.address ?? null,
    general_phone: row.general_phone ?? null,
    general_phone_option: row.general_phone_option ?? null,
    general_fax: row.general_fax ?? null,
    cdn_fax: row.cdn_fax ?? null,
    accepts_cdn_by_fax: row.accepts_cdn_by_fax ?? null,
    visit_request_phone: row.visit_request_phone ?? null,
    visit_request_email: row.visit_request_email ?? null,
    virtual_visit_email: row.virtual_visit_email ?? null,
    lawyer_callback_email: row.lawyer_callback_email ?? null,
    callback_1_start: row.callback_1_start ?? null,
    callback_1_end: row.callback_1_end ?? null,
    callback_2_start: row.callback_2_start ?? null,
    callback_2_end: row.callback_2_end ?? null,
    visit_hours_inperson: row.visit_hours_inperson ?? null,
    visit_hours_virtual: row.visit_hours_virtual ?? null,
    accepts_usb: row.accepts_usb ?? null,
    accepts_hard_drive: row.accepts_hard_drive ?? null,
    accepts_cd_dvd: row.accepts_cd_dvd ?? null,
    disclosure_notes: row.disclosure_notes ?? null,
    require_padlock: row.require_padlock ?? false,
  };
}

export async function fetchCorrectionals(): Promise<CorrectionalCentre[]> {
  const { data, error } = await supabase
    .from("correctionals")
    .select(
      `
      *,
      region:regions(id, name, code),
      type:correctional_types(id, name)
    `,
    )
    .order("name");

  if (error) throw new Error(error.message);
  return (data || []).map(mapCorrectionalRow);
}

export async function fetchCorrectional(
  id: number,
): Promise<CorrectionalCentre | null> {
  const { data, error } = await supabase
    .from("correctionals")
    .select(
      `
      *,
      region:regions(id, name, code),
      type:correctional_types(id, name)
    `,
    )
    .eq("id", id)
    .limit(1);

  if (error) throw new Error(error.message);
  const row = data?.[0];
  if (!row) return null;
  return mapCorrectionalRow(row);
}
