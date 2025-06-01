import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Initialize the Supabase client with the URL and anon key from environment variables or config fallback
const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Log error if env variables not found - this helps debugging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables are missing!', {
    url: supabaseUrl ? 'Found' : 'Missing',
    key: supabaseAnonKey ? 'Found' : 'Missing'
  });
  
  // Alert developers in development mode
  if (import.meta.env.DEV) {
    console.warn('Running in development mode with missing Supabase credentials!');
    setTimeout(() => {
      alert('Supabase credentials missing. Check console for details.');
    }, 1000);
  }
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Store the client instance once to avoid recursive imports
let clientInstance = supabase;

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