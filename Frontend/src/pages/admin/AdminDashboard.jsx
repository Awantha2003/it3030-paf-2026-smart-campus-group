import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Clock3, Users, ArrowRight, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { mockTickets } from '../../data/mockData';

export function AdminDashboard() {
  const openTickets = mockTickets.filter((ticket) => ticket.status === 'OPEN');
  const inProgressTickets = mockTickets.filter((ticket) => ticket.status === 'IN_PROGRESS');
  const resolvedTickets = mockTickets.filter((ticket) => ticket.status === 'RESOLVED');
  const criticalTickets = mockTickets.filter(
    (ticket) => ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Command Center
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Ticket operations overview and response status
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Critical Tickets
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {criticalTickets.length}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
            <Clock3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Open Tickets
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {openTickets.length}
            </h3>
          </div>
        </Card>

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users className="w-6 h-6" />
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

        <Card className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Resolved Tickets
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {resolvedTickets.length}
            </h3>
          </div>
        </Card>
      </div>

      <Card className="flex flex-col">
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Priority Queue
          </h3>
          <Link
            to="/Admin/tickets"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            View All <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="p-0 flex-1">
          {criticalTickets.length > 0 ? (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {criticalTickets.map((ticket) => (
                <li
                  key={ticket.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {ticket.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {ticket.location}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={ticket.priority === 'CRITICAL' ? 'danger' : 'warning'}>
                      {ticket.priority}
                    </Badge>
                    <StatusBadge status={ticket.status} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center text-slate-500">No critical tickets</div>
          )}
        </div>
      </Card>

      <Card className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Technician Team Setup
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Add technician members so admins can maintain the support roster from one place.
            </p>
          </div>
        </div>
        <Link
          to="/Admin/technicians"
          className="inline-flex items-center justify-center rounded-lg bg-brand-purple px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700"
        >
          Manage Technicians <ArrowRight className="ml-2 w-4 h-4" />
        </Link>
      </Card>
    </motion.div>
  );
}
