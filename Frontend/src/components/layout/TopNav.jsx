import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { SearchIcon, SunIcon, MoonIcon, PlusIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function TopNav() {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const location = useLocation();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const pathnames = location.pathname.split('/').filter((segment) => segment);
  const breadcrumb =
    pathnames.length > 0
      ? pathnames[pathnames.length - 1].charAt(0).toUpperCase() +
        pathnames[pathnames.length - 1].slice(1)
      : 'Dashboard';

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
            className="pl-9 pr-4 py-2 w-64 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-brand-dark focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 rounded-lg text-sm transition-all outline-none text-slate-700 dark:text-slate-200"
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded">
              Ctrl K
            </kbd>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<PlusIcon className="w-4 h-4" />}
          className="hidden sm:flex"
        >
          Quick Add
        </Button>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700"
            />
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
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                  Login UI has been removed. This app now opens with a local demo profile.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
