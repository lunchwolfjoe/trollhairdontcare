import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { authService, getUserRoles } from '../lib/services';
import { AuthContextType, AuthProviderProps, Role, User } from './auth.types';

// Define development mode
const isDevelopment = import.meta.env.MODE === 'development' || window.location.hostname === 'localhost';

// Create context with undefined default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Main AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [activeRole, setActiveRole] = useState<Role | null>(null);

  // Initialize auth state on mount and listen for auth changes
  useEffect(() => {
    // Check for existing session on component mount
    const initializeAuth = async () => {
      setLoading(true);
      
      // Get current session
      const { data, error } = await authService.getSession();
      
      if (error || !data) {
        console.log('No active session found');
        setLoading(false);
        return;
      }
      
      await fetchUserData(data.user.id);
    };
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          await fetchUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setAuthenticated(false);
          setRoles([]);
          setActiveRole(null);
        }
      }
    );
    
    initializeAuth();
    
    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Fetch user's data, including profile and roles
  const fetchUserData = async (userId: string) => {
    setLoading(true);
    
    try {
      // Get user's roles
      const userRoles = await getUserRoles() as Role[];
      
      // Get user's profile
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      const userWithRoles: User = {
        id: userId,
        email: userData?.email || '',
        roles: userRoles,
        full_name: userData?.full_name,
        avatar_url: userData?.avatar_url
      };
      
      setUser(userWithRoles);
      setRoles(userRoles);
      setAuthenticated(true);
      
      // Set initial active role (prefer coordinator > volunteer > admin)
      if (userRoles.includes('coordinator')) {
        setActiveRole('coordinator');
      } else if (userRoles.includes('volunteer')) {
        setActiveRole('volunteer');
      } else if (userRoles.includes('admin')) {
        setActiveRole('admin');
      } else {
        setActiveRole(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if user has a specific role
  const checkHasRole = (role: Role): boolean => {
    return roles.includes(role);
  };

  // Check if user has any of the specified roles
  const checkHasAnyRole = (rolesToCheck: Role[]): boolean => {
    return rolesToCheck.some(role => roles.includes(role));
  };

  // Sign in user
  const signin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      const { data, error } = await authService.login({ email, password });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      if (!data?.user) {
        return {
          success: false,
          error: 'No user data returned'
        };
      }
      
      // User data will be fetched via onAuthStateChange listener
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An unknown error occurred'
      };
    } finally {
      setLoading(false);
    }
  };

  // Sign out user
  const signout = async (): Promise<void> => {
    setLoading(true);
    await authService.logout();
    setLoading(false);
  };

  // Sign up new user
  const signup = async (
    email: string, 
    password: string, 
    fullName?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    
    try {
      const { data, error } = await authService.register({
        email,
        password,
        full_name: fullName
      });
      
      if (error) {
        return {
          success: false,
          error: error.message
        };
      }
      
      if (!data?.user) {
        return {
          success: false,
          error: 'No user data returned'
        };
      }
      
      // User data will be fetched via onAuthStateChange listener
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'An unknown error occurred'
      };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    authenticated,
    roles,
    activeRole,
    setActiveRole,
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,
    signin,
    signout,
    signup,
    isDevelopment
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 
