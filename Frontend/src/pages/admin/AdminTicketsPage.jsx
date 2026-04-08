import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Clock, MapPin, MessageSquare, RefreshCw, XCircle, Search, UserCircle, Navigation, ShieldAlert, CheckSquare, XOctagon, Inbox } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { RouteMap } from '../../components/maps/RouteMap';
import {
  assignIssueReport,
  getAllIssueReports,
  updateIssueReportAdminNote,
  updateIssueReportStatus
} from '../../api/issues';
import { fetchTechnicians } from '../../api/technicians';
import {
  calculateDistanceKm,
  formatCoordinates,
  getBearingDirection,
  getTechnicianCoordinates,
  parseCoordinatesFromLocation
} from '../../utils/location';

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

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      loadData(false, true);
    }, 15000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedTicketId) || null;
  const activeTechnicians = technicians.filter((technician) => technician.active);
  const assignedTechnician = technicians.find(
    (technician) => technician.id === selectedTicket?.assignedTo
  );
  const studentCoordinates = parseCoordinatesFromLocation(selectedTicket?.location);
  const technicianCoordinates = getTechnicianCoordinates(assignedTechnician);
  const routeDistance = calculateDistanceKm(technicianCoordinates, studentCoordinates);
  const routeDirection = getBearingDirection(technicianCoordinates, studentCoordinates);

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

  async function loadData(showRefreshState = false, silent = false) {
    if (silent) {
      setError('');
    } else if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    if (!silent) {
      setError('');
    }

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
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
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
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-2rem)] flex-col bg-slate-50/30 dark:bg-slate-900/10 rounded-2xl p-2 md:p-4 lg:p-6"
    >
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-2 shrink-0">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400 tracking-tight">
            Mission Control
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Triage, assign, and resolve campus incidents efficiently
          </p>
        </div>
        <Button
          className="shadow-md hover:shadow-lg transition-all duration-300"
          variant="primary"
          size="sm"
          onClick={() => loadData(true)}
          isLoading={refreshing}
          leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />}
        >
          {refreshing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </div>

      <AnimatePresence>
        {(error || success) && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            className="mb-4 shrink-0"
          >
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-100/50 backdrop-blur-sm px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-100/50 backdrop-blur-sm px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="font-medium">{success}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex min-h-0 flex-1 flex-col gap-6 lg:flex-row shadow-2xl shadow-indigo-100/40 dark:shadow-none rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-slate-800">
        
        {/* LEFT PANE - Ticket List */}
        <div className="flex w-full flex-col overflow-hidden border-r border-slate-200/60 dark:border-slate-700/60 lg:w-96 shrink-0 bg-white/40 dark:bg-slate-900/40">
          <div className="shrink-0 space-y-4 p-5">
            <div className="relative group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full rounded-xl border-slate-200/70 bg-white/70 py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-white"
              />
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
              {ticketTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-xs font-bold transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                      : 'bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm'
                  }`}
                >
                  {tab.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4 pt-0 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-8 text-center animate-pulse">
                <div className="h-10 w-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading tickets...</p>
              </div>
            ) : filteredTickets.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-10 text-center"
              >
                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-base font-semibold text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">No tickets match your filters.</p>
              </motion.div>
            ) : (
              filteredTickets.map((ticket, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl transition-all duration-300 ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30 scale-[1.02]'
                      : 'border border-slate-200/60 bg-white hover:border-purple-300 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/60 dark:hover:border-purple-500/50 hover:-translate-y-0.5'
                  }`}
                >
                  <div className="p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md ${
                        selectedTicket?.id === ticket.id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        #{ticket.id.slice(0,8)}
                      </span>
                      <Badge
                        variant={selectedTicket?.id === ticket.id ? 'white' : getPriorityVariant(ticket.priority)}
                        className={`text-[10px] uppercase font-bold tracking-wide ${selectedTicket?.id === ticket.id ? 'bg-white/20 border-white/30 text-white' : ''}`}
                      >
                        {ticket.priority}
                      </Badge>
                    </div>
                    <h4 className={`mb-2 line-clamp-2 text-sm font-bold ${
                      selectedTicket?.id === ticket.id ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                    }`}>
                      {ticket.title}
                    </h4>
                    <div className={`mb-4 flex items-center text-xs font-medium ${
                      selectedTicket?.id === ticket.id ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
                    }`}>
                      <MapPin className="mr-1.5 h-3.5 w-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{ticket.location}</span>
                    </div>
                    
                    <div className={`mt-2 flex items-center justify-between pt-3 border-t ${
                      selectedTicket?.id === ticket.id ? 'border-white/20' : 'border-slate-100 dark:border-slate-700'
                    }`}>
                      <StatusBadge 
                        status={ticket.status} 
                        className={selectedTicket?.id === ticket.id ? 'bg-white/20 text-white border-transparent' : ''}
                      />
                      <div className="flex items-center gap-1.5">
                         {ticket.assignedTo ? (
                           <>
                              <UserCircle className={`h-4 w-4 ${selectedTicket?.id === ticket.id ? 'text-white/80' : 'text-indigo-400'}`} />
                              <span className={`text-xs font-semibold ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`}>
                                {getTechnicianName(ticket.assignedTo).split(' ')[0] || 'Assigned'}
                              </span>
                           </>
                         ) : (
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                             selectedTicket?.id === ticket.id 
                              ? 'bg-red-400/30 text-white' 
                              : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                           }`}>
                             UNASSIGNED
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANE - Ticket Details */}
        <div className="flex flex-1 flex-col overflow-hidden relative bg-slate-50/30 dark:bg-slate-900/30">
          {selectedTicket ? (
            <>
              {/* Header details */}
              <div className="flex shrink-0 flex-col gap-3 border-b border-white/20 bg-white/40 p-4 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-800/40 xl:flex-row xl:items-start xl:justify-between shadow-sm z-10">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                     <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md dark:bg-indigo-900/50 dark:text-indigo-300">
                      ID: {selectedTicket.id.slice(0, 10)}...
                    </span>
                    <Badge variant={getPriorityVariant(selectedTicket.priority)}>
                      {selectedTicket.priority} Priority
                    </Badge>
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight break-words">
                    {selectedTicket.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <MapPin className="mr-1.5 h-3.5 w-3.5 text-rose-500" />
                      {selectedTicket.location}
                    </span>
                    <span className="flex items-center bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      <Clock className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-1 xl:mt-0">
                  <Button
                    className="shadow-sm hover:shadow transition-all bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'RESOLVED')}
                    isLoading={actioning === `status-${selectedTicket.id}`}
                    disabled={selectedTicket.status === 'RESOLVED'}
                  >
                    <CheckSquare className="mr-1.5 h-4 w-4" /> Resolve
                  </Button>
                  <Button
                    className="shadow-sm hover:shadow transition-all"
                    variant="danger"
                    size="sm"
                    onClick={() => handleStatusChange(selectedTicket.id, 'REJECTED')}
                    isLoading={actioning === `status-${selectedTicket.id}`}
                    disabled={selectedTicket.status === 'REJECTED'}
                  >
                    <XOctagon className="mr-1.5 h-4 w-4" /> Reject
                  </Button>
                </div>
              </div>

              {/* Scrollable details body */}
              <div className="flex-1 space-y-5 overflow-y-auto p-4 md:p-5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="group">
                  <h3 className="mb-2 flex items-center text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                    <Navigation className="mr-2 h-4 w-4 text-purple-500" /> Incident Description
                  </h3>
                  <div className="rounded-xl border border-white/60 bg-white/70 p-4 min-h-[60px] leading-relaxed text-slate-700 shadow-sm backdrop-blur-md dark:border-slate-700/60 dark:bg-slate-800/70 dark:text-slate-300 text-sm">
                    {selectedTicket.description}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h3 className="mb-2 flex items-center text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                    <UserCircle className="mr-2 h-4 w-4 text-blue-500" /> Technician Assignment
                  </h3>
                  <div className="rounded-xl border border-blue-100/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-4 shadow-sm backdrop-blur-md dark:border-blue-900/30 dark:from-blue-900/10 dark:to-indigo-900/10">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Assign personnel
                        </label>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Select the best technician to resolve this issue.
                        </p>
                      </div>
                      <div className="flex-[2]">
                        <select
                          value={selectedTicket.assignedTo || ''}
                          onChange={(event) => handleAssign(selectedTicket.id, event.target.value)}
                          disabled={actioning === `assign-${selectedTicket.id}` || activeTechnicians.length === 0}
                          className="w-full rounded-xl border-2 border-white bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                        >
                          <option value="" disabled>
                            {activeTechnicians.length === 0
                              ? 'No active technicians available'
                              : 'Select a skilled professional...'}
                          </option>
                          {activeTechnicians.map((technician) => (
                            <option key={technician.id} value={technician.id}>
                              {technician.fullName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <h3 className="mb-2 flex items-center text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                    <MapPin className="mr-2 h-4 w-4 text-rose-500" /> Live Location Monitor
                  </h3>
                  <div className="rounded-xl border border-rose-100/50 bg-gradient-to-br from-rose-50/50 to-blue-50/50 p-4 shadow-sm backdrop-blur-md dark:border-rose-900/30 dark:from-rose-900/10 dark:to-blue-900/10">
                    {studentCoordinates ? (
                      <div className="space-y-4">
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-rose-100 bg-white/70 p-4 dark:border-rose-900/30 dark:bg-slate-900/30">
                            <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                              Student Destination
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                              {selectedTicket.location}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              GPS {formatCoordinates(studentCoordinates)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-blue-100 bg-white/70 p-4 dark:border-blue-900/30 dark:bg-slate-900/30">
                            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                              Assigned Technician
                            </p>
                            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                              {assignedTechnician?.fullName || 'Not assigned yet'}
                            </p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                              {assignedTechnician?.currentLocation || 'Waiting for technician live GPS'}
                            </p>
                            {assignedTechnician?.trackingUpdatedAt && (
                              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                                Updated {new Date(assignedTechnician.trackingUpdatedAt).toLocaleTimeString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {(routeDistance || routeDirection) && technicianCoordinates && (
                          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-800 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-300">
                            Technician is approximately {routeDistance?.toFixed(2) || '0.00'} km away
                            {routeDirection ? `, moving toward the ${routeDirection}` : ''}.
                          </div>
                        )}

                        <RouteMap
                          origin={technicianCoordinates}
                          destination={studentCoordinates}
                          originLabel="Technician Live Position"
                          destinationLabel="Student Issue Location"
                          height="300px"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        This ticket does not have GPS coordinates yet, so live route monitoring is unavailable.
                      </p>
                    )}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <h3 className="mb-2 flex items-center text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                    <ShieldAlert className="mr-2 h-4 w-4 text-amber-500" /> Status Flow
                  </h3>
                  <div className="rounded-xl border border-amber-100/50 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 shadow-sm backdrop-blur-md dark:border-amber-900/30 dark:from-amber-900/10 dark:to-orange-900/10">
                     <div className="flex flex-col md:flex-row md:items-center gap-4">
                       <div className="flex-1">
                         <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                           Lifecycle Stage
                         </label>
                         <p className="text-xs text-slate-500 dark:text-slate-400">
                           Update the workflow status.
                         </p>
                       </div>
                       <div className="flex-[2]">
                        <select
                          value={selectedTicket.status}
                          onChange={(event) => handleStatusChange(selectedTicket.id, event.target.value)}
                          disabled={actioning === `status-${selectedTicket.id}`}
                          className="w-full rounded-xl border-2 border-white bg-white/80 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition-all focus:border-amber-400 focus:ring-4 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
                        >
                          <option value="OPEN">💡 Open</option>
                          <option value="IN_PROGRESS">⚙️ In Progress</option>
                          <option value="RESOLVED">✅ Resolved</option>
                          <option value="REJECTED">❌ Rejected</option>
                          <option value="CLOSED">🔒 Closed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                  <h3 className="mb-2 flex items-center text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-slate-200">
                    <MessageSquare className="mr-2 h-4 w-4 text-emerald-500" /> Administrative Notes
                  </h3>
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-emerald-100/60 dark:border-emerald-900/30">
                    <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-emerald-400 to-teal-500 z-10"></div>
                    <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 p-5 pl-6 dark:from-emerald-900/10 dark:to-teal-900/10 backdrop-blur-xl">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-500 uppercase tracking-widest bg-emerald-100/50 dark:bg-emerald-900/50 px-2 py-0.5 rounded inline-block">Confidential Log</p>
                      </div>
                      <textarea
                        value={adminNote}
                        onChange={(event) => setAdminNote(event.target.value)}
                        placeholder="Document internal updates, follow-ups, or evidence notes here..."
                        className="w-full min-h-[80px] bg-white/60 dark:bg-slate-900/40 rounded-xl p-3 text-sm font-medium placeholder-emerald-700/40 dark:placeholder-emerald-400/30 text-slate-900 dark:text-emerald-100 outline-none border-2 border-transparent focus:border-emerald-400/50 focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                      />
                      <div className="flex justify-end mt-3">
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-sm shadow-emerald-500/30 transition-all hover:-translate-y-0.5 px-4 py-1.5 rounded-lg text-sm font-semibold"
                          size="sm"
                          onClick={handleSaveNote}
                          isLoading={actioning === `note-${selectedTicket.id}`}
                          disabled={!adminNote.trim() || adminNote === selectedTicket.adminNote}
                        >
                          Save Note
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </>
          ) : (
             <div className="flex flex-1 flex-col items-center justify-center p-12 text-slate-500 dark:text-slate-400 text-center bg-slate-50/50 dark:bg-slate-900/20">
               <motion.div 
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: 'spring', bounce: 0.5 }}
                 className="relative mb-8"
               >
                 <div className="absolute inset-0 bg-indigo-200 dark:bg-indigo-900/50 rotate-6 rounded-3xl"></div>
                 <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl shadow-indigo-100 dark:shadow-none border border-slate-100 dark:border-slate-700">
                    <ShieldAlert className="h-16 w-16 text-indigo-500 dark:text-indigo-400 mb-4 mx-auto" />
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">
                      Command Center Ready
                    </h3>
                    <p className="max-w-xs text-sm font-medium leading-relaxed">
                      Select a ticket from the queue to review details, dispatch technicians, and resolve issues.
                    </p>
                 </div>
               </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function getPriorityVariant(priority) {
  if (priority === 'CRITICAL') return 'danger';
  if (priority === 'HIGH') return 'warning';
  if (priority === 'MEDIUM') return 'info';
  return 'default';
}
