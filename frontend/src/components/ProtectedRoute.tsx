import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You might want to use a proper loading component
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
} 
