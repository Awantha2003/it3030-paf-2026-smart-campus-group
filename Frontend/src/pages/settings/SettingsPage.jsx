import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Bell,
  Palette,
  Shield,
  Save,
  Camera,
  Smartphone,
  Mail,
  Moon,
  Sun,
  Monitor } from
'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter } from
'../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
const tabs = [
{
  id: 'PROFILE',
  label: 'Profile',
  icon: <User className="w-4 h-4" />
},
{
  id: 'APPEARANCE',
  label: 'Appearance',
  icon: <Palette className="w-4 h-4" />
},
{
  id: 'SECURITY',
  label: 'Security',
  icon: <Shield className="w-4 h-4" />
}];
export function SettingsPage() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('PROFILE');
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1000);
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences and settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) =>
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-brand-purple/10 text-brand-purple dark:bg-purple-900/20 dark:text-purple-400' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'}`}>
            
              {tab.icon}
              {tab.label}
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            transition={{
              duration: 0.2
            }}>
            
            {activeTab === 'PROFILE' &&
            <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Profile Information
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Update your account details and public profile.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                      src={
                      user?.avatar ||
                      `https://ui-avatars.com/api/?name=${user?.name}&background=random`
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-brand-surface shadow-sm" />
                    
                      <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-purple transition-colors">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                        Profile Picture
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        JPG, GIF or PNG. Max size of 2MB.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-slate-900 dark:text-white" />
                    
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-slate-900 dark:text-white" />
                    
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Role
                      </label>
                      <input
                      type="text"
                      value={user?.role}
                      disabled
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                    
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Department
                      </label>
                      <input
                      type="text"
                      defaultValue="Computer Science"
                      className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-slate-900 dark:text-white" />
                    
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-6">
                  <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                  leftIcon={<Save className="w-4 h-4" />}>
                  
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            }

            {activeTab === 'APPEARANCE' &&
            <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Appearance
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Customize how the platform looks on your device.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                    onClick={() => !isDark && toggleTheme()}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${!isDark ? 'border-brand-purple bg-purple-50/50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    
                      <Sun
                      className={`w-6 h-6 mb-3 ${!isDark ? 'text-brand-purple' : 'text-slate-400'}`} />
                    
                      <p className="font-medium text-slate-900 dark:text-white">
                        Light Mode
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Clean and bright
                      </p>
                    </button>

                    <button
                    onClick={() => isDark && toggleTheme()}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${isDark ? 'border-brand-purple bg-purple-50/50 dark:bg-purple-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                    
                      <Moon
                      className={`w-6 h-6 mb-3 ${isDark ? 'text-brand-purple' : 'text-slate-400'}`} />
                    
                      <p className="font-medium text-slate-900 dark:text-white">
                        Dark Mode
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Easy on the eyes
                      </p>
                    </button>

                    <button className="p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-left hover:border-slate-300 dark:hover:border-slate-600 transition-all opacity-50 cursor-not-allowed">
                      <Monitor className="w-6 h-6 mb-3 text-slate-400" />
                      <p className="font-medium text-slate-900 dark:text-white">
                        System
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Matches your device
                      </p>
                    </button>
                  </div>
                </CardContent>
              </Card>
            }

            {activeTab === 'SECURITY' &&
            <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Security Settings
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Manage your password and account security.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Change Password
                    </h3>
                    <div className="space-y-4 max-w-md">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Current Password
                        </label>
                        <input
                        type="password"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-slate-900 dark:text-white" />
                      
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          New Password
                        </label>
                        <input
                        type="password"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-slate-900 dark:text-white" />
                      
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Confirm New Password
                        </label>
                        <input
                        type="password"
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple/20 focus:border-brand-purple outline-none transition-all text-slate-900 dark:text-white" />
                      
                      </div>
                      <Button
                      variant="primary"
                      onClick={handleSave}
                      isLoading={isSaving}>
                      
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Two-Factor Authentication
                    </h3>
                    <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          Authenticator App
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Use an app like Google Authenticator to secure your
                          account.
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            }
          </motion.div>
        </div>
      </div>
    </div>);

}
