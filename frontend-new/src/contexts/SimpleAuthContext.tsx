import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Removed hardcoded values to rely solely on environment variables
// const SUPABASE_URL = "https://ysljpqtpbpugekhrdocq.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c";

// Debug logs to verify environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

// Create a very simple Supabase client with minimal options
const supabaseClient = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage
    }
  }
);

// Detect development vs production for domain-specific handling
const isProduction = window.location.hostname !== 'localhost';
console.log(`Running in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode on ${window.location.hostname}`);

// Current site URL for redirects and cookies
const SITE_URL = isProduction 
  ? `https://${window.location.hostname}`
  : 'http://localhost:5173';
console.log('Using site URL:', SITE_URL);

// User type 
type User = {
  id: string;
  email: string;
  full_name?: string;
  roles: string[];
  avatar_url?: string;
};

// Context type
type SimpleAuthContextType = {
  user: User | null;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
  activeRole: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: { full_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  mockSignIn: (role: string) => void;
  getAuthHeaders: () => Record<string, string>;
};

// Create context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Helper function to debug token issues
const debugToken = async (token: string | null) => {
  if (!token) {
    console.error('DEBUG: No token available to debug');
    return;
  }
  
  try {
    console.log('DEBUG: Testing token validity...');
    // Test token with API
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`DEBUG: Token validation failed - Status: ${response.status}, StatusText: ${response.statusText}`);
      const errorText = await response.text();
      console.error('DEBUG: Error response:', errorText);
      return null;
    }
    
    const userData = await response.json();
    console.log('DEBUG: Token is valid for user:', userData.id);
    return userData;
  } catch (err) {
    console.error('DEBUG: Token test error:', err);
    return null;
  }
};

