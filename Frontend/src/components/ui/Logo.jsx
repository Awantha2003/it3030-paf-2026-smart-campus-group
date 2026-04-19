import React from 'react';

const Logo = ({ className = "h-8" }) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-5" />
      </svg>
    </div>
    <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
      SmartCampus
    </span>
  </div>
);

export default Logo;
