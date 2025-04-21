import { supabase as supabaseClient } from './supabaseClient';

// Export a consistent interface for getSupabaseClient that returns the same
// supabase instance from supabaseClient.js
export const getSupabaseClient = () => {
  return supabaseClient;
};

// Helper to get auth headers for API requests
export const getAuthHeaders = async () => {
  const supabase = getSupabaseClient();
  const { data } = await supabase.auth.getSession();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Only include auth header if we have a session
  if (data.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  
  return headers;
}; 