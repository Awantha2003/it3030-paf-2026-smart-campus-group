import React from 'react';

export function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    success: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    warning: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    danger: "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    info: "bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status, className = '' }) {
  const statusConfig = {
    'OPEN': { variant: 'warning', label: 'Open' },
    'IN_PROGRESS': { variant: 'primary', label: 'In Progress' },
    'RESOLVED': { variant: 'success', label: 'Resolved' },
    'CLOSED': { variant: 'info', label: 'Closed' }
  };

  const config = statusConfig[status] || { variant: 'info', label: status };

  return <Badge variant={config.variant} className={className}>{config.label}</Badge>;
}
