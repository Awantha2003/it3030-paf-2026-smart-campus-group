export const CAMPUS_MAP_CENTER = { lat: 6.9147, lng: 79.9733 };

export const CAMPUS_ZONES = [
  {
    id: 'academic-core',
    name: 'Academic Core',
    color: '#2563eb',
    center: { lat: 6.9151, lng: 79.9731 },
    radius: 180,
    description: 'Lecture halls, faculty offices, labs, and student consultation areas.'
  },
  {
    id: 'student-services',
    name: 'Student Services',
    color: '#7c3aed',
    center: { lat: 6.9142, lng: 79.9741 },
    radius: 135,
    description: 'Helpdesk, student affairs, registration support, and service desks.'
  },
  {
    id: 'residential-access',
    name: 'Access And Transit',
    color: '#ea580c',
    center: { lat: 6.9138, lng: 79.9724 },
    radius: 145,
    description: 'Main gate, shuttle stop, maintenance access, and vehicle entry points.'
  },
  {
    id: 'innovation-wing',
    name: 'Innovation Wing',
    color: '#059669',
    center: { lat: 6.9159, lng: 79.9743 },
    radius: 150,
    description: 'Makerspaces, computing labs, media rooms, and project collaboration areas.'
  }
];

export const CAMPUS_LANDMARKS = [
  {
    id: 'main-gate',
    name: 'Main Gate',
    shortName: 'Gate',
    type: 'ACCESS',
    description: 'Primary campus entrance and the easiest public pickup point.',
    position: { lat: 6.9135, lng: 79.9721 }
  },
  {
    id: 'student-center',
    name: 'Student Center',
    shortName: 'Center',
    type: 'SERVICE',
    description: 'Student affairs, finance, campus information, and common seating.',
    position: { lat: 6.9141, lng: 79.9742 }
  },
  {
    id: 'computing-faculty',
    name: 'Computing Faculty',
    shortName: 'Comp',
    type: 'ACADEMIC',
    description: 'Computer science and IT lecture rooms with several lab spaces.',
    position: { lat: 6.9153, lng: 79.9735 }
  },
  {
    id: 'engineering-block',
    name: 'Engineering Block',
    shortName: 'Eng',
    type: 'ACADEMIC',
    description: 'Core engineering classrooms, workshops, and staff offices.',
    position: { lat: 6.9158, lng: 79.9729 }
  },
  {
    id: 'library',
    name: 'Main Library',
    shortName: 'Lib',
    type: 'ACADEMIC',
    description: 'Learning commons, library desks, and group study areas.',
    position: { lat: 6.9149, lng: 79.9747 }
  },
  {
    id: 'innovation-lab',
    name: 'Innovation Lab',
    shortName: 'Lab',
    type: 'LAB',
    description: 'Prototype lab, media support, and hardware troubleshooting zone.',
    position: { lat: 6.9162, lng: 79.9744 }
  },
  {
    id: 'sports-complex',
    name: 'Sports Complex',
    shortName: 'Sport',
    type: 'FACILITY',
    description: 'Indoor court access, recreation equipment, and event preparation.',
    position: { lat: 6.9139, lng: 79.9751 }
  },
  {
    id: 'admin-operations',
    name: 'Admin Operations',
    shortName: 'Ops',
    type: 'SERVICE',
    description: 'Facilities management, admin coordination, and escalation handling.',
    position: { lat: 6.9146, lng: 79.9726 }
  }
];

export const CAMPUS_SUPPORT_HUBS = [
  {
    id: 'it-helpdesk',
    name: 'IT Helpdesk',
    team: 'Digital Support',
    position: { lat: 6.9154, lng: 79.9739 }
  },
  {
    id: 'facilities-desk',
    name: 'Facilities Desk',
    team: 'Facilities',
    position: { lat: 6.9145, lng: 79.9727 }
  },
  {
    id: 'security-post',
    name: 'Security Post',
    team: 'Campus Security',
    position: { lat: 6.9136, lng: 79.9723 }
  }
];

export function findCampusLandmarkById(landmarkId) {
  return CAMPUS_LANDMARKS.find((landmark) => landmark.id === landmarkId) || null;
}
