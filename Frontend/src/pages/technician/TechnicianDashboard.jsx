import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  CheckCircle,
  Clock,
  List,
  MapPin,
  AlertTriangle,
  MessageSquare } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { mockTickets, mockUsers } from '../../data/mockData';
export function TechnicianDashboard() {
  // Mock current technician ID
  const techId = 't1';
  const [tickets, setTickets] = useState(
    mockTickets.filter((t) => t.assignedTo === techId || t.status === 'OPEN')
  );
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const assignedTickets = tickets.filter((t) => t.assignedTo === techId);
  const inProgressTickets = assignedTickets.filter(
    (t) => t.status === 'IN_PROGRESS'
  );
  const resolvedToday = assignedTickets.filter(
    (t) => t.status === 'RESOLVED'
  ).length;
  const pendingFollowUps = assignedTickets.filter(
    (t) => t.status === 'OPEN'
  ).length;
  const handleUpdateClick = (ticket) => {
    setSelectedTicket(ticket);
    setUpdateStatus(ticket.status === 'OPEN' ? 'IN_PROGRESS' : ticket.status);
    setIsUpdateModalOpen(true);
  };
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (selectedTicket) {
      setTickets(
        tickets.map((t) =>
        t.id === selectedTicket.id ?
        {
          ...t,
          status: updateStatus
        } :
        t
        )
      );
      setIsUpdateModalOpen(false);
      setSelectedTicket(null);
      setResolutionNotes('');
    }
  };
  // Sort by priority (CRITICAL first)
  const sortedTickets = [...assignedTickets].sort((a, b) => {
    const priorityWeight = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1
    };
    return priorityWeight[b.priority] - priorityWeight[a.priority];
  });
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
      </div>

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
            <Card
              key={ticket.id}
              className="p-5 hover:shadow-md transition-shadow border-l-4"
              style={{
                borderLeftColor:
                ticket.priority === 'CRITICAL' ?
                '#ef4444' :
                ticket.priority === 'HIGH' ?
                '#f59e0b' :
                ticket.priority === 'MEDIUM' ?
                '#3b82f6' :
                '#94a3b8'
              }}>
              
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
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" /> {ticket.location}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />{' '}
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <StatusBadge status={ticket.status} />
                        <div className="flex space-x-2">
                          <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                        window.location.href = `/tickets/${ticket.id}`
                        }>
                        
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
    </motion.div>);

}
