import React from 'react';
export function Badge({
  children,
  variant = 'default',
  className = ''
}) {
  const variants = {
    default:
    'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
    success:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      
      {children}
    </span>);

}
export function StatusBadge({ status }) {
  let variant = 'default';
  switch (status) {
    case 'APPROVED':
    case 'RESOLVED':
    case 'CLOSED':
    case 'ACTIVE':
      variant = 'success';
      break;
    case 'PENDING':
    case 'IN_PROGRESS':
    case 'MAINTENANCE':
      variant = 'warning';
      break;
    case 'REJECTED':
    case 'CANCELLED':
    case 'OUT_OF_SERVICE':
    case 'CRITICAL':
    case 'HIGH':
      variant = 'danger';
      break;
    case 'OPEN':
    case 'LOW':
    case 'MEDIUM':
      variant = 'info';
      break;
  }
  return <Badge variant={variant}>{status.replace('_', ' ')}</Badge>;
}
