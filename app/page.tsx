'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Court, CourtRegion, CourtContacts } from '@/types/database';
import { 
  Search, ChevronLeft, ChevronRight,
  Copy, Check, X,
  Building2, MapPin, Scale, Home, Users, Shield, Briefcase
} from 'lucide-react';

// Regions for filtering
const REGIONS: CourtRegion[] = ['Fraser', 'Interior', 'North', 'Vancouver Island', 'Vancouver Coastal'];

// Navigation tabs
type NavTab = 'home' | 'courts' | 'police' | 'custody' | 'services';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('courts');
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<CourtRegion | 'All'>('All');
  const [hideCircuit, setHideCircuit] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [hubCourt, setHubCourt] = useState<Court | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [courtLevel, setCourtLevel] = useState<'provincial' | 'supreme'>('provincial');

  // Fetch courts from Supabase
  useEffect(() => {
    async function fetchCourts() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching courts:', error);
      } else {
        setCourts(data || []);
      }
      setLoading(false);
    }
    fetchCourts();
  }, []);

  // Filter courts based on search, region, and circuit filter
  const filteredCourts = useMemo(() => {
    return courts.filter(court => {
      const matchesSearch = searchQuery === '' || 
        court.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        court.city?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion === 'All' || court.region === selectedRegion;
      const matchesCircuit = !hideCircuit || !court.is_circuit;
      return matchesSearch && matchesRegion && matchesCircuit;
    });
  }, [courts, searchQuery, selectedRegion, hideCircuit]);

  // Separate staffed and circuit courts
  const staffedCourts = filteredCourts.filter(c => !c.is_circuit);
  const circuitCourts = filteredCourts.filter(c => c.is_circuit);

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Select a court and fetch hub court if it's a circuit court
  const selectCourt = (court: Court) => {
    setSelectedCourt(court);
    
    if (court.is_circuit && court.hub_court_name) {
      // Find the hub court from loaded courts
      const hub = courts.find(c => 
        c.name.toLowerCase().includes(court.hub_court_name!.toLowerCase().replace(' law courts', '').replace(' provincial court', ''))
      );
      setHubCourt(hub || null);
    } else {
      setHubCourt(null);
    }
  };

  // If a court is selected, show the detail view
  if (selectedCourt) {
    return (
      <CourtDetailView 
        court={selectedCourt}
        hubCourt={hubCourt}
        allCourts={courts}
        onBack={() => { setSelectedCourt(null); setHubCourt(null); }}
        copiedField={copiedField}
        onCopy={copyToClipboard}
        courtLevel={courtLevel}
        setCourtLevel={setCourtLevel}
      />
    );
  }

  // Main app with tabs
  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-safe pb-4 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <h1 className="text-2xl font-bold mb-4">BC Legal Directory</h1>
        
        {/* Search - only show on courts tab */}
        {activeTab === 'courts' && (
          <>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search courts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Region Filter */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              <button
                onClick={() => setSelectedRegion('All')}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                  selectedRegion === 'All' 
                    ? 'bg-white text-black' 
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                All
              </button>
              {REGIONS.map(region => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedRegion === region 
                      ? 'bg-white text-black' 
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {region}
                </button>
              ))}
              {/* Circuit Court Toggle */}
              <button
                onClick={() => setHideCircuit(!hideCircuit)}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  hideCircuit 
                    ? 'bg-amber-500 text-black' 
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <MapPin size={12} />
                {hideCircuit ? 'Circuit Hidden' : 'Hide Circuit'}
              </button>
            </div>
          </>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto min-h-0 px-4 pb-4">
        {activeTab === 'courts' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-zinc-500">Loading courts...</div>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="text-sm text-zinc-500 mb-4">
                  {filteredCourts.length} courts found
                  {selectedRegion !== 'All' && ` in ${selectedRegion}`}
                </div>

                {/* Staffed Courthouses */}
                {staffedCourts.length > 0 && (
                  <div className="mb-6">
                    <div className="space-y-2">
                      {staffedCourts.map(court => (
                        <CourtCard 
                          key={court.id} 
                          court={court} 
                          onClick={() => selectCourt(court)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Circuit Courts */}
                {circuitCourts.length > 0 && (
                  <div>
                    <h2 className="text-xs uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                      <MapPin size={14} />
                      Circuit Courts ({circuitCourts.length})
                    </h2>
                    <div className="space-y-2">
                      {circuitCourts.map(court => (
                        <CourtCard 
                          key={court.id} 
                          court={court} 
                          onClick={() => selectCourt(court)} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredCourts.length === 0 && (
                  <div className="text-center text-zinc-500 py-8">
                    No courts found matching your search.
                  </div>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'home' && (
          <div className="text-center py-12">
            <Scale size={48} className="mx-auto text-zinc-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">BC Legal Directory</h2>
            <p className="text-zinc-400 mb-6">Quick access to BC courts, police cells, custody facilities, and legal services.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveTab('courts')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                <Building2 size={24} className="mx-auto mb-2 text-emerald-500" />
                <span className="text-sm">Courts</span>
              </button>
              <button onClick={() => setActiveTab('police')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                <Shield size={24} className="mx-auto mb-2 text-blue-500" />
                <span className="text-sm">Police</span>
              </button>
              <button onClick={() => setActiveTab('custody')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                <Users size={24} className="mx-auto mb-2 text-amber-500" />
                <span className="text-sm">Custody</span>
              </button>
              <button onClick={() => setActiveTab('services')} className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700">
                <Briefcase size={24} className="mx-auto mb-2 text-purple-500" />
                <span className="text-sm">Services</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'police' && (
          <div className="text-center py-12 text-zinc-500">
            <Shield size={48} className="mx-auto mb-4 opacity-50" />
            <p>Police & RCMP contacts coming soon</p>
          </div>
        )}

        {activeTab === 'custody' && (
          <div className="text-center py-12 text-zinc-500">
            <Users size={48} className="mx-auto mb-4 opacity-50" />
            <p>Correctional facilities coming soon</p>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="text-center py-12 text-zinc-500">
            <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
            <p>Legal Aid & services coming soon</p>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="flex-shrink-0 flex border-t border-zinc-800 bg-zinc-900 pb-safe">
        <NavButton icon={Home} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavButton icon={Building2} label="Courts" active={activeTab === 'courts'} onClick={() => setActiveTab('courts')} />
        <NavButton icon={Shield} label="Police" active={activeTab === 'police'} onClick={() => setActiveTab('police')} />
        <NavButton icon={Users} label="Custody" active={activeTab === 'custody'} onClick={() => setActiveTab('custody')} />
        <NavButton icon={Briefcase} label="Services" active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
      </nav>

      {/* Toast notification */}
      {copiedField && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm shadow-lg z-50">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}

// Navigation Button Component
function NavButton({ icon: Icon, label, active, onClick }: { 
  icon: typeof Home; 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-3 ${active ? 'text-white' : 'text-zinc-500'}`}
    >
      <Icon size={20} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
}

// Court Card Component
function CourtCard({ court, onClick }: { court: Court; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-white truncate">{court.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {court.access_code && (
              <span className="text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                {court.access_code}
              </span>
            )}
            <span className="text-xs text-zinc-500">{court.region}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {court.has_provincial && (
            <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
              Prov
            </span>
          )}
          {court.has_supreme && (
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded">
              Sup
            </span>
          )}
          <ChevronRight size={16} className="text-zinc-600 ml-1" />
        </div>
      </div>
      {court.is_circuit && court.hub_court_name && (
        <p className="text-xs text-zinc-500 mt-1">
          Contact: {court.hub_court_name}
        </p>
      )}
    </button>
  );
}

// Court Detail View Component
function CourtDetailView({ 
  court, 
  hubCourt,
  allCourts,
  onBack, 
  copiedField, 
  onCopy,
  courtLevel,
  setCourtLevel
}: { 
  court: Court;
  hubCourt: Court | null;
  allCourts: Court[];
  onBack: () => void;
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
  courtLevel: 'provincial' | 'supreme';
  setCourtLevel: (level: 'provincial' | 'supreme') => void;
}) {
  // For circuit courts, use the hub court's contacts
  const contactSource = court.is_circuit && hubCourt ? hubCourt : court;
  const showToggle = contactSource.has_provincial && contactSource.has_supreme;
  const contacts: CourtContacts | null = courtLevel === 'provincial' 
    ? contactSource.provincial_contacts 
    : contactSource.supreme_contacts;

  // Reset to appropriate court level when court changes
  useEffect(() => {
    if (contactSource.has_provincial) {
      setCourtLevel('provincial');
    } else if (contactSource.has_supreme) {
      setCourtLevel('supreme');
    }
  }, [court.id, contactSource.has_provincial, contactSource.has_supreme, setCourtLevel]);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-4 pt-safe pb-4 bg-gradient-to-b from-zinc-900 to-zinc-950">
        {/* Back button and title */}
        <div className="flex items-start gap-3 mb-3">
          <button onClick={onBack} className="mt-1 text-zinc-400 hover:text-white">
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold leading-tight">{court.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              {court.access_code && (
                <button 
                  onClick={() => onCopy(court.access_code!, 'access_code')}
                  className="text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded flex items-center gap-1"
                  title={court.access_code_notes || 'Access code'}
                >
                  {copiedField === 'access_code' ? <Check size={12} /> : null}
                  {court.access_code}
                </button>
              )}
              <span className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded">
                {court.region}
              </span>
            </div>
          </div>
        </div>

        {/* Address */}
        {court.address && (
          <p className="text-sm text-zinc-400 ml-9 mb-3">{court.address}</p>
        )}

        {/* Provincial/Supreme Toggle */}
        {showToggle && (
          <div className="flex mt-4 ml-9 p-1 bg-zinc-800 rounded-lg">
            <button
              onClick={() => setCourtLevel('provincial')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                courtLevel === 'provincial' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Provincial
            </button>
            <button
              onClick={() => setCourtLevel('supreme')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                courtLevel === 'supreme' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Supreme
            </button>
          </div>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        {/* Circuit Court Notice */}
        {court.is_circuit && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-sm text-amber-400">
              <strong>Circuit Court</strong>
            </p>
            <p className="text-sm text-amber-400/80 mt-1">
              {hubCourt 
                ? `Contacts below are from ${hubCourt.name} (hub court)`
                : `Contact ${court.hub_court_name} for registry services`
              }
            </p>
          </div>
        )}

        {/* SC Fax Filing Box - Supreme Court Only */}
        {courtLevel === 'supreme' && contacts && contacts.fax_filing && (
          <button
            onClick={() => onCopy(contacts.fax_filing!, 'fax_filing')}
            className="w-full p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors"
          >
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-400 mb-1">SC Fax Filing</p>
              <p className="text-lg font-medium text-white">{contacts.fax_filing}</p>
            </div>
            <div className="text-blue-400">
              {copiedField === 'fax_filing' ? <Check size={20} /> : <Copy size={20} />}
            </div>
          </button>
        )}

        {/* Registry & JCM Section */}
        {contacts && (contacts.registry_email || contacts.criminal_registry_email || contacts.jcm_scheduling_email || contacts.scheduling_email) && (
          <ContactSection 
            title="Registry & JCM" 
            color="emerald"
            contacts={contacts}
            fields={['registry_email', 'criminal_registry_email', 'jcm_scheduling_email', 'scheduling_email']}
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}

        {/* Crown Section */}
        {contacts && contacts.crown_email && (
          <ContactSection 
            title="Crown" 
            color="blue"
            contacts={contacts}
            fields={['crown_email']}
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}

        {/* Bail Section - Provincial Only */}
        {courtLevel === 'provincial' && contacts && (contacts.bail_crown_email || contacts.bail_jcm_email) && (
          <ContactSection 
            title="Bail" 
            color="amber"
            contacts={contacts}
            fields={['bail_crown_email', 'bail_jcm_email']}
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}

        {/* Other - Transcripts & Interpreters */}
        {contacts && (contacts.transcripts_email || contacts.interpreter_email) && (
          <ContactSection 
            title="Other" 
            color="purple"
            contacts={contacts}
            fields={['transcripts_email', 'interpreter_email']}
            copiedField={copiedField}
            onCopy={onCopy}
          />
        )}

        {/* Notes */}
        {court.notes && (
          <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Notes</p>
            <p className="text-sm text-zinc-300">{court.notes}</p>
          </div>
        )}

        {/* Access Code Notes */}
        {court.access_code_notes && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-amber-500 mb-2">Access Code Instructions</p>
            <p className="text-sm text-amber-300">{court.access_code_notes}</p>
          </div>
        )}
      </main>

      {/* Toast notification */}
      {copiedField && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm shadow-lg">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
}

// Contact Section Component
function ContactSection({
  title,
  color,
  contacts,
  fields,
  copiedField,
  onCopy
}: {
  title: string;
  color: 'emerald' | 'blue' | 'amber' | 'purple';
  contacts: CourtContacts;
  fields: string[];
  copiedField: string | null;
  onCopy: (text: string, field: string) => void;
}) {
  const colorClasses = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    amber: 'border-amber-500/30 bg-amber-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5'
  };

  const labelColorClasses = {
    emerald: 'text-emerald-500',
    blue: 'text-blue-500',
    amber: 'text-amber-500',
    purple: 'text-purple-500'
  };

  const fieldLabels: Record<string, string> = {
    registry_email: 'Registry',
    criminal_registry_email: 'Criminal Registry',
    jcm_scheduling_email: 'JCM Scheduling',
    scheduling_email: 'Scheduling',
    crown_email: 'Crown Counsel',
    bail_crown_email: 'Bail Crown',
    bail_jcm_email: 'Bail JCM',
    transcripts_email: 'Transcripts',
    interpreter_email: 'Interpreter Request',
    fax_filing: 'Fax Filing'
  };

  const activeFields = fields.filter(f => contacts[f as keyof CourtContacts]);

  if (activeFields.length === 0) return null;

  return (
    <div className={`rounded-xl border ${colorClasses[color]}`}>
      <div className="px-3 py-2 border-b border-zinc-800/50">
        <h3 className={`text-xs uppercase tracking-wider ${labelColorClasses[color]}`}>
          {title}
        </h3>
      </div>
      <div className="divide-y divide-zinc-800/50">
        {activeFields.map(field => {
          const value = contacts[field as keyof CourtContacts] as string;
          const fieldKey = `${field}-${value}`;
          return (
            <button
              key={field}
              onClick={() => onCopy(value, fieldKey)}
              className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-zinc-800/50 active:bg-zinc-800 transition-colors text-left"
            >
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-xs text-zinc-500">{fieldLabels[field]}</p>
                <p className="text-sm text-white truncate">{value}</p>
              </div>
              <div className="flex items-center">
                {copiedField === fieldKey ? (
                  <Check size={16} className="text-emerald-500" />
                ) : (
                  <Copy size={16} className="text-zinc-500" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

