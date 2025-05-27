import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
  requireAllRoles?: boolean;
}

export function ProtectedRoute({
  children,
  requiredRoles,
  requireAllRoles = false,
}: ProtectedRouteProps) {
  console.log('ProtectedRoute: Rendering...');
  const { user, isLoading, hasRole, hasAllRoles, hasAnyRole } = useAuth();
  const location = useLocation();

  console.log('ProtectedRoute: isLoading:', isLoading, 'user:', !!user, 'requiredRoles:', requiredRoles);

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner.');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user, redirecting to login.');
    // Redirect to login page but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles) {
    const hasRequiredRoles = requireAllRoles
      ? hasAllRoles(requiredRoles)
      : hasAnyRole(requiredRoles);

    console.log('ProtectedRoute: User has required roles:', hasRequiredRoles);

    if (!hasRequiredRoles) {
      console.log('ProtectedRoute: User does not have required roles, redirecting to unauthorized.');
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  console.log('ProtectedRoute: Access granted, rendering children.');
  return <>{children}</>;
} 