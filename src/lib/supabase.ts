import { createClient } from '@supabase/supabase-js';

// HÄMTA ALLTID från env-variabler – INGET hårdkodat här
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
