export const adminRoutes = {
    dashboard: '/Admin/dashboard',
    tickets: '/Admin/tickets',
    ticketDetail: (ticketId) => `/Admin/tickets/${ticketId}`,
    campusMap: '/Admin/campus-map',
    technicians: '/Admin/technicians',
    users: '/Admin/users',
    settings: '/Admin/settings',
    notifications: '/Admin/notifications'
};

export const studentRoutes = {
    dashboard: '/Student/dashboard',
    tickets: '/Student/tickets',
    newTicket: '/Student/tickets/new',
    ticketDetail: (ticketId) => `/Student/tickets/${ticketId}`,
    bookingResources: '/Student/booking-resources',
    campusMap: '/Student/campus-map',
    settings: '/Student/settings',
    notifications: '/Student/notifications'
};

export const techRoutes = {
    dashboard: '/Technician/dashboard',
    tickets: '/Technician/tickets',
    ticketDetail: (ticketId) => `/Technician/tickets/${ticketId}`,
    campusMap: '/Technician/campus-map',
    settings: '/Technician/settings',
    notifications: '/Technician/notifications'
};

export const getTicketDetailPathForRole = (role, ticketId) => {
    switch (role) {
        case 'ADMIN': return `/Admin/tickets/${ticketId}`;
        case 'TECHNICIAN': return `/Technician/tickets/${ticketId}`;
        default: return `/Student/tickets/${ticketId}`;
    }
};

export const getTicketListPathForRole = (role) => {
    switch (role) {
        case 'ADMIN': return adminRoutes.tickets;
        case 'TECHNICIAN': return techRoutes.tickets;
        default: return studentRoutes.tickets;
    }
};

export const getNotificationsPathForRole = (role) => {
    switch (role) {
        case 'ADMIN': return adminRoutes.notifications;
        case 'TECHNICIAN': return techRoutes.notifications;
        default: return studentRoutes.notifications;
    }
};

export const resolvePathForRole = (path, role) => {
    // If the path is simple like '/notifications', map it. Provide a robust resolver if needed,
    // otherwise fallback to string manipulation
    if (path.startsWith('/tickets/')) {
        const id = path.split('/')[2];
        return getTicketDetailPathForRole(role, id);
    }
    if (path === '/notifications') return getNotificationsPathForRole(role);
    
    // Add prefix
    const rolePrefix = role === 'ADMIN' ? '/Admin' : role === 'TECHNICIAN' ? '/Technician' : '/Student';
    return `${rolePrefix}${path.startsWith('/') ? path : '/' + path}`;
};
