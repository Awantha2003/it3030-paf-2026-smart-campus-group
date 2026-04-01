import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCapIcon,
  MailIcon,
  LockIcon,
  ArrowRightIcon,
  ShieldIcon
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';

const roleOptions = [
  {
    label: 'Admin',
    value: 'ADMIN',
    icon: ShieldIcon,
    redirectTo: '/admin'
  }
];

export function LoginPage() {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await loginAdmin({
        username: email,
        password
      });
      navigate('/admin');
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-bg dark:bg-brand-dark">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[40%] w-[40%] rounded-full bg-brand-purple/20 blur-[100px]" />
      <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[40%] w-[40%] rounded-full bg-brand-blue/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-md px-4"
      >
        <div className="mb-8 text-center">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-purple text-white shadow-glow">
            <GraduationCapIcon className="h-8 w-8" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">
            Smart Campus Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Admin sign in to manage campus operations
          </p>
        </div>

        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-brand-surface/80">
          <CardContent className="p-8">
            <Button variant="outline" className="relative mb-6 h-12 w-full" type="button">
              <svg className="absolute left-4 h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </Button>

            <div className="mb-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Sign in as
              </p>
              <div className="grid grid-cols-1 gap-2">
                {roleOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedRole === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedRole(option.value)}
                      className={`flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm transition-colors ${
                        isActive
                          ? 'border-brand-purple bg-brand-purple/10 text-brand-purple'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative mb-6 flex items-center py-2">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
              <span className="mx-4 flex-shrink-0 text-xs uppercase tracking-wider text-slate-400">
                Or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 outline-none transition-all focus:border-brand-purple focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs text-brand-purple hover:text-purple-700 dark:hover:text-purple-400"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Admin123@"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 outline-none transition-all focus:border-brand-purple focus:ring-2 focus:ring-brand-purple dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
                  {error}
                </div>
              )}

              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300">
                Admin login:
                <br />
                Email: admin@gmail.com
                <br />
                Password: Admin123@
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-slate-300 text-brand-purple focus:ring-brand-purple"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
                  Remember me for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="mt-6 w-full"
                size="lg"
                isLoading={isLoading}
                rightIcon={!isLoading && <ArrowRightIcon className="h-4 w-4" />}
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
