import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { theme } from './theme';
import PrivateRoute from './components/PrivateRoute';
import RoleGuard from './components/RoleGuard';
import Layout from './components/Layout';
import CoordinatorLayout from './components/CoordinatorLayout';
import VolunteerLayout from './components/VolunteerLayout';
import { NotificationSettings } from './components/NotificationSettings';

// Admin Components
import AdminDashboard from './features/admin/AdminDashboard';
import ManageUsers from './features/admin/ManageUsers';
import ManageRoles from './features/admin/ManageRoles';
import ManageSettings from './features/admin/ManageSettings';

// Coordinator Components
import CoordinatorDashboard from './features/coordinator/CoordinatorDashboard';
import CoordinatorVolunteers from './features/coordinator/CoordinatorVolunteers';
import CoordinatorTasks from './features/coordinator/CoordinatorTasks';
import TaskStats from './features/coordinator/TaskStats';
import CoordinatorSchedule from './features/coordinator/CoordinatorSchedule';
import CoordinatorReports from './features/coordinator/CoordinatorReports';
import ShiftSwapManagement from './features/coordinator/ShiftSwapManagement';
import TaskManagement from './features/coordinator/TaskManagement';
import ManageVolunteers from './features/coordinator/ManageVolunteers';
import WeatherMonitoring from './features/coordinator/WeatherMonitoring';

// Volunteer Components
import VolunteerDashboard from './features/volunteer/VolunteerDashboard';
import VolunteerProfile from './features/volunteer/VolunteerProfile';
import VolunteerAvailability from './features/volunteer/VolunteerAvailability';
import VolunteerMap from './features/volunteer/VolunteerMap';
import VolunteerTasks from './features/volunteer/VolunteerTasks';
import VolunteerSchedule from './features/volunteer/VolunteerSchedule';
import VolunteerRegistration from './features/volunteer/VolunteerRegistration';
import ShiftSwapRequest from './features/volunteer/ShiftSwapRequest';

// Auth Components
import Auth from './features/auth/Auth';
import PageNotFound from './components/PageNotFound';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Auth />} />
            <Route path="/volunteer/register" element={<VolunteerRegistration />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <PrivateRoute>
                  <RoleGuard allowedRoles={['admin']}>
                    <Layout />
                  </RoleGuard>
                </PrivateRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="roles" element={<ManageRoles />} />
              <Route path="settings" element={<ManageSettings />} />
            </Route>

            {/* Coordinator Routes */}
            <Route
              path="/coordinator"
              element={
                <PrivateRoute>
                  <RoleGuard allowedRoles={['coordinator']}>
                    <CoordinatorLayout />
                  </RoleGuard>
                </PrivateRoute>
              }
            >
              <Route index element={<CoordinatorDashboard />} />
              <Route path="volunteers" element={<ManageVolunteers />} />
              <Route path="tasks" element={<TaskManagement />} />
              <Route path="schedule" element={<CoordinatorSchedule />} />
              <Route path="reports" element={<CoordinatorReports />} />
              <Route path="weather" element={<WeatherMonitoring />} />
            </Route>

            {/* Volunteer Routes */}
            <Route
              path="/volunteer"
              element={
                <PrivateRoute>
                  <RoleGuard allowedRoles={['volunteer']}>
                    <VolunteerLayout />
                  </RoleGuard>
                </PrivateRoute>
              }
            >
              <Route index element={<VolunteerDashboard />} />
              <Route path="profile" element={<VolunteerProfile />} />
              <Route path="availability" element={<VolunteerAvailability />} />
              <Route path="map" element={<VolunteerMap />} />
              <Route path="tasks" element={<VolunteerTasks />} />
              <Route path="schedule" element={<VolunteerSchedule />} />
            </Route>

            {/* Notification Settings Route */}
            <Route
              path="/settings/notifications"
              element={
                <PrivateRoute>
                  <Layout>
                    <NotificationSettings />
                  </Layout>
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Catch All Route */}
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
