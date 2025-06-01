import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/simpleAuthClient';

// Create Auth context
const AuthContext = createContext(null);

// Auth Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [roles, setRoles] = useState(['volunteer']);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        // Get current session
        const session = await auth.getSession();
        setSession(session);
        
        // Update user if session exists
        if (session) {
          const user = await auth.getUser();
          setUser(user);
          
          // Get user roles if user exists
          if (user) {
            const userRoles = await auth.getUserRoles(user.id);
            setRoles(userRoles);
          }
        }
        
        // Set up auth subscription
        const { data: authListener } = auth.supabase?.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event);
            setSession(session);
            setUser(session?.user || null);
            
            if (session?.user) {
              const userRoles = await auth.getUserRoles(session.user.id);
              setRoles(userRoles);
            } else {
              setRoles(['volunteer']);
            }
          }
        );
        
        setAuthError(null);
        return () => {
          authListener?.subscription?.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthError(error.message || 'Authentication failed');
        // Set default state on error
        setUser(null);
        setSession(null);
        setRoles(['volunteer']);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setAuthError(null);
      setLoading(true);
      const { user, session } = await auth.signIn(email, password);
      return { user, session };
    } catch (error) {
      setAuthError(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setAuthError(null);
      setLoading(true);
      const success = await auth.signOut();
      if (success) {
        setUser(null);
        setSession(null);
        setRoles(['volunteer']);
      }
      return success;
    } catch (error) {
      setAuthError(error.message || 'Failed to sign out');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!requiredRole) return true;
    return roles.includes(requiredRole);
  };

  // The value to be provided to consumers
  const value = {
    user,
    session,
    roles,
    loading,
    error: authError,
    signIn,
    signOut,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Auth hook for component use
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext; 