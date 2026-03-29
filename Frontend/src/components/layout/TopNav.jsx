import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  SearchIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  LogOutIcon,
  WrenchIcon,
  CalendarIcon,
  MessageCircleIcon,
  CheckIcon } from
'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { mockNotifications } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
export function TopNav() {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Simple breadcrumb generator
  const pathnames = location.pathname.split('/').filter((x) => x);
  const breadcrumb =
  pathnames.length > 0 ?
  pathnames[pathnames.length - 1].charAt(0).toUpperCase() +
  pathnames[pathnames.length - 1].slice(1) :
  'Dashboard';
  return (
    <header className="h-16 bg-white/80 dark:bg-brand-surface/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
          {breadcrumb.replace('-', ' ')}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources, tickets..."
            className="pl-9 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-brand-dark focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 rounded-lg text-sm transition-all outline-none text-slate-700 dark:text-slate-200" />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
              âŒ˜K
            </kbd>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon className="w-4 h-4" />}
          className="hidden sm:flex">
          
          Quick Add
        </Button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          
          {isDark ?
          <SunIcon className="w-5 h-5" /> :

          <MoonIcon className="w-5 h-5" />
          }
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
            
            <BellIcon className="w-5 h-5" />
            {mockNotifications.filter((n) => !n.read).length > 0 &&
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-brand-surface"></span>
            }
          </button>

          <AnimatePresence>
            {showNotifications &&
            <>
                <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}>
              </div>
                <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.95
                }}
                transition={{
                  duration: 0.2
                }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-brand-surface rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
                
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </h3>
                    <button className="text-xs text-brand-purple hover:text-brand-purple/80 font-medium">
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {mockNotifications.slice(0, 5).map((notification) =>
                  <div
                    key={notification.id}
                    onClick={() => {
                      setShowNotifications(false);
                      if (notification.link) navigate(notification.link);
                    }}
                    className={`flex gap-3 p-4 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${!notification.read ? 'bg-slate-50/50 dark:bg-slate-800/30' : ''}`}>
                    
                        <div className="flex-shrink-0 mt-1">
                          <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${notification.title.includes('Booking') ? 'bg-purple-100 text-brand-purple dark:bg-purple-900/30 dark:text-purple-400' : notification.title.includes('Ticket') ? 'bg-blue-100 text-brand-blue dark:bg-blue-900/30 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        
                            {notification.title.includes('Booking') ?
                        <CalendarIcon className="w-4 h-4" /> :
                        notification.title.includes('Ticket') ?
                        <WrenchIcon className="w-4 h-4" /> :

                        <BellIcon className="w-4 h-4" />
                        }
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {notification.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            {new Date(
                          notification.createdAt
                        ).toLocaleDateString()}
                          </p>
                        </div>
                        {!notification.read &&
                    <div className="flex-shrink-0 flex items-center">
                            <div className="w-2 h-2 bg-brand-blue rounded-full"></div>
                          </div>
                    }
                      </div>
                  )}
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                    onClick={() => {
                      setShowNotifications(false);
                      navigate('/notifications');
                    }}
                    className="w-full text-center px-2 py-2 text-sm text-brand-purple hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors">
                    
                      View All Notifications &rarr;
                    </button>
                  </div>
                </motion.div>
              </>
            }
          </AnimatePresence>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
            
          </button>

          {showProfileMenu &&
          <>
              <div
              className="fixed inset-0 z-10"
              onClick={() => setShowProfileMenu(false)}>
            </div>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-surface rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                  onClick={() => {
                    logout();
                    setShowProfileMenu(false);
                    navigate('/login');
                  }}
                  className="w-full text-left px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md flex items-center gap-2">
                  
                    <LogOutIcon className="w-4 h-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          }
        </div>
      </div>
    </header>);

}
