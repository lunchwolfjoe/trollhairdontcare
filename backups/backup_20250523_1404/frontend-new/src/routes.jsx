import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SimpleLogin } from './pages/SimpleLogin';
import DebugEnv from './components/DebugEnv';
import { ProtectedRoute } from './components/ProtectedRoute';

// Simple dashboard component that we'll replace later
const DashboardPlaceholder = () => (
  <div style={{ 
    padding: '20px',
    textAlign: 'center',
    marginTop: '40px'
  }}>
    <h1>Dashboard</h1>
    <p>This is a placeholder for the dashboard that will be implemented later.</p>
    <div style={{ marginTop: '20px' }}>
      <a 
        href="/debug" 
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          marginRight: '10px'
        }}
      >
        Debug Environment
      </a>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<SimpleLogin />} />
      <Route path="/debug" element={<DebugEnv />} />
      
      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardPlaceholder />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPlaceholder />
        </ProtectedRoute>
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes; 