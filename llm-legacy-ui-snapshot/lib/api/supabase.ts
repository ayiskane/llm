import { createBrowserClient } from '@supabase/ssr';

// Create a singleton Supabase client for browser
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (supabaseClient) {
    return supabaseClient;
  }

  supabaseClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseClient;
}

// Export types for convenience
export type SupabaseClient = ReturnType<typeof createClient>;
