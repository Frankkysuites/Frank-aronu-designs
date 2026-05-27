import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://acbhiirlijxczlpmmarb.supabase.co';
const supabaseAnonKey = 'sb_publishable_pH93IGUl9hJnDNdTPhuZTA_TQ77nJ0_';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
