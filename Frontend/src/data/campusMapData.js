export const CAMPUS_MAP_CENTER = { lat: 6.9147, lng: 79.9733 };

export const CAMPUS_ZONES = [
  {
    id: 'academic-spine',
    name: 'Academic Spine',
    color: '#2563eb',
    center: { lat: 6.9152, lng: 79.97335 },
    radius: 190,
    description: 'Faculty buildings, lecture halls, library floors, and the main student learning spaces.'
  },
  {
    id: 'admin-services',
    name: 'Admin And Services',
    color: '#7c3aed',
    center: { lat: 6.9143, lng: 79.9728 },
    radius: 145,
    description: 'Administration, examinations, student help desks, finance, and service counters.'
  },
  {
    id: 'sports-transit',
    name: 'Sports And Transit',
    color: '#ea580c',
    center: { lat: 6.91375, lng: 79.9736 },
    radius: 185,
    description: 'Main gate, shuttle access, recreation areas, and outdoor event movement paths.'
  },
  {
    id: 'research-innovation',
    name: 'Research And Innovation',
    color: '#059669',
    center: { lat: 6.9159, lng: 79.97415 },
    radius: 150,
    description: 'Research labs, innovation spaces, incubation activity, and technical project collaboration.'
  }
];

export const CAMPUS_LANDMARKS = [
  {
    id: 'main-gate',
    name: 'SLIIT Main Gate',
    shortName: 'Gate',
    type: 'ACCESS',
    description: 'Primary entrance on New Kandy Road and the most reliable campus pickup and drop-off point.',
    position: { lat: 6.9135, lng: 79.9721 }
  },
  {
    id: 'admin-examinations',
    name: 'Administration And Examinations Tower',
    shortName: 'Admin',
    type: 'SERVICE',
    description:
      'Main administrative tower used for examinations, registrar coordination, and campus operations.',
    position: { lat: 6.9144, lng: 79.9726 }
  },
  {
    id: 'student-services',
    name: 'Student Services And Help Desk',
    shortName: 'Help',
    type: 'SERVICE',
    description: 'Student affairs, finance, information desk support, and routine service counters.',
    position: { lat: 6.9142, lng: 79.97395 }
  },
  {
    id: 'computing-library',
    name: 'Faculty Of Computing And Main Library',
    shortName: 'FOC',
    type: 'ACADEMIC',
    description:
      'Core computing lectures, IT labs, faculty offices, and the main library used across the campus.',
    position: { lat: 6.91525, lng: 79.97345 }
  },
  {
    id: 'engineering-block',
    name: 'Engineering Faculty Building',
    shortName: 'ENG',
    type: 'ACADEMIC',
    description: 'Engineering classrooms, specialist laboratories, workshops, and academic offices.',
    position: { lat: 6.9158, lng: 79.97295 }
  },
  {
    id: 'business-school',
    name: 'Business School Building',
    shortName: 'BUS',
    type: 'ACADEMIC',
    description: 'Teaching floors, seminar rooms, and staff spaces for business and management programmes.',
    position: { lat: 6.915, lng: 79.974 }
  },
  {
    id: 'graduate-humanities-architecture',
    name: 'Graduate Studies, Humanities And Architecture Tower',
    shortName: 'GSA',
    type: 'ACADEMIC',
    description:
      'Shared tower for graduate studies, humanities and sciences, architecture, and examination-related activity.',
    position: { lat: 6.91485, lng: 79.97295 }
  },
  {
    id: 'auditorium',
    name: 'SLIIT Auditorium',
    shortName: 'AUD',
    type: 'FACILITY',
    description: 'Main auditorium used for large lectures, guest sessions, ceremonies, and campus events.',
    position: { lat: 6.91455, lng: 79.97475 }
  },
  {
    id: 'research-centre',
    name: 'Research And Innovation Centre',
    shortName: 'R&D',
    type: 'LAB',
    description: 'Research, incubation, innovation projects, and advanced technical collaboration spaces.',
    position: { lat: 6.91595, lng: 79.97415 }
  },
  {
    id: 'sports-recreation',
    name: 'Sports And Recreation Complex',
    shortName: 'REC',
    type: 'FACILITY',
    description: 'Playing field access, recreation support, fitness activity, and outdoor event coordination.',
    position: { lat: 6.91385, lng: 79.9751 }
  },
  {
    id: 'shuttle-bay',
    name: 'Campus Shuttle Bay',
    shortName: 'Bay',
    type: 'ACCESS',
    description: 'Common internal shuttle and pickup zone for moving between campus edges and nearby access roads.',
    position: { lat: 6.9137, lng: 79.97245 }
  }
];

export const CAMPUS_SUPPORT_HUBS = [
  {
    id: 'it-helpdesk',
    name: 'IT Helpdesk',
    team: 'Digital Support',
    position: { lat: 6.9153, lng: 79.97375 }
  },
  {
    id: 'facilities-desk',
    name: 'Facilities Desk',
    team: 'Facilities',
    position: { lat: 6.91445, lng: 79.9727 }
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
