import { createClient } from '@supabase/supabase-js';

// Get the Supabase URL and key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables before using them
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  throw new Error('Missing Supabase environment variables');
}

console.log(`Initializing Supabase client with URL: ${supabaseUrl.slice(0, 20)}...`);

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Verify the client was created correctly
if (!supabase || !supabase.from) {
  console.error('Failed to initialize Supabase client properly');
  throw new Error('Supabase client initialization failed');
}

// Test the connection to verify it's working
supabase.from('health_check').select('*').limit(1).then(() => {
  console.log('Supabase connection successful');
}).catch(error => {
  console.error('Supabase connection test failed:', error);
});

// Export a function to get the singleton instance
export const getSupabase = () => supabase; 