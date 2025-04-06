import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a singleton pattern to ensure only one client is created
// even during hot module reloads in development
let supabaseInstance: ReturnType<typeof createClient> | null = null;

const createSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance;
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  
  return supabaseInstance;
};

export const supabase = createSupabaseClient();

// Export a function to get the singleton instance
export const getSupabase = () => supabase; 