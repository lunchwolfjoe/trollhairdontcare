import { ReactNode } from 'react';

export type Role = 'coordinator' | 'volunteer' | 'admin';

export interface User {
  id: string;
  email: string;
  roles: Role[];
  full_name?: string;
  avatar_url?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  roles: Role[];
  activeRole: Role | null;
  setActiveRole: (role: Role) => void;
  hasRole: (role: Role) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  signin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signout: () => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  isDevelopment: boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
} 