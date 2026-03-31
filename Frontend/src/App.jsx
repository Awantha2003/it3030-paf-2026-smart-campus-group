import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { MyTicketsPage } from './pages/tickets/MyTicketsPage';
import { NewTicketPage } from './pages/tickets/NewTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';
import { AdminTechniciansPage } from './pages/admin/AdminTechniciansPage';
import { TechnicianDashboard } from './pages/technician/TechnicianDashboard';
import { ErrorPage } from './pages/ErrorPage';

function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function RoleRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === 'TECHNICIAN') {
    return <Navigate to="/technician" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}


export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/unauthorized"
              element={
                <ProtectedRoute>
                  <UnauthorizedPage />
                </ProtectedRoute>
              }
            />
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<RootRedirect />} />
              <Route
                path="/dashboard"
                element={
                  <RoleRoute allowedRoles={['USER']}>
                    <UserDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <RoleRoute allowedRoles={['USER']}>
                    <MyTicketsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/tickets/new"
                element={
                  <RoleRoute allowedRoles={['USER']}>
                    <NewTicketPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/tickets/:id"
                element={
                  <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                    <TicketDetailPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                    <NotificationsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                    <SettingsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/tickets"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminTicketsPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/admin/technicians"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <AdminTechniciansPage />
                  </RoleRoute>
                }
              />
              <Route
                path="/technician"
                element={
                  <RoleRoute allowedRoles={['TECHNICIAN']}>
                    <TechnicianDashboard />
                  </RoleRoute>
                }
              />
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
