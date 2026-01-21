'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, Phone, MapPin, Check, Mail, Clock, Video, Building2, Shield, Scale, Users, ChevronDown, ChevronUp, Copy, ExternalLink } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

// Types
interface Court {
  id: number;
  name: string;
  region_id: number;
  region_name?: string;
  has_provincial: boolean;
  has_supreme: boolean;
  is_circuit: boolean;
  is_staffed: boolean;
  contact_hub: string | null;
  address: string | null;
  phone: string | null;
  fax: string | null;
  sheriff_phone: string | null;
  supreme_scheduling_phone: string | null;
  access_code: string | null;
  bail_hub_id: number | null;
}

interface Contact {
  id: number;
  email: string | null;
  emails: string[] | null;
  contact_role_id: number;
  role_name?: string;
}

interface ShellCell {
  id: number;
  name: string;
  cell_type: string;
  phones: string[];
  catchment: string | null;
  court_id: number | null;
}

interface TeamsLink {
  id: number;
  name: string | null;
  courtroom: string | null;
  conference_id: string | null;
  phone: string | null;
  phone_toll_free: string | null;
  teams_link: string | null;
  teams_link_type_id: number | null;
  type_name?: string;
}

interface BailCourt {
  id: number;
  name: string;
  region_id: number;
  is_hybrid: boolean;
  is_daytime: boolean;
  triage_time_am: string | null;
  triage_time_pm: string | null;
  court_start_am: string | null;
  court_start_pm: string | null;
  court_end: string | null;
  cutoff_new_arrests: string | null;
}

interface BailContact {
  id: number;
  email: string | null;
  role_id: number;
  availability_id: number | null;
  role_name?: string;
  availability_name?: string;
}

interface SearchResults {
  courts: Court[];
  contacts: Contact[];
  sheriffCells: ShellCell[];
  teamsLinks: TeamsLink[];
  bailCourt: BailCourt | null;
  bailContacts: BailContact[];
  bailTeamsLinks: TeamsLink[];
}

