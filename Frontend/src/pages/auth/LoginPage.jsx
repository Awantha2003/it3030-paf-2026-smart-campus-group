import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../contexts/AuthContext';
import { SERVER_BASE_URL } from '../../api/baseUrl';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.status === 'MFA_SETUP_REQUIRED') {
        navigate('/mfa-setup', { state: { userId: result.userId } });
      } else if (result.status === 'MFA_CODE_REQUIRED') {
        navigate('/mfa-verify', { state: { userId: result.userId } });
      } else {
        // Role-based redirection
        const role = result.role;
        if (role === 'ADMIN') {
          navigate('/Admin/dashboard');
        } else if (role === 'TECHNICIAN') {
          navigate('/Technician/dashboard');
        } else {
          navigate('/Student/dashboard');
        }
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to manage your campus life."
    >
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Mail size={16} />
            </div>
            <input
              id="email"
              type="email"
              required
              autoComplete="new-email"
              className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              placeholder="e.g. john@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between ml-1">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500" htmlFor="password">
              Password
            </label>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Lock size={16} />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-300 hover:text-slate-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {successMessage && <p className="text-[11px] font-semibold text-green-600 ml-1 bg-green-50 py-2 px-3 rounded-lg border border-green-100">{successMessage}</p>}
        {error && <p className="text-[11px] font-semibold text-red-500 ml-1 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100">{error}</p>}

        <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In Now'}
            </button>
        </div>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="mx-4 flex-shrink text-[9px] font-extrabold uppercase tracking-[0.4em] text-slate-300">Or</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = `${SERVER_BASE_URL}/oauth2/authorization/google`}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>

        <div className="flex items-center justify-center">
           <Link to="/forgot-password" title="Coming Soon" className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-all">
              Forgot your password?
           </Link>
        </div>
      </form>

      <div className="mt-8 border-t border-slate-100 pt-6 text-center text-[10px] font-bold uppercase tracking-widest text-slate-300">
        New here?{' '}
        <Link to="/register" className="text-slate-900 hover:text-blue-600 transition-colors">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
