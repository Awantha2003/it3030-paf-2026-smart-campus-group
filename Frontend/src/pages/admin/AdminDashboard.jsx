import React from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiArrowRight, FiCheckCircle, FiClock, FiAlertTriangle, FiShield, FiLock, FiSmartphone } from 'react-icons/fi';
import { FaUserShield, FaTools, FaBuilding, FaTicketAlt } from 'react-icons/fa';
import { PiBuildingOfficeBold } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { mockTickets } from '../../data/mockData';
import { adminRoutes } from '../../utils/routes';
import { useAuth } from '../../contexts/AuthContext';

export function AdminDashboard() {
    const { user } = useAuth();
    
    const openTickets = mockTickets.filter((ticket) => ticket.status === 'OPEN');
    const inProgressTickets = mockTickets.filter((ticket) => ticket.status === 'IN_PROGRESS');
    const resolvedTickets = mockTickets.filter((ticket) => ticket.status === 'RESOLVED');
    const criticalTickets = mockTickets.filter(
        (ticket) => ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH'
    );

    // Mock data for user accounts
    const activeUsers = 124;
    const pendingRoles = 3;
    const mfaAdopted = 89; // percentage

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-red-600 to-orange-500 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <FaUserShield className="w-64 h-64 text-white" />
                </div>
                <div className="z-10">
                    <h1 className="text-3xl font-extrabold text-white mb-2 drop-shadow-sm">
                        Welcome back, {user?.name || 'Admin'}
                    </h1>
                    <p className="text-red-50 text-lg font-medium opacity-90">
                        Platform Operations & Security Overview
                    </p>
                    {user?.email && (
                        <div className="mt-3 inline-flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                            <FiUsers className="text-white/80 w-4 h-4" />
                            <span className="text-white/90 text-sm font-semibold tracking-wide">
                                {user.email} &bull; {user.role || 'ADMIN'}
                            </span>
                        </div>
                    )}
                </div>
                <div className="z-10 flex flex-wrap gap-4">
                    <Link
                        to="/Admin/users"
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FiUsers className="w-5 h-5" />
                        Users
                    </Link>
                    <Link
                        to="/Admin/facilities"
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
                    >
                        <PiBuildingOfficeBold className="w-5 h-5" />
                        Facilities
                    </Link>
                    <Link
                        to="/Admin/bookings"
                        className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
                    >
                        <FaTicketAlt className="w-5 h-5" />
                        Bookings
                    </Link>
                </div>
            </div>

            {/* SECURITY & IDENTITY METRICS */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FiShield className="text-blue-500" /> Identity & Security
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-shadow border-blue-100 dark:border-blue-900/40">
                        <div className="absolute -right-6 -top-6 text-blue-500/10 group-hover:scale-110 transition-transform">
                            <FiUsers className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-500/30">
                                <FiUsers className="w-6 h-6" />
                            </div>
                            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">{activeUsers}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Active Users</p>
                            {pendingRoles > 0 && (
                                <span className="inline-flex mt-3 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                                    {pendingRoles} Pending Verifications
                                </span>
                            )}
                        </div>
                    </Card>

                    <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-shadow border-emerald-100 dark:border-emerald-900/40">
                        <div className="absolute -right-6 -top-6 text-emerald-500/10 group-hover:scale-110 transition-transform">
                            <FiSmartphone className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-emerald-500/30">
                                <FiSmartphone className="w-6 h-6" />
                            </div>
                            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-1">{mfaAdopted}%</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">MFA Adoption Rate</p>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-4">
                                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${mfaAdopted}%` }}></div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 relative overflow-hidden group hover:shadow-xl transition-shadow border-purple-100 dark:border-purple-900/40">
                        <div className="absolute -right-6 -top-6 text-purple-500/10 group-hover:scale-110 transition-transform">
                            <FiLock className="w-32 h-32" />
                        </div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/30">
                                    <FiLock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">System Security</h3>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">All services running secure.</p>
                            </div>
                            <Link to="/admin/settings" className="text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center mt-4">
                                View Access Logs <FiArrowRight className="ml-1" />
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>

            {/* TICKETS & OPERATIONS */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <FaTools className="text-orange-500" /> Maintenance Operations
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-red-500">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl shadow-inner">
                            <FiAlertTriangle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Critical</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{criticalTickets.length}</h3>
                        </div>
                    </Card>

                    <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-amber-500">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl shadow-inner">
                            <FiClock className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Open Queue</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{openTickets.length}</h3>
                        </div>
                    </Card>

                    <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-blue-500">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl shadow-inner">
                            <FaTools className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">In Progress</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{inProgressTickets.length}</h3>
                        </div>
                    </Card>

                    <Card className="p-5 flex items-center space-x-4 border-l-4 border-l-emerald-500">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-inner">
                            <FiCheckCircle className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Resolved</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{resolvedTickets.length}</h3>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 flex flex-col shadow-sm border border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiAlertTriangle className="text-red-500" /> Priority Issue Queue
                            </h3>
                            <p className="text-sm text-slate-500">Items requiring immediate administrative attention.</p>
                        </div>
                        <Link
                            to={adminRoutes.tickets}
                            className="text-sm px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors flex items-center"
                        >
                            View All <FiArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                    </div>
                    <div className="p-0 flex-1">
                        {criticalTickets.length > 0 ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {criticalTickets.map((ticket) => (
                                    <li
                                        key={ticket.id}
                                        className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between group"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {ticket.title}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium truncate flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span> {ticket.location}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            <Badge variant={ticket.priority === 'CRITICAL' ? 'danger' : 'warning'} className="shadow-sm">
                                                {ticket.priority}
                                            </Badge>
                                            <StatusBadge status={ticket.status} />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-10 flex flex-col items-center justify-center text-slate-500">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                    <FiCheckCircle className="w-8 h-8 text-emerald-500" />
                                </div>
                                <p className="font-semibold text-slate-600 dark:text-slate-400">All clear!</p>
                                <p className="text-sm text-slate-400 mt-1">No critical tickets in queue.</p>
                            </div>
                        )}
                    </div>
                </Card>

                <Card className="p-6 relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-xl shadow-indigo-900/20 border-0 rounded-2xl flex flex-col justify-between h-full group">
                    <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                        <FaTools className="w-48 h-48" />
                    </div>
                    <div>
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-indigo-300 mb-6 shadow-lg border border-white/10">
                            <FaTools className="w-7 h-7 border-indigo-300" />
                        </div>
                        <h3 className="text-2xl font-extrabold mb-2">
                            Technician Roster
                        </h3>
                        <p className="text-indigo-200 text-sm leading-relaxed font-medium mb-8">
                            Configure technician accounts, reset MFA devices, and organize your maintenance squads effectively.
                        </p>
                    </div>
                    <Link
                        to={adminRoutes.technicians}
                        className="w-full inline-flex items-center justify-between rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-3.5 text-sm font-bold text-white transition-all shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5"
                    >
                        Manage Technicians <FiArrowRight className="w-5 h-5" />
                    </Link>
                </Card>
            </div>
        </motion.div>
    );
}
