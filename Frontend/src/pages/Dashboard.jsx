import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Bell, LayoutDashboard, ShieldCheck, ShieldOff } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Simple Navbar */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-xl">
                    <LayoutDashboard size={24} />
                    <span>SmartCampus</span>
                </div>

                <div className="flex items-center gap-6">
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                        <Bell size={20} />
                    </button>
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-100">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{user?.name || 'User'}</p>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{user?.role}</p>
                        </div>
                        <button 
                            onClick={logout}
                            className="p-2 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content Area */}
            <main className="p-12 max-w-7xl mx-auto">
                <div className="bg-white rounded-[2.5rem] p-12 border border-slate-100 shadow-xl shadow-slate-200/50">
                    <h1 className="text-4xl font-extrabold text-slate-900 mb-4">Welcome back, {user?.name.split(' ')[0]}!</h1>
                    <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                        You have successfully logged in to the Smart Campus Hub. We are currently preparing your modules and personalized dashboard.
                    </p>
                    
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <User size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-blue-900 tracking-tight">Profile Settings</h3>
                            <p className="text-sm text-blue-700/70">Manage your security and account preferences.</p>
                        </div>

                        {/* MFA Setup card */}
                        <div className="p-8 rounded-3xl bg-emerald-50 border border-emerald-100 space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                                {user?.isMfaEnabled ? <ShieldCheck size={24} /> : <ShieldOff size={24} />}
                            </div>
                            <h3 className="text-lg font-bold text-emerald-900 tracking-tight">
                                {user?.isMfaEnabled ? '2FA Enabled ✓' : 'Enable 2FA Security'}
                            </h3>
                            <p className="text-sm text-emerald-700/70">
                                {user?.isMfaEnabled
                                    ? 'Your account is protected with two-factor authentication.'
                                    : 'Add an extra layer of security to your account.'}
                            </p>
                            {!user?.isMfaEnabled && (
                                <button
                                    onClick={() => navigate('/mfa-setup')}
                                    className="mt-2 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-all"
                                >
                                    Set Up Now
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
