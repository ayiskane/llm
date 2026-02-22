import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createServerClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase server environment variables not set");
  }
  return createClient(url, key);
}
