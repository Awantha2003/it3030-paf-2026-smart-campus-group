import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Users, KeyRound, Eye, EyeOff } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    password: ''
  });

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, name: val });
    
    if (val && !/^[a-zA-Z\s]+$/.test(val)) {
      setFieldErrors(prev => ({ ...prev, name: 'Name must contain only letters and spaces' }));
    } else {
      setFieldErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setFormData({ ...formData, password: val });
    
    if (val && !/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(val)) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must contain at least one letter and one number' }));
    } else if (val && val.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Prevent submission if there are any active inline field errors
    if (fieldErrors.name || fieldErrors.password) {
      setError('Please fix the validation errors before submitting');
      return;
    }

    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      setError('Name must contain only letters and spaces');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(formData.password)) {
      setError('Password must contain at least one letter and one number');
      return;
    }

    const techEmailRegex = /^[a-z0-9._%+-]+\.tech@gmail\.com$/i;
    if (formData.role === 'TECHNICIAN' && !techEmailRegex.test(formData.email)) {
      setError('Technician email must follow the format: username.tech@gmail.com');
      return;
    }



    setLoading(true);
    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      // Redirect based on role and MFA requirement
      if (result.status === 'PENDING_APPROVAL') {
        navigate('/login', { state: { message: 'Registration successful! Your account is pending admin approval. You will be able to log in once an admin approves your account.' } });
      } else if (result.role === 'ADMIN' || result.role === 'TECHNICIAN') {
        localStorage.setItem('token', result.token); // Autologin for setup
        navigate('/mfa-setup');
      } else {
        navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      }

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join the community and simplify your campus life."
    >
      <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-1" htmlFor="name">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <User size={18} />
            </div>
            <input
              id="name"
              type="text"
              required
              autoComplete="none"
              className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleNameChange}
            />
          </div>
          {fieldErrors.name && <p className="text-[10px] uppercase font-bold text-red-500 ml-1">{fieldErrors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-1" htmlFor="email">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Mail size={18} />
            </div>
            <input
              id="email"
              type="email"
              required
              autoComplete="new-email"
              className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              placeholder="e.g. john@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-1" htmlFor="role">I am a...</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Users size={18} />
            </div>
            <select
              id="role"
              className="block w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-[15px] text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="STUDENT">Student</option>
              <option value="TECHNICIAN">Technician</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-1" htmlFor="password">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-[15px] text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                placeholder="••••••••"
                value={formData.password}
                onChange={handlePasswordChange}
              />
            </div>
            {fieldErrors.password && <p className="text-[10px] uppercase font-bold text-red-500 ml-1">{fieldErrors.password}</p>}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500 ml-1" htmlFor="confirmPassword">Confirm</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                <KeyRound size={18} />
              </div>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                className="block w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-3 text-[15px] text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-red-500 ml-1 bg-red-50 py-2 px-3 rounded-lg border border-red-100">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-2xl bg-blue-600 py-4 text-[15px] font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Continue to Register'}
        </button>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-slate-100"></div>
          <span className="mx-4 flex-shrink text-[10px] font-bold uppercase tracking-[0.4em] text-slate-300">Or</span>
          <div className="flex-grow border-t border-slate-100"></div>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 active:scale-[0.98] transition-all"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>
      </form>

      <div className="mt-8 border-t border-slate-100 pt-8 text-center text-xs font-bold uppercase tracking-widest text-slate-300">
        Member already?{' '}
        <Link to="/login" className="text-slate-900 hover:text-blue-600 transition-colors uppercase">
          Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
