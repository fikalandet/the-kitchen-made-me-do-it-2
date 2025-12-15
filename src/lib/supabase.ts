import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * VIKTIGT:
 * - Endast VITE_-variabler används (frontend)
 * - Inget fallback, inget hårdkodat
 * - Kastar tydligt fel om något är fel → istället för tom sida
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Check Bolt Secrets + .env sync.'
  );
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'tkmmdi-frontend',
      },
    },
  }
);
