import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, UploadCloudIcon, CheckCircle2Icon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { createIssueReport, uploadFile } from '../../api/issues';
import { GoogleMap } from '@react-google-maps/api';
import { CAMPUS_LANDMARKS, findCampusLandmarkById } from '../../data/campusMapData';
import { buildRichLocationLabel, findNearestCoordinate, formatCoordinates } from '../../utils/location';
import { CAMPUS_GOOGLE_MAP_ID, useCampusGoogleMaps } from '../../hooks/useCampusGoogleMaps';
import { CampusMarker } from '../../components/maps/CampusMarker';

const DEFAULT_MAP_CENTER = { lat: 6.9147, lng: 79.9733 };
const GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 30000
};

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

export function NewTicketPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  // Setup Google Maps for SLIIT Malabe or generic Campus
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
        const nextPosition = {
          lat: coords.latitude,
          lng: coords.longitude
        };

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

  const isValid = title && location && category && description;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      let attachmentUrls = [];
      if (selectedFile) {
        const uploadRes = await uploadFile(selectedFile);
        if (uploadRes && uploadRes.url) {
          attachmentUrls.push(`http://localhost:8080${uploadRes.url}`);
        }
      }

      await createIssueReport({
        title,
        description,
        category,
        location,
        priority,
        studentId: user?.id || '',
        studentName: user?.name || '',
        studentEmail: user?.email || '',
        attachmentUrls
      });

      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/Student/tickets');
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message || 'Failed to submit ticket.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="px-2">
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Report an Issue</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Submit a maintenance or support ticket
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3 text-green-800 dark:text-green-400"
          >
            <CheckCircle2Icon className="w-5 h-5" />
            <span className="font-medium">Ticket submitted successfully! Redirecting...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-800 dark:text-red-400"
          >
            <span className="font-medium">{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Issue Details</h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief summary of the issue"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Incident Location <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant={isAutoTracking ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={handleEnableAutoTracking}
                        isLoading={isLocating}
                      >
                        {isAutoTracking ? 'Tracking Current Location' : 'Use Current Location'}
                      </Button>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {locationStatus}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={location}
                      onChange={handleLocationChange}
                      placeholder="Location is tracked automatically, or type Building / Room"
                      className="w-full px-4 py-2.5 mb-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 dark:text-white"
                      required
                    />
                    <div className="mb-3 flex flex-wrap gap-2">
                      {CAMPUS_LANDMARKS.slice(0, 6).map((landmark) => (
                        <button
                          key={landmark.id}
                          type="button"
                          onClick={() => handleLandmarkSelect(landmark.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            selectedLandmarkId === landmark.id
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                          }`}
                        >
                          {landmark.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      The student location starts from live GPS. You can still type a room number, use a campus landmark, or drag the map pin to improve dispatch accuracy.
                    </p>
                    {(markerPos || nearestLandmark || selectedLandmark) && (
                      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Dispatch Summary
                        </p>
                        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                          {selectedLandmark?.name || nearestLandmark?.candidate?.name || 'Pinned campus location'}
                        </p>
                        {markerPos && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            GPS {formatCoordinates(markerPos)}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {selectedLandmark?.description ||
                            nearestLandmark?.candidate?.description ||
                            'Manual pin helps technicians locate the issue faster than a text-only address.'}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="h-64 rounded-xl overflow-hidden shadow-inner border-2 border-slate-200 dark:border-slate-700">
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
                            background="#2563eb"
                            onDragEnd={handleMarkerDragEnd}
                          />
                        )}
                      </GoogleMap>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500">
                        <div className="h-8 w-8 border-4 border-slate-300 border-t-brand-purple rounded-full animate-spin mb-2" />
                        <span className="text-sm font-semibold">Loading Campus Map...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Urgency Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="LOW">Low - Not urgent</option>
                  <option value="MEDIUM">Medium - Needs attention soon</option>
                  <option value="HIGH">High - Impacting work/classes</option>
                  <option value="CRITICAL">Critical - Immediate hazard/blocker</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 dark:text-white"
                  required
                >
                  <option value="">Select category...</option>
                  <option value="Hardware">Hardware / IT</option>
                  <option value="Facilities">Facilities / Maintenance</option>
                  <option value="Supplies">Supplies</option>
                  <option value="Software">Software</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide detailed information about the issue..."
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-slate-900 dark:text-white resize-none"
                required
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Evidence / Photos (Optional)
              </label>
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/gif, image/svg+xml" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const file = files[0];
                      setSelectedFile(file);
                      setFilePreview(URL.createObjectURL(file));
                    }
                  }}
                />
                {!filePreview ? (
                  <>
                    <UploadCloudIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      SVG, PNG, JPG or GIF (max. 5MB)
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center relative z-0">
                    <img src={filePreview} alt="Preview" className="max-h-32 mb-2 rounded-md object-contain" />
                    <p className="text-sm font-medium text-brand-purple truncate max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">Click or drag to replace</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
              Submit Ticket
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
