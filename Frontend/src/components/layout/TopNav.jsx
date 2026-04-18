import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Plus, Bell, Wrench, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import api from '../../api/axiosInstance';

export function TopNav() {
    const { isDark, toggleTheme } = useTheme();
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    
    // For live pop-up toast on recent login/activity
    const [recentPopup, setRecentPopup] = useState(null);
    const [prevUnread, setPrevUnread] = useState(-1);

    const fetchNotificationsData = async () => {
        if (user) {
            try {
                const resCount = await api.get('/api/notifications/unread-count');
                const count = resCount.data.count;
                setUnreadCount(count);
                
                const resNotif = await api.get('/api/notifications');
                const notifs = resNotif.data;
                setNotifications(notifs.slice(0, 5)); // Keep only top 5 recent for the drawer
                
                // Pop up for newly arrived unread notifications OR if it's the first load and we have unread ones
                if (notifs.length > 0 && count > 0) {
                    const latestUnread = notifs.find(n => !(n.read ?? n.isRead));
                    setPrevUnread(currentPrev => {
                        if (latestUnread && (currentPrev === -1 || count > currentPrev)) {
                            setRecentPopup(latestUnread);
                            setTimeout(() => setRecentPopup(null), 5000);
                        }
                        return count;
                    });
                } else {
                    setPrevUnread(count);
                }
            } catch (err) {
                console.error('Failed to fetch notifications info:', err);
            }
        }
    };

    useEffect(() => {
        fetchNotificationsData();
        const intervalId = setInterval(fetchNotificationsData, 30000); // Poll every 30 seconds

        return () => clearInterval(intervalId);
    }, [user, location.pathname]);

    const pathnames = location.pathname.split('/').filter((segment) => segment);
    const breadcrumb =
        pathnames.length > 0
            ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() +
            pathnames[pathnames.length - 1].slice(1)
            : 'Dashboard';

    return (
        <>
            <header className="h-16 bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
                        {breadcrumb.replace('-', ' ')}
                    </h1>
                </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search resources, tickets..."

                        className="pl-9 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-brand-dark focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 rounded-lg text-sm transition-all outline-none text-slate-700 dark:text-slate-200"
                    />
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="hidden sm:flex"
                >

                    Quick Add
                </Button>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

                <button
                    type="button"
                    onClick={() => {
                        setShowNotifications(true);
                        fetchNotificationsData();
                    }}
                    className="relative p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-brand-surface"></span>
                    )}
                </button>

                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>


                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-brand-purple text-white flex items-center justify-center font-bold text-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    </button>

                    {showProfileMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowProfileMenu(false)}
                            ></div>
                            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-surface rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
                                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                                        {user?.name || 'Unknown User'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                        {user?.email || 'No email provided'}
                                    </p>
                                    <p className="text-xs font-bold text-brand-purple mt-1 uppercase">
                                        {user?.role || 'Guest'}
                                    </p>
                                </div>
                                <div className="p-2">
                                    <button 
                                        onClick={() => {
                                            localStorage.removeItem('token');
                                            window.location.href = '/login';
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            </header>

            <Drawer
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
                title="Notifications"
                position="right"
                width="w-full sm:w-[400px]"
                footer={
                    <Button
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                            setShowNotifications(false);
                            navigate('/notifications');
                        }}
                    >
                        View All
                    </Button>
                }
            >
                <div className="space-y-4">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={`p-4 rounded-xl border ${
                                (notif.read ?? notif.isRead)
                                    ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                                    : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                        notif.type === 'TICKET'
                                            ? 'bg-blue-100 text-brand-blue dark:bg-blue-900/30 dark:text-blue-400'
                                            : 'bg-purple-100 text-brand-purple dark:bg-purple-900/30 dark:text-purple-400'
                                    }`}
                                >
                                    {notif.type === 'TICKET' ? <Wrench className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                        {notif.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                {!(notif.read ?? notif.isRead) && (
                                    <div className="w-2.5 h-2.5 bg-brand-blue rounded-full shrink-0 mt-1" />
                                )}
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <p className="text-sm text-slate-500 text-center py-8">No notifications yet</p>
                    )}
                </div>
            </Drawer>

            {/* Notification Toast Popup */}
            {recentPopup && (
                <div className="fixed right-6 bottom-6 z-[100] max-w-sm animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="bg-white dark:bg-brand-surface shadow-2xl rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
                                <Bell className="w-5 h-5 text-brand-blue" />
                            </div>
                            <div className="flex-1 min-w-0 pr-8">
                                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                                    {recentPopup.title}
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {recentPopup.message}
                                </p>
                            </div>
                            <button
                                onClick={() => setRecentPopup(null)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
