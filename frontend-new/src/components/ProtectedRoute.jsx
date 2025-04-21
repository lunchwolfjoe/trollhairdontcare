import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/BasicAuthContext';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading, hasRole } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/access-denied" replace />;
  }
  
  return children;
}; 