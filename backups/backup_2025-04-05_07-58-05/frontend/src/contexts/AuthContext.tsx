import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  // Dev mode controls
  isDevMode: boolean;
  setDevMode: (enabled: boolean) => void;
  devUserRole: string | null;
  setDevUserRole: (role: string | null) => void;
  setDevRole?: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development mode flag
const DEV_MODE = true; // Set this to true to bypass authentication

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>('coordinator'); // Set default role for development
  const [loading, setLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(DEV_MODE);
  const [devUserRole, setDevUserRole] = useState<string | null>('coordinator');

  useEffect(() => {
    if (isDevMode) {
      // In development mode, create a mock user based on selected role
      const mockUser = {
        id: "dev-user-id",
        email: "dev@example.com",
        role: devUserRole,
      } as User;
      setUser(mockUser);
      setRole(devUserRole);
      setLoading(false);
      return;
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [isDevMode, devUserRole]);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      setRole(data?.role || null);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    if (isDevMode) {
      console.log("Development mode: Sign in attempted with", email);
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    if (isDevMode) {
      console.log("Development mode: Sign up attempted with", email);
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/volunteer/profile`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    if (isDevMode) {
      console.log("Development mode: Sign out attempted");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const setDevRole = (newRole: string | null) => {
    setRole(newRole);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signIn,
        signUp,
        signOut,
        // Dev mode controls
        isDevMode,
        setDevMode: setIsDevMode,
        devUserRole,
        setDevUserRole,
        setDevRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 