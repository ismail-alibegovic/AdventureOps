import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'subtle';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-150 rounded-xl select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07110F] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none active:scale-[0.98]';

    const variants: Record<ButtonVariant, string> = {
      primary:
        'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 shadow-sm hover:shadow-md hover:shadow-emerald-950/40 font-bold',
      secondary:
        'bg-[#0E1A17] hover:bg-[#13211D] active:bg-[#172723] text-slate-200 border border-[#1F332C] hover:border-[#2C473E] shadow-xs',
      outline:
        'bg-transparent hover:bg-[#0E1A17]/60 text-slate-300 hover:text-white border border-[#1F332C] hover:border-emerald-500/40',
      ghost:
        'bg-transparent hover:bg-[#0E1A17]/70 text-slate-300 hover:text-white',
      danger:
        'bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/40 hover:border-rose-700/60',
      accent:
        'bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white shadow-sm font-bold',
      subtle:
        'bg-[#13211D] hover:bg-[#1A2D27] text-emerald-300 border border-[#1F332C]',
    };

    const sizes: Record<ButtonSize, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-10',
      lg: 'text-base px-6 py-3.5 gap-2.5 h-12',
      icon: 'p-2 w-9 h-9',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
