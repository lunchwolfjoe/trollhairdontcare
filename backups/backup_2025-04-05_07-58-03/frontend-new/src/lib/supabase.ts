// Re-export supabase client from supabaseClient.ts
// This file exists to maintain compatibility with imports that use '../../lib/supabase'
import { supabase } from './supabaseClient';

export { supabase };
export default supabase; 