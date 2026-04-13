import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Navigation,
  Radar,
  RefreshCw,
  Route,
  Ticket,
  Wrench
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CampusOperationsMap } from '../../components/maps/CampusOperationsMap';
import { getAllIssueReports, getStudentIssueReports, getTechnicianIssueReports } from '../../api/issues';
import { fetchTechnicians } from '../../api/technicians';
import { useAuth } from '../../contexts/AuthContext';
import { useTechnicianTracking } from '../../contexts/TechnicianTrackingContext';
import { CAMPUS_LANDMARKS, CAMPUS_SUPPORT_HUBS } from '../../data/campusMapData';
import {
  getMapCoverageSummary,
  getNearestEntity,
  rankTechniciansForTicket,
  rankTicketsForTechnician
} from '../../utils/campusMap';
import {
  calculateDistanceKm,
  formatCoordinates,
  formatDistanceKm,
  estimateTravelMinutes,
  getTechnicianCoordinates,
  parseCoordinatesFromLocation
} from '../../utils/location';

function FilterChip({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-900/60 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-800'
      }`}
    >
      {children}
    </button>
  );
}

function MetricCard({ icon: Icon, label, value, tone = 'slate' }) {
  const toneClasses = {
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300'
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function CampusMapPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCoordinates, locationStatus, trackingUpdatedAt } = useTechnicianTracking();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [selectedLandmarkId, setSelectedLandmarkId] = useState('');
  const [showTickets, setShowTickets] = useState(true);
  const [showTechnicians, setShowTechnicians] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [studentCoordinates, setStudentCoordinates] = useState(null);

  const role = user?.role;
  const effectiveUserCoordinates = role === 'TECHNICIAN' ? currentCoordinates : studentCoordinates;
  const pseudoTechnician =
    role === 'TECHNICIAN' && user
      ? [
          {
            id: user.id,
            fullName: user.name,
            specialization: user.department || 'Campus technician',
            active: true,
            currentLatitude: currentCoordinates?.lat,
            currentLongitude: currentCoordinates?.lng,
            currentLocation: currentCoordinates ? `Live GPS | ${formatCoordinates(currentCoordinates)}` : '',
            trackingUpdatedAt
          }
        ]
      : [];

  const visibleTechnicians = role === 'TECHNICIAN' ? pseudoTechnician : technicians;
  const filteredTickets = tickets.filter((ticket) => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return (
      ticket.title.toLowerCase().includes(query) ||
      ticket.location.toLowerCase().includes(query) ||
      ticket.priority.toLowerCase().includes(query) ||
      ticket.status.toLowerCase().includes(query)
    );
  });

  const rankedTechnicianTickets =
    role === 'TECHNICIAN'
      ? rankTicketsForTechnician(filteredTickets, currentCoordinates)
      : filteredTickets;
  const selectedTicket =
    rankedTechnicianTickets.find((ticket) => ticket.id === selectedTicketId) ||
    filteredTickets.find((ticket) => ticket.id === selectedTicketId) ||
    rankedTechnicianTickets[0] ||
    filteredTickets[0] ||
    null;
  const selectedTechnician =
    visibleTechnicians.find((technician) => technician.id === selectedTechnicianId) || null;
  const selectedLandmark =
    CAMPUS_LANDMARKS.find((landmark) => landmark.id === selectedLandmarkId) || null;
  const technicianRecommendations =
    role === 'ADMIN' && selectedTicket
      ? rankTechniciansForTicket(selectedTicket, technicians, tickets).slice(0, 4)
      : [];
  const nearestLandmark = effectiveUserCoordinates
    ? getNearestEntity(effectiveUserCoordinates, CAMPUS_LANDMARKS, (landmark) => landmark.position)
    : null;
  const coverageSummary = getMapCoverageSummary(tickets, technicians);

  useEffect(() => {
    loadMapData();
  }, [role, user?.id]);

  useEffect(() => {
    if (role === 'USER' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setStudentCoordinates({ lat: coords.latitude, lng: coords.longitude });
        },
        () => {},
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    }
  }, [role]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadMapData(true);
    }, role === 'ADMIN' ? 15000 : 20000);

    return () => window.clearInterval(intervalId);
  }, [role, user?.id]);

  useEffect(() => {
    if (!filteredTickets.length) {
      setSelectedTicketId('');
      return;
    }

    setSelectedTicketId((current) =>
      current && filteredTickets.some((ticket) => ticket.id === current)
        ? current
        : filteredTickets[0].id
    );
  }, [filteredTickets]);

  useEffect(() => {
    if (!visibleTechnicians.length) {
      setSelectedTechnicianId('');
      return;
    }

    setSelectedTechnicianId((current) =>
      current && visibleTechnicians.some((technician) => technician.id === current)
        ? current
        : visibleTechnicians[0].id
    );
  }, [visibleTechnicians]);

  async function loadMapData(isBackgroundRefresh = false) {
    if (isBackgroundRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      if (role === 'ADMIN') {
        const [ticketData, technicianData] = await Promise.all([
          getAllIssueReports(),
          fetchTechnicians()
        ]);
        setTickets(ticketData);
        setTechnicians(technicianData);
      } else if (role === 'TECHNICIAN') {
        const ticketData = await getTechnicianIssueReports(user?.id);
        setTickets(ticketData);
      } else {
        const ticketData = await getStudentIssueReports(user?.id);
        setTickets(ticketData);
      }
    } catch (loadError) {
      setError(loadError.message || 'Failed to load the campus map view.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Campus Intelligence Map
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
            {role === 'ADMIN' &&
              'Monitor ticket hotspots, technician coverage, and dispatch decisions from one live operational map.'}
            {role === 'TECHNICIAN' &&
              'Track the best next job, compare route distance, and keep your live field position visible to dispatch.'}
            {role === 'USER' &&
              'See your live campus position, nearby landmarks, and active issue locations before you report or follow up.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadMapData(true)}
            isLoading={refreshing}
            leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
          >
            Refresh Map
          </Button>
          {role === 'USER' && (
            <Button size="sm" onClick={() => navigate('/Student/tickets/new')} leftIcon={<Ticket className="h-4 w-4" />}>
              Report Issue
            </Button>
          )}
          {role === 'ADMIN' && (
            <Button size="sm" onClick={() => navigate('/Admin/tickets')} leftIcon={<Wrench className="h-4 w-4" />}>
              Open Dispatch Board
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Radar}
          label={role === 'ADMIN' ? 'Actionable Tickets' : 'Visible Tickets'}
          value={filteredTickets.length}
          tone="rose"
        />
        <MetricCard
          icon={Wrench}
          label={role === 'ADMIN' ? 'Live Technicians' : 'Field Coverage'}
          value={role === 'ADMIN' ? coverageSummary.liveTechnicianCount : visibleTechnicians.length}
          tone="emerald"
        />
        <MetricCard
          icon={Compass}
          label={role === 'ADMIN' ? 'GPS Coverage' : 'Nearest Landmark'}
          value={role === 'ADMIN' ? `${coverageSummary.coverageRate}%` : nearestLandmark?.item?.name || 'Not detected'}
          tone="blue"
        />
        <MetricCard
          icon={Route}
          label={role === 'TECHNICIAN' ? 'GPS Status' : 'Landmarks'}
          value={
            role === 'TECHNICIAN'
              ? currentCoordinates
                ? 'Live'
                : 'Waiting'
              : CAMPUS_LANDMARKS.length
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_380px]">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <FilterChip active={showTickets} onClick={() => setShowTickets((current) => !current)}>
                  Tickets
                </FilterChip>
                <FilterChip
                  active={showTechnicians}
                  onClick={() => setShowTechnicians((current) => !current)}
                >
                  Technicians
                </FilterChip>
                <FilterChip
                  active={showLandmarks}
                  onClick={() => setShowLandmarks((current) => !current)}
                >
                  Landmarks
                </FilterChip>
                <FilterChip active={showZones} onClick={() => setShowZones((current) => !current)}>
                  Zones
                </FilterChip>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title, location, priority, or status"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white lg:max-w-sm"
              />
            </div>
          </Card>

          {loading ? (
            <Card className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
              Loading map intelligence...
            </Card>
          ) : (
            <CampusOperationsMap
              tickets={filteredTickets}
              technicians={visibleTechnicians}
              selectedTicket={selectedTicket}
              selectedTechnician={selectedTechnician}
              selectedLandmark={selectedLandmark}
              onTicketSelect={(ticket) => setSelectedTicketId(ticket.id)}
              onTechnicianSelect={(technician) => setSelectedTechnicianId(technician.id)}
              onLandmarkSelect={(landmark) => setSelectedLandmarkId(landmark.id)}
              showTickets={showTickets}
              showTechnicians={showTechnicians}
              showLandmarks={showLandmarks}
              showZones={showZones}
              userCoordinates={effectiveUserCoordinates}
              height="620px"
            />
          )}
        </div>

        <div className="space-y-4">
          {role === 'USER' && (
            <>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Student Position
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {effectiveUserCoordinates ? 'Live location detected' : 'Location not available yet'}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {effectiveUserCoordinates
                    ? `GPS ${formatCoordinates(effectiveUserCoordinates)}`
                    : 'Allow browser location access to see nearby campus landmarks and faster dispatch guidance.'}
                </p>
                {nearestLandmark && (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Closest landmark: {nearestLandmark.item.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Approx. {formatDistanceKm(nearestLandmark.distanceKm)} away
                    </p>
                  </div>
                )}
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Support Hubs
                </p>
                <div className="mt-4 space-y-3">
                  {CAMPUS_SUPPORT_HUBS.map((hub) => (
                    <div key={hub.id} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
                      <p className="font-semibold text-slate-900 dark:text-white">{hub.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{hub.team}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Active Reports
                </p>
                <div className="mt-4 space-y-3">
                  {filteredTickets.slice(0, 4).map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => {
                        setSelectedTicketId(ticket.id);
                        navigate(`/Student/tickets/${ticket.id}`);
                      }}
                      className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:border-slate-400 dark:border-slate-800"
                    >
                      <p className="font-semibold text-slate-900 dark:text-white">{ticket.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{ticket.location}</p>
                    </button>
                  ))}
                  {filteredTickets.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No existing tickets yet. Use the map to choose the best place to report from.
                    </p>
                  )}
                </div>
              </Card>
            </>
          )}

          {role === 'TECHNICIAN' && (
            <>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Field Tracking
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                  {currentCoordinates ? 'GPS is broadcasting' : 'Waiting for GPS permission'}
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {locationStatus || 'Open the technician workspace to share live location with admin dispatch.'}
                </p>
                {trackingUpdatedAt && (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
                    Last updated {new Date(trackingUpdatedAt).toLocaleTimeString()}
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Best Next Task
                </p>
                {selectedTicket ? (
                  <div className="mt-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="font-semibold text-slate-900 dark:text-white">{selectedTicket.title}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedTicket.location}</p>
                    {selectedTicket.distanceKm !== null && (
                      <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {formatDistanceKm(selectedTicket.distanceKm)} away, about{' '}
                        {selectedTicket.travelMinutes || estimateTravelMinutes(selectedTicket.distanceKm)} min on foot
                      </p>
                    )}
                    <Button
                      size="sm"
                      className="mt-4"
                      onClick={() => navigate(`/Student/tickets/${selectedTicket.id}`)}
                      leftIcon={<Navigation className="h-4 w-4" />}
                    >
                      Open Task
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    No assigned ticket currently available.
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Dispatch Queue
                </p>
                <div className="mt-4 space-y-3">
                  {rankedTechnicianTickets.slice(0, 5).map((ticket) => (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => setSelectedTicketId(ticket.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selectedTicket?.id === ticket.id
                          ? 'border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <p className="font-semibold">{ticket.title}</p>
                      <p className="mt-1 text-xs opacity-80">{ticket.location}</p>
                      {ticket.distanceKm !== null && (
                        <p className="mt-2 text-xs font-medium">
                          {formatDistanceKm(ticket.distanceKm)} | {ticket.travelMinutes} min
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </Card>
            </>
          )}

          {role === 'ADMIN' && (
            <>
              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Dispatch Coverage
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">GPS Tickets</p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {coverageSummary.geocodedCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Coverage Rate</p>
                    <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                      {coverageSummary.coverageRate}%
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recommended Dispatch
                </p>
                {selectedTicket ? (
                  <div className="mt-3 space-y-3">
                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60">
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedTicket.title}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{selectedTicket.location}</p>
                    </div>
                    {technicianRecommendations.map((entry, index) => (
                      <button
                        key={entry.technician.id}
                        type="button"
                        onClick={() => setSelectedTechnicianId(entry.technician.id)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          index === 0
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {index === 0 ? 'Best fit' : `Option ${index + 1}`}: {entry.technician.fullName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {entry.technician.specialization || 'General technician'}
                        </p>
                        <p className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                          {entry.distanceKm !== null
                            ? `${formatDistanceKm(entry.distanceKm)} away | ${entry.travelMinutes} min | ${entry.activeLoad} active jobs`
                            : `${entry.activeLoad} active jobs | Waiting for live GPS`}
                        </p>
                      </button>
                    ))}
                    {technicianRecommendations.length === 0 && (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        No active technician with suitable dispatch data is available.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                    Select a ticket on the map to see dispatch recommendations.
                  </p>
                )}
              </Card>

              <Card className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Live Staff
                </p>
                <div className="mt-4 space-y-3">
                  {visibleTechnicians.slice(0, 6).map((technician) => {
                    const technicianCoordinates = getTechnicianCoordinates(technician);
                    const distanceToSelected =
                      selectedTicket && technicianCoordinates
                        ? formatDistanceKm(
                            calculateDistanceKm(
                              technicianCoordinates,
                              parseCoordinatesFromLocation(selectedTicket.location)
                            )
                          )
                        : null;

                    return (
                      <button
                        key={technician.id}
                        type="button"
                        onClick={() => setSelectedTechnicianId(technician.id)}
                        className="w-full rounded-2xl border border-slate-200 p-3 text-left transition hover:border-slate-400 dark:border-slate-800"
                      >
                        <p className="font-semibold text-slate-900 dark:text-white">{technician.fullName}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {technician.specialization || 'General support'}
                        </p>
                        <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          {technician.currentLocation || 'Live location pending'}
                        </p>
                        {distanceToSelected && (
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Selected ticket proximity: {distanceToSelected}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </Card>
            </>
          )}

          {selectedLandmark && (
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Landmark Focus
              </p>
              <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                {selectedLandmark.name}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {selectedLandmark.description}
              </p>
              <p className="mt-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                GPS {formatCoordinates(selectedLandmark.position)}
              </p>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
}
