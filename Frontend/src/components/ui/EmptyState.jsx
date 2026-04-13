import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      
      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction &&
      <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      }
    </motion.div>);

}
