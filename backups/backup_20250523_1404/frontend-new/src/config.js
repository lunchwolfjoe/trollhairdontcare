// Configuration with hardcoded values as fallback for when environment variables fail
const SUPABASE_URL = 'https://ysljpqtpbpugekhrdocq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM2NTQ1MTMsImV4cCI6MjAyOTIzMDUxM30.7WYpS0R0BL03xMbIQcbvz5uBrAGXcZJPlY3K3UcYXD8';

export const config = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || SUPABASE_URL,
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || SUPABASE_ANON_KEY,
  env: import.meta.env.VITE_ENV || 'production',
  publicUrl: import.meta.env.VITE_PUBLIC_URL || 'https://kfffast.vercel.app',
  useMockData: import.meta.env.VITE_USE_MOCK_DATA === 'true' || false,
};

// Debug helper
console.log('Config loaded with:', {
  supabaseUrl: config.supabaseUrl,
  keyPresent: !!config.supabaseAnonKey,
  fromEnv: !!import.meta.env.VITE_SUPABASE_URL,
  env: config.env
}); 