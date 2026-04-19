import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Wrench,
  CheckCircle,
  Clock,
  List,
  MapPin,
  Navigation,
  Route,
  AlertTriangle,
  MessageSquare } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../contexts/AuthContext';
import { useTechnicianTracking } from '../../contexts/TechnicianTrackingContext';
import { getTechnicianIssueReports, updateIssueReportStatus } from '../../api/issues';
import { RouteMap } from '../../components/maps/RouteMap';
import { NotificationsPage } from '../notifications/NotificationsPage';
import {
  formatCoordinates,
  formatDistanceKm,
  getOpenStreetMapLocationUrl,
  parseCoordinatesFromLocation
} from '../../utils/location';
import { rankTicketsForTechnician } from '../../utils/campusMap';
import { getTicketDetailPathForRole } from '../../utils/routes';

function renderStars(rating) {
  if (!rating) {
    return 'No rating yet';
  }

  return `${rating}/5 stars`;
}

function formatTrackingAge(trackingUpdatedAt) {
  if (!trackingUpdatedAt) {
    return 'No live update yet';
  }

  const elapsedMs = Date.now() - new Date(trackingUpdatedAt).getTime();
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) {
    return 'Updated just now';
  }

  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  if (elapsedSeconds < 60) {
    return `Updated ${elapsedSeconds}s ago`;
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes < 60) {
    return `Updated ${elapsedMinutes} min ago`;
  }

  return `Updated ${new Date(trackingUpdatedAt).toLocaleTimeString()}`;
}