// Collapsible Section Component
function Section({ title, icon: Icon, count, children, defaultOpen = true }: {
  title: string;
  icon: any;
  count: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (count === 0) return null;
  
  return (
    <div className="mb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-800">{title}</span>
          <span className="text-sm text-gray-500">({count})</span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}

// Copy Button Component
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  
  return (
    <button 
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-sm bg-white border rounded hover:bg-gray-50 transition-colors"
      title={`Copy ${label}`}
    >
      {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
      <span className="text-gray-700">{text}</span>
    </button>
  );
}

// Main App
export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);

  // Search function
  const handleSearch = useCallback(async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults(null);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const searchTerm = `%${q}%`;

    try {
      // 1. Search courts
      const { data: courtsData } = await supabase
        .from('courts')
        .select('*, regions(name)')
        .or(`name.ilike.${searchTerm},address.ilike.${searchTerm}`)
        .order('name')
        .limit(10);

      const courts: Court[] = (courtsData || []).map((c: any) => ({
        ...c,
        region_name: c.regions?.name
      }));

      // 2. Get contacts for found courts
      let contacts: Contact[] = [];
      if (courts.length > 0) {
        const courtIds = courts.map(c => c.id);
        const { data: contactsData } = await supabase
          .from('contacts_courts')
          .select('contacts(*, contact_roles(name))')
          .in('court_id', courtIds);
        
        if (contactsData) {
          const contactMap = new Map<number, Contact>();
          contactsData.forEach((cc: any) => {
            if (cc.contacts && !contactMap.has(cc.contacts.id)) {
              contactMap.set(cc.contacts.id, {
                ...cc.contacts,
                role_name: cc.contacts.contact_roles?.name
              });
            }
          });
          contacts = Array.from(contactMap.values());
        }
      }

      // 3. Search sheriff cells by name or catchment
      const { data: cellsData } = await supabase
        .from('sheriff_cells')
        .select('*')
        .or(`name.ilike.${searchTerm},catchment.ilike.${searchTerm}`)
        .order('name')
        .limit(20);

      // Also get cells linked to found courts
      if (courts.length > 0) {
        const courtIds = courts.map(c => c.id);
        const { data: linkedCells } = await supabase
          .from('sheriff_cells')
          .select('*')
          .in('court_id', courtIds);
        
        // Merge and dedupe
        const cellMap = new Map<number, ShellCell>();
        (cellsData || []).forEach((c: any) => cellMap.set(c.id, c));
        (linkedCells || []).forEach((c: any) => cellMap.set(c.id, c));
        
        // Also get via junction table
        const { data: junctionCells } = await supabase
          .from('sheriff_cells_courts')
          .select('sheriff_cells(*)')
          .in('court_id', courtIds);
        
        (junctionCells || []).forEach((jc: any) => {
          if (jc.sheriff_cells) cellMap.set(jc.sheriff_cells.id, jc.sheriff_cells);
        });
      }

      const sheriffCells: ShellCell[] = cellsData || [];

      // 4. Get teams links for found courts
      let teamsLinks: TeamsLink[] = [];
      if (courts.length > 0) {
        const courtIds = courts.map(c => c.id);
        const { data: linksData } = await supabase
          .from('teams_links')
          .select('*, teams_link_types(name)')
          .in('court_id', courtIds)
          .order('courtroom');
        
        teamsLinks = (linksData || []).map((l: any) => ({
          ...l,
          type_name: l.teams_link_types?.name
        }));
      }

      // 5. Get bail court info
      let bailCourt: BailCourt | null = null;
      let bailContacts: BailContact[] = [];
      let bailTeamsLinks: TeamsLink[] = [];

      if (courts.length > 0) {
        const bailHubIds = courts.map(c => c.bail_hub_id).filter(Boolean);
        
        // First try direct match on bail_courts name
        const { data: bailData } = await supabase
          .from('bail_courts')
          .select('*')
          .or(`name.ilike.${searchTerm},id.in.(${bailHubIds.join(',')})`)
          .limit(1)
          .single();
        
        if (bailData) {
          bailCourt = bailData;
          
          // Get bail contacts
          const { data: bailContactsData } = await supabase
            .from('bail_contacts')
            .select('*, contact_roles(name)')
            .eq('bail_court_id', bailData.id);
          
          bailContacts = (bailContactsData || []).map((bc: any) => ({
            ...bc,
            role_name: bc.contact_roles?.name
          }));
          
          // Get bail teams links
          const { data: bailLinksData } = await supabase
            .from('bail_courts_teams_links')
            .select('teams_links(*, teams_link_types(name))')
            .eq('bail_court_id', bailData.id);
          
          bailTeamsLinks = (bailLinksData || []).map((bl: any) => ({
            ...bl.teams_links,
            type_name: bl.teams_links?.teams_link_types?.name
          })).filter(Boolean);
        }
      }

      setResults({
        courts,
        contacts,
        sheriffCells,
        teamsLinks,
        bailCourt,
        bailContacts,
        bailTeamsLinks
      });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const hasResults = results && (
    results.courts.length > 0 || 
    results.sheriffCells.length > 0 ||
    results.bailCourt
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="w-8 h-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">BC Legal Reference</h1>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courts, cells, contacts... (e.g., 'Abby', 'Surrey', 'Victoria')"
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {!query && (
          <div className="text-center py-12">
            <Scale className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <h2 className="text-2xl font-medium text-gray-600 mb-2">Search BC Courts & Contacts</h2>
            <p className="text-gray-500 mb-6">Enter a court name, city, or search term to find related information</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Abby', 'Surrey', 'Victoria', 'Kelowna', 'Prince George'].map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 bg-white border rounded-full text-gray-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {query && !loading && !hasResults && (
          <div className="text-center py-12">
            <p className="text-gray-500">No results found for "{query}"</p>
          </div>
        )}

        {hasResults && (
          <div className="space-y-6">
            {/* Courts Section */}
            <Section title="Courts" icon={Building2} count={results.courts.length}>
              {results.courts.map(court => (
                <div key={court.id} className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{court.name}</h3>
                      <p className="text-sm text-gray-500">{court.region_name} Region</p>
                    </div>
                    <div className="flex gap-1">
                      {court.has_provincial && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Provincial</span>}
                      {court.has_supreme && <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">Supreme</span>}
                      {court.is_circuit && <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">Circuit</span>}
                    </div>
                  </div>
                  
                  {court.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{court.address}</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {court.phone && <CopyButton text={court.phone} label="phone" />}
                    {court.fax && <CopyButton text={court.fax} label="fax" />}
                    {court.sheriff_phone && <CopyButton text={court.sheriff_phone} label="sheriff" />}
                    {court.access_code && (
                      <span className="px-2 py-1 text-sm bg-yellow-50 border border-yellow-200 rounded">
                        🔑 {court.access_code}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </Section>

            {/* Contacts Section */}
            <Section title="Contacts" icon={Mail} count={results.contacts.length}>
              <div className="bg-white rounded-lg border divide-y">
                {results.contacts.filter(c => c.email).map(contact => (
                  <div key={contact.id} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-700">{contact.role_name}</span>
                    </div>
                    <CopyButton text={contact.email!} label="email" />
                  </div>
                ))}
              </div>
            </Section>

            {/* Sheriff Cells Section */}
            <Section title="Sheriff & Police Cells" icon={Shield} count={results.sheriffCells.length}>
              {results.sheriffCells.map(cell => (
                <div key={cell.id} className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-800">{cell.name}</h4>
                      {cell.catchment && (
                        <p className="text-sm text-gray-500">Serves: {cell.catchment}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      cell.cell_type === 'courthouse' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {cell.cell_type === 'courthouse' ? 'Courthouse' : 'Police'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cell.phones.map((phone, i) => (
                      <CopyButton key={i} text={phone} label="phone" />
                    ))}
                  </div>
                </div>
              ))}
            </Section>

            {/* MS Teams Links Section */}
            <Section title="MS Teams Courtrooms" icon={Video} count={results.teamsLinks.length} defaultOpen={false}>
              <div className="bg-white rounded-lg border divide-y max-h-64 overflow-y-auto">
                {results.teamsLinks.map(link => (
                  <div key={link.id} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800">
                        {link.courtroom || link.name || 'Courtroom'}
                      </span>
                      {link.type_name && (
                        <span className="text-xs text-gray-500">{link.type_name}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm">
                      {link.conference_id && (
                        <CopyButton text={link.conference_id} label="conference ID" />
                      )}
                      {link.teams_link && (
                        <a 
                          href={link.teams_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Join
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Bail Information Section */}
            {results.bailCourt && (
              <Section title="Virtual Bail" icon={Users} count={1}>
                <div className="bg-white rounded-lg border p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{results.bailCourt.name} Bail Hub</h4>
                      {results.bailCourt.is_hybrid && (
                        <span className="text-xs text-purple-600">Hybrid Courtroom</span>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      results.bailCourt.is_daytime ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {results.bailCourt.is_daytime ? '☀️ Daytime' : '🌙 Evening'}
                    </span>
                  </div>
                  
                  {/* Triage Times */}
                  {(results.bailCourt.triage_time_am || results.bailCourt.triage_time_pm) && (
                    <div className="mb-3 p-2 bg-gray-50 rounded">
                      <div className="text-sm text-gray-700">
                        <Clock className="w-4 h-4 inline mr-1" />
                        <strong>Triage:</strong> {results.bailCourt.triage_time_am} / {results.bailCourt.triage_time_pm}
                      </div>
                      <div className="text-sm text-gray-700">
                        <strong>Court:</strong> {results.bailCourt.court_start_am} - {results.bailCourt.court_end}
                      </div>
                      {results.bailCourt.cutoff_new_arrests && (
                        <div className="text-sm text-red-600">
                          <strong>Cutoff:</strong> {results.bailCourt.cutoff_new_arrests}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Bail Contacts */}
                  {results.bailContacts.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Bail Contacts:</h5>
                      <div className="space-y-1">
                        {results.bailContacts.map(bc => (
                          <div key={bc.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{bc.role_name}</span>
                            {bc.email && <CopyButton text={bc.email} label="email" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Bail Teams Links */}
                  {results.bailTeamsLinks.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Bail MS Teams:</h5>
                      <div className="space-y-2">
                        {results.bailTeamsLinks.map(link => (
                          <div key={link.id} className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                            <span className="text-gray-700">{link.courtroom || link.name}</span>
                            <div className="flex gap-2">
                              {link.conference_id && <CopyButton text={link.conference_id} label="ID" />}
                              {link.teams_link && (
                                <a 
                                  href={link.teams_link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  <Video className="w-3 h-3" />
                                  Join
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-sm text-gray-500">
        BC Legal Reference Database
      </footer>
    </div>
  );
}
