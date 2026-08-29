import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'secondary' | 'outline' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'elevated',
  padding = 'md',
  className = '',
  ...props
}) => {
  const variants: Record<string, string> = {
    elevated:
      'bg-[#0E1A17] border border-[#1F332C] text-slate-100 shadow-sm',
    secondary:
      'bg-[#13211D] border border-[#1F332C]/80 text-slate-100 shadow-xs',
    outline:
      'bg-transparent border border-[#1F332C] text-slate-100',
    interactive:
      'bg-[#0E1A17] hover:bg-[#13211D] border border-[#1F332C] hover:border-emerald-500/40 text-slate-100 transition-all duration-200 cursor-pointer hover:shadow-md hover:shadow-emerald-950/20',
  };

  const paddings: Record<string, string> = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <div className={`flex items-center justify-between gap-4 pb-4 border-b border-[#1F332C] mb-4 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className = '',
  children,
  ...props
}) => (
  <h3 className={`text-base font-bold text-slate-100 tracking-tight flex items-center gap-2 ${className}`} {...props}>
    {children}
  </h3>
);
