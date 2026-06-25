import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallback for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acbhiirlijxczlpmmarb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pH93IGUl9hJnDNdTPhuZTA_TQ77nJ0_';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key missing!');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
