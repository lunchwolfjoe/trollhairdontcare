import React, { createContext, useState, useEffect, useContext } from 'react';
import { getSupabaseClient } from '../lib/supabase';

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
};

// Create context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Provider component
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);

  // Get supabase client
  const supabase = getSupabaseClient();

  // Fetch user roles by ID
  const fetchUserRoles = async (userId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role_id, roles(name)')
        .eq('user_id', userId);
      
      if (error || !data || data.length === 0) {
        return ['volunteer']; // Default role
      }
      
      const roles = data.map((r: any) => r.roles?.name || 'volunteer');
      return roles;
    } catch (err) {
      console.error('Error fetching roles:', err);
      return ['volunteer']; // Default role on error
    }
  };

  // Setup auth state
  useEffect(() => {
    setLoading(true);
    
    const setupAuth = async () => {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          setError(sessionError.message);
          setLoading(false);
          return;
        }
        
        if (!session) {
          // No active session
          setUser(null);
          setActiveRole(null);
          setLoading(false);
          return;
        }
        
        try {
          // Get user data
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData?.user) {
            throw userError || new Error('No user found');
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Then fetch the user
        supabase.auth.getUser().then(({ data, error }) => {
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
        setUser(null);
        setActiveRole(null);
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
      // Clear any existing session first
      await supabase.auth.signOut();
      
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
      
      console.log("Auth successful, session established");
      
      // Get roles for this user - user data is handled by the auth state listener
      // so we don't need to manually set it here
      
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
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message);
      
      // Force sign out anyway
      setUser(null);
      setActiveRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    loading,
    error,
    authenticated: !!user,
    activeRole,
    signIn,
    signUp,
    signOut,
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