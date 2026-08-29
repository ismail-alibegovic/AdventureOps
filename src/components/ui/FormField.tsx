import React, { forwardRef } from 'react';

export interface FormFieldProps {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helperText,
  required,
  className = '',
  children,
  id,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
        >
          {label} {required && <span className="text-emerald-400 font-bold">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs font-medium text-rose-400 mt-1">{error}</p>}
      {!error && helperText && (
        <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>
      )}
    </div>
  );
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 text-slate-400 pointer-events-none shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-[#091412] text-slate-100 placeholder:text-slate-500 rounded-xl border transition-all duration-150 text-sm font-medium py-2.5 h-11 px-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 disabled:opacity-50 disabled:bg-[#07110F] ${
            error
              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
              : 'border-[#1F332C] hover:border-[#2C473E]'
          } ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 pointer-events-none shrink-0">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full bg-[#091412] text-slate-100 rounded-xl border transition-all duration-150 text-sm font-medium py-2.5 h-11 px-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 cursor-pointer disabled:opacity-50 ${
          error
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30'
            : 'border-[#1F332C] hover:border-[#2C473E]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';
