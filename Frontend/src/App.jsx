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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/tickets" element={<MyTicketsPage />} />
              <Route path="/tickets/new" element={<NewTicketPage />} />
              <Route path="/tickets/:id" element={<TicketDetailPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/tickets" element={<AdminTicketsPage />} />
              <Route path="/admin/technicians" element={<AdminTechniciansPage />} />
              <Route path="/technician" element={<TechnicianDashboard />} />
              <Route path="*" element={<ErrorPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
