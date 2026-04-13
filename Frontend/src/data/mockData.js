export const mockUsers = {
  user: {
    id: 'u1',
    name: 'Alex Student',
    email: 'alex@university.edu',
    role: 'USER',
    avatar: 'https://i.pravatar.cc/150?u=u1'
  },
  admin: {
    id: 'a1',
    name: 'Sarah Admin',
    email: 'sarah@university.edu',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?u=a1'
  },
  tech: {
    id: 't1',
    name: 'Mike Tech',
    email: 'mike@university.edu',
    role: 'TECHNICIAN',
    avatar: 'https://i.pravatar.cc/150?u=t1'
  }
};

export const mockResources = [
{
  id: 'r1',
  name: 'Alan Turing Lecture Hall',
  type: 'LECTURE_HALL',
  capacity: 250,
  location: 'Computer Science Bldg, Floor 1',
  status: 'ACTIVE',
  description:
  'Large tiered lecture hall with dual projectors and recording equipment.',
  imageUrl:
  'https://images.unsplash.com/photo-1592289140660-8805f7787208?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r2',
  name: 'Quantum Computing Lab',
  type: 'LAB',
  capacity: 30,
  location: 'Physics Bldg, Floor 3',
  status: 'ACTIVE',
  description: 'Advanced computing lab with specialized hardware access.',
  imageUrl:
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r3',
  name: 'Innovation Hub Room A',
  type: 'MEETING_ROOM',
  capacity: 12,
  location: 'Student Center, Floor 2',
  status: 'ACTIVE',
  description: 'Glass-walled meeting room with smart whiteboard.',
  imageUrl:
  'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r4',
  name: 'Chemistry Lab 101',
  type: 'LAB',
  capacity: 40,
  location: 'Science Bldg, Floor 1',
  status: 'MAINTENANCE',
  description:
  'Standard wet lab. Currently undergoing ventilation maintenance.',
  imageUrl:
  'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r5',
  name: '4K Projector Cart',
  type: 'EQUIPMENT',
  capacity: 1,
  location: 'IT Helpdesk',
  status: 'ACTIVE',
  description: 'Mobile 4K projector with built-in speakers and Apple TV.'
},
{
  id: 'r6',
  name: 'Seminar Room 4B',
  type: 'MEETING_ROOM',
  capacity: 20,
  location: 'Humanities Bldg, Floor 4',
  status: 'ACTIVE',
  description: 'Quiet seminar room perfect for graduate discussions.',
  imageUrl:
  'https://images.unsplash.com/photo-1577414445304-749113660528?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r7',
  name: 'Main Auditorium',
  type: 'LECTURE_HALL',
  capacity: 500,
  location: 'Main Campus Center',
  status: 'ACTIVE',
  description: 'Primary university auditorium for major events.',
  imageUrl:
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
},
{
  id: 'r8',
  name: 'VR Headset Kit',
  type: 'EQUIPMENT',
  capacity: 1,
  location: 'Media Library',
  status: 'OUT_OF_SERVICE',
  description: 'Meta Quest 3 kit with controllers and charging dock.'
}];


export const mockBookings = [
{
  id: 'b1',
  resourceId: 'r3',
  userId: 'u1',
  date: '2026-03-30',
  startTime: '10:00',
  endTime: '12:00',
  purpose: 'Group Project Meeting',
  attendees: 5,
  status: 'APPROVED'
},
{
  id: 'b2',
  resourceId: 'r1',
  userId: 'u1',
  date: '2026-04-02',
  startTime: '14:00',
  endTime: '16:00',
  purpose: 'Guest Lecture Prep',
  attendees: 150,
  status: 'PENDING'
},
{
  id: 'b3',
  resourceId: 'r5',
  userId: 'u1',
  date: '2026-03-25',
  startTime: '09:00',
  endTime: '17:00',
  purpose: 'Department Presentation',
  attendees: 1,
  status: 'COMPLETED'
},
{
  id: 'b4',
  resourceId: 'r6',
  userId: 'u1',
  date: '2026-04-05',
  startTime: '13:00',
  endTime: '15:00',
  purpose: 'Study Session',
  attendees: 8,
  status: 'REJECTED'
}];


export const mockTickets = [
{
  id: 't1',
  title: 'Projector bulb burnt out',
  description: 'The main projector in the Turing hall is not turning on.',
  resourceId: 'r1',
  location: 'Computer Science Bldg, Floor 1',
  category: 'Hardware',
  priority: 'HIGH',
  status: 'OPEN',
  createdBy: 'u1',
  createdAt: '2026-03-27T09:00:00Z'
},
{
  id: 't2',
  title: 'AC leaking',
  description: 'Water dripping from the ceiling vent.',
  location: 'Physics Bldg, Floor 3',
  category: 'Facilities',
  priority: 'CRITICAL',
  status: 'IN_PROGRESS',
  createdBy: 'u1',
  assignedTo: 't1',
  createdAt: '2026-03-28T10:30:00Z'
},
{
  id: 't3',
  title: 'Whiteboard markers empty',
  description: 'Need new markers for the room.',
  resourceId: 'r3',
  location: 'Student Center, Floor 2',
  category: 'Supplies',
  priority: 'LOW',
  status: 'RESOLVED',
  createdBy: 'u1',
  assignedTo: 't1',
  createdAt: '2026-03-25T14:00:00Z'
}];


export const mockNotifications = [
{
  id: 'n1',
  userId: 'u1',
  title: 'Maintenance Alert',
  message: 'A scheduled maintenance window will begin tonight at 10 PM.',
  type: 'SUCCESS',
  read: false,
  createdAt: '2026-03-28T11:00:00Z',
  link: '/notifications'
},
{
  id: 'n2',
  userId: 'u1',
  title: 'Ticket Updated',
  message: 'Ticket "AC leaking" is now IN_PROGRESS.',
  type: 'INFO',
  read: false,
  createdAt: '2026-03-28T10:35:00Z',
  link: '/tickets/t2'
},
{
  id: 'n3',
  userId: 'u1',
  title: 'System Update',
  message:
  'The support portal has been updated with faster technician assignment flow.',
  type: 'ERROR',
  read: true,
  createdAt: '2026-03-27T15:00:00Z',
  link: '/settings'
}];


export const mockChartData = {
  bookingTrends: [
  { name: 'Mon', bookings: 12 },
  { name: 'Tue', bookings: 19 },
  { name: 'Wed', bookings: 15 },
  { name: 'Thu', bookings: 22 },
  { name: 'Fri', bookings: 28 },
  { name: 'Sat', bookings: 10 },
  { name: 'Sun', bookings: 8 }],

  incidentCategories: [
  { name: 'Hardware', value: 15, color: '#3b82f6' },
  { name: 'Facilities', value: 25, color: '#8b5cf6' },
  { name: 'Supplies', value: 10, color: '#10b981' },
  { name: 'Network', value: 8, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#64748b' }],

  peakHours: [
  { hour: '08:00', count: 5 },
  { hour: '10:00', count: 25 },
  { hour: '12:00', count: 15 },
  { hour: '14:00', count: 30 },
  { hour: '16:00', count: 20 },
  { hour: '18:00', count: 10 }]

};
