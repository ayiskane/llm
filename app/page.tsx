'use client';

import { useState, useCallback, memo, useMemo, useEffect } from 'react';
import { Court, CourtRegion, CourtContacts } from '@/types/database';
import { 
  ChevronLeft, ChevronRight, Check, Copy,
  Building2, MapPin, Scale, Home, Users, Shield, Briefcase, Gavel
} from 'lucide-react';
import { 
  NavButton, CourtCard, ContactSection, Toast, SearchInput, RegionFilter 
} from './components/ui';
import { 
  useClipboard, useCourts, useFilteredCourts, useDaytime, useHubCourt 
} from '@/lib/hooks';
import { BAIL_CONTACTS, BAIL_COLOR_CLASSES } from '@/lib/constants/bail-contacts';

// Constants
const REGIONS: CourtRegion[] = ['Fraser', 'Interior', 'North', 'Vancouver Island', 'Vancouver Coastal'];
const REGION_CODES: Record<string, string> = {
  'Vancouver Island': 'R1',
  'Vancouver Coastal': 'R2',
  'Fraser': 'R3',
  'Interior': 'R4',
  'North': 'R5'
};

type NavTab = 'home' | 'courts' | 'bail' | 'police' | 'custody' | 'services';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('courts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<CourtRegion | 'All'>('All');
  const [hideCircuit, setHideCircuit] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [courtLevel, setCourtLevel] = useState<'provincial' | 'supreme'>('provincial');

  const { courts, loading } = useCourts();
  const { copiedField, copyToClipboard } = useClipboard();
  const { filteredCourts, staffedCourts, circuitCourts } = useFilteredCourts(
    courts, searchQuery, selectedRegion, hideCircuit
  );
  const hubCourt = useHubCourt(selectedCourt, courts);

  const handleSelectCourt = useCallback((court: Court) => setSelectedCourt(court), []);
  const handleBack = useCallback(() => setSelectedCourt(null), []);
  const handleClearSearch = useCallback(() => setSearchQuery(''), []);
  const handleRegionSelect = useCallback((region: string) => setSelectedRegion(region as CourtRegion | 'All'), []);
  const handleToggleCircuit = useCallback(() => setHideCircuit(prev => !prev), []);

  if (selectedCourt) {
    return (
      <CourtDetailView
        court={selectedCourt}
        hubCourt={hubCourt}
        onBack={handleBack}
        copiedField={copiedField}
        onCopy={copyToClipboard}
        courtLevel={courtLevel}
        setCourtLevel={setCourtLevel}
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <header className="flex-shrink-0 px-4 pt-2 pb-3 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <h1 className="text-xl font-bold mb-3">BC Legal Directory</h1>
        {activeTab === 'courts' && (
          <>
            <SearchInput value={searchQuery} onChange={setSearchQuery} onClear={handleClearSearch} placeholder="Search courts..." />
            <div className="mt-3">
              <RegionFilter regions={REGIONS} selectedRegion={selectedRegion} onSelect={handleRegionSelect} hideCircuit={hideCircuit} onToggleCircuit={handleToggleCircuit} />
            </div>
          </>
        )}
      </header>

      <main className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
        {activeTab === 'courts' && <CourtsTab loading={loading} filteredCourts={filteredCourts} staffedCourts={staffedCourts} circuitCourts={circuitCourts} selectedRegion={selectedRegion} onSelectCourt={handleSelectCourt} />}
        {activeTab === 'home' && <HomeTab onNavigate={setActiveTab} />}
        {activeTab === 'bail' && <BailPage copiedField={copiedField} onCopy={copyToClipboard} />}
        {activeTab === 'police' && <PlaceholderTab icon={Shield} message="Police & RCMP contacts coming soon" />}
        {activeTab === 'custody' && <PlaceholderTab icon={Users} message="Correctional facilities coming soon" />}
      </main>

      <nav className="flex-shrink-0 flex border-t border-zinc-800 bg-zinc-900 pb-1">
        <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={Building2} label="Courts" active={activeTab === 'courts'} onClick={() => setActiveTab('courts')} />
        <NavButton icon={Gavel} label="Bail" active={activeTab === 'bail'} onClick={() => setActiveTab('bail')} />
        <NavButton icon={Shield} label="Police" active={activeTab === 'police'} onClick={() => setActiveTab('police')} />
        <NavButton icon={Users} label="Custody" active={activeTab === 'custody'} onClick={() => setActiveTab('custody')} />
      </nav>
      <Toast message="Copied to clipboard!" visible={!!copiedField} position="bottom-nav" />
    </div>
  );
}

interface CourtsTabProps {
  loading: boolean;
  filteredCourts: Court[];
  staffedCourts: Court[];
  circuitCourts: Court[];
  selectedRegion: CourtRegion | 'All';
  onSelectCourt: (court: Court) => void;
}

const CourtsTab = memo(function CourtsTab({ loading, filteredCourts, staffedCourts, circuitCourts, selectedRegion, onSelectCourt }: CourtsTabProps) {
  if (loading) return <div className="flex items-center justify-center h-32"><div className="text-zinc-500">Loading courts...</div></div>;
  return (
    <>
      <div className="text-sm text-zinc-500 mb-4">{filteredCourts.length} courts found{selectedRegion !== 'All' && ` in ${selectedRegion}`}</div>
      {staffedCourts.length > 0 && <div className="mb-6"><div className="space-y-2">{staffedCourts.map(court => <CourtCard key={court.id} court={court} onClick={() => onSelectCourt(court)} />)}</div></div>}
      {circuitCourts.length > 0 && <div><h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2"><MapPin size={14} />Circuit Courts ({circuitCourts.length})</h2><div className="space-y-2">{circuitCourts.map(court => <CourtCard key={court.id} court={court} onClick={() => onSelectCourt(court)} />)}</div></div>}
      {filteredCourts.length === 0 && <div className="text-center text-zinc-500 py-8">No courts found matching your search.</div>}
    </>
  );
});

const HomeTab = memo(function HomeTab({ onNavigate }: { onNavigate: (tab: NavTab) => void }) {
  return (
    <div className="text-center py-12">
      <Scale size={48} className="mx-auto text-zinc-600 mb-4" />
      <h2 className="text-xl font-semibold mb-2">BC Legal Directory</h2>
      <p className="text-zinc-400 mb-6">Quick access to BC courts, bail contacts, police cells, and custody facilities.</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onNavigate('courts')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700"><Building2 size={24} className="mx-auto mb-2 text-emerald-500" /><span className="text-sm">Courts</span></button>
        <button onClick={() => onNavigate('bail')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700"><Gavel size={24} className="mx-auto mb-2 text-red-500" /><span className="text-sm">Bail</span></button>
        <button onClick={() => onNavigate('police')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700"><Shield size={24} className="mx-auto mb-2 text-blue-500" /><span className="text-sm">Police</span></button>
        <button onClick={() => onNavigate('custody')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700"><Users size={24} className="mx-auto mb-2 text-amber-500" /><span className="text-sm">Custody</span></button>
      </div>
    </div>
  );
});

const PlaceholderTab = memo(function PlaceholderTab({ icon: Icon, message }: { icon: React.ComponentType<{ size?: number; className?: string }>; message: string }) {
  return <div className="text-center py-12 text-zinc-500"><Icon size={48} className="mx-auto mb-4 opacity-50" /><p>{message}</p></div>;
});

interface CourtDetailViewProps {
  court: Court;
  hubCourt: Court | null;
  onBack: () => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  courtLevel: 'provincial' | 'supreme';
  setCourtLevel: (level: 'provincial' | 'supreme') => void;
}

const CourtDetailView = memo(function CourtDetailView({ court, hubCourt, onBack, copiedField, onCopy, courtLevel, setCourtLevel }: CourtDetailViewProps) {
  const contactSource = court.is_circuit && hubCourt ? hubCourt : court;
  const showToggle = contactSource.has_provincial && contactSource.has_supreme;
  const contacts: CourtContacts | null = courtLevel === 'provincial' ? contactSource.provincial_contacts : contactSource.supreme_contacts;

  useEffect(() => {
    if (contactSource.has_provincial) setCourtLevel('provincial');
    else if (contactSource.has_supreme) setCourtLevel('supreme');
  }, [court.id, contactSource.has_provincial, contactSource.has_supreme, setCourtLevel]);

  const openInMaps = useCallback((address: string) => window.open(`https://maps.google.com/maps?q=${encodeURIComponent(address)}`, '_blank'), []);
  const regionCode = REGION_CODES[court.region] || '';

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <div className="flex-shrink-0 px-4 pt-safe">
        <button onClick={onBack} className="flex items-center gap-1 py-1.5 text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft size={20} /><span className="text-sm">Courts</span>
        </button>
      </div>

      <header className="flex-shrink-0 px-4 pb-3">
        <h1 className="text-xl font-bold leading-tight">{court.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {court.access_code && (
            <button onClick={() => onCopy(court.access_code!, 'access_code')} className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded flex items-center gap-1 hover:bg-amber-500/30 transition-colors">
              {copiedField === 'access_code' && <Check size={12} />}{court.access_code}
            </button>
          )}
          {court.virtual_courtroom_code && <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">{court.virtual_courtroom_code}</span>}
          <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">{court.region}</span>
        </div>
        {court.address && (
          <button onClick={() => openInMaps(court.address!)} className="flex items-center gap-2 mt-2 text-left group">
            <MapPin size={14} className="text-zinc-500 flex-shrink-0 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-zinc-400 group-hover:text-blue-400 transition-colors underline decoration-zinc-600 group-hover:decoration-blue-400">{court.address}</span>
          </button>
        )}
        {showToggle && (
          <div className="flex mt-3 p-1 bg-zinc-800 rounded-lg">
            <button onClick={() => setCourtLevel('provincial')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${courtLevel === 'provincial' ? 'bg-emerald-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Provincial</button>
            <button onClick={() => setCourtLevel('supreme')} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${courtLevel === 'supreme' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'}`}>Supreme</button>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {court.is_circuit && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-sm text-amber-400"><strong>{regionCode} Circuit Court</strong>: Please contact {hubCourt?.name || court.hub_court_name || 'the hub court'}.</p>
          </div>
        )}
        {contacts && (contacts.registry_email || contacts.criminal_registry_email || contacts.jcm_scheduling_email || contacts.scheduling_email) && (
          <ContactSection title={courtLevel === 'provincial' ? "Registry & JCM" : "Registry & Scheduling"} color="emerald" contacts={contacts}
            fields={courtLevel === 'provincial' ? ['registry_email', 'criminal_registry_email', 'jcm_scheduling_email'] : ['registry_email', 'criminal_registry_email', 'scheduling_email']}
            faxFiling={courtLevel === 'supreme' ? contacts.fax_filing : undefined} copiedField={copiedField} onCopy={onCopy} />
        )}
        {contacts?.crown_email && <ContactSection title="Crown" color="blue" contacts={contacts} fields={['crown_email']} copiedField={copiedField} onCopy={onCopy} />}
        {courtLevel === 'provincial' && contacts && (contacts.bail_crown_email || contacts.bail_jcm_email) && (
          <ContactSection title="Bail" color="amber" contacts={contacts} fields={['bail_crown_email', 'bail_jcm_email']} copiedField={copiedField} onCopy={onCopy} />
        )}
        {contacts && (contacts.transcripts_email || contacts.interpreter_email) && (
          <ContactSection title="Other" color="purple" contacts={contacts} fields={['transcripts_email', 'interpreter_email']} copiedField={copiedField} onCopy={onCopy} />
        )}
        {court.notes && <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl"><p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Notes</p><p className="text-sm text-zinc-300">{court.notes}</p></div>}
        {court.access_code_notes && <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl"><p className="text-xs uppercase tracking-wider text-amber-500 mb-2">Access Code Instructions</p><p className="text-sm text-amber-300">{court.access_code_notes}</p></div>}
      </main>
      <Toast message="Copied to clipboard!" visible={!!copiedField} />
    </div>
  );
});

interface BailPageProps {
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

const BailPage = memo(function BailPage({ copiedField, onCopy }: BailPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResult, setSelectedResult] = useState<{ region: string; name: string; court?: string } | null>(null);
  const isDaytime = useDaytime();

  const findRegionBySearch = useCallback((query: string) => {
    const q = query.toLowerCase();
    for (const region of BAIL_CONTACTS.regional) {
      if (region.areas?.some(a => a.toLowerCase().includes(q))) {
        if (region.contactType === 'court-specific' && region.courts) {
          for (const court of region.courts) {
            if (court.areas?.some(a => a.toLowerCase().includes(q))) return { region: region.region, name: region.name, court: court.court };
          }
        }
        return { region: region.region, name: region.name };
      }
      if (region.name.toLowerCase().includes(q)) return { region: region.region, name: region.name };
    }
    return null;
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      const result = findRegionBySearch(searchQuery);
      if (result) setSelectedResult(result);
    }
  }, [searchQuery, findRegionBySearch]);

  if (selectedResult) {
    return <BailDetailView selectedResult={selectedResult} setSelectedResult={setSelectedResult} searchQuery={searchQuery} setSearchQuery={setSearchQuery}
      onBack={() => { setSelectedResult(null); setSearchQuery(''); }} onSearch={handleSearch} isDaytime={isDaytime} copiedField={copiedField} onCopy={onCopy} />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center"><h2 className="text-2xl font-bold">Virtual Bail</h2><p className="text-zinc-500 text-sm mt-1">BC Provincial Court Bail Contacts</p></div>
      <SearchInput value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} onSubmit={handleSearch} placeholder="Search by city or detachment..." />
      <div className="flex justify-center gap-2">
        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${isDaytime ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>☀️ Daytime Hours</span>
        <span className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${!isDaytime ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'}`}>🌙 After Hours</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {BAIL_CONTACTS.regional.map(region => {
          const colors = BAIL_COLOR_CLASSES[region.color] || BAIL_COLOR_CLASSES.cyan;
          return (
            <button key={region.region} onClick={() => setSelectedResult({ region: region.region, name: region.name })}
              className={`${region.code === 'R5' ? 'col-span-2' : ''} relative p-5 rounded-2xl border ${colors.border} ${colors.bg} text-left transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]`}>
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient} rounded-t-2xl opacity-80`} />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase mb-1">{region.region}</p>
                  <p className="text-base font-semibold text-white">{region.name}</p>
                  <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                    <MapPin size={12} />{region.courtCount} courts
                    {region.allHours && <span className="ml-1 text-green-400">• All hours</span>}
                    {region.contactType === 'court-specific' && <span className="ml-1 text-yellow-400">• Daytime only</span>}
                  </p>
                </div>
                {region.contactType === 'court-specific' && <span className="text-[10px] px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg">☀️ By court</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
});

interface BailDetailViewProps {
  selectedResult: { region: string; name: string; court?: string };
  setSelectedResult: (result: { region: string; name: string; court?: string } | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onBack: () => void;
  onSearch: () => void;
  isDaytime: boolean;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}

const BailDetailView = memo(function BailDetailView({ selectedResult, setSelectedResult, searchQuery, setSearchQuery, onBack, onSearch, isDaytime, copiedField, onCopy }: BailDetailViewProps) {
  const region = useMemo(() => BAIL_CONTACTS.regional.find(r => r.region === selectedResult.region), [selectedResult.region]);
  if (!region) return null;

  const colors = BAIL_COLOR_CLASSES[region.color] || BAIL_COLOR_CLASSES.cyan;
  const court = region.courts?.find(c => c.court === selectedResult.court);
  const federalContacts = BAIL_CONTACTS.federal.find(f => f.region === region.name || (region.name === 'Vancouver Island' && f.region === 'Vancouver Island') || (region.name === 'Interior' && f.region === 'Interior'));

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"><ChevronLeft size={20} /><span className="text-sm">Back to regions</span></button>

      <SearchInput value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} onSubmit={onSearch} placeholder="Search city or detachment..."
        rightElement={<span className={`text-xs px-2 py-1 ${colors.bg} ${colors.text} rounded-lg`}>{region.code}</span>} />

      <div className={`rounded-3xl border ${colors.border} ${colors.bg} overflow-hidden`}>
        <div className={`p-4 ${colors.bg} border-b border-zinc-800/50`}>
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center shadow-lg`}><span className="text-white font-bold text-lg">{region.code}</span></div>
            <div className="flex-1"><h2 className="text-white font-bold text-lg">{region.name}</h2><p className="text-zinc-400 text-sm">{court ? court.court : region.vrs?.join(' • ')}</p></div>
            <div className="text-right">
              {region.allHours ? (<><span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-lg block mb-1">☀️🌙</span><span className="text-zinc-500 text-xs">ALL HOURS</span></>)
              : region.contactType === 'court-specific' ? (<><span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg block mb-1">☀️</span><span className="text-zinc-500 text-xs">DAYTIME ONLY</span></>)
              : (<><span className={`text-xs px-2 py-1 ${isDaytime ? 'bg-yellow-500/20 text-yellow-400' : 'bg-indigo-500/20 text-indigo-400'} rounded-lg block mb-1`}>{isDaytime ? '☀️ DAY' : '🌙 NIGHT'}</span><span className="text-zinc-500 text-xs">{isDaytime ? '8am-5pm' : 'After hours'}</span></>)}
            </div>
          </div>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {court && (
            <button onClick={() => onCopy(court.email, 'court-email')} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 active:bg-white/10 transition text-left">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><Briefcase size={20} className="text-yellow-400" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><p className="text-zinc-400 text-xs">Virtual Bail - {court.court}</p><span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">☀️ Daytime</span></div>
                <p className="text-white font-medium truncate">{court.email}</p><p className="text-zinc-500 text-xs mt-0.5">8am-5pm weekdays only</p>
              </div>
              <div className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                {copiedField === 'court-email' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-zinc-400" />}
              </div>
            </button>
          )}

          {court && region.contactType === 'court-specific' && (
            <div className="w-full p-4 flex items-center gap-4 text-left bg-zinc-900/50">
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0"><Briefcase size={20} className="text-zinc-600" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><p className="text-zinc-500 text-xs">After Hours / Weekends / Holidays</p><span className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded">🌙</span></div>
                <p className="text-zinc-500 font-medium">No evening virtual bail for {region.code}</p><p className="text-zinc-600 text-xs mt-0.5">Contact individual Crown offices or wait for daytime hours</p>
              </div>
            </div>
          )}

          {!court && region.daytime && (
            <button onClick={() => onCopy(region.daytime!, 'daytime-email')} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 active:bg-white/10 transition text-left">
              <div className={`w-10 h-10 ${region.allHours ? 'bg-green-500/20' : 'bg-yellow-500/20'} rounded-xl flex items-center justify-center flex-shrink-0`}><Briefcase size={20} className={region.allHours ? 'text-green-400' : 'text-yellow-400'} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><p className="text-zinc-400 text-xs">{region.allHours ? 'Virtual Bail (All Hours)' : 'Daytime (8am-5pm weekdays)'}</p>
                  {region.allHours ? <span className="text-[10px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">☀️🌙</span> : <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">☀️</span>}
                </div>
                <p className="text-white font-medium truncate">{region.daytime}</p>
              </div>
              <div className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                {copiedField === 'daytime-email' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-zinc-400" />}
              </div>
            </button>
          )}

          {!court && !region.allHours && region.afterHours && (
            <button onClick={() => onCopy(region.afterHours!, 'afterhours-email')} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 active:bg-white/10 transition text-left">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0"><Briefcase size={20} className="text-indigo-400" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5"><p className="text-zinc-400 text-xs">After Hours / Weekends / Holidays</p><span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 rounded">🌙</span></div>
                <p className="text-white font-medium truncate">{region.afterHours}</p><p className="text-zinc-500 text-xs mt-0.5">Remote - no fax available</p>
              </div>
              <div className="w-10 h-10 bg-zinc-800 hover:bg-zinc-700 rounded-xl flex items-center justify-center flex-shrink-0">
                {copiedField === 'afterhours-email' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-zinc-400" />}
              </div>
            </button>
          )}

          {region.rabc && (
            <div className="p-4">
              <p className="text-zinc-500 text-xs mb-2">RABC (Bail Coordinator)</p>
              <div className="flex items-center gap-3">
                <div className="flex-1"><p className="text-white font-medium">{region.rabc.name}</p></div>
                <button onClick={() => onCopy(region.rabc!.email, 'rabc-email')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm text-zinc-300 transition flex items-center gap-2">
                  {copiedField === 'rabc-email' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}Email
                </button>
                <a href={`tel:${region.rabc.phone}`} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-sm text-white font-medium transition">📞 Call</a>
              </div>
              <p className="text-zinc-500 text-xs mt-2">{region.rabc.phone}</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-zinc-900/80 border-t border-zinc-800/50">
          <button onClick={() => onCopy(region.subjectLine, 'subject-line')} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800 transition">
            <div><p className="text-zinc-500 text-xs">Subject Line Template</p><p className="text-zinc-300 text-sm">{region.subjectLine}</p></div>
            {copiedField === 'subject-line' ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} className="text-zinc-500" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => federalContacts && onCopy(federalContacts.areas[0].email, 'federal')} className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl text-left hover:bg-purple-500/20 transition">
          <span className="text-xs text-purple-400 font-medium">FEDERAL (PPSC)</span><p className="text-white text-sm mt-1">Federal Crown</p><p className="text-zinc-500 text-xs">CDSA, firearms</p>
        </button>
        <button onClick={() => onCopy(BAIL_CONTACTS.sheriffs[0].email, 'sheriff')} className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-left hover:bg-amber-500/20 transition">
          <span className="text-xs text-amber-400 font-medium">SHERIFF</span><p className="text-white text-sm mt-1">VB Coordinator</p><p className="text-zinc-500 text-xs">Prisoner transport</p>
        </button>
      </div>

      <div className="p-3 bg-zinc-900/50 rounded-xl">
        <p className="text-zinc-500 text-xs mb-2">Areas served by {region.name}</p>
        <p className="text-zinc-400 text-xs leading-relaxed">{(court?.areas || region.areas)?.join(' • ')}</p>
      </div>

      {region.courts && region.courts.length > 1 && (
        <div>
          <p className="text-zinc-500 text-xs mb-2">OTHER {region.code} COURTS</p>
          <div className="space-y-2">
            {region.courts.filter(c => c.court !== court?.court).map(c => (
              <button key={c.court} onClick={() => setSelectedResult({ region: region.region, name: region.name, court: c.court })}
                className="w-full p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl flex items-center justify-between hover:bg-zinc-800 transition">
                <span className="text-zinc-300 text-sm">{c.court}</span><ChevronRight size={16} className="text-zinc-600" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});
