import { createClient } from './supabase';

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
