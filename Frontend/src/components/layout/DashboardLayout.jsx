import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { ChatWidget } from '../chat/ChatWidget';
import { useAuth } from '../../contexts/AuthContext';

export function DashboardLayout() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-brand-bg dark:bg-brand-dark text-slate-900 dark:text-slate-100 transition-colors duration-200 relative">
            <div className="flex min-h-screen">
                <Sidebar />
                <div className="flex min-w-0 flex-1 flex-col">
                    <TopNav />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"> 
                        <Outlet />
                    </main>
                </div>
            </div>
            
            {/* Global Chat Widget - Visible only to ADMIN and TECHNICIAN */}
            {user?.role && ['ADMIN', 'TECHNICIAN'].includes(user.role) && (
                <ChatWidget />
            )}
        </div>
    );
}
