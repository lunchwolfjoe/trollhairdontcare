import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/BasicAuthContext';
import { useAuth } from './contexts/BasicAuthContext';
import { SimpleLogin } from './pages/SimpleLogin';
import DebugEnv from './components/DebugEnv';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from './theme';

// Protected route component
const ProtectedRoute = ({ children, requiredRole }) => {
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

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<SimpleLogin />} />
      <Route path="/debug" element={<DebugEnv />} />
      
      {/* Home route redirects based on authentication */}
      <Route path="/" element={
        user 
          ? <Navigate to="/dashboard" replace /> 
          : <Navigate to="/login" replace />
      } />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div>Dashboard (Will implement later)</div>
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 