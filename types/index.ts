// Court
export interface Court {
  id: number;
  name: string;
  region_id: number;
  region_name?: string;
  region_code?: string;
  has_provincial: boolean;
  has_supreme: boolean;
  is_circuit: boolean;
  is_staffed: boolean;
  address: string | null;
  phone: string | null;
  fax: string | null;
  sheriff_phone: string | null;
  bail_hub_id: number | null;
}

// Region
export interface Region {
  id: number;
  code: string;
  name: string;
}

// Court list item (minimal for index page)
export interface CourtListItem {
  id: number;
  name: string;
  region_id: number;
  region_name: string;
  is_circuit: boolean;
  has_provincial: boolean;
  has_supreme: boolean;
}

// Grouped courts by letter
export interface GroupedCourts {
  letter: string;
  courts: CourtListItem[];
}
