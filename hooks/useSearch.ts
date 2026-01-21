'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Court, Contact, ShellCell, TeamsLink, BailCourt, BailContact, SearchResults } from '@/types';
import { parseSearchQuery, getContactRoleIds, getContactTypeLabel, type ParsedQuery } from '@/lib/searchParser';

// Filter teams links by courtroom number
function filterTeamsLinksByCourtroom(links: TeamsLink[], courtroomNum: string): TeamsLink[] {
  const normalizedNum = parseInt(courtroomNum, 10).toString();
  
  return links.filter(link => {
    const courtroom = (link.courtroom || link.name || '').toLowerCase();
    
    // Match patterns like "CR 204", "CR204", "Courtroom 204", etc.
    const patterns = [
      new RegExp(`\\bcr\\s*0*${normalizedNum}\\b`, 'i'),
      new RegExp(`\\broom\\s*0*${normalizedNum}\\b`, 'i'),
      new RegExp(`\\bcourtroom\\s*0*${normalizedNum}\\b`, 'i'),
      new RegExp(`^0*${normalizedNum}$`),
    ];
    
    return patterns.some(pattern => pattern.test(courtroom));
  });
}

// Filter contacts by role IDs
function filterContactsByRole(contacts: Contact[], roleIds: number[]): Contact[] {
  return contacts.filter(c => roleIds.includes(c.contact_role_id));
}

// Filter cells by type
function filterCellsByType(cells: ShellCell[], cellType: string): ShellCell[] {
  if (cellType === 'ALL') return cells;
  return cells.filter(c => c.cell_type === cellType);
}

