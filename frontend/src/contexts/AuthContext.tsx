import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { AuthContextType, Role, Session, User } from '../types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session>({
  user: null,
  roles: [],
    isLoading: true,
    error: null,
});

  useEffect(() => {
    console.log('AuthContext: Initializing auth...');
    // Check for existing session on mount
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          const roles = await authService.getUserRoles(user.id);
          console.log('AuthContext: User found', user.id, 'Roles:', roles);
          setSession({
            user,
            roles: roles.map(r => r.role),
            isLoading: false,
            error: null,
          });
        } else {
          console.log('AuthContext: No user found');
          setSession({
            user: null,
            roles: [],
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('AuthContext: Error during initialization', error);
        setSession({
          user: null,
          roles: [],
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to initialize auth'),
        });
        }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Signing in...');
      setSession(prev => ({ ...prev, isLoading: true, error: null }));
      const user = await authService.signIn(email, password);
      if (user) {
        const roles = await authService.getUserRoles(user.id);
        console.log('AuthContext: Sign in successful', user.id, 'Roles:', roles);
        setSession({
          user,
          roles: roles.map(r => r.role),
          isLoading: false,
          error: null,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('AuthContext: Sign in failed', error);
      setSession(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign in'),
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out...');
      setSession(prev => ({ ...prev, isLoading: true, error: null }));
      await authService.signOut();
      console.log('AuthContext: Sign out successful');
      setSession({
        user: null,
        roles: [],
        isLoading: false,
        error: null,
      });
      navigate('/login');
    } catch (error) {
      console.error('AuthContext: Sign out failed', error);
      setSession(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error : new Error('Failed to sign out'),
      }));
      throw error;
    }
  };

  const hasRole = (role: Role): boolean => {
    return session.roles.includes(role);
  };

  const hasAnyRole = (roles: Role[]): boolean => {
    return roles.some(role => session.roles.includes(role));
  };

  const hasAllRoles = (roles: Role[]): boolean => {
    return roles.every(role => session.roles.includes(role));
  };

  const value: AuthContextType = {
    ...session,
    signIn,
    signOut,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
   console.log('useAuth: Context value:', context === undefined ? 'undefined' : 'defined', 'isLoading:', context?.isLoading);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 
