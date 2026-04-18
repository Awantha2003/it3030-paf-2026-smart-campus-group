import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  SparklesIcon,
  UploadCloudIcon,
  UserIcon
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { createIssueReport, uploadFile } from '../../api/issues';
import { SERVER_BASE_URL } from '../../api/baseUrl';
import { GoogleMap } from '@react-google-maps/api';
import { CAMPUS_LANDMARKS, findCampusLandmarkById } from '../../data/campusMapData';
import { buildRichLocationLabel, findNearestCoordinate, formatCoordinates } from '../../utils/location';
import { CAMPUS_GOOGLE_MAP_ID, useCampusGoogleMaps } from '../../hooks/useCampusGoogleMaps';
import { CampusMarker } from '../../components/maps/CampusMarker';
import { studentRoutes } from '../../utils/routes';

const DEFAULT_MAP_CENTER = { lat: 6.9147, lng: 79.9733 };
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000
};
const FACULTIES = ['Computing', 'Engineering', 'Business', 'Architecture', 'Humanities', 'Other'];
const REQUEST_TYPES = ['Technical Support', 'Facilities Issue', 'Network Problem', 'Account Help', 'Other'];
const DEPARTMENTS = ['Student Services', 'IT Helpdesk', 'Maintenance', 'Academic Affairs', 'Security'];

