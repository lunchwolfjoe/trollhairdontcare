import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { hasRole } from '../../lib/supabase';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: string;
  fallbackPath?: string;
}

export default function RoleGuard({ 
  children, 
  requiredRole, 
  fallbackPath = '/dashboard' 
}: RoleGuardProps) {
  const { user, loading } = useAuth();
  const [hasRequiredRole, setHasRequiredRole] = useState<boolean | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setHasRequiredRole(false);
        setCheckingRole(false);
        return;
      }

      try {
        // Check if user has the required role
        const userHasRole = await hasRole(requiredRole);
        setHasRequiredRole(userHasRole);
      } catch (error) {
        console.error('Error checking user role:', error);
        setHasRequiredRole(false);
      } finally {
        setCheckingRole(false);
      }
    };

    checkUserRole();
  }, [user, requiredRole]);

  // Show loading while checking authentication or role
  if (loading || checkingRole) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to fallback if user doesn't have the required role
  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Return children if user has the required role
  return <>{children}</>;
} 