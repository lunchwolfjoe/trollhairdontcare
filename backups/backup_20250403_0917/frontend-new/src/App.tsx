import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import VolunteerLayout from "./components/VolunteerLayout";
import CoordinatorLayout from "./components/CoordinatorLayout";
import AdminLayout from "./components/AdminLayout";
import VolunteerDashboard from "./features/volunteer/VolunteerDashboard";
import ShiftSwapRequest from "./features/volunteer/ShiftSwapRequest";
import TaskManagement from "./features/coordinator/TaskManagement";
import VolunteerTasks from "./features/volunteer/VolunteerTasks";
import ShiftSwapManagement from "./features/coordinator/ShiftSwapManagement";
import CoordinatorDashboard from "./features/coordinator/CoordinatorDashboard";
import AutoScheduler from "./features/coordinator/AutoScheduler";
import WeatherMonitoring from "./features/coordinator/WeatherMonitoring";
import CrewManagement from "./features/coordinator/CrewManagement";
import Map from "./features/coordinator/Map";
import AssetManagement from "./features/coordinator/AssetManagement";
import AdminDashboard from "./features/admin/AdminDashboard";
import AdminFestivals from "./features/admin/AdminFestivals";
import RoleSwitcher from "./components/RoleSwitcher";
import VolunteerAvailability from "./features/volunteer/VolunteerAvailability";
import VolunteerManagement from "./features/coordinator/VolunteerManagement";
import Communications from "./features/coordinator/Communications";
import ReportingAnalytics from "./features/coordinator/ReportingAnalytics";
import WaiverSystem from "./features/volunteer/WaiverSystem";

function AppRoutes() {
  const { role } = useAuth();

  return (
    <>
      <Routes>
        {/* Default redirect based on role */}
        <Route
          path="/"
          element={
            role === "coordinator" ? (
              <Navigate to="/coordinator/dashboard" replace />
            ) : role === "admin" ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/volunteer/dashboard" replace />
            )
          }
        />

        {/* Volunteer routes - accessible to everyone */}
        <Route
          path="/volunteer/*"
          element={
            <VolunteerLayout>
              <Routes>
                <Route path="dashboard" element={<VolunteerDashboard />} />
                <Route path="tasks" element={<VolunteerTasks />} />
                <Route path="shift-swap" element={<ShiftSwapRequest />} />
                <Route path="availability" element={<VolunteerAvailability />} />
                <Route path="waivers" element={<WaiverSystem />} />
              </Routes>
            </VolunteerLayout>
          }
        />

        {/* Coordinator routes */}
        <Route
          path="/coordinator/*"
          element={
            <CoordinatorLayout>
              <Routes>
                <Route path="dashboard" element={<CoordinatorDashboard />} />
                <Route path="volunteers" element={<VolunteerManagement />} />
                <Route path="crews" element={<CrewManagement />} />
                <Route path="tasks" element={<TaskManagement />} />
                <Route path="shift-swaps" element={<ShiftSwapManagement />} />
                <Route path="scheduler" element={<AutoScheduler />} />
                <Route path="communications" element={<Communications />} />
                <Route path="reporting" element={<ReportingAnalytics />} />
                <Route path="weather" element={<WeatherMonitoring />} />
                <Route path="map" element={<Map />} />
                <Route path="assets" element={<AssetManagement />} />
              </Routes>
            </CoordinatorLayout>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="festivals" element={<AdminFestivals />} />
              </Routes>
            </AdminLayout>
          }
        />
      </Routes>
      
      {/* Role Switcher */}
      <RoleSwitcher />
    </>
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
