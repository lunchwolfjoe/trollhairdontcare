import { createClient } from '@supabase/supabase-js';

// These variables will be loaded from .env.local files
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 