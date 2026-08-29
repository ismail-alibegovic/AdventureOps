import React from 'react';

export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: 'left' | 'center';
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  eyebrow,
  title,
  description,
  action,
  align = 'center',
  className = '',
}) => {
  const isCenter = align === 'center';
  return (
    <div
      className={`mb-10 sm:mb-14 ${isCenter ? 'text-center mx-auto max-w-3xl' : 'flex flex-col sm:flex-row sm:items-end justify-between gap-4'} ${className}`}
    >
      <div>
        {eyebrow && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 mb-3 ${isCenter ? 'mx-auto' : ''}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            {eyebrow}
          </div>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight font-display">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0 mt-4 sm:mt-0">{action}</div>}
    </div>
  );
};
