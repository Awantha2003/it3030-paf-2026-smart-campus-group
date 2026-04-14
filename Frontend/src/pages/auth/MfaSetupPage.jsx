import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Smartphone, Copy, CheckCircle2 } from 'lucide-react';
import AuthLayout from './AuthLayout';
import api from '../../api/axiosInstance';
import { useAuth } from '../../contexts/AuthContext';

const MfaSetupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = location.state?.userId;
  const { verifyMfaSetup } = useAuth();
  const [setupData, setSetupData] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSetupData = async () => {
      // Guard: if no token, must login first
      if (!userId) {
        navigate('/login', { state: { message: 'Missing user context. Please login again.' } });
        return;
      }
      try {
        const res = await api.get(`/api/auth/mfa/setup/${userId}`);
        setSetupData(res.data);
      } catch (err) {
        setError('Failed to initialize MFA setup. Please try again.');
      }
    };
    fetchSetupData();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const result = await verifyMfaSetup(userId, code);
      const role = result.role;
      if (role === 'ADMIN') {
        navigate('/Admin/dashboard');
      } else if (role === 'TECHNICIAN') {
        navigate('/Student/dashboard'); // Temporary fallback if Technician doesn't have a unique dash
      } else {
        navigate('/Student/dashboard');
      }
    } catch (err) {
      // Don't redirect — show the error on this page
      const status = err.response?.status;
      if (status === 401) {
        setError('Invalid code. Please check your Authenticator app and try again.');
      } else if (status === 500) {
        setError('Server error. Please try again.');
      } else {
        setError('Verification failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(setupData?.secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthLayout
      title="Secure Your Account"
      subtitle="Complete your 2-Step Verification setup to protect your access."
      rightContent={
        <div className="relative flex flex-col items-center justify-center space-y-8 z-10">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-slate-100 transition-transform hover:scale-105 duration-500">
            {setupData ? (
              <QRCodeSVG value={setupData.otpUri} size={220} className="rounded-lg" />
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                Generating Code...
              </div>
            )}
          </div>
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Smartphone size={20} />
              <h3 className="text-lg font-bold">Authentication App</h3>
            </div>
            <p className="text-slate-500 text-xs max-w-[240px] leading-relaxed">
              Works with Google Authenticator, Authy, or Microsoft Authenticator.
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Step 1: Instructions */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">Scan QR Code</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open Google Authenticator on your phone and scan the code on the right.
            </p>
          </div>
        </div>

        {/* QR Code Container (Mobile only as it's on right for desktop) */}
        <div className="lg:hidden flex flex-col items-center bg-slate-50 p-6 rounded-3xl border border-slate-100">
          {setupData ? (
            <div className="bg-white p-4 rounded-2xl shadow-sm">
              <QRCodeSVG value={setupData.otpUri} size={180} />
            </div>
          ) : <div className="h-[212px] flex items-center justify-center text-slate-300">Loading...</div>}
        </div>

        {/* Step 2: Verification */}
        <div className="flex gap-4 items-start">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
          <div className="flex-1 space-y-4">
            <h4 className="text-sm font-bold text-slate-800">Verify & Finalize</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <ShieldCheck size={18} />
                </div>
                <input
                  type="text"
                  maxLength="6"
                  required
                  className="block w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-center text-xl font-bold tracking-[0.5em] text-slate-900 placeholder:text-slate-200 focus:border-blue-500 focus:bg-blue-50/5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              {error && <p className="text-[11px] font-semibold text-red-500 bg-red-50 py-2 px-3 rounded-lg border border-red-100">{error}</p>}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full rounded-2xl bg-blue-600 py-4 text-[15px] font-bold text-white shadow-xl shadow-blue-600/25 hover:bg-blue-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Enable Secure Access'}
              </button>
            </form>
          </div>
        </div>

        {/* Manual Code Option */}
        {setupData && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300 mb-3 text-center">Or manual setup</p>
            <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <code className="flex-1 text-xs font-mono text-slate-600">{setupData.secret}</code>
              <button
                onClick={copySecret}
                className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-blue-600"
              >
                {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Injecting the QR Code into the Right side of AuthLayout */}
      {/* We need to modify AuthLayout or pass the QR content differently */}
    </AuthLayout>
  );
};

export default MfaSetupPage;
