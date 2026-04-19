import React from 'react';
import Lottie from 'lottie-react';
import Logo from '../../components/ui/Logo';
import loginAnimation from '../../assets/Login.json';

const AuthLayout = ({ children, title, subtitle, rightContent }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-brand-bg dark:bg-brand-dark py-10 px-4 sm:px-6 transition-colors duration-200 overflow-hidden">
      
      {/* Decorative Background Elements to reduce plain white space */}
      <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/5 blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-purple-500/10 dark:bg-purple-600/5 blur-[120px] pointer-events-none" />

      {/* Centered Main Card */}
      <div className="relative z-10 flex w-full max-w-[880px] overflow-hidden rounded-[2rem] bg-white dark:bg-brand-surface shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-black/50 outline outline-1 outline-slate-100 dark:outline-slate-800 min-h-fit backdrop-blur-sm">
        
        {/* Left Side: Form Content */}
        <div className="flex w-full flex-col justify-center px-8 py-10 sm:px-12 lg:w-1/2">
          <div className="mx-auto w-full max-w-sm">
            <Logo className="mb-8" />
            
            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">{title}</h1>
              <p className="mt-2 text-sm font-medium text-slate-400 dark:text-slate-500">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>

        {/* Right Side: Dynamic Content */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-slate-50/50 dark:bg-slate-800/20 items-center justify-center flex-col p-10 border-l border-slate-50 dark:border-slate-800">
          
          {rightContent ? rightContent : (
            <>
              {/* Blue Decorative Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] rounded-full bg-blue-600/5 blur-[80px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[280px] w-[280px] border border-blue-500/10 rounded-full animate-pulse" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[340px] w-[340px] border border-indigo-500/5 rounded-full" />
              
              <div className="relative w-full max-w-[300px] z-10 transition-transform hover:scale-105 duration-700">
                <Lottie 
                  animationData={loginAnimation} 
                  loop={true} 
                  className="w-full h-auto drop-shadow-2xl"
                />
              </div>
              
              {/* Tagline section */}
              <div className="mt-10 text-center z-10 space-y-4 px-6">
                 <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Modern Campus Hub</h3>
                 <p className="text-slate-500 dark:text-slate-400 text-[13px] leading-relaxed max-w-[300px] mx-auto font-medium">
                   Unlock a world of possibilities with our unified campus operations hub. 
                   Designed to streamline your academic journey with effortless intelligence and real-time insights.
                 </p>
                 <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                       Join 5,000+ Students Already Onboard
                    </span>
                 </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
