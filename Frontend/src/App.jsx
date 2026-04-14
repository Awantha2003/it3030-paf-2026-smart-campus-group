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
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ProtectedRoute } from './components/ProtectedRoute';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

export const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/mfa-setup" element={<MfaSetupPage />} />
            <Route path="/mfa-verify" element={<MfaVerifyPage />} />
            <Route path="/oauth2/callback" element={<OAuth2RedirectHandler />} />

            {/* Unified Dashboard Entry Point */}
            <Route element={<DashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/Admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/Admin/users" element={<UserManagementPage />} />
              </Route>
              <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN', 'USER']} />}>
                  <Route path="/Student/dashboard" element={<UserDashboard />} />
              </Route>
            </Route>

            {/* Redirect root to login for now */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Fallback for undefined routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};
