import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log configuration info
console.log('Auth Context - Supabase Config:', {
  url: supabaseUrl,
  key: supabaseKey ? `${supabaseKey.substring(0, 10)}...` : 'missing',
});

// Create client - do NOT use any custom options here to avoid conflicts
const supabase = createClient(supabaseUrl, supabaseKey);

// User type definition
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
  sessionToken: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  mockSignIn: (role: string) => void;
  mockSignInAdmin: () => void;
  hasRole: (role: string) => boolean;
  setActiveRole: (role: string) => void;
  getAuthHeaders: () => Record<string, string>;
  forceRefresh: () => Promise<boolean>;
};

// Create the context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Provider component
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Helper function to get authentication headers
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    };
    
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    
    return headers;
  };

  // Force refresh function - external way to completely refresh auth state
  const forceRefresh = async (): Promise<boolean> => {
    try {
      // Clear session token to ensure we get a fresh one
      localStorage.removeItem('supabase_auth_token');
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("Session refresh failed:", error);
        setUser(null);
        setActiveRole(null);
        setSessionToken(null);
        setError(error.message);
        return false;
      }

      if (!data.session) {
        return false;
      }

      // Set session token
      const token = data.session.access_token;
      localStorage.setItem('supabase_auth_token', token);
      setSessionToken(token);

      // Get user data with the new token
      await fetchUserData(token);
      return true;
    } catch (e: any) {
      console.error("Error in forceRefresh:", e);
      setError(e.message);
      return false;
    }
  };

  // Function to fetch user data and roles
  const fetchUserData = async (token: string) => {
    try {
      // Get user data
      const { data: userData, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !userData?.user) {
        throw userError || new Error("Failed to get user data");
      }
      
      // Get user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userData.user.id);
      
      if (rolesError) {
        console.warn("Error fetching roles:", rolesError);
      }
      
      // Extract roles or default to volunteer
      const roles = (rolesData || []).map((r: any) => r.roles?.name || 'volunteer');
      if (roles.length === 0) roles.push('volunteer');
      
      // Set user data
      setUser({
        id: userData.user.id,
        email: userData.user.email || '',
        full_name: userData.user.user_metadata?.full_name,
        roles: roles,
        avatar_url: userData.user.user_metadata?.avatar_url,
      });
      
      // Set active role - prefer admin if available
      setActiveRole(roles.includes('admin') ? 'admin' : roles[0]);
      
      return true;
    } catch (e: any) {
      console.error("Error fetching user data:", e);
      setUser(null);
      setActiveRole(null);
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (initialized) return;
    
    const initAuth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to get session token from localStorage first
        const storedToken = localStorage.getItem('supabase_auth_token');
        
        // Get session from Supabase
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        // If we have a session, use it
        if (sessionData?.session) {
          const token = sessionData.session.access_token;
          
          // Store token in localStorage and state
          localStorage.setItem('supabase_auth_token', token);
          setSessionToken(token);
          
          // Fetch user data with token
          await fetchUserData(token);
        } 
        // Try using stored token if available
        else if (storedToken) {
          setSessionToken(storedToken);
          const success = await fetchUserData(storedToken);
          
          // If failed with stored token, clear it
          if (!success) {
            localStorage.removeItem('supabase_auth_token');
            setSessionToken(null);
          }
        }
        // No session or token
        else {
          setUser(null);
          setActiveRole(null);
          setSessionToken(null);
        }
      } catch (e: any) {
        console.error("Error initializing auth:", e);
        setError(e.message);
        setUser(null);
        setActiveRole(null);
        setSessionToken(null);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };
    
    initAuth();
  }, [initialized]);
  
  // Define auth event listener without using onAuthStateChange
  // This avoids the deadlock issue documented in Supabase issues
  useEffect(() => {
    if (!initialized) return;
    
    const handleAuthChange = (event: any) => {
      if (event === 'SIGNED_IN') {
        // Instead of doing auth work in the callback (which can cause deadlocks),
        // simply rerun our initialization logic
        setInitialized(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveRole(null);
        setSessionToken(null);
        localStorage.removeItem('supabase_auth_token');
      }
    };
    
    // Set up manually triggered auth listener
    const setupListener = async () => {
      try {
        const { data } = await supabase.auth.onAuthStateChange((event) => {
          console.log('Auth event:', event);
          handleAuthChange(event);
        });
        return data.subscription.unsubscribe;
      } catch (e) {
        console.error('Error setting up auth listener:', e);
        return () => {};
      }
    };
    
    const unsubscribe = setupListener();
    return () => {
      // Clean up listener
      unsubscribe.then(fn => fn());
    };
  }, [initialized]);

  // Mock sign in for testing
  const mockSignIn = (role: string) => {
    console.log("Using mock sign in with role:", role);
    
    // For admin users, give access to all roles
    const roles = role === 'admin' ? ['admin', 'coordinator', 'volunteer'] : [role];
    
    setUser({
      id: 'mock-user-id',
      email: 'mock@example.com',
      full_name: 'Mock User',
      roles: roles,
    });
    
    setActiveRole(role);
    setLoading(false);
    setError(null);
    
    // Use API key as token for mock users
    const token = supabaseKey;
    setSessionToken(token);
    localStorage.setItem('supabase_auth_token', token);
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.session) {
        throw new Error("No session returned from authentication server");
      }
      
      // We don't need to do anything else here
      // The auth state change listener will trigger and handle the rest
    } catch (e: any) {
      console.error("Sign in error:", e);
      setError(e.message);
      setUser(null);
      setActiveRole(null);
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: { full_name: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
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
      
      console.log("Sign up successful, waiting for email verification");
    } catch (e: any) {
      console.error("Sign up error:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // We'll let the auth change listener handle the state updates
    } catch (e: any) {
      console.error("Sign out error:", e);
      setError(e.message);
      
      // Force clean state on error
      setUser(null);
      setActiveRole(null);
      setSessionToken(null);
      localStorage.removeItem('supabase_auth_token');
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    authenticated: !!user && !!sessionToken,
    activeRole,
    sessionToken,
    signIn,
    signUp,
    signOut,
    mockSignIn,
    mockSignInAdmin: () => mockSignIn('admin'),
    forceRefresh,
    getAuthHeaders,
    
    // Role helper functions
    hasRole: (role: string) => {
      if (!user) return false;
      if (user.roles.includes('admin')) return true;
      return user.roles.includes(role);
    },
    
    // Switch active role
    setActiveRole: (role: string) => {
      if (!user) return;
      if (!user.roles.includes(role) && !user.roles.includes('admin')) return;
      setActiveRole(role);
    }
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