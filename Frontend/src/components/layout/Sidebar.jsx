import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLayout, FiMap, FiTool, FiChevronLeft, FiSettings, FiShield, FiUsers, FiCalendar } from 'react-icons/fi';
import { FaGraduationCap, FaTicketAlt } from 'react-icons/fa';
import { RiAdminFill } from 'react-icons/ri';
import { MdEngineering } from 'react-icons/md';
import { PiStudentFill } from 'react-icons/pi';

import { useAuth } from '../../contexts/AuthContext';
import { studentRoutes } from '../../utils/routes';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();
    
    // User role fallback
    const role = user?.role || 'USER';

    const getRoleDesign = (role) => {
        switch (role) {
            case 'ADMIN':
                return {
                    color: 'from-orange-500 to-red-600',
                    bg: 'bg-red-500/10 text-red-500',
                    icon: <RiAdminFill className="text-xl" />,
                    label: 'Administrator'
                };
            case 'TECHNICIAN':
                return {
                    color: 'from-emerald-400 to-emerald-600',
                    bg: 'bg-emerald-500/10 text-emerald-500',
                    icon: <MdEngineering className="text-xl" />,
                    label: 'Technician'
                };
            default:
                return {
                    color: 'from-blue-500 to-indigo-600',
                    bg: 'bg-blue-500/10 text-blue-500',
                    icon: <PiStudentFill className="text-xl" />,
                    label: 'Student'
                };
        }
    };

    const currentRoleDesign = getRoleDesign(role);

    const mainNav = [
        { name: 'Dashboard', path: studentRoutes.dashboard, icon: FiLayout },
        { name: 'Tickets', path: studentRoutes.newTicket, icon: FaTicketAlt },
        { name: 'Booking Resources', path: studentRoutes.bookingResources, icon: FiCalendar },
        { name: 'Campus Map', path: studentRoutes.campusMap, icon: FiMap }
    ];

    const adminNav = [
        { name: 'Admin Dashboard', path: '/Admin/dashboard', icon: FiShield },
        { name: 'User Management', path: '/Admin/users', icon: FiUsers },
        { name: 'Technicians', path: '/Admin/technicians', icon: FiTool }
    ];

    const techNav = [
        { name: 'My Assignments', path: '/Technician/dashboard', icon: FiTool },
        { name: 'Campus Map', path: '/Technician/campus-map', icon: FiMap }
    ];

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    `flex items-center px-4 py-3 rounded-xl mb-2 transition-all duration-300 group relative overflow-hidden ${isActive
                        ? 'bg-gradient-to-r ' + currentRoleDesign.color + ' text-white shadow-lg shadow-current/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        <Icon
                            className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${collapsed ? 'mx-auto scale-110' : 'mr-4'} ${
                                isActive ? 'text-white drop-shadow-md' : 'text-slate-400 group-hover:text-current'
                            } ${isActive && !collapsed && 'scale-110'}`}
                        />
                        {!collapsed && (
                            <span className={`font-medium tracking-wide ${isActive ? 'font-semibold' : ''}`}>
                                {item.name}
                            </span>
                        )}
                        {isActive && !collapsed && (
                            <motion.div
                                layoutId="activeNavHighlight"
                                className="absolute inset-0 bg-white/20 z-[-1]"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 90 : 280 }}
            className={`h-screen bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-800/50 flex flex-col z-20 sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.2)]`}
        >
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-200/50 dark:border-slate-800/50 relative">
                {!collapsed && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentRoleDesign.color} shadow-lg`}>
                            <FaGraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                                Smart Campus
                            </span>
                        </div>
                    </div>
                )}
                {collapsed && (
                    <div className={`mx-auto p-2.5 rounded-xl bg-gradient-to-br ${currentRoleDesign.color} shadow-lg cursor-pointer`} onClick={() => setCollapsed(!collapsed)}>
                        <FaGraduationCap className="w-6 h-6 text-white" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`absolute -right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-md z-30 transition-transform hover:scale-110 ${collapsed ? 'rotate-180 translate-x-2' : ''}`}
                >
                    <FiChevronLeft className="w-4 h-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
                
                {/* ROLE HIGHLIGHT CARD */}
                {!collapsed && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mb-8 p-4 rounded-2xl flex items-center gap-4 border border-slate-100 dark:border-slate-800/60 ${currentRoleDesign.bg}`}
                    >
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 shadow-sm">
                            {currentRoleDesign.icon}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase tracking-wider opacity-80">Current Role</span>
                            <span className="text-sm font-semibold">{currentRoleDesign.label}</span>
                        </div>
                    </motion.div>
                )}

                {role === 'USER' && (
                    <div className="mb-8">
                        {!collapsed && (
                            <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                Main Menu
                            </p>
                        )}
                        {mainNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                )}

                {role === 'ADMIN' && (
                    <div className="mb-8">
                        {!collapsed && (
                            <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                Administration
                            </p>
                        )}
                        {adminNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                )}

                {role === 'TECHNICIAN' && (
                    <div className="mb-8">
                        {!collapsed && (
                            <p className="px-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">
                                Operations
                            </p>
                        )}
                        {techNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-md">
                <NavItem
                    item={{
                        name: 'Settings',
                        path:
                            role === 'ADMIN'
                                ? '/Admin/settings'
                                : role === 'TECHNICIAN'
                                    ? '/Technician/settings'
                                    : '/Student/settings',
                        icon: FiSettings
                    }}
                />
            </div>

        </motion.aside>
    );
}
