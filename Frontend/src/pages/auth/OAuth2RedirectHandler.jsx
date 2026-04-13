import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log("OAuth2RedirectHandler mounted, search:", location.search);
        const getUrlParameter = (name) => {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        const role = getUrlParameter('role');
        const token = getUrlParameter('token');
        const error = getUrlParameter('error');
        const mfaRequired = getUrlParameter('mfaRequired');
        const userId = getUrlParameter('userId');

        if (mfaRequired === 'true' && userId) {
            console.log("MFA required for Google login, redirecting to verify page...");
            navigate('/mfa-verify', { state: { userId } });
        } else if (token) {
            console.log("Token found, saving to localStorage...");
            localStorage.setItem('token', token);
            
            // Role-based redirection
            if (role === 'ADMIN') {
              navigate('/Admin/dashboard');
            } else if (role === 'TECHNICIAN') {
              navigate('/Technician/dashboard');
            } else {
              navigate('/Student/dashboard');
            }
        }
 else {
            console.warn("No token or MFA found in URL. Error:", error);
            navigate('/login');
        }
    }, [location, navigate]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="text-center space-y-4">
                <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-slate-600 font-medium animate-pulse">Completing secure login...</p>
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;
