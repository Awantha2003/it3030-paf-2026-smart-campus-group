import React from 'react';
export function LoadingSkeleton({
  variant = 'text-line',
  className = ''
}) {
  const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700 rounded';
  if (variant === 'card') {
    return (
      <div
        className={`p-4 border border-slate-200 dark:border-slate-800 rounded-xl ${className}`}>
        
        <div className={`${baseClass} h-40 w-full mb-4 rounded-lg`}></div>
        <div className={`${baseClass} h-6 w-3/4 mb-2`}></div>
        <div className={`${baseClass} h-4 w-1/2`}></div>
      </div>);

  }
  if (variant === 'table-row') {
    return (
      <div
        className={`flex items-center gap-4 py-3 border-b border-slate-100 dark:border-slate-800 ${className}`}>
        
        <div className={`${baseClass} h-4 w-1/4`}></div>
        <div className={`${baseClass} h-4 w-1/4`}></div>
        <div className={`${baseClass} h-4 w-1/4`}></div>
        <div className={`${baseClass} h-4 w-1/4`}></div>
      </div>);

  }
  if (variant === 'avatar') {
    return (
      <div className={`${baseClass} h-10 w-10 rounded-full ${className}`}></div>);

  }
  return <div className={`${baseClass} h-4 w-full ${className}`}></div>;
}
