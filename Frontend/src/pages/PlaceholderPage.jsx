import React from 'react';
import { WrenchIcon } from 'lucide-react';
export function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
        <WrenchIcon className="w-10 h-10 text-slate-400" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-md">
        This page is currently under construction and will be available in the
        next phase of development.
      </p>
    </div>);

}
