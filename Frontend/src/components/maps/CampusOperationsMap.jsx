import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { Activity, MapPin, ShieldCheck, Wrench } from 'lucide-react';
import { CAMPUS_LANDMARKS, CAMPUS_MAP_CENTER, CAMPUS_ZONES } from '../../data/campusMapData';
import {
  calculateDistanceKm,
  estimateTravelMinutes,
  formatCoordinates,
  getTechnicianCoordinates,
  parseCoordinatesFromLocation
} from '../../utils/location';
import { CampusMarker } from './CampusMarker';
import {
  CAMPUS_MAP_ATTRIBUTION,
  CAMPUS_MAP_TILE_URL,
  toLeafletPosition
} from './mapConfig';

function getTicketColor(ticket) {
  if (ticket.priority === 'CRITICAL') return '#dc2626';
  if (ticket.priority === 'HIGH') return '#f59e0b';
  if (ticket.priority === 'MEDIUM') return '#2563eb';
  return '#64748b';
}

function getTicketLabel(ticket) {
  if (ticket.priority === 'CRITICAL') {
    return '!';
  }

  return (ticket.id || 'T').slice(0, 1).toUpperCase();
}

function getTechnicianColor(technician) {
  return technician.active ? '#059669' : '#94a3b8';
}

function buildSelection(kind, payload) {
  if (!payload) {
    return null;
  }

  return { kind, payload };
}

function getSelectionPosition(payload) {
  if (!payload) {
    return null;
  }

  return (
    parseCoordinatesFromLocation(payload.location) ||
    getTechnicianCoordinates(payload) ||
    payload.position ||
    payload.coordinates ||
    null
  );
}

