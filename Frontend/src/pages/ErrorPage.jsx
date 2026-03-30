import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AlertTriangleIcon, HomeIcon } from 'lucide-react';
import { Button } from '../components/ui/Button';
export function ErrorPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-dark flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        className="max-w-md w-full bg-white dark:bg-brand-surface rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
        
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangleIcon className="w-10 h-10 text-red-600 dark:text-red-500" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Button
          variant="primary"
          className="w-full"
          leftIcon={<HomeIcon className="w-5 h-5" />}
          onClick={() => navigate('/')}>
          
          Go to Dashboard
        </Button>
      </motion.div>
    </div>);

}