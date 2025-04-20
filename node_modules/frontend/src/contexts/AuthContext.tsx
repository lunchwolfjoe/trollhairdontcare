import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuthContextType, User, Role, AuthProviderProps, SessionData } from './auth.types';

// Define development mode
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

// Create context with default values
export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  authenticated: false,
  roles: [],
  activeRole: null,
  signIn: async () => { throw new Error('signIn called before AuthProvider initialized'); },
  signUp: async () => { throw new Error('signUp called before AuthProvider initialized'); },
  signOut: async () => { throw new Error('signOut called before AuthProvider initialized'); },
  hasRole: () => false,
  setActiveRole: () => { throw new Error('setActiveRole called before AuthProvider initialized'); },
  isDevelopment: isDevelopment,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Main AuthProvider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  useEffect(() => {
    let mounted = true;

    // Check active session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (data.session && mounted) {
          await handleSession(data.session);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error during session check:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          if (session && mounted) {
            await handleSession(session);
          } else if (mounted) {
            setUser(null);
            setRoles([]);
            setActiveRole(null);
          }
        } catch (err) {
          console.error('Error in auth state change:', err);
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = async (session: SessionData) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        const userData: User = {
          id: profile.id,
          email: profile.email || session.user.email,
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url || '',
          roles: profile.roles || [],
          phone: profile.phone
        };
        setUser(userData);
        setRoles(userData.roles);
        setActiveRole(userData.roles[0] || null);
      }
    } catch (err) {
      console.error('Error handling session:', err);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { error: signUpError, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            roles: ['volunteer']
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email,
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            roles: ['volunteer']
          });
          
        if (profileError) throw profileError;
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const hasRole = (role: Role) => {
    return roles.includes(role);
  };

  const value = {
    user,
    loading,
    authenticated: !!user,
    roles,
    activeRole,
    signIn,
    signUp,
    signOut,
    hasRole,
    setActiveRole,
    isDevelopment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