export function CampusOperationsMap({
  tickets = [],
  technicians = [],
  landmarks = CAMPUS_LANDMARKS,
  selectedTicket = null,
  selectedTechnician = null,
  selectedLandmark = null,
  onTicketSelect,
  onTechnicianSelect,
  onLandmarkSelect,
  showTickets = true,
  showTechnicians = true,
  showLandmarks = true,
  showZones = true,
  userCoordinates = null,
  height = '520px'
}) {
  const [activeSelection, setActiveSelection] = useState(null);
  const mapRef = useRef(null);

  const visibleTickets = showTickets
    ? tickets
        .map((ticket) => ({
          ...ticket,
          coordinates: parseCoordinatesFromLocation(ticket.location)
        }))
        .filter((ticket) => ticket.coordinates)
    : [];

  const visibleTechnicians = showTechnicians
    ? technicians
        .map((technician) => ({
          ...technician,
          coordinates: getTechnicianCoordinates(technician)
        }))
        .filter((technician) => technician.coordinates)
    : [];

  const visibleLandmarks = showLandmarks ? landmarks : [];
  const activeSelectionPosition = getSelectionPosition(activeSelection?.payload);

  const explicitFocus =
    parseCoordinatesFromLocation(selectedTicket?.location) ||
    getTechnicianCoordinates(selectedTechnician) ||
    selectedLandmark?.position ||
    userCoordinates ||
    null;

  const pointSignature = [
    ...visibleTickets.map((ticket) => `${ticket.id}:${formatCoordinates(ticket.coordinates)}`),
    ...visibleTechnicians.map(
      (technician) => `${technician.id}:${formatCoordinates(technician.coordinates)}`
    ),
    ...visibleLandmarks.map((landmark) => `${landmark.id}:${formatCoordinates(landmark.position)}`)
  ].join('|');

  useEffect(() => {
    if (!mapRef.current) {
      return;
    }

    if (explicitFocus) {
      mapRef.current.setView(toLeafletPosition(explicitFocus), 17);
      return;
    }

    const points = [];

    visibleTickets.forEach((ticket) => {
      points.push(toLeafletPosition(ticket.coordinates));
    });

    visibleTechnicians.forEach((technician) => {
      points.push(toLeafletPosition(technician.coordinates));
    });

    visibleLandmarks.forEach((landmark) => {
      points.push(toLeafletPosition(landmark.position));
    });

    if (userCoordinates) {
      points.push(toLeafletPosition(userCoordinates));
    }

    const validPoints = points.filter(Boolean);

    if (validPoints.length > 1) {
      mapRef.current.fitBounds(L.latLngBounds(validPoints), {
        padding: [72, 72]
      });
      return;
    }

    if (validPoints.length === 1) {
      mapRef.current.setView(validPoints[0], 16);
    }
  }, [
    explicitFocus,
    pointSignature,
    userCoordinates,
    visibleLandmarks,
    visibleTechnicians,
    visibleTickets
  ]);

  useEffect(() => {
    if (selectedTicket && getSelectionPosition(selectedTicket)) {
      setActiveSelection(buildSelection('ticket', selectedTicket));
      return;
    }

    if (selectedTechnician && getSelectionPosition(selectedTechnician)) {
      setActiveSelection(buildSelection('technician', selectedTechnician));
      return;
    }

    if (selectedLandmark && getSelectionPosition(selectedLandmark)) {
      setActiveSelection(buildSelection('landmark', selectedLandmark));
      return;
    }

    setActiveSelection(null);
  }, [selectedLandmark, selectedTechnician, selectedTicket]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Activity className="h-4 w-4 text-rose-500" />
            Live Tickets
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{visibleTickets.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Wrench className="h-4 w-4 text-emerald-500" />
            Live Technicians
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{visibleTechnicians.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <MapPin className="h-4 w-4 text-blue-500" />
            Landmarks
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{visibleLandmarks.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4 text-violet-500" />
            Map Layers
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
            {[
              showTickets ? 'Tickets' : null,
              showTechnicians ? 'Technicians' : null,
              showLandmarks ? 'Landmarks' : null,
              showZones ? 'Zones' : null
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900/60">
        <MapContainer
          center={toLeafletPosition(explicitFocus || CAMPUS_MAP_CENTER)}
          zoom={16}
          scrollWheelZoom
          style={{ width: '100%', height }}
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer
            attribution={CAMPUS_MAP_ATTRIBUTION}
            url={CAMPUS_MAP_TILE_URL}
          />

          {showZones &&
            CAMPUS_ZONES.map((zone) => (
              <Circle
                key={zone.id}
                center={toLeafletPosition(zone.center)}
                radius={zone.radius}
                pathOptions={{
                  fillColor: zone.color,
                  fillOpacity: 0.1,
                  color: zone.color,
                  opacity: 0.4,
                  weight: 2
                }}
              />
            ))}

          {userCoordinates && (
            <CampusMarker
              position={userCoordinates}
              glyph="Y"
              background="#0f172a"
              scale={1.2}
              onClick={() =>
                setActiveSelection(
                  buildSelection('user', {
                    location: `Current user position | GPS ${formatCoordinates(userCoordinates)}`,
                    coordinates: userCoordinates
                  })
                )
              }
            />
          )}

          {visibleLandmarks.map((landmark) => (
            <CampusMarker
              key={landmark.id}
              position={landmark.position}
              glyph={landmark.shortName}
              background="#1d4ed8"
              scale={1}
              onClick={() => {
                setActiveSelection(buildSelection('landmark', landmark));
                onLandmarkSelect?.(landmark);
              }}
            />
          ))}

          {visibleTickets.map((ticket) => (
            <CampusMarker
              key={ticket.id}
              position={ticket.coordinates}
              glyph={getTicketLabel(ticket)}
              background={getTicketColor(ticket)}
              scale={1.2}
              onClick={() => {
                setActiveSelection(buildSelection('ticket', ticket));
                onTicketSelect?.(ticket);
              }}
            />
          ))}

          {visibleTechnicians.map((technician) => (
            <CampusMarker
              key={technician.id}
              position={technician.coordinates}
              glyph="T"
              background={getTechnicianColor(technician)}
              scale={1.1}
              onClick={() => {
                setActiveSelection(buildSelection('technician', technician));
                onTechnicianSelect?.(technician);
              }}
            />
          ))}

          {activeSelection && activeSelectionPosition && (
            <Popup
              position={toLeafletPosition(activeSelectionPosition)}
              eventHandlers={{
                remove: () => setActiveSelection(null)
              }}
            >
              <div className="max-w-[240px] space-y-2 pr-2 text-xs text-slate-700">
                <p className="text-sm font-bold text-slate-900">
                  {activeSelection.kind === 'ticket' && activeSelection.payload.title}
                  {activeSelection.kind === 'technician' && activeSelection.payload.fullName}
                  {activeSelection.kind === 'landmark' && activeSelection.payload.name}
                  {activeSelection.kind === 'user' && 'Current Position'}
                </p>
                {activeSelection.kind === 'ticket' && (
                  <>
                    <p>{activeSelection.payload.location}</p>
                    <p>
                      Priority: {activeSelection.payload.priority} | Status:{' '}
                      {activeSelection.payload.status}
                    </p>
                  </>
                )}
                {activeSelection.kind === 'technician' && (
                  <>
                    <p>{activeSelection.payload.specialization || 'General field support'}</p>
                    <p>{activeSelection.payload.currentLocation || 'Live GPS active'}</p>
                  </>
                )}
                {activeSelection.kind === 'landmark' && <p>{activeSelection.payload.description}</p>}
                {(activeSelection.kind === 'ticket' || activeSelection.kind === 'user') &&
                  activeSelection.payload.coordinates && (
                    <p>GPS {formatCoordinates(activeSelection.payload.coordinates)}</p>
                  )}
                {activeSelection.kind === 'technician' && selectedTicket && (() => {
                  const distanceKm = calculateDistanceKm(
                    getTechnicianCoordinates(activeSelection.payload),
                    parseCoordinatesFromLocation(selectedTicket.location)
                  );

                  if (distanceKm === null) {
                    return null;
                  }

                  return <p>ETA: {estimateTravelMinutes(distanceKm)} min</p>;
                })()}
              </div>
            </Popup>
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
          Red markers: critical or urgent tickets
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
          Green markers: technicians with live GPS
        </span>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          Blue markers: campus landmarks and service points
        </span>
      </div>
    </div>
  );
}
