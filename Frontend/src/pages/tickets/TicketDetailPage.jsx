import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  UserIcon,
  CheckCircle2Icon,
  NavigationIcon
} from 'lucide-react';
import { fetchTechnicianById } from '../../api/technicians';
import { useAuth } from '../../contexts/AuthContext';
import { useTechnicianTracking } from '../../contexts/TechnicianTrackingContext';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { RouteMap } from '../../components/maps/RouteMap';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { getIssueReportById, updateIssueReportFeedback } from '../../api/issues';
import {
  formatCoordinates,
  getTechnicianCoordinates,
  getOpenStreetMapLocationUrl,
  parseCoordinatesFromLocation
} from '../../utils/location';
import { getTicketListPathForRole } from '../../utils/routes';

// Show one ticket in full detail, including route and feedback.
export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [assignedTechnician, setAssignedTechnician] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [attachmentPreviews, setAttachmentPreviews] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState('5');
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const { currentCoordinates } = useTechnicianTracking();

  // Load the selected ticket by its id.
  useEffect(() => {
    let ignore = false;

    async function loadTicket() {
      if (!id) {
        setErrorMessage('Ticket not found');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getIssueReportById(id);
        if (!ignore) {
          setTicket(response);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load ticket.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTicket();

    return () => {
      ignore = true;
    };
  }, [id]);

  // Load the assigned technician so route details can be shown.
  useEffect(() => {
    let ignore = false;

    async function loadAssignedTechnician() {
      if (!ticket?.assignedTo) {
        setAssignedTechnician(null);
        return;
      }

      try {
        const technician = await fetchTechnicianById(ticket.assignedTo);
        if (!ignore) {
          setAssignedTechnician(technician || null);
        }
      } catch (error) {
        if (!ignore) {
          setAssignedTechnician(null);
        }
      }
    }

    loadAssignedTechnician();

    return () => {
      ignore = true;
    };
  }, [ticket?.assignedTo]);

  useEffect(() => {
    setFeedbackRating(String(ticket?.studentFeedbackRating || 5));
    setFeedbackComment(ticket?.studentFeedbackComment || '');
    setFeedbackMessage('');
  }, [ticket?.id, ticket?.studentFeedbackRating, ticket?.studentFeedbackComment]);

  // Convert uploaded attachments into previewable images.
  useEffect(() => {
    let ignore = false;
    const createdUrls = [];

    async function loadAttachmentPreviews() {
      const attachmentUrls = ticket?.attachmentUrls || [];
      if (attachmentUrls.length === 0) {
        setAttachmentPreviews([]);
        return;
      }

      const token = localStorage.getItem('token');

      const previews = await Promise.all(
        attachmentUrls.map(async (url) => {
          if (/^https?:\/\//i.test(url) && !url.includes('/api/uploads/')) {
            return {
              sourceUrl: url,
              previewUrl: url
            };
          }

          try {
            const response = await fetch(url, {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (!response.ok) {
              throw new Error('Failed to load attachment');
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            createdUrls.push(objectUrl);

            return {
              sourceUrl: url,
              previewUrl: objectUrl
            };
          } catch (error) {
            return {
              sourceUrl: url,
              previewUrl: ''
            };
          }
        })
      );

      if (!ignore) {
        setAttachmentPreviews(previews);
      }
    }

    loadAttachmentPreviews();

    return () => {
      ignore = true;
      createdUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [ticket?.attachmentUrls]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const renderStars = (rating) => {
    if (!rating) {
      return 'No rating yet';
    }

    return `${rating}/5 stars`;
  };

  const canSubmitFeedback =
    user?.role === 'USER' &&
    Boolean(ticket?.assignedTo) &&
    (ticket?.status === 'RESOLVED' || ticket?.status === 'CLOSED');

  // Submit the student's rating and comment to the backend.
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();

    if (!ticket?.id) {
      return;
    }

    setFeedbackMessage('');
    setIsSubmittingFeedback(true);

    try {
      const updatedTicket = await updateIssueReportFeedback(ticket.id, {
        feedbackRating: Number(feedbackRating),
        feedbackComment
      });
      setTicket(updatedTicket);
      setFeedbackMessage('Feedback submitted successfully.');
    } catch (error) {
      setFeedbackMessage(error.message || 'Failed to submit feedback.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const returnPath = getTicketListPathForRole(user?.role);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
        Loading ticket...
      </div>
    );
  }

  if (errorMessage || !ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          {errorMessage || 'Ticket not found'}
        </h2>
        <Button className="mt-4" onClick={() => navigate(returnPath)}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  const coordinates = parseCoordinatesFromLocation(ticket.location);
  const mapsUrl = getOpenStreetMapLocationUrl(ticket.location);
  const liveTechnicianCoordinates =
    user?.role === 'TECHNICIAN' ? currentCoordinates : getTechnicianCoordinates(assignedTechnician);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(returnPath)}
          className="px-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {ticket.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              Ticket #{ticket.id?.toUpperCase()}
            </span>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="text-slate-500 dark:text-slate-400">
              Created {new Date(ticket.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Issue Details
              </h2>
              <div className="flex gap-2">
                <StatusBadge status={ticket.status} />
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}
                >
                  <AlertTriangleIcon className="w-3 h-3" />
                  {ticket.priority}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                  {ticket.description}
                </p>
              </div>

              {ticket.status === 'REJECTED' && ticket.rejectionReason ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-900/40 dark:bg-rose-900/10">
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    Rejection Reason
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {ticket.rejectionReason}
                  </p>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Student Location
                  </p>
                  <div className="space-y-3">
                    <p className="flex items-center gap-2 text-slate-900 dark:text-white text-sm">
                      <MapPinIcon className="w-4 h-4 text-slate-400" />
                      {ticket.location}
                    </p>
                    {coordinates && (
                      <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                        <NavigationIcon className="w-4 h-4" />
                        GPS: {formatCoordinates(coordinates)}
                      </p>
                    )}
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <NavigationIcon className="w-4 h-4 mr-2" />
                      Open in OpenStreetMap
                    </a>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Category
                  </p>
                  <p className="text-slate-900 dark:text-white text-sm">
                    {ticket.category}
                  </p>
                </div>
              </div>

              {user?.role !== 'USER' && coordinates && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                    Live Route Monitor
                  </p>
                  <RouteMap
                    origin={liveTechnicianCoordinates}
                    destination={coordinates}
                    originLabel={
                      user?.role === 'TECHNICIAN'
                        ? 'Your Live Position'
                        : assignedTechnician?.fullName || 'Assigned Technician'
                    }
                    destinationLabel="Student Location"
                    height="280px"
                  />
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Attached Evidence
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {attachmentPreviews.length > 0 ? (
                    attachmentPreviews.map((attachment, index) => (
                      <a
                        key={attachment.sourceUrl}
                        href={attachment.previewUrl || attachment.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-sky-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                      >
                        {attachment.previewUrl ? (
                          <img
                            src={attachment.previewUrl}
                            alt={`Attachment ${index + 1}`}
                            className="h-52 w-full bg-slate-100 object-contain dark:bg-slate-800"
                          />
                        ) : (
                          <div className="flex h-52 w-full items-center justify-center bg-slate-100 text-sm font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Unable to load image preview
                          </div>
                        )}
                        <div className="border-t border-slate-100 px-4 py-3 text-sm font-medium text-sky-700 dark:border-slate-800 dark:text-sky-300">
                          Open full image
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      No images
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Assigned Technician
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignedTechnician ? (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {assignedTechnician.fullName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {assignedTechnician.specialization || assignedTechnician.department || 'Campus technician'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Email:</span> {assignedTechnician.email || 'Not available'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Phone:</span> {assignedTechnician.phone || 'Not available'}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Live location:</span>{' '}
                      {assignedTechnician.currentLocation || 'Waiting for technician location update'}
                    </p>
                    {ticket.assignedAt && (
                      <p className="text-slate-700 dark:text-slate-300">
                        <span className="font-medium">Assigned on:</span>{' '}
                        {new Date(ticket.assignedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  This ticket has not been assigned to a technician yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Student Feedback
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticket.studentFeedbackRating ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-900/10">
                  <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                    {renderStars(ticket.studentFeedbackRating)} ({ticket.studentFeedbackRating}/5)
                  </p>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">
                    {ticket.studentFeedbackComment || 'No written feedback provided.'}
                  </p>
                  {ticket.studentFeedbackSubmittedAt && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Submitted {new Date(ticket.studentFeedbackSubmittedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {canSubmitFeedback
                    ? 'Rate the technician support once the issue has been completed.'
                    : 'Feedback becomes available after the assigned technician resolves this ticket.'}
                </p>
              )}

              {canSubmitFeedback && (
                <form onSubmit={handleFeedbackSubmit} className="space-y-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Rating
                    </label>
                    <select
                      value={feedbackRating}
                      onChange={(e) => setFeedbackRating(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Poor</option>
                      <option value="1">1 - Very Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Comment
                    </label>
                    <textarea
                      rows={4}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="Share how the technician handled your issue."
                      className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                  </div>
                  {feedbackMessage && (
                    <p className={`text-sm ${feedbackMessage.includes('successfully') ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {feedbackMessage}
                    </p>
                  )}
                  <Button type="submit" size="sm" isLoading={isSubmittingFeedback}>
                    {ticket.studentFeedbackRating ? 'Update Feedback' : 'Submit Feedback'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Reporter
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {ticket.studentName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {ticket.studentEmail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Status Timeline
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700">
                {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? (
                  <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                      <CheckCircle2Icon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {ticket.status === 'CLOSED' ? 'Closed' : 'Resolved'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : null}

                {ticket.status === 'IN_PROGRESS' ||
                ticket.status === 'RESOLVED' ||
                ticket.status === 'CLOSED' ? (
                  <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        In Progress
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(ticket.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : null}

                {ticket.assignedAt ? (
                  <div className="relative flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                      <UserIcon className="w-3 h-3" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        Technician Assigned
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(ticket.assignedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ) : null}

                <div className="relative flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                    <div className="w-2 h-2 rounded-full bg-current" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Ticket Created
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-brand-surface">
                    <ClockIcon className="w-3 h-3" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      Last Updated
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(ticket.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
