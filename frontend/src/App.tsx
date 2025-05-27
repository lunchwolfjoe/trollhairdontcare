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
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { FestivalsPage } from './pages/FestivalsPage';
import { CrewsPage } from './pages/CrewsPage';
import { TasksPage } from './pages/TasksPage';
import { AdminPage } from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/access-denied" element={<UnauthorizedPage />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
               <Route path="/dashboard" element={<DashboardPage />} />
               <Route path="/festivals/*" element={<FestivalsPage />} />
               <Route path="/crews/*" element={<CrewsPage />} />
               <Route path="/tasks/*" element={<TasksPage />} />
               <Route path="/admin/*" element={<AdminPage />} />
            </Route>

            {/* Catch all - redirect to dashboard if authenticated, login otherwise (handled by ProtectedRoute) */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />

          </Routes>
        </Router>

    </ThemeProvider>
  );
}

// Make sure the Supabase client is available as a global for debugging in development
if (import.meta.env.DEV) {
  console.log('DEV mode: Exposing Supabase client to window');
  (window as any).supabaseClient = supabase;
}

export default App;
