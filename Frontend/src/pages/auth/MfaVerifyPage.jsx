import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthLayout from './AuthLayout';
import { useAuth } from '../../contexts/AuthContext';

const MfaVerifyPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyMfaLogin } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // The userId is passed from LoginPage during the first login step
  const userId = location.state?.userId;

  if (!userId) {
    navigate('/login');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      await verifyMfaLogin(userId, code);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid verification code. Please check your authenticator app.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Verify Identity" 
      subtitle="Enter the 6-digit code from your authenticator app to continue."
      rightContent={
        <div className="relative flex flex-col items-center justify-center space-y-6 z-10">
           <div className="relative">
              {/* Animated Glow Rings */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[260px] w-[260px] rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[180px] w-[180px] border border-blue-500/20 rounded-full animate-ping [animation-duration:3s]" />
              
              <div className="relative bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-slate-50">
                 <ShieldCheck size={120} className="text-blue-600 drop-shadow-lg" />
              </div>
           </div>
           
           <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Extra Layer of Security</h3>
              <p className="text-slate-500 text-sm max-w-[240px] leading-relaxed">
                Your account is protected with Two-Factor Authentication.
              </p>
           </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-8 pt-4">
        <div className="space-y-3 text-center">
          <label className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400" htmlFor="code">
            Verification Code
          </label>
          <div className="relative group max-w-[280px] mx-auto">
             <input
               id="code"
               type="text"
               maxLength="6"
               autoFocus
               required
               className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 py-5 text-center text-3xl font-black tracking-[0.6em] text-slate-900 placeholder:text-slate-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
               placeholder="000000"
               value={code}
               onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
             />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 text-[11px] font-semibold text-red-500 bg-red-50 py-2.5 px-4 rounded-xl border border-red-100 max-w-[280px] mx-auto">
            <ShieldAlert size={14} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4 max-w-[280px] mx-auto">
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="w-full rounded-2xl bg-blue-600 py-4 text-[15px] font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Continue to Dashboard'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="flex items-center justify-center gap-2 w-full text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors py-2"
          >
            <ArrowLeft size={14} />
            Back to Login
          </button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default MfaVerifyPage;
