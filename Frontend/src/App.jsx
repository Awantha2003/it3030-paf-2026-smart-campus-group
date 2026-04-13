import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TechnicianTrackingProvider } from './contexts/TechnicianTrackingContext';
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
import { CampusMapPage } from './pages/maps/CampusMapPage';
import { ErrorPage } from './pages/ErrorPage';
import {
  adminRoutes,
  getCampusMapPathForRole,
  getHomePathForRole,
  getNotificationsPathForRole,
  getSettingsPathForRole,
  getTicketDetailPathForRole,
  studentRoutes,
  technicianRoutes
} from './utils/routes';

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

  return <Navigate to={getHomePathForRole(user.role)} replace />;
}

function RoleNotificationsRedirect() {
  const { user } = useAuth();
  return <Navigate to={getNotificationsPathForRole(user?.role)} replace />;
}

function RoleCampusMapRedirect() {
  const { user } = useAuth();
  return <Navigate to={getCampusMapPathForRole(user?.role)} replace />;
}

function RoleSettingsRedirect() {
  const { user } = useAuth();
  return <Navigate to={getSettingsPathForRole(user?.role)} replace />;
}

function RoleTicketDetailRedirect() {
  const { user } = useAuth();
  const { id: ticketId } = useParams();

  if (!ticketId) {
    return <Navigate to={getHomePathForRole(user?.role)} replace />;
  }

  return <Navigate to={getTicketDetailPathForRole(user?.role, ticketId)} replace />;
}


export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TechnicianTrackingProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
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
                  path={studentRoutes.base}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <Navigate to={studentRoutes.dashboard} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.dashboard}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <UserDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.tickets}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <MyTicketsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.newTicket}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <NewTicketPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.ticketDetail(':id')}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <TicketDetailPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.notifications}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <NotificationsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.campusMap}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <CampusMapPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={studentRoutes.settings}
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <SettingsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.base}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <Navigate to={adminRoutes.dashboard} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.dashboard}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <AdminDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.tickets}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <AdminTicketsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.ticketDetail(':id')}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <TicketDetailPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.technicians}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <AdminTechniciansPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.notifications}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <NotificationsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.campusMap}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <CampusMapPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={adminRoutes.settings}
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <SettingsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={technicianRoutes.base}
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <Navigate to={technicianRoutes.dashboard} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path={technicianRoutes.dashboard}
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <TechnicianDashboard />
                    </RoleRoute>
                  }
                />
                <Route
                  path={technicianRoutes.ticketDetail(':id')}
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <TicketDetailPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={technicianRoutes.notifications}
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <NotificationsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={technicianRoutes.campusMap}
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <CampusMapPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path={technicianRoutes.settings}
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <SettingsPage />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <Navigate to={studentRoutes.dashboard} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/tickets"
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <Navigate to={studentRoutes.tickets} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/tickets/new"
                  element={
                    <RoleRoute allowedRoles={['USER']}>
                      <Navigate to={studentRoutes.newTicket} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/tickets/:id"
                  element={
                    <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                      <RoleTicketDetailRedirect />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                      <RoleNotificationsRedirect />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/campus-map"
                  element={
                    <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                      <RoleCampusMapRedirect />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RoleRoute allowedRoles={['USER', 'ADMIN', 'TECHNICIAN']}>
                      <RoleSettingsRedirect />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <Navigate to={adminRoutes.dashboard} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/tickets"
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <Navigate to={adminRoutes.tickets} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/admin/technicians"
                  element={
                    <RoleRoute allowedRoles={['ADMIN']}>
                      <Navigate to={adminRoutes.technicians} replace />
                    </RoleRoute>
                  }
                />
                <Route
                  path="/technician"
                  element={
                    <RoleRoute allowedRoles={['TECHNICIAN']}>
                      <Navigate to={technicianRoutes.dashboard} replace />
                    </RoleRoute>
                  }
                />
                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TechnicianTrackingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
