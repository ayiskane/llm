import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Court, CourtRegion } from '@/types/database';

// Hook for clipboard functionality with auto-reset
export function useClipboard(resetDelay = 2000) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
  }, []);

  useEffect(() => {
    if (copiedField) {
      const timer = setTimeout(() => setCopiedField(null), resetDelay);
      return () => clearTimeout(timer);
    }
  }, [copiedField, resetDelay]);

  return { copiedField, copyToClipboard };
}

// Hook for fetching courts from Supabase
export function useCourts() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchCourts() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('courts')
          .select('*')
          .order('name');
        
        if (error) throw error;
        if (mounted) {
          setCourts(data || []);
        }
      } catch (err) {
        console.error('Error fetching courts:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch courts'));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchCourts();
    return () => { mounted = false; };
  }, []);

  return { courts, loading, error };
}

// Hook for filtering courts
export function useFilteredCourts(
  courts: Court[],
  searchQuery: string,
  selectedRegion: CourtRegion | 'All',
  hideCircuit: boolean
) {
  const filteredCourts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return courts.filter(court => {
      const matchesSearch = !query || 
        court.name.toLowerCase().includes(query) ||
        court.city?.toLowerCase().includes(query);
      const matchesRegion = selectedRegion === 'All' || court.region === selectedRegion;
      const matchesCircuit = !hideCircuit || !court.is_circuit;
      return matchesSearch && matchesRegion && matchesCircuit;
    });
  }, [courts, searchQuery, selectedRegion, hideCircuit]);

  const staffedCourts = useMemo(() => 
    filteredCourts.filter(c => !c.is_circuit), 
    [filteredCourts]
  );
  
  const circuitCourts = useMemo(() => 
    filteredCourts.filter(c => c.is_circuit), 
    [filteredCourts]
  );

  return { filteredCourts, staffedCourts, circuitCourts };
}

// Hook for checking daytime hours (8am-5pm weekdays)
export function useDaytime() {
  const [isDaytime, setIsDaytime] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    return day >= 1 && day <= 5 && hour >= 8 && hour < 17;
  });

  useEffect(() => {
    // Update every minute
    const interval = setInterval(() => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      setIsDaytime(day >= 1 && day <= 5 && hour >= 8 && hour < 17);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return isDaytime;
}

// Hook for finding hub court
export function useHubCourt(court: Court | null, courts: Court[]) {
  return useMemo(() => {
    if (!court?.is_circuit || !court.hub_court_name) return null;
    
    const hubName = court.hub_court_name.toLowerCase()
      .replace(' law courts', '')
      .replace(' provincial court', '');
    
    return courts.find(c => c.name.toLowerCase().includes(hubName)) || null;
  }, [court, courts]);
}
