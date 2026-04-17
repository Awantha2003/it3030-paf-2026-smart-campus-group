export const adminRoutes = {
    dashboard: '/Admin/dashboard',
    tickets: '/Admin/tickets',
    ticketDetail: (ticketId) => `/Admin/tickets/${ticketId}`,
    campusMap: '/Admin/campus-map',
    technicians: '/Admin/technicians',
    users: '/Admin/users',
    settings: '/Admin/settings'
};

export const studentRoutes = {
    dashboard: '/Student/dashboard',
    tickets: '/Student/tickets',
    newTicket: '/Student/tickets/new',
    ticketDetail: (ticketId) => `/Student/tickets/${ticketId}`,
    bookingResources: '/Student/booking-resources',
    campusMap: '/Student/campus-map',
    settings: '/Student/settings'
};

export const techRoutes = {
    dashboard: '/Technician/dashboard',
    tickets: '/Technician/tickets',
    ticketDetail: (ticketId) => `/Technician/tickets/${ticketId}`,
    campusMap: '/Technician/campus-map',
    settings: '/Technician/settings'
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