function formatGpsLocation(lat, lng) {
  return `Current GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function getGeolocationErrorMessage(error) {
  if (error?.code === 1) {
    return 'Location access was blocked. Allow browser permission or enter the building and room manually.';
  }

  if (error?.code === 2) {
    return 'Current location could not be detected. Check your GPS or network signal and try again.';
  }

  if (error?.code === 3) {
    return 'Location detection timed out. Move to an open area or enter the location manually.';
  }

  return 'Current location could not be detected automatically. Enter the location manually.';
}

function FieldLabel({ children, required }) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children} {required && <span className="text-rose-500">*</span>}
    </label>
  );
}

function InputShell({ icon, children }) {
  return (
    <div className="group relative">
      <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-600">
        {icon}
      </div>
      {children}
    </div>
  );
}

export function NewTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [registrationNumber, setRegistrationNumber] = useState('');
  const [faculty, setFaculty] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [requestType, setRequestType] = useState('');
  const [requestSubType, setRequestSubType] = useState('');
  const [department, setDepartment] = useState('Student Services');

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('LOW');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  const [isAutoTracking, setIsAutoTracking] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(
    'Automatic location tracking starts when the page opens.'
  );
  const [selectedLandmarkId, setSelectedLandmarkId] = useState('');

  const watchIdRef = useRef(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [markerPos, setMarkerPos] = useState(null);

  const { isLoaded } = useCampusGoogleMaps();
  const nearestLandmark = markerPos
    ? findNearestCoordinate(markerPos, CAMPUS_LANDMARKS, (landmark) => landmark.position)
    : null;
  const selectedLandmark = findCampusLandmarkById(selectedLandmarkId);

  useEffect(() => {
    if (!isAutoTracking) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setIsAutoTracking(false);
      setLocationStatus('This browser does not support GPS access. Enter the location manually.');
      return undefined;
    }

    setIsLocating(true);
    setLocationStatus("Allow location access to track the student's current position automatically.");

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const nextPosition = { lat: coords.latitude, lng: coords.longitude };
        setMarkerPos(nextPosition);
        setMapCenter(nextPosition);
        setLocation(formatGpsLocation(coords.latitude, coords.longitude));
        setSelectedLandmarkId('');
        setLocationStatus('Current location is being tracked automatically.');
        setIsLocating(false);
      },
      (error) => {
        setIsAutoTracking(false);
        setIsLocating(false);
        setLocationStatus(getGeolocationErrorMessage(error));
      },
      GEOLOCATION_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isAutoTracking]);

  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setIsAutoTracking(false);
    setMarkerPos({ lat, lng });
    setMapCenter({ lat, lng });
    setSelectedLandmarkId('');
    setLocation(buildRichLocationLabel({ coordinates: { lat, lng }, label: 'Pinned location' }));
    setLocationStatus('Automatic tracking paused. The selected map pin will be submitted.');
  };

  const handleMarkerDragEnd = (e) => {
    const latLng = e?.latLng || e?.detail?.latLng;
    if (!latLng) {
      return;
    }

    const lat = typeof latLng.lat === 'function' ? latLng.lat() : latLng.lat;
    const lng = typeof latLng.lng === 'function' ? latLng.lng() : latLng.lng;
    const draggedCoordinates = { lat, lng };
    const nearestToDraggedPoint = findNearestCoordinate(
      draggedCoordinates,
      CAMPUS_LANDMARKS,
      (landmark) => landmark.position
    );

    setIsAutoTracking(false);
    setMarkerPos(draggedCoordinates);
    setMapCenter(draggedCoordinates);
    setSelectedLandmarkId('');
    setLocation(
      buildRichLocationLabel({
        label: 'Adjusted pin',
        coordinates: draggedCoordinates,
        extraDetails: nearestToDraggedPoint?.candidate?.name
          ? `Near ${nearestToDraggedPoint.candidate.name}`
          : ''
      })
    );
    setLocationStatus('Map pin adjusted manually for more precise dispatch.');
  };

  const handleLocationChange = (e) => {
    if (isAutoTracking) {
      setIsAutoTracking(false);
      setLocationStatus('Automatic tracking paused while you edit the location manually.');
    }
    setSelectedLandmarkId('');
    setLocation(e.target.value);
  };

  const handleEnableAutoTracking = () => {
    setIsAutoTracking(true);
    setSelectedLandmarkId('');
    setLocationStatus("Reconnecting to the student's current location...");
  };

  const handleLandmarkSelect = (landmarkId) => {
    const landmark = findCampusLandmarkById(landmarkId);
    if (!landmark) {
      return;
    }

    setIsAutoTracking(false);
    setSelectedLandmarkId(landmark.id);
    setMarkerPos(landmark.position);
    setMapCenter(landmark.position);
    setLocation(
      buildRichLocationLabel({
        label: landmark.name,
        extraDetails: landmark.description,
        coordinates: landmark.position
      })
    );
    setLocationStatus('Campus landmark selected. Technicians can use this as a reliable dispatch point.');
  };

  const isValid =
    title.trim() &&
    location.trim() &&
    description.trim() &&
    registrationNumber.trim() &&
    faculty &&
    contactNumber.trim() &&
    requestType &&
    department;

  const missingRequiredFields = [
    !registrationNumber.trim() ? 'Registration Number' : null,
    !faculty ? 'Faculty / School' : null,
    !contactNumber.trim() ? 'Contact Number' : null,
    !requestType ? 'Request / Inquiry Type' : null,
    !title.trim() ? 'Subject' : null,
    !location.trim() ? 'Location' : null,
    !description.trim() ? 'Ticket Description' : null
  ].filter(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user?.id || !user?.name || !user?.email) {
      setErrorMessage('Your student account details are still loading. Refresh the page and try again.');
      return;
    }

    if (!isValid) {
      setErrorMessage(`Complete the required fields before submitting: ${missingRequiredFields.join(', ')}.`);
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const attachmentUrls = [];
      if (selectedFile) {
        const uploadRes = await uploadFile(selectedFile);
        if (uploadRes?.url) {
          const normalizedUrl =
            /^https?:\/\//i.test(uploadRes.url) ? uploadRes.url : `${SERVER_BASE_URL}${uploadRes.url}`;
          attachmentUrls.push(normalizedUrl);
        }
      }

      await createIssueReport({
        title,
        description,
        category: category || requestType || 'Other',
        location,
        priority,
        studentId: user?.id || '',
        studentName: user?.name || '',
        studentEmail: user?.email || '',
        registrationNumber,
        faculty,
        contactNumber,
        requestType,
        requestSubType,
        department,
        attachmentUrls
      });

      setShowSuccess(true);
      setIsSubmitting(false);
      setTimeout(() => navigate(studentRoutes.tickets), 1500);
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message || 'Failed to submit ticket.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-slate-50 to-sky-50 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="border-b border-slate-200/60 p-6 md:p-8 lg:border-b-0 lg:border-r"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mt-0.5 px-2">
                  <ArrowLeftIcon className="h-5 w-5" />
                </Button>
                <div>
                  <p className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                    <SparklesIcon className="mr-1.5 h-3.5 w-3.5" />
                    Smart Support Desk
                  </p>
                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Create Ticket</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill this request form and our campus team will respond quickly.
                  </p>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700"
                >
                  <CheckCircle2Icon className="h-5 w-5" />
                  <span className="text-sm font-semibold">Ticket submitted successfully! Redirecting...</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
                >
                  {errorMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel required>Name</FieldLabel>
                  <InputShell icon={<UserIcon className="h-4 w-4" />}>
                    <input
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-slate-700"
                    />
                  </InputShell>
                </div>

                <div>
                  <FieldLabel required>Email</FieldLabel>
                  <InputShell icon={<MailIcon className="h-4 w-4" />}>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-slate-700"
                    />
                  </InputShell>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel required>Registration Number</FieldLabel>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="IT23xxxxx"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    required
                  />
                </div>
                <div>
                  <FieldLabel required>Faculty / School</FieldLabel>
                  <select
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    required
                  >
                    <option value="">Select faculty</option>
                    {FACULTIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel required>Contact Number</FieldLabel>
                  <InputShell icon={<PhoneIcon className="h-4 w-4" />}>
                    <input
                      type="tel"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="+94 77 123 4567"
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                      required
                    />
                  </InputShell>
                </div>
                <div>
                  <FieldLabel required>Department</FieldLabel>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    required
                  >
                    {DEPARTMENTS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel required>Request / Inquiry Type</FieldLabel>
                  <select
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    required
                  >
                    <option value="">Select request type</option>
                    {REQUEST_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <FieldLabel>Sub Type</FieldLabel>
                  <input
                    type="text"
                    value={requestSubType}
                    onChange={(e) => setRequestSubType(e.target.value)}
                    placeholder="Other / specific service"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FieldLabel required>Subject</FieldLabel>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Short summary of the issue"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    required
                  />
                </div>
              </div>

              <div>
                <FieldLabel required>Location</FieldLabel>
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant={isAutoTracking ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={handleEnableAutoTracking}
                    isLoading={isLocating}
                    className="rounded-full"
                  >
                    {isAutoTracking ? 'Tracking Current Location' : 'Use Current Location'}
                  </Button>
                  <span className="text-xs text-slate-500">{locationStatus}</span>
                </div>
                <InputShell icon={<MapPinIcon className="h-4 w-4" />}>
                  <input
                    type="text"
                    value={location}
                    onChange={handleLocationChange}
                    placeholder="Building, floor, room or outdoor landmark"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    required
                  />
                </InputShell>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel>Issue Category</FieldLabel>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="">Use request type as category</option>
                    <option value="Hardware">Hardware / IT</option>
                    <option value="Facilities">Facilities / Maintenance</option>
                    <option value="Network">Network</option>
                    <option value="Software">Software</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <FieldLabel>Urgency Level</FieldLabel>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="LOW">Low - Not urgent</option>
                    <option value="MEDIUM">Medium - Needs attention soon</option>
                    <option value="HIGH">High - Impacting work/classes</option>
                    <option value="CRITICAL">Critical - Immediate hazard/blocker</option>
                  </select>
                </div>
              </div>

              <div>
                <FieldLabel required>Ticket Description</FieldLabel>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, when it started, and any actions already taken."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                  required
                />
              </div>

              <div>
                <FieldLabel>Attachment (Optional)</FieldLabel>
                <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-sky-50 p-6 text-center transition hover:border-sky-400 hover:bg-sky-50/70">
                  <input
                    type="file"
                    accept="image/png"
                    className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files?.length) {
                        const file = files[0];
                        if (file.type !== 'image/png') {
                          setSelectedFile(null);
                          if (filePreview) {
                            URL.revokeObjectURL(filePreview);
                            setFilePreview('');
                          }
                          setErrorMessage('Only PNG attachments are supported.');
                          e.target.value = '';
                          return;
                        }

                        setErrorMessage('');
                        setSelectedFile(file);
                        if (filePreview) {
                          URL.revokeObjectURL(filePreview);
                        }
                        setFilePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {!filePreview ? (
                    <>
                      <UploadCloudIcon className="mx-auto mb-2 h-10 w-10 text-sky-600" />
                      <p className="text-sm font-semibold text-slate-700">Drop image here or click to upload</p>
                      <p className="mt-1 text-xs text-slate-500">PNG only</p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <img src={filePreview} alt="Preview" className="mb-2 max-h-32 rounded-xl object-contain" />
                      <p className="max-w-[220px] truncate text-sm font-semibold text-sky-700">{selectedFile?.name}</p>
                      <p className="mt-1 text-xs text-slate-500">Click to replace attachment</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-4">
                {missingRequiredFields.length > 0 && (
                  <p className="w-full text-sm font-medium text-amber-700">
                    Submit stays locked until these are filled: {missingRequiredFields.join(', ')}.
                  </p>
                )}
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white hover:from-sky-700 hover:to-cyan-700"
                >
                  Submit Ticket
                </Button>
              </div>
            </form>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.08 }}
            className="p-6 md:p-8"
          >
            <div className="mb-4 rounded-2xl border border-sky-100 bg-white/80 p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Live Location Pin</h3>
              <p className="mt-1 text-sm text-slate-500">
                Tap the map to pin exact location or drag marker for precision dispatch.
              </p>
            </div>

            <div className="h-72 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-inner md:h-[22rem]">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '100%' }}
                  center={mapCenter}
                  zoom={17}
                  onClick={handleMapClick}
                  options={{
                    mapId: CAMPUS_GOOGLE_MAP_ID,
                    streetViewControl: false,
                    fullscreenControl: false,
                    mapTypeControl: false
                  }}
                >
                  {markerPos && (
                    <CampusMarker
                      position={markerPos}
                      draggable
                      glyph="!"
                      background="#0284c7"
                      onDragEnd={handleMarkerDragEnd}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-slate-500">
                  <div className="mb-2 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-sky-500" />
                  <span className="text-sm font-semibold">Loading Campus Map...</span>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Landmarks</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CAMPUS_LANDMARKS.map((landmark) => (
                  <button
                    key={landmark.id}
                    type="button"
                    onClick={() => handleLandmarkSelect(landmark.id)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      selectedLandmarkId === landmark.id
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {landmark.name}
                  </button>
                ))}
              </div>

              {(markerPos || nearestLandmark || selectedLandmark) && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedLandmark?.name || nearestLandmark?.candidate?.name || 'Pinned campus location'}
                  </p>
                  {markerPos && (
                    <p className="mt-1 text-xs text-slate-500">GPS {formatCoordinates(markerPos)}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {selectedLandmark?.description ||
                      nearestLandmark?.candidate?.description ||
                      'Manual pin helps technicians locate the issue faster than a text-only address.'}
                  </p>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