// Provider component
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Get headers for authenticated requests
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  // Fetch user roles by ID
  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    console.log(`Fetching roles for user ${userId}`);
    try {
      // Use direct fetch to avoid any Supabase client issues
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userId}&select=role_id,roles(name)`,
        {
          method: 'GET',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': token ? `Bearer ${token}` : `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.warn(`Failed to fetch roles: ${response.status} ${response.statusText}`);
        return ['volunteer']; // Default
      }
      
      const rolesData = await response.json();
      console.log('Roles data:', rolesData);
      
      if (!Array.isArray(rolesData) || rolesData.length === 0) {
        return ['volunteer'];
      }
      
      const roles = rolesData.map((r: any) => r.roles?.name || 'volunteer');
      console.log('Mapped roles:', roles);
      return roles;
    } catch (err) {
      console.error('Error fetching roles:', err);
      return ['volunteer']; // Default role on error
    }
  };

  // Setup auth state
  useEffect(() => {
    // Initial loading state
    setLoading(true);
    console.log('Setting up auth state');
    
    // 1. Get direct session from Supabase - use async function to avoid useEffect issues
    const setupAuth = async () => {
      try {
        // First get the current session
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError) {
          console.error('Session retrieval error:', sessionError);
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        console.log('Session check result:', session ? 'Has session' : 'No session');
        
        if (!session) {
          // No active session
          setUser(null);
          setToken(null);
          setActiveRole(null);
          setLoading(false);
          return;
        }
        
        // We have a session, save the token 
        const accessToken = session.access_token;
        setToken(accessToken);
        console.log('Access token retrieved and saved');
        
        try {
          // Get user data
          const { data: userData, error: userError } = await supabaseClient.auth.getUser(accessToken);
          
          if (userError || !userData?.user) {
            throw userError || new Error('No user found');
          }
          
          console.log('User data retrieved:', userData.user.email);
          
          // Get roles for this user
          const roles = await fetchUserRoles(userData.user.id);
          
          // Create user object
          const newUser = {
            id: userData.user.id,
            email: userData.user.email || '',
            full_name: userData.user.user_metadata?.full_name,
            roles: roles,
            avatar_url: userData.user.user_metadata?.avatar_url,
          };
          
          // Set state
          setUser(newUser);
          setActiveRole(roles.includes('admin') ? 'admin' : roles[0]);
          console.log('User authenticated:', newUser.email, 'with roles:', roles);
        } catch (err) {
          console.error('Error retrieving user data:', err);
          setUser(null);
          setActiveRole(null);
        }
      } catch (err) {
        console.error('Unexpected error in auth setup:', err);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };
    
    // Run the setup
    setupAuth();
    
    // Set up session change listener
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change event:', event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in, updating state');
        // Update the token right away
        setToken(session.access_token);
        
        // Then fetch the user - use a non-async function to avoid React warnings
        supabaseClient.auth.getUser(session.access_token).then(({ data, error }) => {
          if (error || !data?.user) {
            console.error('Failed to get user after sign in:', error);
            return;
          }
          
          // Get user ID and fetch roles
          const userId = data.user.id;
          fetchUserRoles(userId).then(roles => {
            // Create and set user object
            setUser({
              id: userId,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name,
              roles: roles,
              avatar_url: data.user.user_metadata?.avatar_url,
            });
            
            setActiveRole(roles.includes('admin') ? 'admin' : roles[0]);
          });
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing state');
        setUser(null);
        setToken(null);
        setActiveRole(null);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('Token refreshed, updating');
        setToken(session.access_token);
      }
    });
    
    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in function 
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`[SimpleAuth] Signing in with email: ${email.substring(0, 3)}...`);
      console.log(`[SimpleAuth] Environment: ${import.meta.env.MODE}, Is secure: ${window.location.protocol === 'https:'}`);
      console.log(`[SimpleAuth] Hostname: ${window.location.hostname}`);
      
      // Clear any existing tokens to prevent conflicts
      supabaseClient.auth.signOut();
      
      // Determine cookie options based on environment
      const isVercel = window.location.hostname.includes('vercel.app');
      const cookieOptions = {
        domain: isVercel ? '.vercel.app' : window.location.hostname,
        secure: window.location.protocol === 'https:',
        path: '/'
      };
      console.log('[SimpleAuth] Using cookie options:', cookieOptions);
      
      // Option 1: Using signInWithPassword (recommended way)
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('[SimpleAuth] Sign in error:', error);
        setError(error.message);
        return false;
      }
      
      if (!data?.user || !data?.session) {
        console.error('[SimpleAuth] No user or session returned after sign in');
        setError('Authentication failed. Please try again.');
        return false;
      }
      
      console.log(`[SimpleAuth] User signed in successfully: ${data.user.id}`);
      console.log(`[SimpleAuth] Session expiry: ${new Date(data.session.expires_at * 1000).toISOString()}`);
      
      // Debug the token
      await debugToken(data.session.access_token);
      
      // Get roles for this user
      const roles = await fetchUserRoles(data.user.id);
      
      // Store user info
      const userWithRoles: User = {
        id: data.user.id,
        email: data.user.email || '',
        full_name: data.user.user_metadata?.full_name,
        roles: roles,
        avatar_url: data.user.user_metadata?.avatar_url,
      };
      
      setUser(userWithRoles);
      setToken(data.session.access_token);
      
      // Let Supabase client handle token storage
      
      return true;
    } catch (err) {
      console.error('[SimpleAuth] Unexpected error during sign in:', err);
      setError('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: { full_name: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Attempting to sign up: ${email}`);
      
      const { error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Sign up successful, awaiting email verification');
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Signing out');
      
      // Use Supabase client to sign out
      const { error } = await supabaseClient.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear state immediately, don't wait for event
      setUser(null);
      setToken(null);
      setActiveRole(null);
      
      console.log('Sign out successful');
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message);
      
      // Force sign out anyway
      setUser(null);
      setToken(null);
      setActiveRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock sign in for development/testing
  const mockSignIn = (role: string) => {
    console.log(`Mock sign in with role: ${role}`);
    
    // Create a mock user
    const mockUser = {
      id: 'mock-user-id',
      email: 'mock@example.com',
      full_name: 'Mock User',
      roles: role === 'admin' ? ['admin', 'coordinator', 'volunteer'] : [role],
    };
    
    // Set mock state
    setUser(mockUser);
    setActiveRole(role);
    setToken(import.meta.env.VITE_SUPABASE_ANON_KEY); // Use anon key as token
    setLoading(false);
    setError(null);
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    authenticated: !!user && !!token,
    activeRole,
    signIn,
    signUp,
    signOut,
    mockSignIn,
    getAuthHeaders,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

// Hook to use auth context
export const useSimpleAuth = () => {
  const context = useContext(SimpleAuthContext);
  
  if (context === undefined) {
    throw new Error('useSimpleAuth must be used within a SimpleAuthProvider');
  }
  
  return context;
}; 