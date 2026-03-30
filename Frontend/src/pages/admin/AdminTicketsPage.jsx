import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  MapPin,
  User,
  MessageSquare,
  CheckCircle,
  XCircle } from
'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { StatusBadge } from '../../components/ui/Badge';
import { mockTickets, mockUsers } from '../../data/mockData';
const ticketTabs = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
export function AdminTicketsPage() {
  const [tickets, setTickets] = useState(mockTickets);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const filteredTickets = tickets.filter((t) => {
    const matchesTab = activeTab === 'ALL' || t.status === activeTab;
    const matchesSearch =
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });
  const handleAssign = (ticketId, technicianId) => {
    setTickets(
      tickets.map((t) =>
      t.id === ticketId ?
      {
        ...t,
        assignedTo: technicianId,
        status: 'IN_PROGRESS'
      } :
      t
      )
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        assignedTo: technicianId,
        status: 'IN_PROGRESS'
      });
    }
  };
  const handleStatusChange = (ticketId, status) => {
    setTickets(
      tickets.map((t) =>
      t.id === ticketId ?
      {
        ...t,
        status
      } :
      t
      )
    );
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({
        ...selectedTicket,
        status
      });
    }
  };
  const technicians = Object.values(mockUsers).filter(
    (u) => u.role === 'TECHNICIAN'
  );
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
      className="h-[calc(100vh-8rem)] flex flex-col">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Ticket Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Triage, assign, and resolve campus incidents
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel - Ticket List */}
        <Card className="w-full lg:w-1/3 flex flex-col p-0 overflow-hidden border-r border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all text-slate-900 dark:text-white" />
              
            </div>
            <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              {ticketTabs.map((tab) =>
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}>
                
                  {tab.replace('_', ' ')}
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {filteredTickets.map((ticket) =>
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(ticket)}
              className={`p-3 rounded-xl cursor-pointer transition-all border ${selectedTicket?.id === ticket.id ? 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800/50 shadow-sm' : 'bg-white border-transparent hover:border-slate-200 dark:bg-slate-800/50 dark:hover:border-slate-700'}`}>
              
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-500">
                      {ticket.id}
                    </span>
                    <Badge
                    variant={
                    ticket.priority === 'CRITICAL' ?
                    'danger' :
                    ticket.priority === 'HIGH' ?
                    'warning' :
                    'default'
                    }
                    className="scale-90 origin-left">
                    
                      {ticket.priority}
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                  {ticket.title}
                </h4>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <MapPin className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{ticket.location}</span>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                  <StatusBadge status={ticket.status} />
                  {ticket.assignedTo ?
                <img
                  src={
                  mockUsers[
                  Object.keys(mockUsers).find(
                    (k) => mockUsers[k].id === ticket.assignedTo
                  ) || 'tech']?.
                  avatar
                  }
                  alt="Tech"
                  className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-800"
                  title="Assigned" /> :


                <span className="text-xs text-red-500 font-medium">
                      Unassigned
                    </span>
                }
                </div>
              </div>
            )}
            {filteredTickets.length === 0 &&
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                <p className="text-sm">No tickets found</p>
              </div>
            }
          </div>
        </Card>

        {/* Right Panel - Ticket Detail */}
        <Card className="hidden lg:flex flex-col w-2/3 p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
          {selectedTicket ?
          <>
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 shrink-0 flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-sm font-medium text-slate-500">
                      {selectedTicket.id}
                    </span>
                    <Badge
                    variant={
                    selectedTicket.priority === 'CRITICAL' ?
                    'danger' :
                    selectedTicket.priority === 'HIGH' ?
                    'warning' :
                    'default'
                    }>
                    
                      {selectedTicket.priority}
                    </Badge>
                    <StatusBadge status={selectedTicket.status} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {selectedTicket.title}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400">
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />{' '}
                      {selectedTicket.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />{' '}
                      {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                  handleStatusChange(selectedTicket.id, 'RESOLVED')
                  }
                  disabled={selectedTicket.status === 'RESOLVED'}>
                  
                    <CheckCircle className="w-4 h-4 mr-2" /> Mark Resolved
                  </Button>
                  <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                  handleStatusChange(selectedTicket.id, 'REJECTED')
                  }
                  disabled={selectedTicket.status === 'REJECTED'}>
                  
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">
                    Description
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                    {selectedTicket.description}
                  </p>
                </div>

                {/* Assignment & Status */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Assignment
                    </h3>
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <label className="block text-xs text-slate-500 mb-2">
                        Assign Technician
                      </label>
                      <select
                      value={selectedTicket.assignedTo || ''}
                      onChange={(e) =>
                      handleAssign(selectedTicket.id, e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white">
                      
                        <option value="" disabled>
                          Select a technician...
                        </option>
                        {technicians.map((tech) =>
                      <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                      )}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Status Management
                    </h3>
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                      <label className="block text-xs text-slate-500 mb-2">
                        Update Status
                      </label>
                      <select
                      value={selectedTicket.status}
                      onChange={(e) =>
                      handleStatusChange(selectedTicket.id, e.target.value)
                      }
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-white">
                      
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Admin Notes */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 uppercase tracking-wider flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" /> Admin Notes
                  </h3>
                  <div className="space-y-3">
                    <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Add internal notes (not visible to user)..."
                    className="w-full px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white resize-none"
                    rows={3} />
                  
                    <div className="flex justify-end">
                      <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAdminNote('')}
                      disabled={!adminNote.trim()}>
                      
                        Save Note
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </> :

          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-8">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              </div>
              <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">
                No Ticket Selected
              </h3>
              <p className="text-center max-w-md">
                Select a ticket from the list on the left to view its details,
                assign technicians, and manage its status.
              </p>
            </div>
          }
        </Card>
      </div>
    </motion.div>);

}
