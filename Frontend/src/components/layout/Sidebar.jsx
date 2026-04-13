import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LayoutDashboardIcon,
    MapIcon,
    TicketIcon,
    SettingsIcon,
    ShieldIcon,
    WrenchIcon,
    ChevronLeftIcon,
    GraduationCapIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    const mainNav = [
        { name: 'Dashboard', path: '/Student/dashboard', icon: LayoutDashboardIcon },
        { name: 'Tickets', path: '/Student/tickets', icon: TicketIcon },
        { name: 'Campus Map', path: '/Student/campus-map', icon: MapIcon }
    ];

    const adminNav = [
        { name: 'Admin Dashboard', path: '/Admin/dashboard', icon: ShieldIcon },
        { name: 'Campus Map', path: '/Admin/campus-map', icon: MapIcon },
        { name: 'Manage Tickets', path: '/Admin/tickets', icon: TicketIcon },
        { name: 'Technicians', path: '/Admin/technicians', icon: WrenchIcon }
    ];

    const techNav = [
        { name: 'My Assignments', path: '/Technician/dashboard', icon: WrenchIcon },
        { name: 'Campus Map', path: '/Technician/campus-map', icon: MapIcon }
    ];

    const NavItem = ({ item }) => {
        const Icon = item.icon;
        return (
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    `flex items-center px-3 py-2.5 rounded-lg mb-1 transition-all duration-200 group ${isActive
                        ? 'bg-brand-purple/10 text-brand-purple dark:text-purple-400 font-medium relative'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-brand-surface-hover'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <motion.div
                                layoutId="activeNav"
                                className="absolute left-0 top-0 bottom-0 w-1 bg-brand-purple rounded-r-full"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <Icon
                            className={`w-5 h-5 flex-shrink-0 ${collapsed ? 'mx-auto' : 'mr-3'
                                } ${isActive
                                    ? 'text-brand-purple dark:text-purple-400'
                                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                }`}
                        />
                        {!collapsed && <span className="truncate">{item.name}</span>}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 260 }}
            className="h-screen bg-white dark:bg-brand-surface border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 sticky top-0"
        >
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
                {!collapsed && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <div className="bg-brand-purple p-1.5 rounded-lg">
                            <GraduationCapIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                            Smart Campus Hub
                        </span>
                    </div>
                )}
                {collapsed && (
                    <div className="mx-auto bg-brand-purple p-1.5 rounded-lg">
                        <GraduationCapIcon className="w-5 h-5 text-white" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`p-1.5 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${collapsed ? 'hidden' : 'block'
                        }`}
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
                {user?.role === 'USER' && (
                    <div className="mb-6">
                        {!collapsed && (
                            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                Main Menu
                            </p>
                        )}
                        {mainNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                )}

                {user?.role === 'ADMIN' && (
                    <div className="mb-6">
                        {!collapsed && (
                            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                Administration
                            </p>
                        )}
                        {adminNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                )}

                {user?.role === 'TECHNICIAN' && (
                    <div className="mb-6">
                        {!collapsed && (
                            <p className="px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                Operations
                            </p>
                        )}
                        {techNav.map((item) => (
                            <NavItem key={item.path} item={item} />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800">
                <NavItem
                    item={{
                        name: 'Settings',
                        path:
                            user?.role === 'ADMIN'
                                ? '/Admin/settings'
                                : user?.role === 'TECHNICIAN'
                                    ? '/Technician/settings'
                                    : '/Student/settings',
                        icon: SettingsIcon
                    }}
                />
            </div>
        </motion.aside>
    );
}