export function useSearch() {
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Parse the query to extract intent and filters
      const parsed = parseSearchQuery(query);
      
      // Determine what to search for
      const searchTerm = parsed.courtTerm || query;
      const hasCourtTerm = parsed.courtTerm && parsed.courtTerm.length >= 2;
      
      let courts: Court[] = [];
      let cells: ShellCell[] = [];
      let bailCourts: BailCourt[] = [];
      
      // Search courts if we have a court term or need to find related data
      if (hasCourtTerm || parsed.intent === 'court_lookup' || parsed.intent === 'general') {
        const { data: courtsData, error: courtsError } = await supabase
          .rpc('search_courts', { search_term: searchTerm });
        
        if (courtsError) throw courtsError;
        courts = courtsData || [];
      }
      
      // Search cells
      if (hasCourtTerm || parsed.intent === 'cell_lookup' || parsed.intent === 'general') {
        const { data: cellsData, error: cellsError } = await supabase
          .rpc('search_cells', { search_term: searchTerm });
        
        if (cellsError) throw cellsError;
        cells = cellsData || [];
        
        // Apply cell type filter
        if (parsed.filters.cellType) {
          cells = filterCellsByType(cells, parsed.filters.cellType);
        }
      }
      
      // Search bail courts
      if (hasCourtTerm || parsed.intent === 'bail_lookup' || parsed.intent === 'general') {
        const { data: bailData, error: bailError } = await supabase
          .rpc('search_bail_courts', { search_term: searchTerm });
        
        if (bailError) throw bailError;
        bailCourts = bailData || [];
      }
      
      // Apply region filter to courts if specified
      if (parsed.filters.region && courts.length > 0) {
        courts = courts.filter(c => c.region_id === parsed.filters.region);
      }
      
      // If no court term but have region filter, fetch all courts in region
      if (!hasCourtTerm && parsed.filters.region) {
        const { data: regionCourts } = await supabase
          .from('courts')
          .select('*')
          .eq('region_id', parsed.filters.region)
          .eq('is_staffed', true)
          .order('name');
        
        if (regionCourts) {
          courts = regionCourts;
        }
        
        // Also get cells for this region
        const { data: regionCells } = await supabase
          .from('sheriff_cells')
          .select('*')
          .eq('region_id', parsed.filters.region);
        
        if (regionCells) {
          cells = parsed.filters.cellType 
            ? filterCellsByType(regionCells, parsed.filters.cellType)
            : regionCells;
        }
      }

      // Fetch related data for courts
      let contacts: Contact[] = [];
      let teamsLinks: TeamsLink[] = [];
      let bailContacts: BailContact[] = [];
      let bailTeamsLinks: TeamsLink[] = [];
      let bailCourt: BailCourt | null = null;

      if (courts.length > 0) {
        const courtIds = courts.map((c: Court) => c.id);
        
        // Fetch contacts for these courts
        // Fetch contacts WITH court_id for grouping
        const { data: contactsData } = await supabase
          .from('contacts_courts')
          .select(`
            court_id,
            contact_id,
            contacts (
              id,
              email,
              emails,
              contact_role_id
            )
          `)
          .in('court_id', courtIds);

        if (contactsData) {
          contacts = contactsData
            .filter((cc: any) => cc.contacts)
            .map((cc: any) => ({
              ...cc.contacts,
              court_id: cc.court_id  // Include court_id for grouping
            }));
          
          // Apply contact type filter
          const roleIds = getContactRoleIds(parsed.filters.contactType);
          if (roleIds) {
            contacts = filterContactsByRole(contacts, roleIds);
          }
        }

        // Fetch teams links for these courts
        const { data: teamsData } = await supabase
          .from('teams_links')
          .select('*')
          .in('court_id', courtIds);

        if (teamsData) {
          teamsLinks = parsed.filters.courtroom 
            ? filterTeamsLinksByCourtroom(teamsData, parsed.filters.courtroom)
            : teamsData;
        }

        // Check if any court has a bail hub
        const primaryCourt = courts[0];
        if (primaryCourt.bail_hub_id) {
          const { data: bailData } = await supabase
            .from('bail_courts')
            .select('*')
            .eq('id', primaryCourt.bail_hub_id)
            .single();
          
          if (bailData) {
            bailCourt = bailData;
            
            // Fetch bail contacts
            const { data: bailContactsData } = await supabase
              .from('bail_contacts')
              .select('*, contact_roles(name)')
              .or(`bail_court_id.eq.${bailData.id},region_id.eq.${bailData.region_id}`);
            
            if (bailContactsData) {
              bailContacts = bailContactsData.map((bc: any) => ({
                ...bc,
                role_name: bc.contact_roles?.name
              }));
            }

            // Fetch bail teams links
            const { data: bailTeamsData } = await supabase
              .from('teams_links')
              .select('*')
              .eq('bail_court_id', bailData.id);
            
            if (bailTeamsData) {
              bailTeamsLinks = parsed.filters.courtroom
                ? filterTeamsLinksByCourtroom(bailTeamsData, parsed.filters.courtroom)
                : bailTeamsData;
            }
          }
        }
      }
      
      // If searching for contacts by type without a court, fetch all matching contacts
      if (parsed.filters.contactType && contacts.length === 0 && !hasCourtTerm) {
        const roleIds = getContactRoleIds(parsed.filters.contactType);
        if (roleIds) {
          let query = supabase
            .from('contacts')
            .select('*')
            .in('contact_role_id', roleIds);
          
          if (parsed.filters.region) {
            // Need to join through contacts_courts to filter by region
            const { data: regionContacts } = await supabase
              .from('contacts_courts')
              .select(`
                contacts (
                  id,
                  email,
                  emails,
                  contact_role_id
                ),
                courts!inner (
                  region_id
                )
              `)
              .eq('courts.region_id', parsed.filters.region);
            
            if (regionContacts) {
              contacts = regionContacts
                .filter((cc: any) => cc.contacts && roleIds.includes(cc.contacts.contact_role_id))
                .map((cc: any) => cc.contacts);
            }
          } else {
            const { data: allContacts } = await query;
            if (allContacts) {
              contacts = allContacts;
            }
          }
        }
      }

      // Use bail courts from search if no bail court from court lookup
      if (!bailCourt && bailCourts.length > 0) {
        bailCourt = bailCourts[0];
        
        // Fetch bail contacts and teams
        const { data: bailContactsData } = await supabase
          .from('bail_contacts')
          .select('*, contact_roles(name)')
          .or(`bail_court_id.eq.${bailCourt!.id},region_id.eq.${bailCourt!.region_id}`);
        
        if (bailContactsData) {
          bailContacts = bailContactsData.map((bc: any) => ({
            ...bc,
            role_name: bc.contact_roles?.name
          }));
        }

        const { data: bailTeamsData } = await supabase
          .from('teams_links')
          .select('*')
          .eq('bail_court_id', bailCourt!.id);
        
        if (bailTeamsData) {
          bailTeamsLinks = parsed.filters.courtroom
            ? filterTeamsLinksByCourtroom(bailTeamsData, parsed.filters.courtroom)
            : bailTeamsData;
        }
      }

      // Get region info for courts
      const enrichedCourts = await Promise.all(
        courts.map(async (court: Court) => {
          const { data: region } = await supabase
            .from('regions')
            .select('code, name')
            .eq('id', court.region_id)
            .single();
          
          let contactHubName = null;
          if (court.is_circuit && court.contact_hub) {
            const { data: hubCourt } = await supabase
              .from('courts')
              .select('name')
              .eq('id', parseInt(court.contact_hub))
              .single();
            contactHubName = hubCourt?.name;
          }
          
          return {
            ...court,
            region_code: region?.code,
            region_name: region?.name,
            contact_hub_name: contactHubName
          };
        })
      );

      setResults({
        courts: enrichedCourts,
        contacts,
        sheriffCells: cells,
        teamsLinks,
        bailCourt,
        bailContacts,
        bailTeamsLinks,
        // Include parsed query info for UI
        courtroomFilter: parsed.filters.courtroom,
        contactTypeFilter: parsed.filters.contactType,
        contactTypeLabel: getContactTypeLabel(parsed.filters.contactType),
        cellTypeFilter: parsed.filters.cellType,
        regionFilter: parsed.filters.region,
        searchIntent: parsed.intent,
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again.');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const clearResults = useCallback(() => {
    setResults(null);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults
  };
}

// Hook to fetch full court details
export function useCourtDetails() {
  const [court, setCourt] = useState<Court | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [sheriffCells, setSheriffCells] = useState<ShellCell[]>([]);
  const [teamsLinks, setTeamsLinks] = useState<TeamsLink[]>([]);
  const [bailCourt, setBailCourt] = useState<BailCourt | null>(null);
  const [bailContacts, setBailContacts] = useState<BailContact[]>([]);
  const [bailTeamsLinks, setBailTeamsLinks] = useState<TeamsLink[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const fetchCourtDetails = useCallback(async (courtId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch court
      const { data: courtData, error: courtError } = await supabase
        .from('courts')
        .select('*, regions(code, name)')
        .eq('id', courtId)
        .single();
      
      if (courtError) throw courtError;

      const enrichedCourt = {
        ...courtData,
        region_code: courtData.regions?.code,
        region_name: courtData.regions?.name
      };
      setCourt(enrichedCourt);

      // Fetch contacts
      // Fetch contacts WITH court_id for grouping
        const { data: contactsData } = await supabase
        .from('contacts_courts')
        .select(`
          contacts (
            id,
            email,
            emails,
            contact_role_id
          )
        `)
        .eq('court_id', courtId);

      if (contactsData) {
        setContacts(
          contactsData
            .filter((cc: any) => cc.contacts)
            .map((cc: any) => cc.contacts)
        );
      }

      // Fetch sheriff cells linked to this court
      const { data: cellLinksData } = await supabase
        .from('sheriff_cells_courts')
        .select('sheriff_cell_id')
        .eq('court_id', courtId);

      if (cellLinksData && cellLinksData.length > 0) {
        const cellIds = cellLinksData.map((c: any) => c.sheriff_cell_id);
        const { data: cellsData } = await supabase
          .from('sheriff_cells')
          .select('*')
          .in('id', cellIds);
        
        if (cellsData) {
          setSheriffCells(cellsData);
        }
      }

      // Also fetch courthouse cell if exists
      const { data: chCellData } = await supabase
        .from('sheriff_cells')
        .select('*')
        .eq('court_id', courtId);
      
      if (chCellData && chCellData.length > 0) {
        setSheriffCells(prev => {
          const existingIds = prev.map(c => c.id);
          const newCells = chCellData.filter((c: ShellCell) => !existingIds.includes(c.id));
          return [...prev, ...newCells];
        });
      }

      // Fetch teams links
      const { data: teamsData } = await supabase
        .from('teams_links')
        .select('*')
        .eq('court_id', courtId);
      
      if (teamsData) {
        setTeamsLinks(teamsData);
      }

      // Fetch bail info
      if (courtData.bail_hub_id) {
        const { data: bailData } = await supabase
          .from('bail_courts')
          .select('*')
          .eq('id', courtData.bail_hub_id)
          .single();
        
        if (bailData) {
          setBailCourt(bailData);
          
          // Fetch bail contacts
          const { data: bailContactsData } = await supabase
            .from('bail_contacts')
            .select('*, contact_roles(name)')
            .or(`bail_court_id.eq.${bailData.id},region_id.eq.${bailData.region_id}`);
          
          if (bailContactsData) {
            setBailContacts(bailContactsData.map((bc: any) => ({
              ...bc,
              role_name: bc.contact_roles?.name
            })));
          }

          // Fetch bail teams links
          const { data: bailTeamsData } = await supabase
            .from('teams_links')
            .select('*')
            .eq('bail_court_id', bailData.id);
          
          if (bailTeamsData) {
            setBailTeamsLinks(bailTeamsData);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching court details:', err);
      setError('Failed to load court details.');
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  return {
    court,
    contacts,
    sheriffCells,
    teamsLinks,
    bailCourt,
    bailContacts,
    bailTeamsLinks,
    isLoading,
    error,
    fetchCourtDetails
  };
}

