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
import { SimpleAuthProvider, useSimpleAuth } from "./contexts/SimpleAuthContext";
import { SimpleLogin } from "./pages/SimpleLogin";

// New simplified protected route component
interface SimpleProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

const SimpleProtectedRoute: React.FC<SimpleProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { authenticated, loading, activeRole } = useSimpleAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && (!activeRole || !requiredRoles.includes(activeRole))) {
    return <Navigate to="/access-denied" replace />;
  }

  return <>{children}</>;
};

function SimpleAppRoutes() {
  const { activeRole, authenticated } = useSimpleAuth();

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<SimpleLogin />} />
        <Route path="/access-denied" element={<AccessDenied />} />

        {/* Default redirect based on authentication and role */}
        <Route
          path="/"
          element={
            !authenticated ? (
              <Navigate to="/login" replace />
            ) : activeRole === "coordinator" ? (
              <Navigate to="/coordinator/dashboard" replace />
            ) : activeRole === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/volunteer/dashboard" replace />
            )
          }
        />

        {/* Volunteer routes - accessible to users with volunteer role */}
        <Route
          path="/volunteer/*"
          element={
            <SimpleProtectedRoute requiredRoles={['volunteer']}>
              <VolunteerLayout>
                <Routes>
                  <Route path="dashboard" element={<VolunteerDashboard />} />
                  <Route path="tasks" element={<VolunteerTasks />} />
                  <Route path="shift-swap" element={<ShiftSwapRequest />} />
                  <Route path="shift-swaps" element={<ShiftSwapRequest />} />
                  <Route path="availability" element={<VolunteerAvailability />} />
                  <Route path="waivers" element={<WaiverSystem />} />
                  <Route path="communications" element={<VolunteerCommunications />} />
                  <Route path="welcome-home" element={<WelcomeHomePortal />} />
                  <Route path="map" element={<Map />} />
                  <Route path="vectorized-map" element={<VectorizedMap />} />
                </Routes>
              </VolunteerLayout>
            </SimpleProtectedRoute>
          }
        />

        {/* Coordinator routes - accessible to users with coordinator role */}
        <Route
          path="/coordinator/*"
          element={
            <SimpleProtectedRoute requiredRoles={['coordinator']}>
              <CoordinatorLayout>
                <Routes>
                  <Route path="dashboard" element={<CoordinatorDashboard />} />
                  <Route path="volunteers" element={<VolunteerManagement />} />
                  <Route path="festivals" element={<FestivalManagement />} />
                  <Route path="festivals/:festivalId/dashboard" element={<FestivalDashboard />} />
                  <Route path="festivals/:festivalId/volunteers" element={<VolunteerManagement />} />
                  <Route path="festivals/:festivalId/schedule" element={<AutoScheduler />} />
                  <Route path="festivals/:festivalId/incidents" element={<IncidentLogging />} />
                  <Route path="festivals/:festivalId/settings" element={<FestivalManagement />} />
                  <Route path="festivals/:festivalId/checkin" element={<WelcomeHomePortal />} />
                  <Route path="welcome-home" element={<WelcomeHomePortal />} />
                  <Route path="crews" element={<CrewManagement />} />
                  <Route path="tasks" element={<TaskManagement />} />
                  <Route path="shift-swaps" element={<ShiftSwapManagement />} />
                  <Route path="scheduler" element={<AutoScheduler />} />
                  <Route path="communications" element={<Communications />} />
                  <Route path="reporting" element={<ReportingAnalytics />} />
                  <Route path="weather" element={<WeatherMonitoring />} />
                  <Route path="map" element={<Map />} />
                  <Route path="vectorized-map" element={<VectorizedMap />} />
                  <Route path="vectorizedmap" element={<Navigate to="/coordinator/vectorized-map" replace />} />
                  <Route path="assets" element={<AssetManagement />} />
                  <Route path="incidents" element={<IncidentLogging />} />
                </Routes>
              </CoordinatorLayout>
            </SimpleProtectedRoute>
          }
        />

        {/* Admin routes - accessible to users with admin role */}
        <Route
          path="/admin/*"
          element={
            <SimpleProtectedRoute requiredRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="festivals" element={<AdminFestivals />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="settings" element={<SystemSettings />} />
                </Routes>
              </AdminLayout>
            </SimpleProtectedRoute>
          }
        />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Role Switcher - only show if authenticated */}
      {authenticated && <RoleSwitcher />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SimpleAuthProvider>
        <Router>
          <SimpleAppRoutes />
        </Router>
      </SimpleAuthProvider>
    </ThemeProvider>
  );
}

export { App };
