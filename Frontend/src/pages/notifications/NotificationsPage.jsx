import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Bell, Wrench, Check, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { mockNotifications } from '../../data/mockData';

const extendedNotifications = [
  ...mockNotifications,
  {
    id: 'n4',
    userId: 'u1',
    title: 'System Maintenance',
    message: 'The campus portal will be down for maintenance on Sunday 2 AM - 4 AM.',
    type: 'WARNING',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'n5',
    userId: 'u1',
    title: 'Platform Notice',
    message: 'A new help desk workflow is now available in the technician dashboard.',
    type: 'INFO',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/technician'
  },
  {
    id: 'n6',
    userId: 'u1',
    title: 'Ticket Resolved',
    message: 'Your ticket "Whiteboard markers empty" has been marked as RESOLVED.',
    type: 'SUCCESS',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/tickets/t3'
  },
  {
    id: 'n7',
    userId: 'u1',
    title: 'Ticket Escalated',
    message: 'A high-priority support ticket was escalated for immediate review.',
    type: 'INFO',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    link: '/tickets/t2'
  },
  {
    id: 'n8',
    userId: 'u1',
    title: 'Security Alert',
    message: 'New login detected from an unrecognized device.',
    type: 'ERROR',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/settings'
  }
].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

const filterTabs = ['ALL', 'UNREAD', 'TICKETS', 'SYSTEM'];

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(extendedNotifications);
  const [activeTab, setActiveTab] = useState('ALL');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleMarkAsRead = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      setNotifications(
        notifications.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    if (notification.link) navigate(notification.link);
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.read;
    if (activeTab === 'TICKETS') return n.title.toLowerCase().includes('ticket');
    if (activeTab === 'SYSTEM') return !n.title.toLowerCase().includes('ticket');
    return true;
  });

  const getIcon = (title) =>
    title.toLowerCase().includes('ticket') ? <Wrench className="w-5 h-5" /> : <Bell className="w-5 h-5" />;

  const getIconColor = (title) =>
    title.toLowerCase().includes('ticket')
      ? 'bg-blue-100 text-brand-blue dark:bg-blue-900/30 dark:text-blue-400'
      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="danger" className="text-sm px-2.5 py-0.5">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Stay updated on tickets, system notices, and campus alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" leftIcon={<Check className="w-4 h-4" />} onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <div className="bg-white dark:bg-brand-surface rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 hide-scrollbar">
          {filterTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors relative ${
                activeTab === tab
                  ? 'text-brand-purple dark:text-purple-400'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-purple dark:bg-purple-500"
                />
              )}
            </button>
          ))}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
          <AnimatePresence mode="popLayout">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 sm:p-6 flex gap-4 cursor-pointer transition-colors group ${
                    !notification.read
                      ? 'bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconColor(
                        notification.title
                      )}`}
                    >
                      {getIcon(notification.title)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm font-semibold truncate ${
                          !notification.read
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {notification.title}
                      </p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 line-clamp-2 ${
                        !notification.read
                          ? 'text-slate-600 dark:text-slate-300'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {notification.message}
                    </p>
                  </div>

                  <div className="flex-shrink-0 flex flex-col items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.read ? (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="p-1.5 text-slate-400 hover:text-brand-purple dark:hover:text-purple-400 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="h-7"></div>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!notification.read && (
                    <div className="flex-shrink-0 flex items-center justify-center w-4 group-hover:hidden">
                      <div className="w-2.5 h-2.5 bg-brand-blue rounded-full"></div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-12"
              >
                <EmptyState
                  icon={<Bell className="w-8 h-8 text-slate-400" />}
                  title="No notifications"
                  description={
                    activeTab === 'ALL'
                      ? "You're all caught up! Check back later for updates."
                      : `You have no ${activeTab.toLowerCase()} notifications at the moment.`
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
