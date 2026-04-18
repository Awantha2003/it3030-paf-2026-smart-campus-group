import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTool, FiAlertCircle, FiChevronRight, FiShield, FiMail, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { getStudentIssueReports, createIssueReport } from '../../api/issues';
import { studentRoutes } from '../../utils/routes';

export function UserDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [isLoadingTickets, setIsLoadingTickets] = useState(true);
    const [ticketError, setTicketError] = useState('');
    
    // Emergency states
    const [isEmergencyLoading, setIsEmergencyLoading] = useState(false);
    const [emergencyStatus, setEmergencyStatus] = useState('');

    const handleEmergency = async () => {
        setIsEmergencyLoading(true);
        setEmergencyStatus('Detecting location...');
        
        if (!navigator.geolocation) {
            setEmergencyStatus('Geolocation is not supported by your browser.');
            setIsEmergencyLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                const locationString = `Emergency GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                setEmergencyStatus('Assigning technician...');

                try {
                    await createIssueReport({
                        title: "EMERGENCY ASSISTANCE REQUIRED",
                        description: "Emergency generated from student dashboard. Immediate dispatch required.",
                        category: "Emergency",
                        location: locationString,
                        priority: "CRITICAL",
                        studentId: user?.id || '',
                        studentName: user?.name || 'Student',
                        studentEmail: user?.email || 'unknown@student.com',
                        registrationNumber: "EMERGENCY",
                        faculty: "General",
                        contactNumber: "Emergency",
                        requestType: "Emergency",
                        requestSubType: "Immediate Dispatch",
                        department: "Security"
                    });
                    setEmergencyStatus('Technician dispatched successfully!');
                    
                    // Refresh tickets list
                    const response = await getStudentIssueReports(user.id);
                    setTickets(Array.isArray(response) ? response : []);
                } catch (error) {
                    setEmergencyStatus(error.message || 'Failed to dispatch technician.');
                } finally {
                    setTimeout(() => { setIsEmergencyLoading(false); setEmergencyStatus(''); }, 3000);
                }
            },
            (error) => {
                setEmergencyStatus('Failed to get location. Access denied or unavailable.');
                setIsEmergencyLoading(false);
                setTimeout(() => { setEmergencyStatus(''); }, 3000);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };


    // Mock 2FA status
    const mfaEnabled = true;
    const userName = user?.name ? user.name.split(' ')[0] : 'Student';

    useEffect(() => {
        let ignore = false;

        async function loadStudentTickets() {
            if (!user?.id) {
                setTickets([]);
                setIsLoadingTickets(false);
                return;
            }

            setIsLoadingTickets(true);
            setTicketError('');

            try {
                const response = await getStudentIssueReports(user.id);

                if (!ignore) {
                    setTickets(Array.isArray(response) ? response : []);
                }
            } catch (error) {
                if (!ignore) {
                    setTicketError(error.message || 'Failed to load active tickets.');
                    setTickets([]);
                }
            } finally {
                if (!ignore) {
                    setIsLoadingTickets(false);
                }
            }
        }

        loadStudentTickets();

        return () => {
            ignore = true;
        };
    }, [user?.id]);

    const activeTickets = useMemo(
        () =>
            tickets
                .filter(
                    (ticket) =>
                        ticket.status !== 'RESOLVED' &&
                        ticket.status !== 'CLOSED' &&
                        ticket.status !== 'REJECTED'
                )
                .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
        [tickets]
    );

    const attentionCount = useMemo(
        () =>
            activeTickets.filter(
                (ticket) => ticket.priority === 'CRITICAL' || ticket.priority === 'HIGH' || ticket.status === 'OPEN'
            ).length,
        [activeTickets]
    );

    const activeTicketTrend = isLoadingTickets
        ? 'Loading live ticket data'
        : ticketError
          ? 'Live ticket data unavailable'
          : attentionCount > 0
            ? `${attentionCount} require${attentionCount === 1 ? 's' : ''} attention`
            : activeTickets.length > 0
              ? 'All active tickets are progressing'
              : 'No active tickets right now';

    const stats = [
        {
            label: 'Active Tickets',
            value: isLoadingTickets ? '...' : String(activeTickets.length),
            trend: activeTicketTrend,
            icon: FiTool,
            gradient: 'from-orange-400 to-red-500',
            shadow: 'shadow-orange-500/30'
        },
        {
            label: '2-Step Verification',
            value: mfaEnabled ? 'Secured' : 'Action Needed',
            trend: mfaEnabled ? 'Account is protected' : 'Setup highly recommended',
            icon: mfaEnabled ? FiCheckCircle : FiShield,
            gradient: mfaEnabled ? 'from-emerald-400 to-teal-500' : 'from-slate-400 to-slate-600',
            shadow: mfaEnabled ? 'shadow-emerald-500/30' : 'shadow-slate-500/20'
        }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                    <FiShield className="w-64 h-64 text-white" />
                </div>
                <div className="z-10">
                    <h1 className="text-3xl font-extrabold text-white mb-2">
                        Welcome back, {userName}
                    </h1>
                    <p className="text-blue-100 text-lg font-medium opacity-90">
                        Stay on top of your campus activities and security.
                    </p>
                </div>
                <div className="z-10 flex flex-col gap-2 relative mt-4 md:mt-0">
                    <div className="flex gap-4">
                        <Button 
                            variant="secondary" 
                            onClick={handleEmergency}
                            disabled={isEmergencyLoading}
                            className="bg-red-500 hover:bg-red-600 border-none text-white shadow-lg shadow-red-500/40 relative overflow-hidden group"
                            leftIcon={
                                <div className="relative">
                                    <span className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></span>
                                    <FiAlertTriangle className="relative w-5 h-5" />
                                </div>
                            }
                        >
                            <span className="relative z-10 font-bold">
                                {isEmergencyLoading ? 'Dispatching...' : 'Emergency'}
                            </span>
                            <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => navigate(studentRoutes.newTicket)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white shadow-sm"
                            leftIcon={<FiAlertCircle className="w-5 h-5" />}
                        >
                            Report Issue
                        </Button>
                    </div>
                    {emergencyStatus && (
                        <p className="text-white text-sm font-medium absolute -bottom-6 w-full whitespace-nowrap drop-shadow-sm flex items-center justify-center">
                            {emergencyStatus}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg relative overflow-hidden group">
                            <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${stat.gradient}`} />
                            <CardContent className="p-6 flex items-center gap-5">
                                <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow} group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">
                                        {stat.label}
                                    </p>
                                    <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
                                        {stat.value}
                                    </h3>
                                    <p className={`text-xs font-semibold ${mfaEnabled && i === 1 ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {stat.trend}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="shadow-lg border-0 rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-between">
                        <div>
                            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <FiTool className="text-blue-500" /> My Active Tickets
                            </h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(studentRoutes.tickets)}
                            className="hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            rightIcon={<FiChevronRight className="w-4 h-4" />}
                        >
                            View All
                        </Button>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-0 flex-1 bg-white dark:bg-slate-900">
                        {ticketError ? (
                            <div className="p-5 text-sm font-medium text-red-600 dark:text-red-400">
                                {ticketError}
                            </div>
                        ) : null}

                        {isLoadingTickets ? (
                            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
                                Loading your active tickets...
                            </div>
                        ) : null}

                        {!isLoadingTickets && !ticketError && activeTickets.length === 0 ? (
                            <div className="p-5 text-sm text-slate-500 dark:text-slate-400">
                                No active tickets found. New issues you report will appear here.
                            </div>
                        ) : null}

                        {!isLoadingTickets && !ticketError && activeTickets.slice(0, 4).map((ticket) => (
                            <button
                                key={ticket.id}
                                type="button"
                                onClick={() => navigate(studentRoutes.ticketDetail(ticket.id))}
                                className="w-full p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group text-left"
                            >
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-md group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {ticket.title}
                                    </p>
                                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                        {ticket.location}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                        Reported {new Date(ticket.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-2.5 h-2.5 rounded-full shadow-sm ${ticket.priority === 'CRITICAL' ? 'bg-red-500 shadow-red-500/50' : ticket.priority === 'HIGH' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}
                                    ></span>
                                    <StatusBadge status={ticket.status} />
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>

                <Card className="shadow-lg border-0 rounded-2xl overflow-hidden flex flex-col">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex flex-row items-center justify-between">
                        <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <FiShield className="text-purple-500" /> Account Security
                        </h3>
                        <Link to="/settings">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                                rightIcon={<FiChevronRight className="w-4 h-4" />}
                            >
                                Settings
                            </Button>
                        </Link>
                    </div>
                    <CardContent className="p-6 bg-white dark:bg-slate-900 flex-1">
                         <div className="flex flex-col gap-5">
                             <div className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors">
                                 <div className="flex items-center gap-4">
                                     <div className={`p-3 rounded-2xl shadow-sm ${mfaEnabled ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 group-hover:scale-110 transition-transform' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
                                         <FiShield className="w-6 h-6" />
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-900 dark:text-white text-md">Two-Factor Authentication</p>
                                         <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                             {mfaEnabled ? 'Your account is deeply secured with 2FA.' : 'Not set up. Setup is highly recommended.'}
                                         </p>
                                     </div>
                                 </div>
                                 {!mfaEnabled && (
                                     <Link to="/settings/2fa/setup">
                                         <Button variant="outline" size="sm" className="font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800">Set Up</Button>
                                     </Link>
                                 )}
                             </div>
                             
                             <div className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl hover:border-blue-200 dark:hover:border-blue-800/50 transition-colors">
                                 <div className="flex items-center gap-4">
                                     <div className="p-3 rounded-2xl shadow-sm bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                         <FiMail className="w-6 h-6" />
                                     </div>
                                     <div>
                                         <p className="font-bold text-slate-900 dark:text-white text-md">Recent Notifications</p>
                                         <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                             You have 3 unread security messages.
                                         </p>
                                     </div>
                                 </div>
                                 <Link to="/notifications">
                                    <Button variant="ghost" size="sm" className="font-bold hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400">View</Button>
                                 </Link>
                             </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
