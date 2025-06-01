import React, { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { Role } from './auth.types';

interface MockAuthProviderProps {
  children: ReactNode;
  role: Role;
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ 
  children, 
  role 
}) => {
  // Create a mock user with the specified role
  const mockUser = {
    id: 'mock-user-id',
    email: 'mock@example.com',
    full_name: 'Mock User',
    avatar_url: '',
    roles: [role],
    phone: '555-555-5555'
  };

  // Mock auth context values
  const mockAuthValues = {
    user: mockUser,
    loading: false,
    authenticated: true,
    roles: [role],
    activeRole: role,
    signIn: async () => { console.log('Mock sign in'); },
    signUp: async () => { console.log('Mock sign up'); },
    signOut: async () => { console.log('Mock sign out'); },
    hasRole: (r: Role) => mockUser.roles.includes(r),
    hasAnyRole: (roles: Role[]) => roles.some(r => mockUser.roles.includes(r)),
    setActiveRole: () => { console.log('Mock set active role'); },
    isDevelopment: true
  };

  return (
    <AuthContext.Provider value={mockAuthValues}>
      {children}
    </AuthContext.Provider>
  );
}; 