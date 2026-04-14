export const adminRoutes = {
    dashboard: '/Admin/dashboard',
    tickets: '/Admin/tickets',
    campusMap: '/Admin/campus-map',
    technicians: '/Admin/technicians',
    users: '/Admin/users',
    settings: '/Admin/settings'
};

export const studentRoutes = {
    dashboard: '/Student/dashboard',
    tickets: '/Student/tickets',
    campusMap: '/Student/campus-map',
    settings: '/Student/settings'
};

export const techRoutes = {
    dashboard: '/Technician/dashboard',
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
