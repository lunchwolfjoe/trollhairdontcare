import React, { createContext, useState, useEffect, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize a fresh Supabase client to avoid any conflicts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log key for debugging (hiding most of it)
console.log('Auth Context - Supabase Config:', {
  url: supabaseUrl,
  key: supabaseKey ? `${supabaseKey.substring(0, 10)}...${supabaseKey.substring(supabaseKey.length - 5)}` : 'missing',
  keyLength: supabaseKey?.length || 0
});

// Log full URLs and keys in console for debugging (only first time)
console.log(`DEBUG MODE: Auth initialization with URL=${supabaseUrl.substring(0, 15)}...`);

// Create Supabase client with minimal options first
const supabase = createClient(supabaseUrl, supabaseKey);

// User type for our simplified auth context
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
  mockSignIn: (role: string) => void; // For bypass functionality
  mockSignInAdmin: () => void; // Helper for quick testing
  debugAuth: () => Promise<void>; // Added debug function
  hasRole: (role: string) => boolean;
  setActiveRole: (role: string) => void;
  getAuthHeaders: () => Record<string, string>; // Helper for auth headers
  troubleshootAuth: () => Promise<any>; // New troubleshooting function
};

// Create the context
const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined);

// Provider component
export const SimpleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    // Initialize from localStorage if available
    return localStorage.getItem('supabase_auth_token');
  });

  // Helper function to get authentication headers
  const getAuthHeaders = () => {
    // Always include the API key for service access
    const headers: Record<string, string> = {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    };
    
    // Use session token if available for authenticated requests
    const token = sessionToken || supabaseKey;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Setting auth header with', token === supabaseKey ? 'API key' : 'session token');
    }
    
    return headers;
  };

  // Helper to set session token with localStorage persistence
  const setPersistedSessionToken = (token: string | null) => {
    setSessionToken(token);
    
    if (token) {
      localStorage.setItem('supabase_auth_token', token);
      console.log('Session token saved to localStorage');
    } else {
      localStorage.removeItem('supabase_auth_token');
      console.log('Session token removed from localStorage');
    }
  };

  // Debug function to test API directly
  const debugAuth = async () => {
    console.log("Running direct API test");
    
    try {
      // Test basic fetch first
      const testResponse = await fetch(`${supabaseUrl}/rest/v1/festivals?select=*&limit=1`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      console.log('Direct API Test:', {
        status: testResponse.status, 
        ok: testResponse.ok,
        statusText: testResponse.statusText
      });
      
      // Try to read response
      const testJson = await testResponse.json();
      console.log('API Response Data:', testJson);
      
      // Test auth endpoints directly
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || sessionToken;
      
      console.log("Current session token status:", {
        hasSupabaseSession: !!session?.access_token,
        hasStoredToken: !!sessionToken,
        tokenToUse: token ? 'available' : 'missing'
      });
      
      if (token) {
        const authTest = await fetch(`${supabaseUrl}/auth/v1/user`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Auth API Test (with session token):', {
          status: authTest.status,
          ok: authTest.ok,
          statusText: authTest.statusText
        });
        
        if (authTest.ok) {
          const userData = await authTest.json();
          console.log('User data from auth test:', userData);
        }
      } else {
        console.log('No session token available for auth test');
      }
    } catch (e) {
      console.error('Debug test failed:', e);
    }
  };

  // Initialize auth state
  useEffect(() => {
    console.log("SimpleAuthProvider: Initializing auth state");
    
    // Test basic API access
    debugAuth();
    
    // Get initial session
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Try direct session refresh first to ensure we have the most recent session
        const refreshResult = await supabase.auth.refreshSession();
        console.log('Session refresh attempt:', {
          success: !refreshResult.error,
          hasSession: !!refreshResult.data?.session,
          error: refreshResult.error?.message
        });
        
        // Get latest session state after refresh attempt
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session retrieval error:", sessionError);
          setError("Authentication error: " + sessionError.message);
          setUser(null);
          setLoading(false);
          localStorage.removeItem('supabase_auth_token');
          return;
        }
        
        if (sessionData?.session) {
          // Store the session token - ALWAYS UPDATE THIS FIRST
          setPersistedSessionToken(sessionData.session.access_token);
          console.log("Found existing session token:", sessionData.session.access_token.substring(0, 15) + "...");
          
          // We have a valid session - fetch user data
          console.log("Found existing session, getting user data");
          const { data: userData, error: userError } = await supabase.auth.getUser(sessionData.session.access_token);
          
          if (userError || !userData?.user) {
            console.error("User data error:", userError);
            setError("User data error: " + (userError?.message || "No user found"));
            setUser(null);
            localStorage.removeItem('supabase_auth_token');
          } else {
            // Get user roles from profiles/user_roles
            try {
              // Use the session token in the query to ensure it matches the authenticated user
              const { data: rolesData, error: rolesError } = await supabase
                .from('user_roles')
                .select('role_id, roles(name)')
                .eq('user_id', userData.user.id);
                
              if (rolesError) throw rolesError;
                
              const roles = rolesData?.map((r: any) => r.roles?.name || 'volunteer') || ['volunteer'];
                
              // Set authenticated user
              setUser({
                id: userData.user.id,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name,
                roles: roles,
                avatar_url: userData.user.user_metadata?.avatar_url,
              });
                
              setActiveRole(roles.includes('admin') ? 'admin' : roles[0] || 'volunteer');
              console.log("User authenticated with roles:", roles);
            } catch (rolesError) {
              console.error("Error fetching roles:", rolesError);
              // Default to volunteer if we can't get roles
              setUser({
                id: userData.user.id,
                email: userData.user.email || '',
                full_name: userData.user.user_metadata?.full_name,
                roles: ['volunteer'],
                avatar_url: userData.user.user_metadata?.avatar_url,
              });
              setActiveRole('volunteer');
            }
          }
        } else {
          console.log("No existing session found");
          setUser(null);
          setPersistedSessionToken(null);
          localStorage.removeItem('supabase_auth_token');
        }
      } catch (e) {
        console.error("Unexpected error in auth initialization:", e);
        setError("Authentication initialization failed");
        setUser(null);
        localStorage.removeItem('supabase_auth_token');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", event, "Session:", !!session);
      
      if (event === 'SIGNED_IN' && session) {
        // Store session token
        setPersistedSessionToken(session.access_token);
        console.log("New session token stored:", session.access_token.substring(0, 15) + "...");
        
        // Get user roles from profiles/user_roles
        try {
          const { data: userData } = await supabase.auth.getUser();
          
          if (!userData?.user) {
            setUser(null);
            return;
          }
          
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role_id, roles(name)')
            .eq('user_id', userData.user.id);
            
          const roles = rolesData?.map((r: any) => r.roles?.name || 'volunteer') || ['volunteer'];
          
          // Set authenticated user
          setUser({
            id: userData.user.id,
            email: userData.user.email || '',
            full_name: userData.user.user_metadata?.full_name,
            roles: roles,
            avatar_url: userData.user.user_metadata?.avatar_url,
          });
          
          setActiveRole(roles.includes('admin') ? 'admin' : roles[0] || 'volunteer');
        } catch (e) {
          console.error("Error processing sign in:", e);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setActiveRole(null);
        setPersistedSessionToken(null);
        console.log("Session token cleared on sign out");
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Mock sign in for bypass functionality - keep for testing/dev only
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
    
    // Important: For mock users, we need to clear any existing session token
    // and use the API key as the token for API access
    setPersistedSessionToken(supabaseKey);
    console.log("Mock session: Using API key as token");
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting signIn with:", email);
      
      // Perform actual sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Sign in error:", error);
        setError(error.message);
        setUser(null);
        setPersistedSessionToken(null);
        return;
      }
      
      if (!data.session) {
        console.error("Sign in successful but no session returned");
        setError("No session returned from authentication server");
        setUser(null);
        setPersistedSessionToken(null);
        return;
      }
      
      // Store the session token
      setPersistedSessionToken(data.session.access_token);
      console.log("Sign in successful with token:", data.session.access_token.substring(0, 15) + "...");
      
      if (!data.user) {
        console.log("No user data after sign in");
        setError("Failed to get user data after sign in");
        setUser(null);
        return;
      }
      
      // Get user roles from profiles/user_roles
      try {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', data.user.id);
          
        const roles = rolesData?.map((r: any) => r.roles?.name || 'volunteer') || ['volunteer'];
        
        // Set authenticated user
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          roles: roles,
          avatar_url: data.user.user_metadata?.avatar_url,
        });
        
        setActiveRole(roles.includes('admin') ? 'admin' : roles[0] || 'volunteer');
      } catch (rolesError) {
        console.error("Error fetching roles:", rolesError);
        // Default to volunteer if we can't get roles
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          full_name: data.user.user_metadata?.full_name,
          roles: ['volunteer'],
          avatar_url: data.user.user_metadata?.avatar_url,
        });
        setActiveRole('volunteer');
      }
    } catch (e: any) {
      console.error("Sign in exception:", e);
      setError(e.message || "Failed to sign in");
      setUser(null);
      setPersistedSessionToken(null);
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, userData: { full_name: string }) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Attempting sign up with:", email);
      
      // Register the user with Supabase
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
        console.error("Sign up error:", error);
        setError(error.message);
        return;
      }
      
      console.log("Sign up successful, waiting for email verification");
      
      // Supabase will automatically create the profile via triggers
      // Default role is volunteer
      
      // Don't set user yet - they need to verify email first
      setError(null);
    } catch (e: any) {
      console.error("Sign up exception:", e);
      setError(e.message || "Failed to sign up");
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call actual sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        setError(error.message);
      } else {
        setUser(null);
        setActiveRole(null);
        setPersistedSessionToken(null);
      }
    } catch (e: any) {
      console.error("Sign out exception:", e);
      setError(e.message || "Failed to sign out");
    } finally {
      setLoading(false);
    }
  };

  // Add new troubleshooting function
  const troubleshootAuth = async (): Promise<any> => {
    console.log("=== STARTING AUTH TROUBLESHOOTING ===");
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {
        url: supabaseUrl,
        keyPresent: !!supabaseKey,
        keyLength: supabaseKey?.length || 0
      },
      localStorage: {},
      sessionCheck: {},
      tokenTest: {},
      userQuery: {},
      rolesQuery: {}
    };
    
    // Check localStorage
    try {
      const localStorageKeys = ['supabase_auth_token', 'supabase.auth.token'];
      for (const key of localStorageKeys) {
        const token = localStorage.getItem(key);
        results.localStorage[key] = {
          present: !!token,
          preview: token ? `${token.substring(0, 10)}...` : null,
          length: token?.length || 0
        };
      }
    } catch (e) {
      results.localStorage.error = e.message;
    }
    
    // Test session
    try {
      const { data, error } = await supabase.auth.getSession();
      results.sessionCheck = {
        success: !error && !!data?.session,
        hasSession: !!data?.session,
        sessionToken: data?.session?.access_token ? 
          `${data.session.access_token.substring(0, 10)}...` : null,
        error: error ? error.message : null
      };
      
      // Also check if we can refresh the session
      if (data?.session) {
        try {
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          results.sessionCheck.refreshResult = {
            success: !refreshError && !!refreshData?.session,
            error: refreshError ? refreshError.message : null
          };
        } catch (e) {
          results.sessionCheck.refreshResult = { 
            success: false, 
            error: e.message 
          };
        }
      }
    } catch (e) {
      results.sessionCheck.exception = e.message;
    }
    
    // Test token via direct fetch
    try {
      const token = sessionToken || localStorage.getItem('supabase_auth_token');
      const apiKey = supabaseKey;
      
      // Try with session token
      if (token) {
        const sessionTokenResponse = await fetch(`${supabaseUrl}/rest/v1/festivals?select=*&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': apiKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        results.tokenTest.sessionToken = {
          status: sessionTokenResponse.status,
          ok: sessionTokenResponse.ok,
          statusText: sessionTokenResponse.statusText
        };
        
        if (sessionTokenResponse.ok) {
          const data = await sessionTokenResponse.json();
          results.tokenTest.sessionToken.dataCount = Array.isArray(data) ? data.length : 'not array';
        }
      }
      
      // Always try with API key (should work for unauthenticated operations)
      const apiKeyResponse = await fetch(`${supabaseUrl}/rest/v1/festivals?select=*&limit=1`, {
        method: 'GET',
        headers: {
          'apikey': apiKey,
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      results.tokenTest.apiKey = {
        status: apiKeyResponse.status,
        ok: apiKeyResponse.ok,
        statusText: apiKeyResponse.statusText
      };
      
      if (apiKeyResponse.ok) {
        const data = await apiKeyResponse.json();
        results.tokenTest.apiKey.dataCount = Array.isArray(data) ? data.length : 'not array';
      }
    } catch (e) {
      results.tokenTest.exception = e.message;
    }
    
    // Try user query
    try {
      const { data, error } = await supabase.auth.getUser();
      results.userQuery = {
        success: !error && !!data?.user,
        hasUser: !!data?.user,
        userId: data?.user?.id,
        email: data?.user?.email,
        error: error ? error.message : null
      };
    } catch (e) {
      results.userQuery.exception = e.message;
    }
    
    // Try roles query if we have a user
    if (results.userQuery.userId) {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role_id, roles(name)')
          .eq('user_id', results.userQuery.userId);
        
        results.rolesQuery = {
          success: !error,
          count: data?.length || 0,
          roles: data?.map((r: any) => (r.roles?.name || r.role_id || 'unknown')),
          error: error ? error.message : null
        };
      } catch (e) {
        results.rolesQuery.exception = e.message;
      }
    }
    
    console.log("=== AUTH TROUBLESHOOTING RESULTS ===", results);
    return results;
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
    mockSignInAdmin: () => mockSignIn('admin'), // Helper for quick testing
    debugAuth,
    troubleshootAuth, // Add the new function
    getAuthHeaders,
    
    // Add helper functions for role checking
    hasRole: (role: string) => {
      if (!user) return false;
      
      // Admin role has access to everything
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

  // Debug authentication state on every render
  console.log('SimpleAuthContext current state:', {
    hasUser: !!user,
    userId: user?.id || 'none',
    hasToken: !!sessionToken,
    tokenPreview: sessionToken ? `${sessionToken.substring(0, 10)}...` : 'none',
    authenticated: !!user && !!sessionToken,
    activeRole
  });

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