import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = "https://ysljpqtpbpugekhrdocq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGpwcXRwYnB1Z2VraHJkb2NxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMzOTYxMTQsImV4cCI6MjA1ODk3MjExNH0.Vm9ur1yoEIr_4Dc1IrDax5M_-5qASydr6inbf4VhP5c";

console.log('Auth context initialized with URL:', SUPABASE_URL);

// Create a basic Supabase client for data operations
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: { full_name: string }) => Promise<void>;
  signOut: () => Promise<void>;
  mockSignIn: (role: string) => void;
  getAuthHeaders: () => Record<string, string>;
};

// Create context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

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
      'apikey': SUPABASE_KEY,
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };
  
  // Direct API call to get user data with a token
  const fetchUserWithToken = async (authToken: string) => {
    try {
      // Call auth API to get user data
      const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!userResponse.ok) {
        throw new Error(`Failed to get user: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      
      // Get user roles with a simple query
      const rolesResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/user_roles?user_id=eq.${userData.id}&select=role_id,roles(name)`,
        {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!rolesResponse.ok) {
        console.warn('Failed to fetch roles, using default role');
        
        // Set user with default role
        const newUser = {
          id: userData.id,
          email: userData.email || '',
          full_name: userData.user_metadata?.full_name,
          roles: ['volunteer'],
          avatar_url: userData.user_metadata?.avatar_url,
        };
        
        setUser(newUser);
        setActiveRole('volunteer');
        return newUser;
      }
      
      const rolesData = await rolesResponse.json();
      
      // Extract roles
      const roles = rolesData.length > 0 
        ? rolesData.map((r: any) => r.roles?.name || 'volunteer')
        : ['volunteer'];
      
      // Create user object
      const newUser = {
        id: userData.id,
        email: userData.email || '',
        full_name: userData.user_metadata?.full_name,
        roles: roles,
        avatar_url: userData.user_metadata?.avatar_url,
      };
      
      // Update state
      setUser(newUser);
      setActiveRole(roles.includes('admin') ? 'admin' : roles[0]);
      
      return newUser;
    } catch (err) {
      console.error('Error fetching user:', err);
      return null;
    }
  };

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      try {
        // Try to get stored token
        const storedToken = localStorage.getItem('auth_token');
        
        if (!storedToken) {
          // No token found
          setUser(null);
          setActiveRole(null);
          setToken(null);
          setLoading(false);
          return;
        }
        
        // Validate token by fetching user
        setToken(storedToken);
        const userData = await fetchUserWithToken(storedToken);
        
        if (!userData) {
          // Invalid token
          localStorage.removeItem('auth_token');
          setUser(null);
          setActiveRole(null);
          setToken(null);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
        setError(err.message);
        
        // Clear invalid auth state
        localStorage.removeItem('auth_token');
        setUser(null);
        setActiveRole(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  // Sign in function using direct API call
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Call auth API directly
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error_description || data.error || 'Authentication failed');
      }
      
      // Get the access token
      const accessToken = data.access_token;
      
      if (!accessToken) {
        throw new Error('No access token returned');
      }
      
      // Store token
      localStorage.setItem('auth_token', accessToken);
      setToken(accessToken);
      
      // Get user details
      await fetchUserWithToken(accessToken);
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message);
      
      // Clear any partial auth state
      localStorage.removeItem('auth_token');
      setUser(null);
      setActiveRole(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign up function - we'll use Supabase client for this since it's less critical
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
      // Clear token and user state
      localStorage.removeItem('auth_token');
      setUser(null);
      setActiveRole(null);
      setToken(null);
      
      // Also try to sign out via API
      await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err: any) {
      console.error('Sign out error:', err);
      setError(err.message);
      
      // Force logout anyway
      localStorage.removeItem('auth_token');
      setUser(null);
      setActiveRole(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock sign in for development/testing
  const mockSignIn = (role: string) => {
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
    setToken(SUPABASE_KEY); // Use anon key as token
    localStorage.setItem('auth_token', SUPABASE_KEY);
    
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