export function TechnicianDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const techId = user?.id;
  const [activeDashboardTab, setActiveDashboardTab] = useState('DASHBOARD');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [focusedTicketId, setFocusedTicketId] = useState('');

  useEffect(() => {
    async function loadAssignedTickets() {
      if (!techId) return;
      try {
        const data = await getTechnicianIssueReports(techId);
        setTickets(data);
      } catch (error) {
        console.error('Error fetching assigned tickets:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssignedTickets();
  }, [techId]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const {
    currentCoordinates,
    isTrackingEnabled,
    locationStatus,
    setIsTrackingEnabled,
    trackingUpdatedAt
  } = useTechnicianTracking();
  
  // The API already filters by assignedTo, so we just map tickets directly
  const assignedTickets = tickets || [];
  const inProgressTickets = assignedTickets.filter(
    (t) => t.status === 'IN_PROGRESS'
  );
  const resolvedToday = assignedTickets.filter(
    (t) => t.status === 'RESOLVED'
  ).length;
  const pendingFollowUps = assignedTickets.filter(
    (t) => t.status === 'OPEN'
  ).length;
  const feedbackReceivedCount = assignedTickets.filter(
    (t) => typeof t.studentFeedbackRating === 'number'
  ).length;
  const handleUpdateClick = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);
    setIsUpdateModalOpen(true);
  };
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (selectedTicket) {
      try {
        const updatedTicket = await updateIssueReportStatus(selectedTicket.id, updateStatus);
        setTickets(
          tickets.map((t) =>
            t.id === selectedTicket.id ? updatedTicket : t
          )
        );
      } catch (error) {
        console.error('Error updating status:', error);
      }
      setIsUpdateModalOpen(false);
      setSelectedTicket(null);
      setResolutionNotes('');
    }
  };
  const sortedTickets = rankTicketsForTechnician(assignedTickets, currentCoordinates);

  useEffect(() => {
    if (!sortedTickets.length) {
      setFocusedTicketId('');
      return;
    }

    setFocusedTicketId((current) =>
      current && sortedTickets.some((ticket) => ticket.id === current) ? current : sortedTickets[0].id
    );
  }, [sortedTickets]);

  const activeRouteTicket =
    sortedTickets.find((ticket) => ticket.id === focusedTicketId) || sortedTickets[0] || null;
  const activeRouteIndex = activeRouteTicket
    ? sortedTickets.findIndex((ticket) => ticket.id === activeRouteTicket.id)
    : -1;
  const nextBestEta =
    activeRouteTicket?.travelMinutes !== null && activeRouteTicket?.travelMinutes !== undefined
      ? `${activeRouteTicket.travelMinutes} min`
      : 'Waiting for GPS';

  const showPreviousTicket = () => {
    if (activeRouteIndex > 0) {
      setFocusedTicketId(sortedTickets[activeRouteIndex - 1].id);
    }
  };

  const showNextTicket = () => {
    if (activeRouteIndex >= 0 && activeRouteIndex < sortedTickets.length - 1) {
      setFocusedTicketId(sortedTickets[activeRouteIndex + 1].id);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
            <Wrench className="w-6 h-6 mr-2 text-purple-600 dark:text-purple-400" />
            My Workspace
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your assigned tasks and updates
          </p>
        </div>
        <div className="w-full sm:w-auto rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                Live Location
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {isTrackingEnabled ? 'On duty tracking enabled' : 'Tracking paused'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isTrackingEnabled
                  ? formatTrackingAge(trackingUpdatedAt)
                  : 'Turn this on to share GPS with admin dispatch.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTrackingEnabled((current) => !current)}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
                isTrackingEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
              aria-pressed={isTrackingEnabled}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  isTrackingEnabled ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200 dark:border-slate-800 mb-6">
        <button
          onClick={() => setActiveDashboardTab('DASHBOARD')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeDashboardTab === 'DASHBOARD'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveDashboardTab('NOTIFICATIONS')}
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
            activeDashboardTab === 'NOTIFICATIONS'
              ? 'border-brand-purple text-brand-purple'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Notifications
        </button>
      </div>

      {activeDashboardTab === 'NOTIFICATIONS' && (
        <div className="-mt-6">
          <NotificationsPage />
        </div>
      )}

      {activeDashboardTab === 'DASHBOARD' && (
      <>
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4 border-l-4 border-blue-500">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <List className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Assigned Tickets
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {assignedTickets.length}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-amber-500">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              In Progress
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {inProgressTickets.length}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-green-500">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Resolved Today
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {resolvedToday}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-purple-500">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Pending Follow-ups
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {pendingFollowUps}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-rose-500">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Feedback Received
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {feedbackReceivedCount}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4 border-l-4 border-emerald-500 sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Next Route ETA
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {nextBestEta}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Section - Assigned Tickets */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
            My Assigned Tasks
            <Badge variant="outline" className="ml-2">
              {sortedTickets.length}
            </Badge>
          </h2>

          {sortedTickets.length > 0 ?
          <div className="space-y-4">
              {sortedTickets.map((ticket) =>
            {
              const coordinates = parseCoordinatesFromLocation(ticket.location);

              return (
            <Card
              key={ticket.id}
              className={`p-5 hover:shadow-md transition-shadow border-l-4 cursor-pointer ${
                activeRouteTicket?.id === ticket.id ? 'ring-2 ring-blue-300 dark:ring-blue-700' : ''
              }`}
              style={{
                borderLeftColor:
                ticket.priority === 'CRITICAL' ?
                '#ef4444' :
                ticket.priority === 'HIGH' ?
                '#f59e0b' :
                ticket.priority === 'MEDIUM' ?
                '#3b82f6' :
                '#94a3b8'
              }}
              onClick={() => setFocusedTicketId(ticket.id)}>
              
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-slate-500">
                          {ticket.id}
                        </span>
                        <Badge
                      variant={
                      ticket.priority === 'CRITICAL' ?
                      'danger' :
                      ticket.priority === 'HIGH' ?
                      'warning' :
                      'default'
                      }>
                      
                          {ticket.priority}
                        </Badge>
                        <Badge variant="outline">{ticket.category}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                        {ticket.title}
                      </h3>
                      {ticket.studentFeedbackRating && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900/40 dark:bg-amber-900/10">
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                            Student Feedback: {renderStars(ticket.studentFeedbackRating)} ({ticket.studentFeedbackRating}/5)
                          </p>
                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {ticket.studentFeedbackComment || 'No written feedback provided.'}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" /> {ticket.location}
                        </span>
                        {coordinates && (
                          <span className="flex items-center text-emerald-600 dark:text-emerald-400">
                            <Navigation className="w-4 h-4 mr-1" />
                            {formatCoordinates(coordinates)}
                          </span>
                        )}
                        {ticket.distanceKm !== null && (
                          <span className="flex items-center text-blue-600 dark:text-blue-400">
                            <Route className="w-4 h-4 mr-1" />
                            {formatDistanceKm(ticket.distanceKm)} | {ticket.travelMinutes} min
                          </span>
                        )}
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />{' '}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <StatusBadge status={ticket.status} />
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={getOpenStreetMapLocationUrl(ticket.location)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 h-8 px-3 text-xs"
                          >
                            <Navigation className="w-3.5 h-3.5 mr-1.5" />
                            Open Location
                          </a>
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(getTicketDetailPathForRole(user?.role, ticket.id))}>
                        
                            View Details
                          </Button>
                          <Button
                        size="sm"
                        onClick={() => handleUpdateClick(ticket)}
                        disabled={
                        ticket.status === 'RESOLVED' ||
                        ticket.status === 'CLOSED'
                        }>
                        
                            Update Status
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            }
            )}
            </div> :

          <Card className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                All Caught Up!
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                You have no assigned tickets at the moment. Enjoy your break or
                check the open queue.
              </p>
            </Card>
          }
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Live Route Guidance
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Review assigned tasks one by one while on-duty GPS sharing is active.
                </p>
              </div>
              {activeRouteTicket && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {activeRouteIndex + 1} / {sortedTickets.length}
                </span>
              )}
            </div>
            {activeRouteTicket ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={showPreviousTicket}
                    disabled={activeRouteIndex <= 0}
                  >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={showNextTicket}
                    disabled={activeRouteIndex === -1 || activeRouteIndex >= sortedTickets.length - 1}
                  >
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50">
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950/40">
                    <div className="flex items-center gap-3">
                      <span className={`relative flex h-3.5 w-3.5 ${isTrackingEnabled ? '' : 'opacity-60'}`}>
                        <span
                          className={`absolute inline-flex h-full w-full rounded-full ${
                            isTrackingEnabled ? 'animate-ping bg-emerald-400/70' : 'bg-slate-400/40'
                          }`}
                        />
                        <span
                          className={`relative inline-flex h-3.5 w-3.5 rounded-full ${
                            isTrackingEnabled ? 'bg-emerald-500' : 'bg-slate-400'
                          }`}
                        />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          Technician GPS Broadcast
                        </p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {isTrackingEnabled ? 'Sharing live location' : 'Tracking is off'}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant={isTrackingEnabled ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => setIsTrackingEnabled((current) => !current)}
                    >
                      {isTrackingEnabled ? 'Pause' : 'Enable'}
                    </Button>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    Destination: {activeRouteTicket.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Focused task #{activeRouteTicket.id}
                  </p>
                  {activeRouteTicket.distanceKm !== null && (
                    <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                      {formatDistanceKm(activeRouteTicket.distanceKm)} away | {activeRouteTicket.travelMinutes} min
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {locationStatus || 'Enable tracking to start technician GPS updates.'}
                  </p>
                  {currentCoordinates && (
                    <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Technician position: {formatCoordinates(currentCoordinates)}
                    </p>
                  )}
                  {trackingUpdatedAt && (
                    <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                      {formatTrackingAge(trackingUpdatedAt)}
                    </p>
                  )}
                </div>
                <RouteMap
                  origin={currentCoordinates}
                  destination={parseCoordinatesFromLocation(activeRouteTicket.location)}
                  originLabel="Technician Live Position"
                  destinationLabel="Student Ticket Location"
                  height="260px"
                />
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No assigned ticket is available for route tracking.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Student Feedback
            </h3>
            {activeRouteTicket?.studentFeedbackRating ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 dark:border-amber-900/40 dark:bg-amber-900/10">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {renderStars(activeRouteTicket.studentFeedbackRating)} ({activeRouteTicket.studentFeedbackRating}/5)
                </p>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                  {activeRouteTicket.studentFeedbackComment || 'No written feedback provided by the student.'}
                </p>
                {activeRouteTicket.studentFeedbackSubmittedAt && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Submitted {new Date(activeRouteTicket.studentFeedbackSubmittedAt).toLocaleString()}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No student feedback is available for the currently focused ticket.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Today's Schedule
            </h3>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {inProgressTickets.map((ticket, i) =>
              <div
                key={ticket.id}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900">
                        {ticket.id}
                      </div>
                      <time className="text-xs font-medium text-amber-500">
                        In Progress
                      </time>
                    </div>
                    <div className="text-slate-500 text-sm truncate">
                      {ticket.title}
                    </div>
                  </div>
                </div>
              )}
              {inProgressTickets.length === 0 &&
              <div className="text-center text-sm text-slate-500 py-4">
                  No active tasks scheduled.
                </div>
              }
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 text-green-600 rounded-full shrink-0">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Resolved Ticket t3
                  </p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Commented on t2
                  </p>
                  <p className="text-xs text-slate-500">4 hours ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Ticket ${selectedTicket?.id}`}>
        
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700 mb-4">
            <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
              {selectedTicket?.title}
            </h4>
            <p className="text-xs text-slate-500 flex items-center">
              <MapPin className="w-3 h-3 mr-1" /> {selectedTicket?.location}
            </p>
            {parseCoordinatesFromLocation(selectedTicket?.location) && (
              <a
                href={getOpenStreetMapLocationUrl(selectedTicket?.location)}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-700"
              >
                <Navigation className="w-3 h-3 mr-1" />
                Open student location in OpenStreetMap
              </a>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              New Status
            </label>
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white">
              
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="OPEN">Needs Follow-up (Open)</option>
            </select>
          </div>

          {updateStatus === 'RESOLVED' &&
          <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Resolution Notes <span className="text-red-500">*</span>
              </label>
              <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Describe what was done to resolve the issue..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white resize-none"
              rows={4}
              required />
            
            </div>
          }

          <div className="flex justify-end space-x-3 pt-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}>
              
              Cancel
            </Button>
            <Button type="submit">Update Status</Button>
          </div>
        </form>
      </Modal>
      </>
      )}
    </motion.div>
  );
}
