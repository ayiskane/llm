'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Building, 
  Heart, 
  GeoAlt, 
  Telephone, 
  Globe, 
  ChevronRight,
  Funnel
} from 'react-bootstrap-icons';

// TODO: Replace with Supabase fetch when database is set up
// For now, using static data based on our schema

interface Program {
  id: number;
  name: string;
  type_code: string;
  type_name: string;
  location: string | null;
  region_id: number | null;
  region_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  indigenous_only: boolean;
  accepts_sa_records: boolean;
  is_residential: boolean;
  application_method: string | null;
  parent_organization: string | null;
  notes: string | null;
}

// Static data - will be replaced with Supabase query
const PROGRAMS: Program[] = [
  // Recovery Programs
  { id: 1, name: 'Talitha Koum', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Coquitlam', region_id: 3, region_name: 'Fraser', phone: '604-492-3393', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: null, notes: null },
  { id: 2, name: 'Glory House', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Mission', region_id: 3, region_name: 'Fraser', phone: '604-380-3665', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: null, notes: null },
  { id: 3, name: 'Lydia Home', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Mission', region_id: 3, region_name: 'Fraser', phone: '604-253-3323', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: null, notes: null },
  { id: 4, name: 'Hannah House', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Maple Ridge', region_id: 3, region_name: 'Fraser', phone: '866-466-4215', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: null, notes: null },
  { id: 5, name: 'Night & Day', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Surrey', region_id: 3, region_name: 'Fraser', phone: '778-317-4673', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: null, notes: null },
  { id: 6, name: 'Vision Quest Hart House', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Surrey', region_id: 3, region_name: 'Fraser', phone: '604-946-1841', email: null, website: null, indigenous_only: false, accepts_sa_records: true, is_residential: false, application_method: 'phone', parent_organization: null, notes: 'Will take people with SA records' },
  { id: 7, name: 'Stepping Stone', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Courtenay', region_id: 1, region_name: 'Island', phone: '250-897-0360', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'written', parent_organization: null, notes: null },
  { id: 8, name: 'Amethyst', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Campbell River', region_id: 1, region_name: 'Island', phone: '250-870-2570', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'written', parent_organization: null, notes: null },
  { id: 9, name: 'The Farm', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Port Alberni', region_id: 1, region_name: 'Island', phone: null, email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'written', parent_organization: null, notes: null },
  { id: 10, name: 'Sancta Marie', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Vancouver', region_id: 2, region_name: 'Vancouver', phone: '604-731-5550', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'written', parent_organization: null, notes: null },
  { id: 11, name: 'Turning Point (North Van)', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'North Vancouver', region_id: 2, region_name: 'Vancouver', phone: '604-971-0111', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'written', parent_organization: null, notes: null },
  { id: 12, name: 'Turning Point (Vancouver)', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Vancouver', region_id: 2, region_name: 'Vancouver', phone: '604-875-1710', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'written', parent_organization: null, notes: null },
  { id: 13, name: 'Back On Track', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Surrey', region_id: 3, region_name: 'Fraser', phone: '778-316-2625', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: null, notes: null },
  { id: 14, name: "Raven's Moon", type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Abbotsford', region_id: 3, region_name: 'Fraser', phone: '604-751-4631', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: true, application_method: 'phone', parent_organization: null, notes: 'Jeanette 604-751-4631, Tina 604-308-1767' },
  { id: 15, name: 'Ann Elmore House', type_code: 'RECOVERY', type_name: 'Recovery House', location: 'Campbell River', region_id: 1, region_name: 'Island', phone: '250-286-3666', email: null, website: null, indigenous_only: false, accepts_sa_records: false, is_residential: true, application_method: 'phone', parent_organization: null, notes: null },
  { id: 16, name: 'Phoenix', type_code: 'RECOVERY', type_name: 'Recovery House', location: null, region_id: null, region_name: null, phone: null, email: null, website: null, indigenous_only: false, accepts_sa_records: true, is_residential: false, application_method: null, parent_organization: null, notes: 'Will take people with SA records' },
  
  // FPS Clinics
  { id: 17, name: 'Kamloops Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Kamloops', region_id: 4, region_name: 'Interior', phone: '250-377-2660', email: 'KamloopsAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: null },
  { id: 18, name: 'Kelowna Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Kelowna', region_id: 4, region_name: 'Interior', phone: '778-940-2100', email: 'KelownaAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: null },
  { id: 19, name: 'Nanaimo Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Nanaimo', region_id: 1, region_name: 'Island', phone: '250-739-5000', email: 'NanaimoAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: null },
  { id: 20, name: 'Prince George Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Prince George', region_id: 5, region_name: 'Northern', phone: '250-561-8060', email: 'PrinceGeorgeAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: null },
  { id: 21, name: 'Surrey Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Surrey', region_id: 3, region_name: 'Fraser', phone: '604-529-3300', email: 'SurreyAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: null },
  { id: 22, name: 'Vancouver Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Vancouver', region_id: 2, region_name: 'Vancouver', phone: '604-529-3350', email: 'VancouverAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: 'Contact for overnight assessments' },
  { id: 23, name: 'Victoria Forensic Regional Clinic', type_code: 'FPS', type_name: 'Forensic Psychiatric Services', location: 'Victoria', region_id: 1, region_name: 'Island', phone: '250-213-4500', email: 'VictoriaAdmitting@phsa.ca', website: null, indigenous_only: false, accepts_sa_records: false, is_residential: false, application_method: 'referral', parent_organization: 'PHSA', notes: null },
  
  // Indigenous Justice Centres
  { id: 24, name: 'Chilliwack Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Chilliwack', region_id: 3, region_name: 'Fraser', phone: '778-704-1355', email: 'chilliwackinfo@bcfnjc.com', website: 'https://bcfnjc.com/chilliwack-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 25, name: 'Kelowna Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Kelowna', region_id: 4, region_name: 'Interior', phone: '236-763-6881', email: 'kelownainfo@bcfnjc.com', website: 'https://bcfnjc.com/kelowna-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 26, name: 'Merritt Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Merritt', region_id: 4, region_name: 'Interior', phone: '236-575-3004', email: 'merrittinfo@bcfnjc.com', website: 'https://bcfnjc.com/merritt-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 27, name: 'Nanaimo Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Nanaimo', region_id: 1, region_name: 'Island', phone: '778-762-4061', email: 'nanaimoinfo@bcfnjc.com', website: 'https://bcfnjc.com/nanaimo-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 28, name: 'Prince George Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Prince George', region_id: 5, region_name: 'Northern', phone: '250-645-5519', email: 'pginfo@bcfnjc.com', website: 'https://bcfnjc.com/prince-george-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 29, name: 'Prince Rupert Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Prince Rupert', region_id: 5, region_name: 'Northern', phone: '778-622-3563', email: 'prinfo@bcfnjc.com', website: 'https://bcfnjc.com/prince-rupert-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 30, name: 'Surrey Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Surrey', region_id: 3, region_name: 'Fraser', phone: '236-947-6777', email: 'surreyinfo@bcfnjc.com', website: 'https://bcfnjc.com/surrey-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 31, name: 'Vancouver Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Vancouver', region_id: 2, region_name: 'Vancouver', phone: '236-455-6565', email: 'vancouverinfo@bcfnjc.com', website: 'https://bcfnjc.com/vancouver-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 32, name: 'Victoria Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Victoria', region_id: 1, region_name: 'Island', phone: '250-419-9665', email: 'victoriainfo@bcfnjc.com', website: 'https://bcfnjc.com/victoria-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
  { id: 33, name: 'Virtual Indigenous Justice Centre', type_code: 'IJC', type_name: 'Indigenous Justice Centre', location: 'Virtual', region_id: null, region_name: null, phone: '1-866-786-0081', email: 'virtual@bcfnjc.com', website: 'https://bcfnjc.com/virtual-indigenous-justice-centre/', indigenous_only: true, accepts_sa_records: false, is_residential: false, application_method: 'phone', parent_organization: 'BCFNJC', notes: null },
];

type FilterType = 'all' | 'RECOVERY' | 'FPS' | 'IJC';

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  RECOVERY: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  FPS: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  IJC: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
};

function ProgramCard({ program }: { program: Program }) {
  const colors = TYPE_COLORS[program.type_code] || TYPE_COLORS.RECOVERY;
  
  return (
    <div className={`p-4 bg-zinc-900 border ${colors.border} rounded-xl`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-white">{program.name}</h3>
            {program.indigenous_only && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                Indigenous
              </span>
            )}
            {program.accepts_sa_records && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                Accepts SA
              </span>
            )}
            {program.is_residential && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                Residential
              </span>
            )}
          </div>
          <p className={`text-xs mt-1 ${colors.text}`}>{program.type_name}</p>
          {program.location && (
            <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
              <GeoAlt className="w-3 h-3" />
              {program.location}
              {program.region_name && ` · R${program.region_id} ${program.region_name}`}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-3 space-y-1">
        {program.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Telephone className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-white font-mono text-xs">{program.phone}</span>
          </div>
        )}
        {program.email && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-500 text-xs">@</span>
            <span className="text-zinc-400 text-xs truncate">{program.email}</span>
          </div>
        )}
        {program.website && (
          <a 
            href={program.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="text-xs">Website</span>
          </a>
        )}
      </div>
      
      {program.notes && (
        <p className="text-xs text-zinc-500 mt-2 pt-2 border-t border-zinc-800">{program.notes}</p>
      )}
      
      {program.application_method && (
        <p className="text-xs text-zinc-600 mt-2">
          Apply by: {program.application_method === 'phone' ? 'Phone call' : program.application_method === 'written' ? 'Written application' : 'Referral'}
        </p>
      )}
    </div>
  );
}

const regions = [
  { id: 1, name: 'Island' },
  { id: 2, name: 'Vancouver' },
  { id: 3, name: 'Fraser' },
  { id: 4, name: 'Interior' },
  { id: 5, name: 'Northern' },
];

// Inner component that uses useSearchParams
function ProgramsContent() {
  const searchParams = useSearchParams();
  const regionParam = searchParams.get('region');
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [regionFilter, setRegionFilter] = useState<number | null>(
    regionParam ? parseInt(regionParam) : null
  );

  const filteredPrograms = useMemo(() => {
    return PROGRAMS.filter(p => {
      if (activeFilter !== 'all' && p.type_code !== activeFilter) return false;
      if (regionFilter !== null && p.region_id !== regionFilter) return false;
      return true;
    });
  }, [activeFilter, regionFilter]);

  const counts = useMemo(() => ({
    all: PROGRAMS.length,
    RECOVERY: PROGRAMS.filter(p => p.type_code === 'RECOVERY').length,
    FPS: PROGRAMS.filter(p => p.type_code === 'FPS').length,
    IJC: PROGRAMS.filter(p => p.type_code === 'IJC').length,
  }), []);

  return (
    <>
      {/* BCFNJC Banner */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
        <h2 className="text-sm font-medium text-purple-400 mb-2">BC First Nations Justice Council</h2>
        <div className="text-sm space-y-1">
          <p className="text-zinc-400">Toll-free: <span className="text-white font-mono">1-877-602-4858</span></p>
          <p className="text-zinc-400">Virtual IJC: <span className="text-white font-mono">1-866-786-0081</span></p>
        </div>
      </div>

      {/* Type Filters */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
            activeFilter === 'all'
              ? 'bg-zinc-800 text-white'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setActiveFilter('RECOVERY')}
          className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
            activeFilter === 'RECOVERY'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Recovery ({counts.RECOVERY})
        </button>
        <button
          onClick={() => setActiveFilter('FPS')}
          className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
            activeFilter === 'FPS'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Forensic ({counts.FPS})
        </button>
        <button
          onClick={() => setActiveFilter('IJC')}
          className={`px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
            activeFilter === 'IJC'
              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
              : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'
          }`}
        >
          Indigenous ({counts.IJC})
        </button>
      </div>

      {/* Region Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <Funnel className="w-4 h-4 text-zinc-500 flex-shrink-0" />
        <button
          onClick={() => setRegionFilter(null)}
          className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
            regionFilter === null
              ? 'bg-zinc-700 text-white'
              : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
          }`}
        >
          All Regions
        </button>
        {regions.map(r => (
          <button
            key={r.id}
            onClick={() => setRegionFilter(r.id)}
            className={`px-2 py-1 rounded text-xs whitespace-nowrap transition-colors ${
              regionFilter === r.id
                ? 'bg-zinc-700 text-white'
                : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
            }`}
          >
            R{r.id} {r.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filteredPrograms.length === 0 ? (
          <p className="text-zinc-500 text-center py-8">No programs match your filters</p>
        ) : (
          filteredPrograms.map(program => (
            <ProgramCard key={program.id} program={program} />
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 pt-6 border-t border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-500 mb-3">Related</h2>
        <div className="flex gap-2">
          <Link
            href="/correctional-centres"
            className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors text-center"
          >
            <span className="text-sm text-zinc-400">Correctional Centres</span>
          </Link>
        </div>
      </div>
    </>
  );
}

// Loading fallback
function ProgramsLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-24 bg-zinc-900 rounded-xl" />
      <div className="flex gap-2">
        <div className="h-10 w-20 bg-zinc-900 rounded-lg" />
        <div className="h-10 w-24 bg-zinc-900 rounded-lg" />
        <div className="h-10 w-24 bg-zinc-900 rounded-lg" />
      </div>
      <div className="space-y-3">
        <div className="h-32 bg-zinc-900 rounded-xl" />
        <div className="h-32 bg-zinc-900 rounded-xl" />
        <div className="h-32 bg-zinc-900 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/95 backdrop-blur border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold">Programs</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Suspense fallback={<ProgramsLoading />}>
          <ProgramsContent />
        </Suspense>
      </div>
    </div>
  );
}
