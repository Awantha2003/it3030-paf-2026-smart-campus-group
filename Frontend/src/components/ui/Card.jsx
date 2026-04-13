import React from 'react';
export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`bg-white dark:bg-brand-surface rounded-xl border border-slate-200 dark:border-slate-800 shadow-soft overflow-hidden ${className}`}
      {...props}>
      
      {children}
    </div>);

}
export function CardHeader({ children, className = '' }) {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-100 dark:border-slate-800 ${className}`}>
      
      {children}
    </div>);

}
export function CardContent({ children, className = '' }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
export function CardFooter({ children, className = '' }) {
  return (
    <div
      className={`px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 ${className}`}>
      
      {children}
    </div>);

}
