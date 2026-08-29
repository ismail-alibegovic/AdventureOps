import React from 'react';
import { Waves } from 'lucide-react';

export interface PageLoaderProps {
  message?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({
  message = 'Loading data...',
  subtext,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'py-8 min-h-[160px]',
    md: 'py-16 min-h-[260px]',
    lg: 'py-24 min-h-[380px]',
  }[size];

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  }[size];

  const badgeSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-18 h-18',
  }[size];

  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 ${sizeClasses} ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon Badge with Pulse Effect */}
      <div className="relative mb-4">
        <div className="absolute -inset-2 rounded-2xl bg-emerald-500/15 blur-sm animate-pulse pointer-events-none" />
        <div
          className={`${badgeSizes} rounded-2xl bg-[#0B1A16] border border-[#1E392E] flex items-center justify-center text-emerald-400 shadow-lg shadow-black/40`}
        >
          <Waves className={`${iconSizes} animate-pulse stroke-[2.2]`} />
        </div>
      </div>

      {/* Primary Message */}
      <p className="text-sm sm:text-base font-semibold text-slate-200 font-display tracking-tight">
        {message}
      </p>

      {/* Subtext */}
      {subtext && (
        <p className="text-xs text-slate-400 font-mono mt-1 max-w-sm">
          {subtext}
        </p>
      )}

      {/* Flow Indicator Bar */}
      <div className="w-32 h-1 bg-[#12241E] rounded-full overflow-hidden mt-3 relative">
        <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-500 w-1/2 rounded-full animate-[shimmer_1.5s_infinite_linear] -translate-x-full" />
      </div>
    </div>
  );
};
