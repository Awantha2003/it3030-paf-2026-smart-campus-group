export const studentRoutes = Object.freeze({
  base: '/Student',
  dashboard: '/Student/dashboard',
  tickets: '/Student/tickets',
  newTicket: '/Student/tickets/new',
  ticketDetail: (ticketId) => `/Student/tickets/${ticketId}`,
  notifications: '/Student/notifications',
  campusMap: '/Student/campus-map',
  settings: '/Student/settings'
});

export const adminRoutes = Object.freeze({
  base: '/Admin',
  dashboard: '/Admin/dashboard',
  tickets: '/Admin/tickets',
  ticketDetail: (ticketId) => `/Admin/tickets/${ticketId}`,
  technicians: '/Admin/technicians',
  notifications: '/Admin/notifications',
  campusMap: '/Admin/campus-map',
  settings: '/Admin/settings'
});

export const technicianRoutes = Object.freeze({
  base: '/Technician',
  dashboard: '/Technician/dashboard',
  ticketDetail: (ticketId) => `/Technician/tickets/${ticketId}`,
  notifications: '/Technician/notifications',
  campusMap: '/Technician/campus-map',
  settings: '/Technician/settings'
});

export function getHomePathForRole(role) {
  if (role === 'ADMIN') {
    return adminRoutes.dashboard;
  }

  if (role === 'TECHNICIAN') {
    return technicianRoutes.dashboard;
  }

  return studentRoutes.dashboard;
}

export function getTicketListPathForRole(role) {
  if (role === 'ADMIN') {
    return adminRoutes.tickets;
  }

  if (role === 'TECHNICIAN') {
    return technicianRoutes.dashboard;
  }

  return studentRoutes.tickets;
}

export function getNotificationsPathForRole(role) {
  if (role === 'ADMIN') {
    return adminRoutes.notifications;
  }

  if (role === 'TECHNICIAN') {
    return technicianRoutes.notifications;
  }

  return studentRoutes.notifications;
}

export function getSettingsPathForRole(role) {
  if (role === 'ADMIN') {
    return adminRoutes.settings;
  }

  if (role === 'TECHNICIAN') {
    return technicianRoutes.settings;
  }

  return studentRoutes.settings;
}

export function getCampusMapPathForRole(role) {
  if (role === 'ADMIN') {
    return adminRoutes.campusMap;
  }

  if (role === 'TECHNICIAN') {
    return technicianRoutes.campusMap;
  }

  return studentRoutes.campusMap;
}

export function getTicketDetailPathForRole(role, ticketId) {
  if (role === 'ADMIN') {
    return adminRoutes.ticketDetail(ticketId);
  }

  if (role === 'TECHNICIAN') {
    return technicianRoutes.ticketDetail(ticketId);
  }

  return studentRoutes.ticketDetail(ticketId);
}

export function resolvePathForRole(path, role) {
  if (!path) {
    return path;
  }

  if (path === '/dashboard') {
    return getHomePathForRole(role);
  }

  if (path === '/tickets') {
    return getTicketListPathForRole(role);
  }

  if (path === '/tickets/new') {
    return studentRoutes.newTicket;
  }

  if (path === '/notifications') {
    return getNotificationsPathForRole(role);
  }

  if (path === '/campus-map') {
    return getCampusMapPathForRole(role);
  }

  if (path === '/settings') {
    return getSettingsPathForRole(role);
  }

  if (path.startsWith('/tickets/')) {
    return getTicketDetailPathForRole(role, path.slice('/tickets/'.length));
  }

  if (path === '/admin') {
    return adminRoutes.dashboard;
  }

  if (path === '/admin/tickets') {
    return adminRoutes.tickets;
  }

  if (path === '/admin/technicians') {
    return adminRoutes.technicians;
  }

  if (path === '/technician') {
    return technicianRoutes.dashboard;
  }

  return path;
}
