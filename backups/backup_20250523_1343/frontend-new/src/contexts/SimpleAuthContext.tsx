import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSupabaseClient } from '../lib/supabase';

// Track if we've already run the auth setup to prevent infinite loops
let authSetupInitialized = false;

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
  sessionToken: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: { full_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  getAuthHeaders: () => Record<string, string>;
  setActiveRole: (role: string) => void;
};

// Create context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Provider component
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [supabaseInitialized, setSupabaseInitialized] = useState(false);
  
  // Get supabase client safely with error handling
  let supabase;
  try {
    supabase = getSupabaseClient();
    if (!supabaseInitialized) {
      setSupabaseInitialized(true);
    }
  } catch (err) {
    console.error('Failed to get Supabase client:', err);
    if (!error) {
      setError('Failed to initialize Supabase client');
      setLoading(false);
    }
    // Return early if we can't get the client
    if (!supabaseInitialized) {
      return (
        <SimpleAuthContext.Provider 
          value={{
            user: null,
            loading: false,
            error: 'Supabase client initialization failed',
            authenticated: false,
            activeRole: null,
            sessionToken: null,
            signIn: async () => false,
            signUp: async () => {},
            signOut: async () => {},
            getAuthHeaders: () => ({}),
            setActiveRole: () => {},
          }}
        >
          {children}
        </SimpleAuthContext.Provider>
      );
    }
  }

  // Fetch user roles by ID - with error handling
  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    if (!supabase) {
      console.error('Cannot fetch roles: Supabase client not available');
      return ['volunteer']; // Default role on error
    }
    
    try {
      // Get roles for this user from the database
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId);
      
      if (error || !data || data.length === 0) {
        console.log("No roles found, defaulting to volunteer");
        return ['volunteer']; // Default role
      }
      
      const roles = data.map((r: any) => r.roles?.name || 'volunteer');
      return roles;
    } catch (err) {
      console.error('Error fetching roles:', err);
      return ['volunteer']; // Default role on error
    }
  };

  // Function to load user data
  const loadUserData = async () => {
    // Prevent recursive calls
    if (authSetupInitialized) {
      console.log('Auth setup already initialized, skipping duplicate call');
      return;
    }
    
    authSetupInitialized = true;
    
    try {
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Check for session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw sessionError;
      }
      
      if (!session) {
        setUser(null);
        setActiveRole(null);
        setSessionToken(null);
        setLoading(false);
        return;
      }
      
      // Store session token
      setSessionToken(session.access_token);
      
      // Try to get user data
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          // Try to refresh the session if we get an error
          const { error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error('Failed to refresh session:', refreshError);
            throw refreshError;
          }
          
          // Try getting the user again after refresh
          const { data: refreshedData, error: refreshedError } = await supabase.auth.getUser();
          
          if (refreshedError || !refreshedData?.user) {
            throw refreshedError || new Error('No user found after refresh');
          }
          
          const roles = await fetchUserRoles(refreshedData.user.id);
          
          setUser({
            id: refreshedData.user.id,
            email: refreshedData.user.email || '',
            full_name: refreshedData.user.user_metadata?.full_name,
            roles: roles,
            avatar_url: refreshedData.user.user_metadata?.avatar_url,
          });
          
          setActiveRole(roles.includes('admin') ? 'admin' : roles[0]);
          return;
        }
        
        if (!userData?.user) {
          throw new Error('No user found');
        }
        
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
        
      } catch (err) {
        console.error('Error retrieving user data:', err);
        setUser(null);
        setActiveRole(null);
        setSessionToken(null);
      }
    } catch (err) {
      console.error('Unexpected error in auth setup:', err);
      setError('Failed to initialize authentication');
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Setup auth state - only once
  useEffect(() => {
    if (supabase) {
      loadUserData();
      
      // Set up session change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Handle the sign-in event
          try {
            // Store the session token
            setSessionToken(session.access_token);
            
            const { data, error } = await supabase.auth.getUser();
            
            if (error || !data?.user) {
              console.error('Failed to get user after sign in:', error);
              return;
            }
            
            // Get user ID and fetch roles
            const userId = data.user.id;
            const roles = await fetchUserRoles(userId);
            
            // Create and set user object
            setUser({
              id: userId,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name,
              roles: roles,
              avatar_url: data.user.user_metadata?.avatar_url,
            });
            
            setActiveRole(roles.includes('admin') ? 'admin' : roles[0]);
          } catch (err) {
            console.error('Error handling auth state change:', err);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setActiveRole(null);
          setSessionToken(null);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Update session token when refreshed
          setSessionToken(session.access_token);
          // Token was refreshed, update our user data
          // We use a different loading approach to avoid recursion
          try {
            // Get user data
            const { data, error } = await supabase.auth.getUser();
            
            if (error || !data?.user) {
              console.error('Failed to get user after token refresh:', error);
              return;
            }
            
            // Get user ID and fetch roles
            const userId = data.user.id;
            const roles = await fetchUserRoles(userId);
            
            // Create and set user object
            setUser({
              id: userId,
              email: data.user.email || '',
              full_name: data.user.user_metadata?.full_name,
              roles: roles,
              avatar_url: data.user.user_metadata?.avatar_url,
            });
          } catch (err) {
            console.error('Error handling token refresh:', err);
          }
        }
      });
      
      // Cleanup
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [supabaseInitialized]);

  // Sign in function 
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      setError('Authentication service is not available');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("Signing in with:", { email });
      
      // Sign in with password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Sign in error:', error);
        setError(error.message);
        return false;
      }
      
      if (!data?.user || !data?.session) {
        setError('Authentication failed. Please try again.');
        return false;
      }
      
      // Store session token immediately
      setSessionToken(data.session.access_token);
      
      console.log("Auth successful, session established");
      return true;
    } catch (err) {
      console.error('Unexpected error during sign in:', err);
      setError('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: { full_name: string }) => {
    if (!supabase) {
      setError('Authentication service is not available');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
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
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    if (!supabase) {
      setUser(null);
      setActiveRole(null);
      setSessionToken(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Use Supabase client to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear state immediately, don't wait for event
      setUser(null);
      setActiveRole(null);
      setSessionToken(null);
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message);
      
      // Force sign out anyway
      setUser(null);
      setActiveRole(null);
      setSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Add getAuthHeaders function
  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (sessionToken) {
      headers['Authorization'] = `Bearer ${sessionToken}`;
    }
    
    return headers;
  };

  // Add role switching function
  const handleRoleChange = (role: string) => {
    if (user && user.roles.includes(role)) {
      console.log(`Switching active role to: ${role}`);
      setActiveRole(role);
    } else {
      console.error(`Cannot set active role to ${role}. User does not have this role.`);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    authenticated: !!user,
    activeRole,
    sessionToken,
    signIn,
    signUp,
    signOut,
    getAuthHeaders,
    setActiveRole: handleRoleChange,
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