import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!hasSupabaseConfig) {
  console.warn('Supabase not configured: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing');
}

export const supabase = hasSupabaseConfig ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
export {hasSupabaseConfig};

export default supabase;
