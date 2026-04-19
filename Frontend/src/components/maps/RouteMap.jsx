import React from 'react';
import { MapContainer, Polyline, TileLayer, useMap } from 'react-leaflet';
import { MapPin, Navigation } from 'lucide-react';
import { calculateDistanceKm, formatCoordinates, getBearingDirection, parseCoordinates } from '../../utils/location';
import { CampusMarker } from './CampusMarker';
import {
  CAMPUS_MAP_ATTRIBUTION,
  CAMPUS_MAP_TILE_URL,
  toLeafletPosition
} from './mapConfig';

const DEFAULT_CENTER = { lat: 6.9147, lng: 79.9733 };

// Pick a useful center point so both markers stay visible on the map.
function getMapCenter(origin, destination) {
  if (origin && destination) {
    return {
      lat: (origin.lat + destination.lat) / 2,
      lng: (origin.lng + destination.lng) / 2
    };
  }

  return destination || origin || DEFAULT_CENTER;
}

// Keep the Leaflet map centered when route data changes.
function RouteMapViewport({ center, zoom }) {
  const map = useMap();

  React.useEffect(() => {
    const nextCenter = toLeafletPosition(center);

    if (nextCenter) {
      map.setView(nextCenter, zoom);
    }
  }, [center, map, zoom]);

  return null;
}

// Show the technician location, student location, and a simple route line.
export function RouteMap({
  origin,
  destination,
  originLabel = 'Technician',
  destinationLabel = 'Student',
  height = '320px'
}) {
  const start = parseCoordinates(origin);
  const end = parseCoordinates(destination);
  const distanceKm = calculateDistanceKm(start, end);
  const direction = getBearingDirection(start, end);
  const center = getMapCenter(start, end);

  if (!start && !end) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        No live coordinates are available yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/30 dark:bg-blue-900/10">
          <div className="mb-1 flex items-center text-sm font-semibold text-blue-700 dark:text-blue-300">
            <Navigation className="mr-2 h-4 w-4" />
            {originLabel}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {start ? formatCoordinates(start) : 'Waiting for technician GPS'}
          </p>
        </div>
        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4 dark:border-rose-900/30 dark:bg-rose-900/10">
          <div className="mb-1 flex items-center text-sm font-semibold text-rose-700 dark:text-rose-300">
            <MapPin className="mr-2 h-4 w-4" />
            {destinationLabel}
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {end ? formatCoordinates(end) : 'Student GPS not available'}
          </p>
        </div>
      </div>

      {(distanceKm || direction) && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-300">
          {distanceKm ? `Approx. ${distanceKm.toFixed(2)} km` : 'Distance unavailable'}
          {direction ? ` toward the ${direction}` : ''}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border-2 border-slate-200 shadow-inner dark:border-slate-700">
        <MapContainer
          center={toLeafletPosition(center)}
          zoom={16}
          scrollWheelZoom
          style={{ width: '100%', height }}
        >
          <RouteMapViewport center={center} zoom={16} />
          <TileLayer
            attribution={CAMPUS_MAP_ATTRIBUTION}
            url={CAMPUS_MAP_TILE_URL}
          />
          {start && (
            <CampusMarker
              position={start}
              glyph="T"
              background="#2563eb"
            />
          )}
          {end && (
            <CampusMarker
              position={end}
              glyph="S"
              background="#e11d48"
            />
          )}
          {start && end && (
            <Polyline
              positions={[
                toLeafletPosition(start),
                toLeafletPosition(end)
              ]}
              pathOptions={{
                color: '#2563eb',
                opacity: 0.9,
                weight: 4
              }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
