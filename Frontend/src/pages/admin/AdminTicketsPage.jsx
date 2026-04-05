import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, MapPin, MessageSquare, RefreshCw, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import {
  assignIssueReport,
  getAllIssueReports,
  updateIssueReportAdminNote,
  updateIssueReportStatus
} from '../../api/issues';
import { fetchTechnicians } from '../../api/technicians';

const ticketTabs = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CLOSED'];

export function AdminTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicketId, setSelectedTicketId] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actioning, setActioning] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  const activeTechnicians = technicians.filter((technician) => technician.active);

  useEffect(() => {
    setAdminNote(selectedTicket?.adminNote || '');
  }, [selectedTicketId, selectedTicket?.adminNote]);

  const filteredTickets = tickets.filter((ticket) => {
    const query = searchTerm.toLowerCase();
    const matchesTab = activeTab === 'ALL' || ticket.status === activeTab;
    const matchesSearch =
      ticket.title.toLowerCase().includes(query) ||
      ticket.location.toLowerCase().includes(query) ||
      ticket.id.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  async function loadData(showRefreshState = false) {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError('');

    try {
      const [ticketData, technicianData] = await Promise.all([
        getAllIssueReports(),
        fetchTechnicians()
      ]);

      setTickets(ticketData);
      setTechnicians(technicianData);
      setSelectedTicketId((current) => {
        if (current && ticketData.some((ticket) => ticket.id === current)) {
          return current;
        }

        return ticketData[0]?.id || '';
      });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function updateTicketInState(updatedTicket) {
    setTickets((current) =>
      current.map((ticket) => (ticket.id === updatedTicket.id ? updatedTicket : ticket))
    );
  }

  function getTechnicianName(technicianId) {
    return technicians.find((technician) => technician.id === technicianId)?.fullName || '';
  }

  async function handleAssign(ticketId, technicianId) {
    setActioning(`assign-${ticketId}`);
    setError('');
    setSuccess('');

    try {
      const updatedTicket = await assignIssueReport(ticketId, technicianId);
      updateTicketInState(updatedTicket);
      setSuccess(`Ticket assigned to ${getTechnicianName(technicianId) || 'technician'}.`);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActioning('');
    }
  }

  async function handleStatusChange(ticketId, status) {
    setActioning(`status-${ticketId}`);
    setError('');
    setSuccess('');

    try {
      const updatedTicket = await updateIssueReportStatus(ticketId, status);
      updateTicketInState(updatedTicket);
      setSuccess(`Ticket status updated to ${status.replace('_', ' ')}.`);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActioning('');
    }
  }

  async function handleSaveNote() {
    if (!selectedTicket || !adminNote.trim()) {
      return;
    }

    setActioning(`note-${selectedTicket.id}`);
    setError('');
    setSuccess('');

    try {
      const updatedTicket = await updateIssueReportAdminNote(selectedTicket.id, adminNote);
      updateTicketInState(updatedTicket);
      setAdminNote(updatedTicket.adminNote || '');
      setSuccess('Admin note saved successfully.');
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setActioning('');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-8rem)] flex-col"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Ticket Management</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Triage, assign, and resolve campus incidents
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          isLoading={refreshing}
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Refresh
        </Button>
      </div>

      {(error || success) && (
        <div className="mb-4 space-y-2">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
              {success}
            </div>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row">
        <Card className="flex w-full flex-col overflow-hidden border-r border-slate-200 p-0 dark:border-slate-700 lg:w-1/3">
          <div className="shrink-0 border-b border-slate-200 bg-slate-50/50 p-4 dark:border-slate-700 dark:bg-slate-800/20">
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-4 pr-4 text-sm text-slate-900 outline-none transition-all focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {ticketTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    activeTab === tab
                      ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto p-2">
            {loading ? (
              <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">No tickets found</p>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'border-purple-200 bg-purple-50 shadow-sm dark:border-purple-800/50 dark:bg-purple-900/20'
                      : 'border-transparent bg-white hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-slate-500">{ticket.id}</span>
                      <Badge
                        variant={getPriorityVariant(ticket.priority)}
                        className="origin-left scale-90"
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="mb-1 line-clamp-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {ticket.title}
                  </h4>
                  <div className="mb-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
                    <MapPin className="mr-1 h-3 w-3 shrink-0" />
                    <span className="truncate">{ticket.location}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700/50">
                    <StatusBadge status={ticket.status} />
                    {ticket.assignedTo ? (
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {getTechnicianName(ticket.assignedTo) || 'Assigned'}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-500">Unassigned</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="flex w-full flex-col overflow-hidden border border-slate-200 bg-white p-0 dark:border-slate-700 dark:bg-slate-900 lg:w-2/3">
          {selectedTicket ? (
            <>
              <div className="flex shrink-0 flex-col gap-4 border-b border-slate-200 p-6 dark:border-slate-700 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3">
                    <span className="text-sm font-medium text-slate-500">{selectedTicket.id}</span>
                    <Badge variant={getPriorityVariant(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                  <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedTicket.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4" />
                      {selectedTicket.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="mr-1 h-4 w-4" />
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')}
                    isLoading={actioning === `status-${selectedTicket.id}`}
                    disabled={selectedTicket.status === 'RESOLVED'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Resolved
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'REJECTED')}
                    isLoading={actioning === `status-${selectedTicket.id}`}
                    disabled={selectedTicket.status === 'REJECTED'}
                  >
                    <XCircle className="mr-2 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>

              <div className="flex-1 space-y-8 overflow-y-auto p-6">
                <div>
                  <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    Description
                  </h3>
                  <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                      Assignment
                    </h3>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                      <label className="mb-2 block text-xs text-slate-500">Assign Technician</label>
                      <select
                        value={selectedTicket.assignedTo || ''}
                        onChange={(event) => handleAssign(selectedTicket.id, event.target.value)}
                        disabled={actioning === `assign-${selectedTicket.id}` || activeTechnicians.length === 0}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="" disabled>
                          {activeTechnicians.length === 0
                            ? 'No active technicians available'
                            : 'Select a technician...'}
                        </option>
                        {activeTechnicians.map((technician) => (
                          <option key={technician.id} value={technician.id}>
                            {technician.fullName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                      Status Management
                    </h3>
                    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                      <label className="mb-2 block text-xs text-slate-500">Update Status</label>
                      <select
                        value={selectedTicket.status}
                        onChange={(event) => handleStatusChange(selectedTicket.id, event.target.value)}
                        disabled={actioning === `status-${selectedTicket.id}`}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
                    <MessageSquare className="mr-2 h-4 w-4" /> Admin Notes
                  </h3>
                  <div className="space-y-3">
                    <textarea
                      value={adminNote}
                      onChange={(event) => setAdminNote(event.target.value)}
                      placeholder="Add internal notes (not visible to user)..."
                      className="w-full resize-none rounded-xl border border-amber-200 bg-amber-50/50 px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-900/50 dark:bg-amber-900/10 dark:text-white"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSaveNote}
                        isLoading={actioning === `note-${selectedTicket.id}`}
                        disabled={!adminNote.trim()}
                      >
                        Save Note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-slate-500 dark:text-slate-400">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                <AlertTriangle className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="mb-2 text-xl font-medium text-slate-900 dark:text-white">
                No Ticket Selected
              </h3>
              <p className="max-w-md text-center">
                Select a ticket from the list to view its details, assign technicians, and
                manage its status.
              </p>
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}

function getPriorityVariant(priority) {
  if (priority === 'CRITICAL') {
    return 'danger';
  }

  if (priority === 'HIGH') {
    return 'warning';
  }

  if (priority === 'MEDIUM') {
    return 'info';
  }

  return 'default';
}
