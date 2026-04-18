import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Pencil,
  Building2,
  CalendarDays,
  CheckCircle2,
  Dumbbell,
  Library,
  Loader2,
  AlertTriangle,
  MapPin,
  Package,
  Sparkles,
  Trash2,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getResourceTypes, getResources } from '../../api/resources';
import {
  getAvailableFacilitySpaces,
  createFacilityBooking,
  deleteFacilityBooking,
  getFacilityLectureHalls,
  getMyFacilityBookings,
  updateFacilityBooking
} from '../../api/facilityBookings';
import {
  createResourceBooking,
  deleteResourceBooking,
  getMyResourceBookings,
  getResourceBookingsByDate,
  updateResourceBooking
} from '../../api/resourceBookings';
import { useAuth } from '../../contexts/AuthContext';

const FALLBACK_TYPES = [
  {
    type: 'FACILITY',
    title: 'Facility',
    summary: 'Lecture halls, labs, studios, and meeting spaces',
    availabilityLabel: '42 spaces',
    featurePills: ['Live availability checks', 'Smart slot conflict detection', 'Instant confirmation + reminders']
  },
  {
    type: 'EQUIPMENT',
    title: 'Equipment',
    summary: 'Projectors, cameras, kits, and multimedia gear',
    availabilityLabel: '127 items',
    featurePills: ['Damage-precheck workflow', 'Pickup + return slot planning', 'Usage logs per booking']
  },
  {
    type: 'SPORTS',
    title: 'Sports',
    summary: 'Courts, fields, gym slots, and training zones',
    availabilityLabel: '18 venues',
    featurePills: ['Team-based reservations', 'Practice schedule visibility', 'Peak-hour balancing']
  },
  {
    type: 'LIBRARY',
    title: 'Library',
    summary: 'Reading rooms, research pods, and media booths',
    availabilityLabel: '9 zones',
    featurePills: ['Quiet-zone compliance', 'Seat cap intelligence', 'Auto-release for no-shows']
  },
  {
    type: 'EVENT',
    title: 'Event',
    summary: 'Seminars, exhibitions, clubs, and special events',
    availabilityLabel: '11 upcoming',
    featurePills: ['Stage + setup allocation', 'Cross-team approval routing', 'Reminder timeline automation']
  }
];

const FACULTY_OPTIONS = [
  'Faculty of Engineering',
  'Faculty of Computing',
  'Faculty of Business',
  'Faculty of Science',
  'Faculty of Architecture'
];

const FACILITY_BUILDING_FILTER_OPTIONS = ['Engineering', 'Computing', 'Business'];

const CURATED_EQUIPMENT_RESOURCES = [
  {
    id: 'fallback-equipment-mics',
    name: 'Mics',
    subtitle: 'Wireless and wired microphones',
    location: 'Event Desk',
    capacity: 1,
    totalUnits: 40,
    availableUnits: 40,
    approvalRequired: false,
    bookingWindow: 'Up to 14 days',
    tags: ['Audio'],
    highlights: ['Suitable for presentations and events']
  },
  {
    id: 'fallback-equipment-projectors',
    name: 'Projectors',
    subtitle: 'Portable classroom projectors',
    location: 'Resource Counter',
    capacity: 1,
    totalUnits: 16,
    availableUnits: 9,
    approvalRequired: false,
    bookingWindow: 'Up to 14 days',
    tags: ['Classroom'],
    highlights: ['Instant confirmation']
  },
  {
    id: 'fallback-equipment-electronics-kits',
    name: 'Electronics kits',
    subtitle: 'Embedded and circuit experiment kits',
    location: 'Engineering Lab Store',
    capacity: 1,
    totalUnits: 24,
    availableUnits: 12,
    approvalRequired: true,
    bookingWindow: 'Up to 10 days',
    tags: ['Lab'],
    highlights: ['Approval required for external usage']
  },
  {
    id: 'fallback-equipment-lab-tools',
    name: 'Lab tools',
    subtitle: 'Toolboxes for practical sessions',
    location: 'Engineering Lab Store',
    capacity: 1,
    totalUnits: 18,
    availableUnits: 10,
    approvalRequired: true,
    bookingWindow: 'Up to 10 days',
    tags: ['Tools'],
    highlights: ['Condition check on return']
  },
  {
    id: 'fallback-equipment-measuring-devices',
    name: 'Measuring devices',
    subtitle: 'Multimeters and precision meters',
    location: 'Instrumentation Room',
    capacity: 1,
    totalUnits: 22,
    availableUnits: 13,
    approvalRequired: true,
    bookingWindow: 'Up to 7 days',
    tags: ['Precision'],
    highlights: ['Calibration tracked']
  },
  {
    id: 'fallback-equipment-projector-screen',
    name: 'Projector Screen',
    subtitle: 'Portable tripod screens',
    location: 'Event Desk',
    capacity: 1,
    totalUnits: 8,
    availableUnits: 5,
    approvalRequired: false,
    bookingWindow: 'Up to 14 days',
    tags: ['Display'],
    highlights: ['Great for seminar rooms']
  }
];

const FALLBACK_RESOURCE_CATALOG = {
  FACILITY: [
    {
      id: 'fallback-facility-1',
      name: 'Lecture Hall 1',
      subtitle: 'Engineering Building - Block A',
      location: 'Floor 2',
      capacity: 60,
      totalUnits: 1,
      availableUnits: 1,
      approvalRequired: false,
      bookingWindow: 'Up to 30 days',
      tags: ['Projector', 'Whiteboard'],
      highlights: ['Live availability checks', 'Instant confirmation']
    }
  ],
  EQUIPMENT: CURATED_EQUIPMENT_RESOURCES,
  SPORTS: [],
  LIBRARY: [],
  EVENT: []
};

const TYPE_ICON_MAP = {
  FACILITY: Building2,
  EQUIPMENT: Package,
  SPORTS: Dumbbell,
  LIBRARY: Library,
  EVENT: CalendarDays
};

const TYPE_ACCENT_MAP = {
  FACILITY: 'from-cyan-500/25 via-blue-500/10 to-transparent ring-cyan-400/40',
  EQUIPMENT: 'from-amber-500/25 via-orange-500/10 to-transparent ring-amber-400/40',
  SPORTS: 'from-emerald-500/25 via-teal-500/10 to-transparent ring-emerald-400/40',
  LIBRARY: 'from-indigo-500/25 via-violet-500/10 to-transparent ring-indigo-400/40',
  EVENT: 'from-rose-500/25 via-fuchsia-500/10 to-transparent ring-rose-400/40'
};

const GENERIC_BOOKING_CONFIG = {
  EQUIPMENT: {
    bookingLabel: 'Equipment Request Form',
    quantityLabel: 'Requested Units',
    quantityMin: 1,
    quantityMax: 40,
    supportsDurationHours: true,
    durationLabel: 'Required Hours',
    durationMin: 1,
    durationMax: 12,
    purposeLabel: 'Usage Purpose',
    purposePlaceholder: 'Example: Media recording session for project presentation.',
    defaultStatus: 'PENDING_APPROVAL'
  },
  SPORTS: {
    bookingLabel: 'Sports Slot Form',
    quantityLabel: 'Team Members',
    quantityMin: 1,
    quantityMax: 30,
    supportsDurationHours: true,
    durationLabel: 'Session Hours',
    durationMin: 1,
    durationMax: 6,
    purposeLabel: 'Session Plan',
    purposePlaceholder: 'Example: Inter-faculty basketball practice session.',
    defaultStatus: 'APPROVED'
  },
  LIBRARY: {
    bookingLabel: 'Library Space Form',
    quantityLabel: 'Seat Count',
    quantityMin: 1,
    quantityMax: 12,
    supportsDurationHours: true,
    durationLabel: 'Study Hours',
    durationMin: 1,
    durationMax: 8,
    purposeLabel: 'Study Purpose',
    purposePlaceholder: 'Example: Group study for end-semester exam revision.',
    defaultStatus: 'APPROVED'
  },
  EVENT: {
    bookingLabel: 'Event Slot Form',
    quantityLabel: 'Expected Attendees',
    quantityMin: 1,
    quantityMax: 200,
    supportsDurationHours: true,
    durationLabel: 'Event Hours',
    durationMin: 1,
    durationMax: 12,
    purposeLabel: 'Event Details',
    purposePlaceholder: 'Example: Tech club workshop with guest speaker.',
    defaultStatus: 'PENDING_APPROVAL'
  }
};

function getTypeIcon(type) {
  return TYPE_ICON_MAP[type] || Building2;
}

function getTypeAccents(type) {
  return TYPE_ACCENT_MAP[type] || 'from-cyan-500/25 via-blue-500/10 to-transparent ring-cyan-400/40';
}

function getTodayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getCurrentTimeIso() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function timeToMinutes(timeValue) {
  const normalized = String(timeValue || '').slice(0, 5);
  const [hoursPart, minutesPart] = normalized.split(':');
  const hours = Number.parseInt(hoursPart || '0', 10);
  const minutes = Number.parseInt(minutesPart || '0', 10);
  return hours * 60 + minutes;
}

function getReturnSlotLabel(pickupTime, durationHours) {
  const startMinutes = timeToMinutes(pickupTime);
  const totalMinutes = startMinutes + Number(durationHours || 0) * 60;
  const dayOffset = Math.floor(totalMinutes / (24 * 60));
  const normalizedMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
  const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, '0');
  const minutes = String(normalizedMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}${dayOffset > 0 ? ` (+${dayOffset}d)` : ''}`;
}

function isSlotOverlap(startA, durationA, startB, durationB) {
  const startAMinutes = timeToMinutes(startA);
  const endAMinutes = startAMinutes + Number(durationA || 1) * 60;
  const startBMinutes = timeToMinutes(startB);
  const endBMinutes = startBMinutes + Number(durationB || 1) * 60;
  return startAMinutes < endBMinutes && startBMinutes < endAMinutes;
}

function isBlockingBookingStatus(status) {
  const normalizedStatus = String(status || '').toUpperCase();
  return normalizedStatus !== 'REJECTED' && normalizedStatus !== 'CANCELLED';
}

function getBookingResourceType(booking) {
  return String(booking?.resourceType || booking?.type || '').toUpperCase();
}

function normalizeBuildingValue(value = '') {
  return String(value || '').trim().toUpperCase();
}

function normalizeResourceKindValue(value = '') {
  return String(value || '').trim().toUpperCase();
}

function formatResourceKindLabel(value = '') {
  const normalized = normalizeResourceKindValue(value);
  if (!normalized) {
    return 'Unknown';
  }
  return normalized
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function classifyFacilitySpaceType(rawSpaceType = '', rawName = '', rawDisplayName = '') {
  const normalizedSpaceType = String(rawSpaceType || '').trim().toUpperCase();
  const normalizedName = String(rawName || '').trim().toUpperCase();
  const normalizedDisplayName = String(rawDisplayName || '').trim().toUpperCase();
  const combined = `${normalizedSpaceType} ${normalizedName} ${normalizedDisplayName}`;

  if (combined.includes('LAB')) {
    return 'LAB';
  }
  return 'LECTURE_HALL';
}

function getBookingApprovalMeta(status) {
  const normalizedStatus = String(status || '').toUpperCase();
  if (normalizedStatus === 'PENDING_APPROVAL' || normalizedStatus === 'PENDING') {
    return {
      label: 'Pending Admin Approval',
      className:
        'border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/30 dark:text-amber-300'
    };
  }

  if (normalizedStatus === 'REJECTED') {
    return {
      label: 'Rejected by Admin',
      className:
        'border-red-200 bg-red-100 text-red-700 dark:border-red-900/50 dark:bg-red-900/30 dark:text-red-300'
    };
  }

  return {
    label: 'Admin Approved',
    className:
      'border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-300'
  };
}

export function BookingResourcesPage() {
  const { user } = useAuth();
  const [resourceTypes, setResourceTypes] = useState(FALLBACK_TYPES);
  const [selectedType, setSelectedType] = useState(FALLBACK_TYPES[0].type);
  const [resources, setResources] = useState([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loadingFacilityMeta, setLoadingFacilityMeta] = useState(false);
  const [submittingFacilityBooking, setSubmittingFacilityBooking] = useState(false);
  const [submittingGenericBooking, setSubmittingGenericBooking] = useState(false);
  const [showFacilityForm, setShowFacilityForm] = useState(false);
  const [showGenericForm, setShowGenericForm] = useState(false);
  const [editingFacilityBookingId, setEditingFacilityBookingId] = useState('');
  const [editingGenericBookingId, setEditingGenericBookingId] = useState('');
  const [deletingFacilityBookingId, setDeletingFacilityBookingId] = useState('');
  const [deletingGenericBookingId, setDeletingGenericBookingId] = useState('');
  const [error, setError] = useState('');
  const [facilityConflictMessage, setFacilityConflictMessage] = useState('');
  const [genericConflictMessage, setGenericConflictMessage] = useState('');
  const [facilityCatalogDate, setFacilityCatalogDate] = useState(getTodayIsoDate);
  const [facilityBuildingFilter, setFacilityBuildingFilter] = useState('ALL');
  const [facilityTypeFilter, setFacilityTypeFilter] = useState('ALL');
  const [genericCatalogDate, setGenericCatalogDate] = useState(getTodayIsoDate);
  const [genericCatalogTime, setGenericCatalogTime] = useState(getCurrentTimeIso);
  const [genericCatalogDurationHours, setGenericCatalogDurationHours] = useState(1);
  const [genericBuildingFilter, setGenericBuildingFilter] = useState('ALL');
  const [genericTypeFilter, setGenericTypeFilter] = useState('ALL');
  const [lectureHalls, setLectureHalls] = useState([]);
  const [myFacilityBookings, setMyFacilityBookings] = useState([]);
  const [availableFacilitySpaces, setAvailableFacilitySpaces] = useState([]);
  const [genericBookings, setGenericBookings] = useState([]);
  const [genericDayBookings, setGenericDayBookings] = useState([]);

  const [facilityForm, setFacilityForm] = useState({
    faculty: FACULTY_OPTIONS[0],
    bookingDate: '',
    bookingTime: '',
    durationHours: 1,
    studentCount: 1,
    lectureHallCode: ''
  });

  const [genericForm, setGenericForm] = useState({
    resourceId: '',
    bookingDate: getTodayIsoDate(),
    bookingTime: '',
    quantity: 1,
    durationHours: 1,
    purpose: ''
  });

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    if (!selectedType) {
      return;
    }
    if (selectedType === 'FACILITY') {
      setResources([]);
      return;
    }
    loadResourcesByType(selectedType);
  }, [selectedType]);

  useEffect(() => {
    if (selectedType !== 'FACILITY') {
      setShowFacilityForm(false);
      return;
    }

    setShowGenericForm(false);
    loadFacilityMeta();
  }, [selectedType, facilityCatalogDate]);

  useEffect(() => {
    if (!selectedType || selectedType === 'FACILITY') {
      return;
    }
    loadGenericBookingsMeta(selectedType, genericCatalogDate);
  }, [selectedType, genericCatalogDate]);

  async function loadTypes() {
    setLoadingTypes(true);
    setError('');
    
    try {
      const { getResourceSummary } = await import('../../api/facilities');
      
      // Try fetching both, but don't let types failure stop the summary
      const responses = await Promise.allSettled([
        getResourceTypes(),
        getResourceSummary()
      ]);
      
      const typeData = responses[0].status === 'fulfilled' ? responses[0].value : FALLBACK_TYPES;
      const summaryData = responses[1].status === 'fulfilled' ? responses[1].value : {};

      if (Array.isArray(typeData) && typeData.length > 0) {
        const updatedTypes = typeData.map(type => {
          // If counts are in summaryData, use them. Otherwise keep existing label.
          if (summaryData[type.type] !== undefined) {
            const count = summaryData[type.type];
            let label = `${count} available`;
            
            if (type.type === 'FACILITY') label = `${count} spaces`;
            else if (type.type === 'EQUIPMENT') label = `${count} items`;
            else if (type.type === 'SPORTS') label = `${count} venues`;
            else if (type.type === 'LIBRARY') label = `${count} zones`;
            else if (type.type === 'EVENT') label = `${count} upcoming`;
            
            return { ...type, availabilityLabel: label };
          }
          return type;
        });
        
        setResourceTypes(updatedTypes);
        setSelectedType(updatedTypes[0].type);
      }
    } catch (loadError) {
      console.error('Type loading system error:', loadError);
      setResourceTypes(FALLBACK_TYPES);
    } finally {
      setLoadingTypes(false);
    }
  }

  async function loadResourcesByType(type) {
    setLoadingResources(true);
    setError('');

    try {
      if (type === 'EQUIPMENT') {
        const { getAllEquipments } = await import('../../api/equipments');
        const { getAllFacilities } = await import('../../api/facilities');
        const [dbEquipments, allFacilities] = await Promise.all([
          getAllEquipments(),
          getAllFacilities()
        ]);
        const facilitiesById = new Map((Array.isArray(allFacilities) ? allFacilities : []).map((item) => [item.id, item]));
        
        const mapped = (Array.isArray(dbEquipments) ? dbEquipments : []).map((item) => {
          const linkedFacility = facilitiesById.get(item.facilityId);
          const building = linkedFacility?.building || '';
          const block = linkedFacility?.block || '';
          const floor = linkedFacility?.floor;
          const locationParts = [building, block ? `Block ${block}` : '', Number.isFinite(floor) ? `Floor ${floor}` : '']
            .filter(Boolean)
            .join(' | ');

          return {
            id: item.id,
            name: item.name,
            subtitle: item.description || 'Campus Resource',
            building,
            spaceType: linkedFacility?.spaceType || 'EQUIPMENT',
            resourceKind: 'EQUIPMENT',
            location: locationParts || 'Main Campus',
            capacity: 1,
            totalUnits: item.totalQuantity,
            availableUnits: item.availableQuantity,
            approvalRequired: item.approvalRequired,
            bookingWindow: 'Up to 14 days',
            tags: [item.status],
            highlights: item.approvalRequired ? ['Approval required'] : ['Instant confirmation']
          };
        });
        
        setResources(mapped);
      } else if (['SPORTS', 'LIBRARY', 'EVENT'].includes(type)) {
        const { getFacilitiesByType } = await import('../../api/facilities');

        const dbPlaces = await getFacilitiesByType(type);
        
        const mapped = (Array.isArray(dbPlaces) ? dbPlaces : []).map(item => ({
          id: item.id,
          name: item.name,
          building: item.building || '',
          spaceType: item.spaceType || type,
          resourceKind: item.spaceType || type,
          subtitle: `${item.building} - Block ${item.block}`,
          location: `${item.building} | Block ${item.block} | Floor ${item.floor}`,
          capacity: item.capacity,
          totalUnits: 1,
          availableUnits: 1,
          approvalRequired: false,
          bookingWindow: 'Up to 14 days',
          tags: item.amenities || [],
          highlights: [`Capacity: ${item.capacity}`]
        }));
        
        setResources(mapped);
      } else {
        const resourceData = await getResources(type);
        setResources(
          Array.isArray(resourceData)
            ? resourceData.map((resource) => ({
                ...resource,
                building: resource.building || '',
                spaceType: resource.spaceType || type,
                resourceKind: resource.resourceKind || resource.spaceType || type
              }))
            : []
        );
      }
    } catch (loadError) {
      if (loadError?.message === 'Failed to fetch') {
        setResources(FALLBACK_RESOURCE_CATALOG[type] || []);
      } else {
        console.error('Resource load error:', loadError);
        setResources([]);
      }
    } finally {
      setLoadingResources(false);
    }
  }

  async function loadFacilityMeta() {
    setLoadingFacilityMeta(true);
    try {
      const [halls, myBookings, availableSpaces] = await Promise.all([
        getFacilityLectureHalls(),
        getMyFacilityBookings(),
        getAvailableFacilitySpaces(facilityCatalogDate)
      ]);

      const hallOptions = Array.isArray(halls) ? halls : [];
      const bookingList = Array.isArray(myBookings) ? myBookings : [];
      const availableSpacesForDate = Array.isArray(availableSpaces) ? availableSpaces : [];
      setLectureHalls(hallOptions);
      setMyFacilityBookings(bookingList);
      setAvailableFacilitySpaces(availableSpacesForDate);
      setFacilityForm((current) => ({
        ...current,
        lectureHallCode: current.lectureHallCode || hallOptions[0]?.code || ''
      }));
    } catch (loadError) {
      if (loadError?.message !== 'Failed to fetch') {
        setError(loadError?.message || 'Unable to load facility booking form options.');
      }
      setAvailableFacilitySpaces([]);
    } finally {
      setLoadingFacilityMeta(false);
    }
  }

  async function loadGenericBookingsMeta(type, date) {
    try {
      const [myBookings, dayBookings] = await Promise.all([
        getMyResourceBookings(type),
        getResourceBookingsByDate(type, date)
      ]);
      setGenericBookings(Array.isArray(myBookings) ? myBookings : []);
      setGenericDayBookings(Array.isArray(dayBookings) ? dayBookings : []);
    } catch (loadError) {
      if (loadError?.message !== 'Failed to fetch') {
        setError(loadError?.message || 'Unable to load resource booking slots.');
      }
      setGenericBookings([]);
      setGenericDayBookings([]);
    }
  }

  const activeResourceType = useMemo(
    () => resourceTypes.find((type) => type.type === selectedType) ?? resourceTypes[0],
    [resourceTypes, selectedType]
  );

  const selectedTypeFeatures =
    activeResourceType?.featurePills?.length > 0
      ? activeResourceType.featurePills
      : ['Live availability checks', 'Smart slot conflict detection', 'Instant confirmation + reminders'];

  const isFacilityType = selectedType === 'FACILITY';
  const genericTypeConfig = GENERIC_BOOKING_CONFIG[selectedType];
  const selectedGenericCatalogDurationHours =
    genericTypeConfig?.supportsDurationHours
      ? Number(genericCatalogDurationHours || genericTypeConfig.durationMin || 1)
      : 1;
  const selectedGenericBookings = useMemo(
    () =>
      genericBookings.filter(
        (booking) =>
          getBookingResourceType(booking) === selectedType &&
          (!user?.id || booking.studentId === user.id || !booking.studentId)
      ),
    [genericBookings, selectedType, user?.id]
  );

  const slotBlockingGenericBookings = useMemo(
    () =>
      genericDayBookings.filter(
        (booking) =>
          getBookingResourceType(booking) === selectedType &&
          isBlockingBookingStatus(booking.status) &&
          booking.bookingDate === genericCatalogDate
      ),
    [genericDayBookings, selectedType, genericCatalogDate]
  );

  const genericAvailabilityByResourceId = useMemo(() => {
    return resources.reduce((accumulator, resource) => {
      const overlappingBookings = slotBlockingGenericBookings.filter(
        (booking) =>
          booking.resourceId === resource.id &&
          isSlotOverlap(
            booking.bookingTime,
            Number(booking.durationHours || 1),
            genericCatalogTime,
            selectedGenericCatalogDurationHours
          )
      );

      if (selectedType === 'EQUIPMENT') {
        const totalReservedUnits = overlappingBookings.reduce(
          (total, booking) => total + Number(booking.quantity || 0),
          0
        );
        const baseAvailableUnits = Number(resource.availableUnits ?? resource.totalUnits ?? 0);
        const remainingUnits = Math.max(0, baseAvailableUnits - totalReservedUnits);
        accumulator[resource.id] = {
          isAvailable: remainingUnits > 0,
          remainingUnits,
          overlapCount: overlappingBookings.length
        };
        return accumulator;
      }

      accumulator[resource.id] = {
        isAvailable: overlappingBookings.length === 0,
        remainingUnits: Number(resource.availableUnits ?? resource.totalUnits ?? 1),
        overlapCount: overlappingBookings.length
      };
      return accumulator;
    }, {});
  }, [
    resources,
    slotBlockingGenericBookings,
    selectedType,
    genericCatalogTime,
    selectedGenericCatalogDurationHours
  ]);

  const resolvedResources = useMemo(() => {
    if (selectedType !== 'EQUIPMENT') {
      return resources;
    }

    return resources.map((resource) => ({
      ...resource,
      availableUnits: Number(genericAvailabilityByResourceId[resource.id]?.remainingUnits ?? 0)
    }));
  }, [selectedType, resources, genericAvailabilityByResourceId]);

  const genericBuildingOptions = useMemo(() => {
    if (selectedType === 'FACILITY') {
      return [];
    }
    return FACILITY_BUILDING_FILTER_OPTIONS;
  }, [selectedType]);

  const genericResourceTypeOptions = useMemo(() => {
    if (selectedType === 'FACILITY') {
      return [];
    }

    const normalizedKinds = new Set(
      resolvedResources
        .map((resource) =>
          normalizeResourceKindValue(resource.resourceKind || resource.spaceType || selectedType)
        )
        .filter(Boolean)
    );

    if (normalizedKinds.size === 0) {
      normalizedKinds.add(normalizeResourceKindValue(selectedType));
    }

    return [...normalizedKinds].sort((a, b) => a.localeCompare(b));
  }, [selectedType, resolvedResources]);

  const filteredResolvedGenericResources = useMemo(() => {
    if (selectedType === 'FACILITY') {
      return [];
    }

    return resolvedResources.filter((resource) => {
      const buildingMatches =
        genericBuildingFilter === 'ALL' ||
        normalizeBuildingValue(resource.building) === normalizeBuildingValue(genericBuildingFilter);
      const typeMatches =
        genericTypeFilter === 'ALL' ||
        normalizeResourceKindValue(resource.resourceKind || resource.spaceType || selectedType) ===
          normalizeResourceKindValue(genericTypeFilter);
      return buildingMatches && typeMatches;
    });
  }, [selectedType, resolvedResources, genericBuildingFilter, genericTypeFilter]);

  const filteredAvailableGenericResources = useMemo(
    () =>
      filteredResolvedGenericResources.filter(
        (resource) => genericAvailabilityByResourceId[resource.id]?.isAvailable ?? true
      ),
    [filteredResolvedGenericResources, genericAvailabilityByResourceId]
  );

  const filteredConflictingGenericResources = useMemo(
    () =>
      filteredResolvedGenericResources.filter(
        (resource) => !(genericAvailabilityByResourceId[resource.id]?.isAvailable ?? true)
      ),
    [filteredResolvedGenericResources, genericAvailabilityByResourceId]
  );

  const selectableGenericResources = useMemo(() => {
    if (editingGenericBookingId) {
      return resolvedResources;
    }
    return filteredAvailableGenericResources;
  }, [editingGenericBookingId, resolvedResources, filteredAvailableGenericResources]);

  const genericSlotConflictSummary = useMemo(() => {
    if (isFacilityType) {
      return '';
    }
    if (genericConflictMessage) {
      return genericConflictMessage;
    }
    if (filteredConflictingGenericResources.length === 0) {
      return '';
    }
    return `${filteredConflictingGenericResources.length} resource(s) are already booked for ${genericCatalogDate} at ${String(
      genericCatalogTime || ''
    ).slice(0, 5)}.`;
  }, [
    isFacilityType,
    genericConflictMessage,
    filteredConflictingGenericResources,
    genericCatalogDate,
    genericCatalogTime
  ]);

  const nextGenericBooking = useMemo(() => {
    if (!genericTypeConfig || selectedGenericBookings.length === 0) {
      return null;
    }

    const now = new Date();
    return selectedGenericBookings
      .map((booking) => {
        const startAt = new Date(`${booking.bookingDate}T${String(booking.bookingTime || '').slice(0, 5)}:00`);
        return { booking, startAt };
      })
      .filter((entry) => !Number.isNaN(entry.startAt.getTime()) && entry.startAt > now)
      .sort((left, right) => left.startAt - right.startAt)[0]?.booking;
  }, [genericTypeConfig, selectedGenericBookings]);

  const equipmentPickupReturnPlans = useMemo(() => {
    if (selectedType !== 'EQUIPMENT' || selectedGenericBookings.length === 0) {
      return [];
    }

    return selectedGenericBookings
      .map((booking) => ({
        ...booking,
        returnTimeLabel: getReturnSlotLabel(booking.bookingTime, booking.durationHours || 1)
      }))
      .sort((left, right) => {
        const leftKey = `${left.bookingDate || ''}-${String(left.bookingTime || '')}`;
        const rightKey = `${right.bookingDate || ''}-${String(right.bookingTime || '')}`;
        return leftKey.localeCompare(rightKey);
      });
  }, [selectedType, selectedGenericBookings]);

  const equipmentReturnPreviewLabel = useMemo(() => {
    if (selectedType !== 'EQUIPMENT' || !genericForm.bookingTime) {
      return '';
    }
    return getReturnSlotLabel(genericForm.bookingTime, genericForm.durationHours || 1);
  }, [selectedType, genericForm.bookingTime, genericForm.durationHours]);

  const equipmentUsageLogs = useMemo(() => {
    if (selectedType !== 'EQUIPMENT' || selectedGenericBookings.length === 0) {
      return [];
    }

    return [...selectedGenericBookings]
      .sort((left, right) => String(right.updatedAt || '').localeCompare(String(left.updatedAt || '')))
      .map((booking) => ({
        ...booking,
        returnTimeLabel: getReturnSlotLabel(booking.bookingTime, booking.durationHours || 1),
        statusLabel: getBookingApprovalMeta(booking.status).label
      }));
  }, [selectedType, selectedGenericBookings]);

  const facilityBuildingOptions = useMemo(() => {
    if (selectedType !== 'FACILITY') {
      return [];
    }
    return FACILITY_BUILDING_FILTER_OPTIONS;
  }, [selectedType]);

  const filteredFacilitySpaces = useMemo(() => {
    if (selectedType !== 'FACILITY') {
      return [];
    }

    const allowedBuildings = new Set(FACILITY_BUILDING_FILTER_OPTIONS.map(normalizeBuildingValue));

    return availableFacilitySpaces.filter((space) => {
      const normalizedBuilding = normalizeBuildingValue(space.building);
      if (!allowedBuildings.has(normalizedBuilding)) {
        return false;
      }

      const buildingMatches =
        facilityBuildingFilter === 'ALL' ||
        normalizeBuildingValue(space.building) === normalizeBuildingValue(facilityBuildingFilter);
      const type = classifyFacilitySpaceType(space.spaceType, space.name, space.displayName);
      const typeMatches = facilityTypeFilter === 'ALL' || type === facilityTypeFilter;
      return buildingMatches && typeMatches;
    });
  }, [
    selectedType,
    availableFacilitySpaces,
    facilityBuildingFilter,
    facilityTypeFilter
  ]);

  const suggestedAvailableSlots = useMemo(() => {
    if (selectedType !== 'FACILITY') {
      return [];
    }
    return filteredFacilitySpaces;
  }, [selectedType, filteredFacilitySpaces]);

  const nextFacilityBooking = useMemo(() => {
    if (selectedType !== 'FACILITY' || myFacilityBookings.length === 0) {
      return null;
    }

    const now = new Date();
    return myFacilityBookings
      .map((booking) => {
        const normalizedTime = String(booking.bookingTime || '').slice(0, 5);
        const startAt = new Date(`${booking.bookingDate}T${normalizedTime || '00:00'}:00`);
        return { booking, startAt };
      })
      .filter((entry) => !Number.isNaN(entry.startAt.getTime()) && entry.startAt > now)
      .sort((left, right) => left.startAt - right.startAt)[0]?.booking;
  }, [selectedType, myFacilityBookings]);

  function updateFacilityField(field, value) {
    setFacilityForm((current) => ({
      ...current,
      [field]: value
    }));
  }

  function openNewFacilityBookingForm(preselectedSpaceCode = '') {
    setEditingFacilityBookingId('');
    setFacilityForm((current) => ({
      ...current,
      bookingDate: facilityCatalogDate,
      bookingTime: '',
      durationHours: 1,
      studentCount: 1,
      lectureHallCode: preselectedSpaceCode || current.lectureHallCode || lectureHalls[0]?.code || ''
    }));
    setShowFacilityForm(true);
  }

  function closeFacilityForm() {
    setShowFacilityForm(false);
    setEditingFacilityBookingId('');
  }

  function openGenericBookingForm(preselectedResourceId = '') {
    if (!genericTypeConfig) {
      return;
    }

    setError('');
    setEditingGenericBookingId('');
    setGenericConflictMessage('');
    setGenericForm({
      resourceId: preselectedResourceId || filteredAvailableGenericResources[0]?.id || '',
      bookingDate: genericCatalogDate,
      bookingTime: genericCatalogTime,
      quantity: genericTypeConfig.quantityMin,
      durationHours: selectedGenericCatalogDurationHours,
      purpose: ''
    });
    setShowGenericForm(true);
  }

  function closeGenericForm() {
    setShowGenericForm(false);
    setEditingGenericBookingId('');
  }

  function openEditFacilityBookingForm(booking) {
    const normalizedTime = String(booking.bookingTime || '').slice(0, 5);
    setEditingFacilityBookingId(booking.id);
    setFacilityForm({
      faculty: booking.faculty || FACULTY_OPTIONS[0],
      bookingDate: booking.bookingDate || '',
      bookingTime: normalizedTime,
      durationHours: Number(booking.durationHours || 1),
      studentCount: booking.studentCount || 1,
      lectureHallCode: booking.lectureHallCode || ''
    });
    setShowFacilityForm(true);
  }

  function openEditGenericBookingForm(booking) {
    if (!booking) {
      return;
    }

    setEditingGenericBookingId(booking.id);
    setGenericConflictMessage('');
    setGenericForm({
      resourceId: booking.resourceId || '',
      bookingDate: booking.bookingDate || getTodayIsoDate(),
      bookingTime: String(booking.bookingTime || '').slice(0, 5),
      quantity: booking.quantity || 1,
      durationHours: booking.durationHours || genericTypeConfig?.durationMin || 1,
      purpose: booking.purpose || ''
    });
    setShowGenericForm(true);
  }

  function handleResourceTypeClick(typeValue) {
    setSelectedType(typeValue);
    setFacilityConflictMessage('');
    setGenericConflictMessage('');
    setGenericBuildingFilter('ALL');
    setGenericTypeFilter('ALL');
    if (typeValue === 'FACILITY') {
      closeGenericForm();
      closeFacilityForm();
      return;
    }
    closeFacilityForm();
    closeGenericForm();
  }

  function isFacilityConflict(message) {
    const normalizedMessage = (message || '').toLowerCase();
    return (
      normalizedMessage.includes('already reserved for the selected slot') ||
      normalizedMessage.includes('another facility booking at this time')
    );
  }

  function isGenericConflict(message) {
    const normalizedMessage = (message || '').toLowerCase();
    return (
      normalizedMessage.includes('already reserved for the selected slot') ||
      normalizedMessage.includes('available for the selected slot') ||
      normalizedMessage.includes('resource does not belong')
    );
  }

  function getFacilityFormValidationError() {
    if (!facilityForm.bookingDate || !facilityForm.bookingTime || !facilityForm.lectureHallCode) {
      return 'Please complete all facility booking fields.';
    }

    const todayIso = getTodayIsoDate();
    if (facilityForm.bookingDate < todayIso) {
      return 'You can only book for today or a future date.';
    }

    if (facilityForm.bookingDate === todayIso && facilityForm.bookingTime < getCurrentTimeIso()) {
      return 'Selected time has already passed. Choose a future time.';
    }

    const studentCount = Number(facilityForm.studentCount);
    if (!Number.isInteger(studentCount) || studentCount < 1 || studentCount > 60) {
      return 'Student count must be between 1 and 60.';
    }

    const durationHours = Number(facilityForm.durationHours);
    if (!Number.isInteger(durationHours) || durationHours < 1 || durationHours > 12) {
      return 'Duration must be between 1 and 12 hours.';
    }

    return '';
  }

  async function handleFacilitySubmit(event) {
    event.preventDefault();
    setFacilityConflictMessage('');
    setError('');

    const validationError = getFacilityFormValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmittingFacilityBooking(true);
    try {
      const payload = {
        faculty: facilityForm.faculty,
        bookingDate: facilityForm.bookingDate,
        bookingTime: facilityForm.bookingTime,
        studentCount: Number(facilityForm.studentCount),
        durationHours: Number(facilityForm.durationHours),
        lectureHallCode: facilityForm.lectureHallCode
      };

      if (editingFacilityBookingId) {
        await updateFacilityBooking(editingFacilityBookingId, payload);
      } else {
        await createFacilityBooking(payload);
      }

      setEditingFacilityBookingId('');
      setFacilityForm((current) => ({
        ...current,
        bookingDate: facilityCatalogDate,
        bookingTime: '',
        durationHours: 1,
        studentCount: 1
      }));
      await loadFacilityMeta();
    } catch (submitError) {
      const message = submitError?.message?.trim() || 'Unable to submit facility booking request.';
      if (isFacilityConflict(message)) {
        setFacilityConflictMessage(message);
      } else {
        setError(message);
      }
    } finally {
      closeFacilityForm();
      setSubmittingFacilityBooking(false);
    }
  }

  function getGenericFormValidationError() {
    if (!genericTypeConfig) {
      return 'Resource booking for this type is not available yet.';
    }
    if (!genericForm.resourceId || !genericForm.bookingDate || !genericForm.bookingTime) {
      return 'Please complete all booking fields.';
    }

    const todayIso = getTodayIsoDate();
    if (genericForm.bookingDate < todayIso) {
      return 'You can only book for today or a future date.';
    }
    if (genericForm.bookingDate === todayIso && genericForm.bookingTime < getCurrentTimeIso()) {
      return 'Selected time has already passed. Choose a future time.';
    }

    const quantity = Number(genericForm.quantity);
    if (!Number.isInteger(quantity) || quantity < genericTypeConfig.quantityMin || quantity > genericTypeConfig.quantityMax) {
      return `${genericTypeConfig.quantityLabel} must be between ${genericTypeConfig.quantityMin} and ${genericTypeConfig.quantityMax}.`;
    }

    const durationHours = Number(genericForm.durationHours || 1);
    if (
      !Number.isInteger(durationHours) ||
      durationHours < (genericTypeConfig.durationMin || 1) ||
      durationHours > (genericTypeConfig.durationMax || 12)
    ) {
      return `${genericTypeConfig.durationLabel || 'Required Hours'} must be between ${
        genericTypeConfig.durationMin || 1
      } and ${genericTypeConfig.durationMax || 12}.`;
    }

    const bookingsForValidationDate =
      genericForm.bookingDate === genericCatalogDate ? slotBlockingGenericBookings : [];

    const resourceDayBookings = bookingsForValidationDate.filter(
      (booking) =>
        booking.resourceId === genericForm.resourceId &&
        booking.id !== editingGenericBookingId &&
        isSlotOverlap(booking.bookingTime, Number(booking.durationHours || 1), genericForm.bookingTime, durationHours)
    );

    if (selectedType === 'EQUIPMENT') {
      const selectedResource = resources.find((resource) => resource.id === genericForm.resourceId);
      const baseAvailableUnits = Number(selectedResource?.availableUnits ?? selectedResource?.totalUnits ?? 0);
      const reservedUnitsByOtherBookings = resourceDayBookings.reduce(
        (total, booking) => total + Number(booking.quantity || 0),
        0
      );
      const currentlyAvailableUnits = Math.max(0, baseAvailableUnits - reservedUnitsByOtherBookings);

      if (quantity > currentlyAvailableUnits) {
        return `Only ${currentlyAvailableUnits} unit(s) are currently available for this equipment.`;
      }
    } else if (resourceDayBookings.length > 0) {
      return 'This resource is already reserved for the selected slot.';
    }

    if (!genericForm.purpose || genericForm.purpose.trim().length < 8) {
      return `${genericTypeConfig.purposeLabel} should have at least 8 characters.`;
    }

    return '';
  }

  async function handleGenericSubmit(event) {
    event.preventDefault();
    setError('');
    setGenericConflictMessage('');

    const validationError = getGenericFormValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmittingGenericBooking(true);
    try {
      const payload = {
        resourceType: selectedType,
        resourceId: genericForm.resourceId,
        bookingDate: genericForm.bookingDate,
        bookingTime: genericForm.bookingTime,
        quantity: Number(genericForm.quantity),
        durationHours: Number(genericForm.durationHours || 1),
        purpose: genericForm.purpose.trim()
      };

      if (editingGenericBookingId) {
        await updateResourceBooking(editingGenericBookingId, payload);
      } else {
        await createResourceBooking(payload);
      }

      setEditingGenericBookingId('');
      closeGenericForm();
      await loadGenericBookingsMeta(selectedType, genericCatalogDate);
    } catch (submitError) {
      const message = submitError?.message?.trim() || 'Unable to submit booking request.';
      if (isGenericConflict(message)) {
        setGenericConflictMessage(message);
      } else {
        setError(message);
      }
    } finally {
      setSubmittingGenericBooking(false);
    }
  }

  async function handleDeleteFacilityBooking(bookingId) {
    setError('');
    setFacilityConflictMessage('');
    setDeletingFacilityBookingId(bookingId);
    try {
      setMyFacilityBookings((current) => current.filter((booking) => booking.id !== bookingId));
      await deleteFacilityBooking(bookingId);
      if (editingFacilityBookingId === bookingId) {
        setEditingFacilityBookingId('');
      }
      await loadFacilityMeta();
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete booking.');
    } finally {
      setDeletingFacilityBookingId('');
    }
  }

  async function handleDeleteGenericBooking(bookingId) {
    setError('');
    setDeletingGenericBookingId(bookingId);
    try {
      await deleteResourceBooking(bookingId);
      if (editingGenericBookingId === bookingId) {
        closeGenericForm();
      }
      await loadGenericBookingsMeta(selectedType, genericCatalogDate);
    } catch (deleteError) {
      setError(deleteError?.message || 'Unable to delete booking.');
    } finally {
      setDeletingGenericBookingId('');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-cyan-300/40 bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-700 p-7 text-white shadow-[0_20px_60px_-25px_rgba(56,189,248,0.65)]">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
          Booking Resources
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight">
          Book campus assets in one unified flow
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-blue-100">
          Create reservations faster with categorized resource types and smarter availability visibility.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-300">
          <Sparkles className="h-4 w-4" />
          Resource Types
        </div>

        {loadingTypes ? (
          <Card className="border border-slate-200/70 dark:border-slate-800">
            <CardContent className="flex items-center justify-center py-10 text-slate-500 dark:text-slate-300">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading categories...
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {resourceTypes.map((type, index) => {
              const Icon = getTypeIcon(type.type);
              const isActive = selectedType === type.type;
              return (
                <motion.button
                  key={type.type}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.04 * index }}
                onClick={() => handleResourceTypeClick(type.type)}
                className={`group relative overflow-hidden rounded-3xl border p-5 text-left transition-all ${
                    isActive
                      ? 'border-white/50 bg-slate-900 text-white shadow-[0_20px_45px_-20px_rgba(15,23,42,0.8)]'
                      : 'border-slate-200/70 bg-white/80 hover:-translate-y-0.5 hover:border-slate-300 dark:border-slate-700/70 dark:bg-slate-900/70 dark:hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${getTypeAccents(type.type)} ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}
                  />
                  <div className="relative">
                    <div
                      className={`mb-4 inline-flex rounded-2xl p-2.5 ring-1 ${
                        isActive
                          ? 'bg-white/15 text-white ring-white/25'
                          : 'bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.14em] ${
                        isActive ? 'text-slate-200' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {type.type}
                    </p>
                    <p className={`mt-1 text-sm font-medium ${isActive ? 'text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                      {type.summary}
                    </p>
                    <p className={`mt-3 text-xs font-semibold ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                      {type.availabilityLabel}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <Card className="overflow-hidden border border-slate-200/70 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100/80 bg-gradient-to-r from-slate-50 to-cyan-50/70 dark:from-slate-900 dark:to-slate-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Selected Type
            </p>
            <h2 className="mt-1 text-2xl font-extrabold text-slate-900 dark:text-white">
              {activeResourceType?.type || 'FACILITY'}
            </h2>
          </div>
          <Button
            size="sm"
            onClick={() => {
              if (isFacilityType) {
                openNewFacilityBookingForm();
                return;
              }
              if (genericTypeConfig) {
                openGenericBookingForm();
              }
            }}
            disabled={!isFacilityType && Boolean(genericTypeConfig) && filteredAvailableGenericResources.length === 0}
            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
            rightIcon={<ArrowUpRight className="h-4 w-4" />}
          >
            {isFacilityType || genericTypeConfig ? 'Open Form' : 'Continue'}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {selectedTypeFeatures.map((feature, index) => {
            const supportsAdvancedFlow = isFacilityType || Boolean(genericTypeConfig);
            const isLiveAvailabilityFeature = supportsAdvancedFlow && index === 0;
            const isConflictDetectionFeature = supportsAdvancedFlow && index === 1;
            const isReminderFeature = supportsAdvancedFlow && index === 2;
            if (!isLiveAvailabilityFeature && !isConflictDetectionFeature && !isReminderFeature) {
              return (
                <div
                  key={feature}
                  className="rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
                >
                  {feature}
                </div>
              );
            }

            if (isConflictDetectionFeature) {
              if (!isFacilityType && selectedType === 'EQUIPMENT') {
                return (
                  <div
                    key={feature}
                    className="rounded-2xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-900/10"
                  >
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">{feature}</p>
                    {equipmentPickupReturnPlans.length === 0 ? (
                      <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                        No pickup/return plan yet. Reserve equipment to generate slot planning.
                      </p>
                    ) : (
                      <div className="mt-2 space-y-1.5">
                        {equipmentPickupReturnPlans.slice(0, 4).map((booking) => (
                          <div
                            key={booking.id}
                            className="rounded-lg border border-amber-200 bg-white/80 px-2.5 py-1.5 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-slate-900/60 dark:text-amber-300"
                          >
                            <span className="font-semibold">{booking.resourceName}</span> | {booking.bookingDate} | Pickup{' '}
                            {String(booking.bookingTime || '').slice(0, 5)} | Return {booking.returnTimeLabel}
                          </div>
                        ))}
                      </div>
                    )}

                    {genericSlotConflictSummary && (
                      <div className="mt-2 flex items-start gap-2 text-xs font-medium text-red-700 dark:text-red-300">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{genericSlotConflictSummary}</span>
                      </div>
                    )}
                  </div>
                );
              }

              const conflictMessage = isFacilityType ? facilityConflictMessage : genericSlotConflictSummary;
              return (
                <div
                  key={feature}
                  className={`rounded-2xl border px-4 py-3 ${
                    conflictMessage
                      ? 'border-red-200 bg-red-50/70 dark:border-red-900/40 dark:bg-red-900/10'
                      : 'border-slate-200/80 bg-slate-50/70 dark:border-slate-700 dark:bg-slate-900/70'
                  }`}
                >
                  <p
                    className={`text-sm font-semibold ${
                      conflictMessage
                        ? 'text-red-800 dark:text-red-300'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {feature}
                  </p>
                  {conflictMessage ? (
                    <div className="mt-2 flex items-start gap-2 text-xs font-medium text-red-700 dark:text-red-300">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{conflictMessage}</span>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      No conflicts detected for your latest booking attempt.
                    </p>
                  )}
                </div>
              );
            }

            if (isReminderFeature) {
              if (!isFacilityType) {
                if (selectedType === 'EQUIPMENT') {
                  const totalUnits = equipmentUsageLogs.reduce(
                    (total, booking) => total + Number(booking.quantity || 0),
                    0
                  );
                  const totalHours = equipmentUsageLogs.reduce(
                    (total, booking) => total + Number(booking.durationHours || 0),
                    0
                  );

                  return (
                    <div
                      key={feature}
                      className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 px-4 py-3 dark:border-indigo-900/50 dark:bg-indigo-900/15"
                    >
                      <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">{feature}</p>
                      {equipmentUsageLogs.length === 0 ? (
                        <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                          No usage logs yet. Once equipment is booked, logs will appear here.
                        </p>
                      ) : (
                        <>
                          <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                            {equipmentUsageLogs.length} booking log(s) | {totalUnits} unit(s) reserved | {totalHours}{' '}
                            hour(s) planned
                          </p>
                          <div className="mt-2 space-y-1.5">
                            {equipmentUsageLogs.slice(0, 4).map((booking) => (
                              <div
                                key={booking.id}
                                className="rounded-lg border border-indigo-200 bg-white/80 px-2.5 py-1.5 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-slate-900/60 dark:text-indigo-300"
                              >
                                <span className="font-semibold">{booking.resourceName}</span> | {booking.bookingDate} |{' '}
                                {String(booking.bookingTime || '').slice(0, 5)} - {booking.returnTimeLabel} | Qty{' '}
                                {Number(booking.quantity || 0)} | {booking.statusLabel}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                }

                return (
                  <div
                    key={feature}
                    className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 px-4 py-3 dark:border-indigo-900/50 dark:bg-indigo-900/15"
                  >
                    <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">{feature}</p>
                    {nextGenericBooking ? (
                      <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                        Upcoming slot for <span className="font-semibold">{nextGenericBooking.resourceName}</span> is on{' '}
                        {nextGenericBooking.bookingDate} at {String(nextGenericBooking.bookingTime || '').slice(0, 5)}
                        {selectedType === 'EQUIPMENT' && nextGenericBooking.durationHours
                          ? ` for ${nextGenericBooking.durationHours} hour(s).`
                          : '.'}
                      </p>
                    ) : (
                      <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                        Add a booking to track your next confirmed resource slot here.
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={feature}
                  className="rounded-2xl border border-indigo-200/80 bg-indigo-50/70 px-4 py-3 dark:border-indigo-900/50 dark:bg-indigo-900/15"
                >
                  <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-200">{feature}</p>
                  {nextFacilityBooking ? (
                    <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                      Next email reminder for <span className="font-semibold">{nextFacilityBooking.lectureHallCode}</span> will be sent 10
                      minutes before {nextFacilityBooking.bookingDate} {String(nextFacilityBooking.bookingTime || '').slice(0, 5)}.
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-indigo-700 dark:text-indigo-300">
                      Book a slot and we will send a reminder email 10 minutes before the start time.
                    </p>
                  )}
                </div>
              );
            }

            if (!isFacilityType) {
              return (
                <div
                  key={feature}
                  className="rounded-2xl border border-cyan-200/90 bg-cyan-50/60 px-4 py-3 dark:border-cyan-900/50 dark:bg-cyan-900/10"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-200">{feature}</p>
                    <button
                      type="button"
                      onClick={() => openGenericBookingForm()}
                      className="rounded-full border border-cyan-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-800 dark:bg-slate-900 dark:text-cyan-300 dark:hover:bg-slate-800"
                    >
                      Book
                    </button>
                  </div>

                  {selectedGenericBookings.length === 0 ? (
                    <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-300">
                      No active slot yet. {filteredAvailableGenericResources.length > 0 ? `${filteredAvailableGenericResources.length} resources ready for booking.` : 'Resources will appear here.'}
                    </p>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      {selectedGenericBookings.map((booking) => {
                        const approval = getBookingApprovalMeta(booking.status);
                        return (
                          <div
                            key={booking.id}
                            className="rounded-xl border border-cyan-200 bg-white/80 px-2.5 py-2 text-xs text-cyan-800 dark:border-cyan-900/50 dark:bg-slate-900/70 dark:text-cyan-300"
                          >
                            <span
                              className={`mb-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${approval.className}`}
                            >
                              {approval.label}
                            </span>
                            <div className="flex items-start justify-between gap-2">
                              <p className="pr-2">
                                <span className="font-semibold">{booking.resourceName}</span> | {booking.bookingDate}{' '}
                                {String(booking.bookingTime || '').slice(0, 5)}
                                {selectedType === 'EQUIPMENT' && booking.durationHours
                                  ? ` | ${booking.durationHours} hour(s)`
                                  : ''}
                                {selectedType === 'EQUIPMENT' && booking.durationHours
                                  ? ` | Return ${getReturnSlotLabel(booking.bookingTime, booking.durationHours)}`
                                  : ''}
                                {selectedType === 'EQUIPMENT'
                                  ? ` | Qty ${Number(booking.quantity || 0)}`
                                  : ''}
                              </p>
                              <div className="flex shrink-0 gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditGenericBookingForm(booking)}
                                  className="rounded-md border border-cyan-300 p-1 text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-slate-800"
                                  aria-label="Update booking"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGenericBooking(booking.id)}
                                  disabled={deletingGenericBookingId === booking.id}
                                  className="rounded-md border border-red-300 p-1 text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                                  aria-label="Delete booking"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={feature}
                className="rounded-2xl border border-cyan-200/90 bg-cyan-50/60 px-4 py-3 dark:border-cyan-900/50 dark:bg-cyan-900/10"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-200">{feature}</p>
                  <button
                    type="button"
                    onClick={() => openNewFacilityBookingForm()}
                    className="rounded-full border border-cyan-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-800 dark:bg-slate-900 dark:text-cyan-300 dark:hover:bg-slate-800"
                  >
                    Book
                  </button>
                </div>

                {loadingFacilityMeta ? (
                  <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-300">Loading availability...</p>
                ) : myFacilityBookings.length === 0 && suggestedAvailableSlots.length > 0 ? (
                  <div className="mt-2 space-y-1.5">
                    {suggestedAvailableSlots.map((hall) => (
                      <div
                        key={hall.code}
                        className="rounded-xl border border-cyan-200 bg-white/80 px-2.5 py-1.5 text-xs text-cyan-800 dark:border-cyan-900/50 dark:bg-slate-900/70 dark:text-cyan-300"
                      >
                        <span className="font-semibold">{hall.code}</span> | {hall.displayName}
                      </div>
                    ))}
                  </div>
                ) : myFacilityBookings.length === 0 ? (
                  <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-300">
                    No active slot yet. Submit the facility form to see availability here.
                  </p>
                ) : (
                  <div className="mt-2 space-y-1.5">
                    {myFacilityBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="rounded-xl border border-cyan-200 bg-white/80 px-2.5 py-2 text-xs text-cyan-800 dark:border-cyan-900/50 dark:bg-slate-900/70 dark:text-cyan-300"
                      >
                        {(() => {
                          const approval = getBookingApprovalMeta(booking.status);
                          return (
                            <span
                              className={`mb-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${approval.className}`}
                            >
                              {approval.label}
                            </span>
                          );
                        })()}
                        <div className="flex items-start justify-between gap-2">
                          <p className="pr-2">
                            <span className="font-semibold">{booking.lectureHallCode}</span> | {booking.bookingDate}{' '}
                            {String(booking.bookingTime || '').slice(0, 5)} | {Number(booking.durationHours || 1)} hour(s)
                          </p>
                          <div className="flex shrink-0 gap-1">
                            <button
                              type="button"
                              onClick={() => openEditFacilityBookingForm(booking)}
                              className="rounded-md border border-cyan-300 p-1 text-cyan-700 transition hover:bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:hover:bg-slate-800"
                              aria-label="Update booking"
                            >
                              <Pencil className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteFacilityBooking(booking.id)}
                              disabled={deletingFacilityBookingId === booking.id}
                              className="rounded-md border border-red-300 p-1 text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                              aria-label="Delete booking"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {showFacilityForm && selectedType === 'FACILITY' && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeFacilityForm}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-cyan-50 to-blue-50 px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  Facility
                </p>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {editingFacilityBookingId ? 'Update Booking Slot' : 'Quick Booking Form'}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeFacilityForm}
                className="rounded-full border border-slate-300 p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {user?.role !== 'USER' ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
                  Facility booking is available for student accounts.
                </div>
              ) : (
                <form onSubmit={handleFacilitySubmit} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Student Name
                      </span>
                      <input
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Student Email
                      </span>
                      <input
                        type="text"
                        value={user?.email || ''}
                        readOnly
                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Date
                      </span>
                      <input
                        type="date"
                        value={facilityForm.bookingDate}
                        min={getTodayIsoDate()}
                        onChange={(event) => {
                          const selectedDate = event.target.value;
                          const todayIso = getTodayIsoDate();
                          if (selectedDate && selectedDate < todayIso) {
                            setError('Please select today or a future date.');
                            updateFacilityField('bookingDate', todayIso);
                            return;
                          }
                          setError('');
                          updateFacilityField('bookingDate', selectedDate);
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Time
                      </span>
                      <input
                        type="time"
                        value={facilityForm.bookingTime}
                        onChange={(event) => updateFacilityField('bookingTime', event.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Duration (hours)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={facilityForm.durationHours}
                        onChange={(event) => {
                          const parsed = parseInt(event.target.value || '1', 10);
                          const safeValue = Number.isFinite(parsed) ? parsed : 1;
                          updateFacilityField('durationHours', Math.max(1, Math.min(12, safeValue)));
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Student Count (max 60)
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={facilityForm.studentCount}
                        onChange={(event) => {
                          const parsed = parseInt(event.target.value || '1', 10);
                          const safeValue = Number.isFinite(parsed) ? parsed : 1;
                          updateFacilityField('studentCount', Math.max(1, Math.min(60, safeValue)));
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Faculty
                      </span>
                      <select
                        value={facilityForm.faculty}
                        onChange={(event) => updateFacilityField('faculty', event.target.value)}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      >
                        {FACULTY_OPTIONS.map((faculty) => (
                          <option key={faculty} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Facility Space
                    </span>
                    <select
                      value={facilityForm.lectureHallCode}
                      onChange={(event) => updateFacilityField('lectureHallCode', event.target.value)}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      required
                      disabled={loadingFacilityMeta}
                    >
                      {lectureHalls.map((hall) => (
                        <option key={hall.code} value={hall.code}>
                          {hall.displayName}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Button
                    type="submit"
                    isLoading={submittingFacilityBooking}
                    disabled={loadingFacilityMeta || !facilityForm.lectureHallCode}
                    className="h-10 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    {editingFacilityBookingId ? 'Update Slot' : 'Check & Reserve Slot'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {showGenericForm && !isFacilityType && genericTypeConfig && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onClick={closeGenericForm}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-cyan-50 to-blue-50 px-5 py-4 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {selectedType}
                </p>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {editingGenericBookingId ? 'Update Booking Slot' : genericTypeConfig.bookingLabel}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeGenericForm}
                className="rounded-full border border-slate-300 p-1.5 text-slate-500 transition hover:bg-white hover:text-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {user?.role !== 'USER' ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-300">
                  Booking is available for student accounts.
                </div>
              ) : (
                <form onSubmit={handleGenericSubmit} className="space-y-3">
                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Resource
                    </span>
                    <select
                      value={genericForm.resourceId}
                      onChange={(event) => setGenericForm((current) => ({ ...current, resourceId: event.target.value }))}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      required
                    >
                      {selectableGenericResources.map((resource) => (
                        <option key={resource.id} value={resource.id}>
                          {resource.name}
                          {resource.subtitle ? ` - ${resource.subtitle}` : ''}
                          {selectedType === 'EQUIPMENT' ? ` (Available: ${resource.availableUnits})` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Date
                      </span>
                      <input
                        type="date"
                        value={genericForm.bookingDate}
                        min={getTodayIsoDate()}
                        onChange={(event) => setGenericForm((current) => ({ ...current, bookingDate: event.target.value }))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        Time
                      </span>
                      <input
                        type="time"
                        value={genericForm.bookingTime}
                        onChange={(event) => setGenericForm((current) => ({ ...current, bookingTime: event.target.value }))}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                  </div>

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {genericTypeConfig.quantityLabel}
                    </span>
                    <input
                      type="number"
                      min={genericTypeConfig.quantityMin}
                      max={genericTypeConfig.quantityMax}
                      value={genericForm.quantity}
                      onChange={(event) => {
                        const parsed = parseInt(event.target.value || '1', 10);
                        const safeValue = Number.isFinite(parsed) ? parsed : genericTypeConfig.quantityMin;
                        setGenericForm((current) => ({
                          ...current,
                          quantity: Math.max(
                            genericTypeConfig.quantityMin,
                            Math.min(genericTypeConfig.quantityMax, safeValue)
                          )
                        }));
                      }}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      required
                    />
                  </label>

                  {genericTypeConfig.supportsDurationHours && (
                    <label className="block">
                      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                        {genericTypeConfig.durationLabel || 'Required Hours'}
                      </span>
                      <input
                        type="number"
                        min={genericTypeConfig.durationMin || 1}
                        max={genericTypeConfig.durationMax || 12}
                        value={genericForm.durationHours}
                        onChange={(event) => {
                          const parsed = parseInt(event.target.value || '1', 10);
                          const safeValue = Number.isFinite(parsed) ? parsed : genericTypeConfig.durationMin || 1;
                          setGenericForm((current) => ({
                            ...current,
                            durationHours: Math.max(
                              genericTypeConfig.durationMin || 1,
                              Math.min(genericTypeConfig.durationMax || 12, safeValue)
                            )
                          }));
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        required
                      />
                    </label>
                  )}

                  {selectedType === 'EQUIPMENT' && equipmentReturnPreviewLabel && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-amber-300">
                      Pickup {String(genericForm.bookingTime || '').slice(0, 5)} | Return {equipmentReturnPreviewLabel}
                    </div>
                  )}

                  <label className="block">
                    <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                      {genericTypeConfig.purposeLabel}
                    </span>
                    <textarea
                      value={genericForm.purpose}
                      onChange={(event) => setGenericForm((current) => ({ ...current, purpose: event.target.value }))}
                      rows={3}
                      placeholder={genericTypeConfig.purposePlaceholder}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                      required
                    />
                  </label>

                  <Button
                    type="submit"
                    isLoading={submittingGenericBooking}
                    disabled={!genericForm.resourceId || selectableGenericResources.length === 0}
                    className="h-10 w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                    leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  >
                    {editingGenericBookingId ? 'Update Slot' : 'Check & Reserve Slot'}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            {activeResourceType?.title || 'Resource'} Catalog
          </h3>
          {selectedType === 'FACILITY' ? (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Date
                <input
                  type="date"
                  value={facilityCatalogDate}
                  min={getTodayIsoDate()}
                  onChange={(event) => setFacilityCatalogDate(event.target.value || getTodayIsoDate())}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Building
                <select
                  value={facilityBuildingFilter}
                  onChange={(event) => setFacilityBuildingFilter(event.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All Buildings</option>
                  {facilityBuildingOptions.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Type
                <select
                  value={facilityTypeFilter}
                  onChange={(event) => setFacilityTypeFilter(event.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All</option>
                  <option value="LECTURE_HALL">Lecture Hall</option>
                  <option value="LAB">Lab</option>
                </select>
              </label>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Date
                <input
                  type="date"
                  value={genericCatalogDate}
                  min={getTodayIsoDate()}
                  onChange={(event) => setGenericCatalogDate(event.target.value || getTodayIsoDate())}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Time
                <input
                  type="time"
                  value={genericCatalogTime}
                  onChange={(event) => setGenericCatalogTime(event.target.value || getCurrentTimeIso())}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Duration
                <input
                  type="number"
                  min={genericTypeConfig?.durationMin || 1}
                  max={genericTypeConfig?.durationMax || 12}
                  value={genericCatalogDurationHours}
                  onChange={(event) => {
                    const parsed = parseInt(event.target.value || '1', 10);
                    const safeValue = Number.isFinite(parsed) ? parsed : genericTypeConfig?.durationMin || 1;
                    setGenericCatalogDurationHours(
                      Math.max(
                        genericTypeConfig?.durationMin || 1,
                        Math.min(genericTypeConfig?.durationMax || 12, safeValue)
                      )
                    );
                  }}
                  className="h-9 w-20 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Building
                <select
                  value={genericBuildingFilter}
                  onChange={(event) => setGenericBuildingFilter(event.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All Buildings</option>
                  {genericBuildingOptions.map((building) => (
                    <option key={building} value={building}>
                      {building}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Type
                <select
                  value={genericTypeFilter}
                  onChange={(event) => setGenericTypeFilter(event.target.value)}
                  className="h-9 rounded-xl border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="ALL">All</option>
                  {genericResourceTypeOptions.map((resourceTypeValue) => (
                    <option key={resourceTypeValue} value={resourceTypeValue}>
                      {formatResourceKindLabel(resourceTypeValue)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {selectedType === 'FACILITY' ? (
          loadingFacilityMeta ? (
            <Card className="border border-slate-200/70 dark:border-slate-800">
              <CardContent className="flex items-center justify-center py-10 text-slate-500 dark:text-slate-300">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading facility catalog...
              </CardContent>
            </Card>
          ) : filteredFacilitySpaces.length === 0 ? (
            <Card className="border border-slate-200/70 dark:border-slate-800">
              <CardContent className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">
                No matching facility spaces for {facilityCatalogDate}. Try another date or filter.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {filteredFacilitySpaces.map((space) => {
                const typeLabel =
                  classifyFacilitySpaceType(space.spaceType, space.name, space.displayName) === 'LAB'
                    ? 'Lab'
                    : 'Lecture Hall';
                return (
                  <Card
                    key={space.code}
                    className="overflow-hidden border border-slate-200/80 bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{space.name}</h4>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            {space.building} | Block {space.block} | Floor {space.floor}
                          </p>
                        </div>
                        <span
                          className="rounded-full bg-cyan-100 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300"
                        >
                          {typeLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin className="h-4 w-4" />
                        {space.displayName}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                          Capacity: {space.capacity || 60}
                        </div>
                        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                          Status: Available
                        </div>
                      </div>

                      {space.bookedSlots && space.bookedSlots.length > 0 ? (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Booked Slots</p>
                          <div className="flex flex-wrap gap-1.5">
                            {space.bookedSlots.map((slot, idx) => {
                              const formatTime = (t) => t ? String(t).slice(0, 5) : '';
                              return (
                                <span key={idx} className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[10px] font-medium text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                          All slots available
                        </div>
                      )}

                      <Button
                        size="sm"
                        onClick={() => openNewFacilityBookingForm(space.code)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                        rightIcon={<ArrowUpRight className="h-4 w-4" />}
                      >
                        Book This Space
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )
        ) : loadingResources ? (
          <Card className="border border-slate-200/70 dark:border-slate-800">
            <CardContent className="flex items-center justify-center py-10 text-slate-500 dark:text-slate-300">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading resources...
            </CardContent>
          </Card>
        ) : filteredAvailableGenericResources.length === 0 ? (
          <Card className="border border-slate-200/70 dark:border-slate-800">
            <CardContent className="py-10 text-center text-sm text-slate-500 dark:text-slate-300">
              {resolvedResources.length === 0
                ? 'No resources available for this category yet.'
                : filteredResolvedGenericResources.length === 0
                  ? 'No resources match the selected building/type filters.'
                  : `All resources are reserved for ${genericCatalogDate} at ${String(genericCatalogTime || '').slice(0, 5)}. Check another slot.`}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredAvailableGenericResources.map((resource) => {
              const utilization = resource.totalUnits > 0
                ? Math.min(100, Math.round((resource.availableUnits / resource.totalUnits) * 100))
                : 0;

              return (
                <Card
                  key={resource.id}
                  className="overflow-hidden border border-slate-200/80 bg-white/90 transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">{resource.name}</h4>
                        {resource.subtitle && (
                          <p className="text-sm text-slate-600 dark:text-slate-300">{resource.subtitle}</p>
                        )}
                      </div>
                      {resource.approvalRequired && (
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                          Approval
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <MapPin className="h-4 w-4" />
                      {resource.location}
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <span>Availability</span>
                        <span>
                          {resource.availableUnits}/{resource.totalUnits}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                          style={{ width: `${utilization}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                        Capacity: {resource.capacity}
                      </div>
                      <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                        Window: {resource.bookingWindow}
                      </div>
                    </div>

                    {resource.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-900/20 dark:text-cyan-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {resource.highlights?.length > 0 && (
                      <div className="space-y-1">
                        {resource.highlights.slice(0, 2).map((note) => (
                          <div
                            key={note}
                            className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            {note}
                          </div>
                        ))}
                      </div>
                    )}

                    {genericTypeConfig && (
                      <Button
                        size="sm"
                        onClick={() => openGenericBookingForm(resource.id)}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700"
                        rightIcon={<ArrowUpRight className="h-4 w-4" />}
                      >
                        Book This Resource
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
