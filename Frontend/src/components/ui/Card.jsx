import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-brand-surface rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-8 ${className}`}>
      {children}
    </div>
  );
}
