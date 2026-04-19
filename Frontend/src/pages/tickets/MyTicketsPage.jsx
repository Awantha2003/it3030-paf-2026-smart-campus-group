import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  SearchIcon,
  MapPinIcon,
  ClockIcon,
  AlertTriangleIcon,
  ChevronRightIcon } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, Badge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { getStudentIssueReports } from '../../api/issues';
import { studentRoutes } from '../../utils/routes';
export function MyTicketsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  useEffect(() => {
    let ignore = false;

    async function loadTickets() {
      if (!user?.id) {
        setTickets([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');

      try {
        const response = await getStudentIssueReports(user.id);
        if (!ignore) {
          setTickets(response);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(error.message || 'Failed to load tickets.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadTickets();

    return () => {
      ignore = true;
    };
  }, [user?.id]);
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
    ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
    statusFilter === 'ALL' || ticket.status === statusFilter;
    const matchesPriority =
    priorityFilter === 'ALL' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-red-600 dark:text-red-400';
      case 'HIGH':
        return 'text-orange-600 dark:text-orange-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'LOW':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-600';
    }
  };
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Tickets
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track and manage your reported incidents
          </p>
        </div>
        <Button
          onClick={() => navigate(studentRoutes.newTicket)}
          leftIcon={<PlusIcon className="w-4 h-4" />}>
          
          Report Issue
        </Button>
      </div>

      <Card>
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-sm text-slate-900 dark:text-white" />
            
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-sm text-slate-900 dark:text-white">
            
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="py-2 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple text-sm text-slate-900 dark:text-white">
            
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-800">
          {errorMessage ?
          <div className="p-6 text-sm text-red-600 dark:text-red-400">{errorMessage}</div> :
          null}
          {isLoading ?
          <div className="p-6 text-sm text-slate-500 dark:text-slate-400">Loading tickets...</div> :
          null}
          {!isLoading && filteredTickets.length > 0 ?
          filteredTickets.map((ticket, index) =>
          <motion.div
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              delay: index * 0.05
            }}
            key={ticket.id}
            onClick={() => navigate(studentRoutes.ticketDetail(ticket.id))}
            className="p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {ticket.title}
                    </h3>
                    <StatusBadge status={ticket.status} />
                    <Badge
                  variant="default"
                  className="bg-slate-100 dark:bg-slate-800">
                  
                      <span
                    className={`flex items-center gap-1 ${getPriorityColor(ticket.priority)}`}>
                    
                        <AlertTriangleIcon className="w-3 h-3" />
                        {ticket.priority}
                      </span>
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{ticket.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <Button
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                rightIcon={<ChevronRightIcon className="w-4 h-4" />}>
                
                    View Ticket
                  </Button>
                </div>
              </motion.div>
          ) :
          !isLoading &&

          <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangleIcon className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">
                No tickets found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                You haven't reported any issues that match your filters.
              </p>
              <Button
              onClick={() => navigate(studentRoutes.newTicket)}
              leftIcon={<PlusIcon className="w-4 h-4" />}>
              
                Report an Issue
              </Button>
            </div>
          }
        </div>
      </Card>
    </div>);

}
