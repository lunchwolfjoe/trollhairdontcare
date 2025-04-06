import React, { createContext, useState, useContext, ReactNode } from 'react';

type Role = 'coordinator' | 'volunteer' | 'admin';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [role, setRole] = useState<Role>('volunteer');
  // Simplified auth - no real authentication needed for now
  const [user] = useState({ id: 'mock-user-id', email: 'user@example.com' });
  const [loading] = useState(false);

  return (
    <AuthContext.Provider value={{ role, setRole, user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 