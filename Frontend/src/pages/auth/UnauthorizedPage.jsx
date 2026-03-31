import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlertIcon, ArrowLeftIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getHomePath = () => {
    if (user?.role === 'ADMIN') {
      return '/admin';
    }

    if (user?.role === 'TECHNICIAN') {
      return '/technician';
    }

    return '/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg dark:bg-brand-dark p-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 mb-6">
          <ShieldAlertIcon className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Access Denied
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          You don't have permission to access this page. Please contact your
          administrator if you believe this is a mistake.
        </p>
        <Button
          onClick={() => navigate(getHomePath())}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          size="lg">
          
          Return to Dashboard
        </Button>
      </div>
    </div>);

}
