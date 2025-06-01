import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to hardcoded values if needed
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ysljpqtpbpugekhrdocq.supabase.co';
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTM2NTQ1MTMsImV4cCI6MjAyOTIzMDUxM30.7WYpS0R0BL03xMbIQcbvz5uBrAGXcZJPlY3K3UcYXD8';

// Log configuration for debugging
console.log('Simple Auth Client initialized with:', { 
  url: SUPABASE_URL,
  keyAvailable: !!SUPABASE_KEY
});

// Create a single Supabase client instance
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

// Simple authentication functions
const auth = {
  // Get the current user
  getUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Get the current session
  getSession: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error signing out:', error);
      return false;
    }
  },

  // Get user roles (requires "user_roles" table with user_id and roles(name) fields)
  getUserRoles: async (userId) => {
    try {
      if (!userId) return ['volunteer']; // Default role
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        console.log("No roles found, defaulting to volunteer");
        return ['volunteer']; // Default role
      }
      
      return data.map(r => r.roles?.name || 'volunteer');
    } catch (error) {
      console.error('Error getting user roles:', error);
      return ['volunteer']; // Default role on error
    }
  }
};

// Export the auth module and supabase client
export { auth, supabase }; 