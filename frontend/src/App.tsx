import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { VolunteerLayout } from "./components/VolunteerLayout";
import { CoordinatorLayout } from "./components/CoordinatorLayout";
import { AdminLayout } from "./components/AdminLayout";
import { VolunteerDashboard } from "./features/volunteer/VolunteerDashboard";
import { ShiftSwapRequest } from "./features/volunteer/ShiftSwapRequest";
import { TaskManagement } from "./features/coordinator/TaskManagement";
import { VolunteerTasks } from "./features/volunteer/VolunteerTasks";
import { ShiftSwapManagement } from "./features/coordinator/ShiftSwapManagement";
import { CoordinatorDashboard } from "./features/coordinator/CoordinatorDashboard";
import { AutoScheduler } from "./features/coordinator/AutoScheduler";
import { WeatherMonitoring } from "./features/coordinator/WeatherMonitoring";
import { CrewManagement } from "./features/coordinator/CrewManagement";
import { Map } from "./features/coordinator/Map";
import { VectorizedMap } from "./features/coordinator/VectorizedMap";
import { AssetManagement } from "./features/coordinator/AssetManagement";
import { IncidentLogging } from "./features/coordinator/IncidentLogging";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { AdminFestivals } from "./features/admin/AdminFestivals";
import { UserManagement } from "./features/admin/UserManagement";
import { SystemSettings } from "./features/admin/SystemSettings";
import { RoleSwitcher } from "./components/RoleSwitcher";
import { VolunteerAvailability } from "./features/volunteer/VolunteerAvailability";
import { VolunteerManagement } from "./features/coordinator/VolunteerManagement";
import { Communications } from "./features/coordinator/Communications";
import { ReportingAnalytics } from "./features/coordinator/ReportingAnalytics";
import { WaiverSystem } from "./features/volunteer/WaiverSystem";
import { FestivalManagement } from "./features/coordinator/FestivalManagement";
import { FestivalDashboard } from "./features/coordinator/FestivalDashboard";
import { WelcomeHomePortal } from "./features/coordinator/WelcomeHomePortal";
import { AccessDenied } from "./pages/AccessDenied";
import { VolunteerCommunications } from "./features/volunteer/VolunteerCommunications";
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { DashboardPage } from './pages/DashboardPage';
import { FestivalsPage } from './pages/FestivalsPage';
import { CrewsPage } from './pages/CrewsPage';
import { TasksPage } from './pages/TasksPage';
import { AdminPage } from './pages/AdminPage';
import { supabase } from './lib/supabaseClient';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/access-denied" element={<UnauthorizedPage />} />

            {/* Protected routes, wrapped individually */}
            <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
            <Route path="/festivals/*" element={<ProtectedRoute><Layout><FestivalsPage /></Layout></ProtectedRoute>} />
            <Route path="/crews/*" element={<ProtectedRoute><Layout><CrewsPage /></Layout></ProtectedRoute>} />
            <Route path="/tasks/*" element={<ProtectedRoute><Layout><TasksPage /></Layout></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute><Layout><AdminPage /></Layout></ProtectedRoute>} />

            {/* Catch all - redirect to dashboard if authenticated, login otherwise (handled by ProtectedRoute logic for '/') */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
             {/* Fallback for the root path, also protected */}
            <Route path="/" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

// Make sure the Supabase client is available as a global for debugging in development
if (import.meta.env.DEV) {
  console.log('DEV mode: Exposing Supabase client to window');
  (window as any).supabaseClient = supabase;
}

export default App;
