import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCapIcon,
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  ShieldIcon,
  WrenchIcon,
  UserIcon } from
'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const roleOptions = [
  {
    label: 'Student',
    value: 'USER',
    icon: UserIcon,
    redirectTo: '/dashboard'
  },
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: ShieldIcon,
    redirectTo: '/admin'
  },
  {
    label: 'Technician',
    value: 'TECHNICIAN',
    icon: WrenchIcon,
    redirectTo: '/technician'
  }
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('USER');
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network request
    setTimeout(() => {
      const selectedOption =
      roleOptions.find((option) => option.value === selectedRole) ||
      roleOptions[0];
      login(selectedOption.value);
      navigate(selectedOption.redirectTo);
    }, 1000);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-brand-dark relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-blue/20 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        initial={{
          opacity: 0,
          y: 20
        }}
        animate={{
          opacity: 1,
          y: 0
        }}
        transition={{
          duration: 0.5
        }}
        className="w-full max-w-md z-10 px-4">
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-purple text-white mb-6 shadow-glow">
            <GraduationCapIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Smart Campus Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Sign in to manage your university operations
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 dark:bg-brand-surface/80 backdrop-blur-xl">
          <CardContent className="p-8">
            <Button
              variant="outline"
              className="w-full mb-6 h-12 relative"
              onClick={() =>
              handleLogin({
                preventDefault: () => {}
              })
              }>
              
              <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4" />
                
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853" />
                
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05" />
                
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335" />
                
              </svg>
              Sign in with Google
            </Button>

            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Sign in as
              </p>
              <div className="grid grid-cols-3 gap-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedRole(option.value)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors ${isActive ? 'border-brand-purple bg-brand-purple/10 text-brand-purple' : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50'}`}>
                      
                      <Icon className="w-4 h-4" />
                      <span>{option.label}</span>
                    </button>);

                })}
              </div>
            </div>

            <div className="relative flex items-center py-2 mb-6">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-slate-400 uppercase tracking-wider">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all dark:text-white"
                    required />
                  
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-brand-purple hover:text-purple-700 dark:hover:text-purple-400">
                    
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-purple focus:border-brand-purple outline-none transition-all dark:text-white"
                    required />
                  
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-brand-purple border-slate-300 rounded focus:ring-brand-purple" />
                
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full mt-6"
                size="lg"
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRightIcon className="w-4 h-4" />}>
                
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>);

}
