import { supabase as supabaseClient } from './supabaseClient';

// Store the client instance once to avoid recursive imports
let clientInstance = supabaseClient;

// Export a consistent interface for getSupabaseClient that returns the same
// supabase instance from supabaseClient.js
export const getSupabaseClient = () => {
  if (!clientInstance) {
    console.error('Supabase client is not initialized!');
    throw new Error('Supabase client is not available. Check configuration.');
  }
  return clientInstance;
};

// Helper to get auth headers for API requests
export const getAuthHeaders = async () => {
  try {
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
  } catch (error) {
    console.error('Error getting auth headers:', error);
    // Return basic headers on error
    return {
      'Content-Type': 'application/json',
    };
  }
}; 