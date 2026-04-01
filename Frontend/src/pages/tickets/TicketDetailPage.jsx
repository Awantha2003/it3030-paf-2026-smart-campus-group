import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  UserIcon,
  CheckCircle2Icon
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { getIssueReportById } from '../../api/issues';

export function TicketDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
        <Button className="mt-4" onClick={() => navigate('/tickets')}>
          Back to Tickets
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tickets')}
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
            <span className="text-slate-300 dark:text-slate-600">•</span>
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

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">
                    Location
                  </p>
                  <p className="flex items-center gap-2 text-slate-900 dark:text-white text-sm">
                    <MapPinIcon className="w-4 h-4 text-slate-400" />
                    {ticket.location}
                  </p>
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

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">
                  Attached Evidence
                </p>
                <div className="flex flex-wrap gap-3">
                  {ticket.attachmentUrls?.length ?
                    ticket.attachmentUrls.map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-300"
                      >
                        View attachment
                      </a>
                    )) :
                    <div className="w-24 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs">
                      No images
                    </div>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
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
                {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ?
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
                  </div> :
                  null}

                {ticket.status === 'IN_PROGRESS' || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ?
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
                  </div> :
                  null}

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
