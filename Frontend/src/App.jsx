import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MfaSetupPage from './pages/auth/MfaSetupPage';
import MfaVerifyPage from './pages/auth/MfaVerifyPage';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { TechnicianDashboard } from './pages/technician/TechnicianDashboard';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';
import { AdminTechniciansPage } from './pages/admin/AdminTechniciansPage';
import { MyTicketsPage } from './pages/tickets/MyTicketsPage';
import { NewTicketPage } from './pages/tickets/NewTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { CampusMapPage } from './pages/maps/CampusMapPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

export const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/mfa-setup" element={<MfaSetupPage />} />
            <Route path="/mfa-verify" element={<MfaVerifyPage />} />
            <Route path="/oauth2/callback" element={<OAuth2RedirectHandler />} />

            <Route path="/Admin" element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="tickets" element={<AdminTicketsPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="technicians" element={<AdminTechniciansPage />} />
                <Route path="campus-map" element={<CampusMapPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="/Technician" element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['TECHNICIAN']} />}>
                <Route path="dashboard" element={<TechnicianDashboard />} />
                <Route path="tickets" element={<TechnicianDashboard />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="campus-map" element={<CampusMapPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            <Route path="/Student" element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['USER']} />}>
                <Route path="dashboard" element={<UserDashboard />} />
                <Route path="tickets" element={<MyTicketsPage />} />
                <Route path="tickets/new" element={<NewTicketPage />} />
                <Route path="tickets/:id" element={<TicketDetailPage />} />
                <Route path="campus-map" element={<CampusMapPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Redirect root to login for now */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};
