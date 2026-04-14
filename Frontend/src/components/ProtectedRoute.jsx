import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function ProtectedRoute({ allowedRoles, children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-brand-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect based on their actual role if they try to access an unauthorized route
        if (user.role === 'ADMIN') return <Navigate to="/Admin/dashboard" replace />;
        if (user.role === 'TECHNICIAN') return <Navigate to="/Technician/dashboard" replace />;
        return <Navigate to="/Student/dashboard" replace />;
    }

    return children ? children : <Outlet />;
}