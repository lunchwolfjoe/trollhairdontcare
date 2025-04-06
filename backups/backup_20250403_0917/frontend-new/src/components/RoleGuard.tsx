import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('coordinator' | 'volunteer')[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    // Redirect to the appropriate dashboard based on current role
    return <Navigate to={role === 'coordinator' ? '/coordinator' : '/volunteer'} replace />;
  }

  return <>{children}</>;
} 