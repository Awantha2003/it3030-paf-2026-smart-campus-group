import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TechnicianTrackingProvider } from './contexts/TechnicianTrackingContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { UserDashboard } from './pages/dashboard/UserDashboard';
import { MyTicketsPage } from './pages/tickets/MyTicketsPage';
import { NewTicketPage } from './pages/tickets/NewTicketPage';
import { TicketDetailPage } from './pages/tickets/TicketDetailPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminTicketsPage } from './pages/admin/AdminTicketsPage';
import { AdminTechniciansPage } from './pages/admin/AdminTechniciansPage';
import { TechnicianDashboard } from './pages/technician/TechnicianDashboard';
import { CampusMapPage } from './pages/maps/CampusMapPage';
import { ErrorPage } from './pages/ErrorPage';

function RoleAwareRedirect({ section }) {
  const { user } = useAuth();
  const rolePrefix =
    user?.role === 'ADMIN'
      ? '/Admin'
      : user?.role === 'TECHNICIAN'
        ? '/Technician'
        : '/Student';

  return <Navigate to={`${rolePrefix}/${section}`} replace />;
}

function RouteRoleSync() {
  const location = useLocation();
  const { user, switchRole } = useAuth();

  useEffect(() => {
    const path = location.pathname;
    let expectedRole = null;

    if (path.startsWith('/Student')) {
      expectedRole = 'USER';
    } else if (path.startsWith('/Admin') || path.startsWith('/admin')) {
      expectedRole = 'ADMIN';
    } else if (path.startsWith('/Technician') || path.startsWith('/technician')) {
      expectedRole = 'TECHNICIAN';
    } else if (
      path === '/' ||
      path.startsWith('/dashboard') ||
      path.startsWith('/tickets')
    ) {
      expectedRole = 'USER';
    }

    if (expectedRole && user?.role !== expectedRole) {
      switchRole(expectedRole);
    }
  }, [location.pathname, switchRole, user?.role]);

  return null;
}

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TechnicianTrackingProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <RouteRoleSync />
            <Routes>
              <Route element={<DashboardLayout />}>
                <Route path="/" element={<Navigate to="/Student/dashboard" replace />} />
                <Route path="/Student/dashboard" element={<UserDashboard />} />
                <Route path="/Student/tickets" element={<MyTicketsPage />} />
                <Route path="/Student/tickets/new" element={<NewTicketPage />} />
                <Route path="/Student/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/Student/campus-map" element={<CampusMapPage />} />
                <Route path="/Student/settings" element={<SettingsPage />} />
                <Route path="/Admin" element={<Navigate to="/Admin/dashboard" replace />} />
                <Route path="/Admin/dashboard" element={<AdminDashboard />} />
                <Route path="/Admin/tickets" element={<AdminTicketsPage />} />
                <Route path="/Admin/technicians" element={<AdminTechniciansPage />} />
                <Route path="/Admin/campus-map" element={<CampusMapPage />} />
                <Route path="/Admin/settings" element={<SettingsPage />} />
                <Route path="/Technician" element={<Navigate to="/Technician/dashboard" replace />} />
                <Route path="/Technician/dashboard" element={<TechnicianDashboard />} />
                <Route path="/Technician/campus-map" element={<CampusMapPage />} />
                <Route path="/Technician/settings" element={<SettingsPage />} />
                <Route path="/dashboard" element={<RoleAwareRedirect section="dashboard" />} />
                <Route path="/tickets" element={<MyTicketsPage />} />
                <Route path="/tickets/new" element={<NewTicketPage />} />
                <Route path="/tickets/:id" element={<TicketDetailPage />} />
                <Route path="/campus-map" element={<RoleAwareRedirect section="campus-map" />} />
                <Route path="/settings" element={<RoleAwareRedirect section="settings" />} />
                <Route path="/Student/notifications" element={<Navigate to="/Student/dashboard" replace />} />
                <Route path="/notifications" element={<Navigate to="/dashboard" replace />} />
                <Route path="/admin" element={<Navigate to="/Admin/dashboard" replace />} />
                <Route path="/admin/tickets" element={<Navigate to="/Admin/tickets" replace />} />
                <Route path="/admin/technicians" element={<Navigate to="/Admin/technicians" replace />} />
                <Route path="/technician" element={<Navigate to="/Technician/dashboard" replace />} />
                <Route path="*" element={<ErrorPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TechnicianTrackingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
