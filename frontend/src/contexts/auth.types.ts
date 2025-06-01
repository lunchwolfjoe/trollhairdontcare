import { ReactNode } from 'react';

export type Role = 'admin' | 'coordinator' | 'volunteer' | 'guest';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  roles: Role[];
  phone?: string;
}

export interface SessionData {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    user_metadata: any;
  };
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  roles: Role[];
  activeRole: Role | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: Role) => boolean;
  setActiveRole: (role: Role) => void;
}

export interface AuthProviderProps {
  children: ReactNode;
} 