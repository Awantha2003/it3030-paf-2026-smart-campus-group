import { useEffect, useRef, useState } from 'react';
import { updateTechnicianLocation } from '../api/technicians';

const TRACKING_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 15000
};

function formatLocation(latitude, longitude) {
  return `Technician GPS: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function useTechnicianLiveTracking(technicianId, enabled) {
  const [currentCoordinates, setCurrentCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const [trackingUpdatedAt, setTrackingUpdatedAt] = useState(null);
  const watchIdRef = useRef(null);
  const lastSentAtRef = useRef(0);

  useEffect(() => {
    if (!enabled || !technicianId) {
      return undefined;
    }

    if (!navigator.geolocation) {
      setLocationStatus('This browser does not support technician GPS tracking.');
      return undefined;
    }

    setLocationStatus('Sharing technician live location with the system.');

    watchIdRef.current = navigator.geolocation.watchPosition(
      async ({ coords }) => {
        const nextCoordinates = {
          lat: coords.latitude,
          lng: coords.longitude
        };

        setCurrentCoordinates(nextCoordinates);
        setTrackingUpdatedAt(new Date().toISOString());

        const now = Date.now();
        if (now - lastSentAtRef.current < 12000) {
          return;
        }

        lastSentAtRef.current = now;

        try {
          await updateTechnicianLocation(technicianId, {
            latitude: coords.latitude,
            longitude: coords.longitude,
            location: formatLocation(coords.latitude, coords.longitude)
          });
          setLocationStatus('Technician live location is updating for admin monitoring.');
        } catch (error) {
          setLocationStatus(error.message || 'Failed to share technician live location.');
        }
      },
      (error) => {
        if (error?.code === 1) {
          setLocationStatus('Technician location permission was denied.');
          return;
        }

        setLocationStatus('Technician live location is temporarily unavailable.');
      },
      TRACKING_OPTIONS
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [enabled, technicianId]);

  return {
    currentCoordinates,
    locationStatus,
    trackingUpdatedAt
  };
}
