import React from 'react';
import { Card } from './Card';

export interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  accent?: 'emerald' | 'blue' | 'amber' | 'neutral';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  accent = 'neutral',
  className = '',
}) => {
  const accentBorder = {
    emerald: 'border-l-2 border-l-emerald-500',
    blue: 'border-l-2 border-l-sky-500',
    amber: 'border-l-2 border-l-amber-500',
    neutral: '',
  }[accent];

  return (
    <Card
      variant="elevated"
      padding="sm"
      className={`p-4 sm:p-5 relative overflow-hidden ${accentBorder} ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1 font-display tracking-tight">
            {value}
          </p>
          {subtext && (
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              {trend && (
                <span
                  className={`font-semibold ${
                    trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {trend.value}
                </span>
              )}
              <span>{subtext}</span>
            </p>
          )}
        </div>
        {icon && (
          <div className="p-2.5 rounded-xl bg-[#13211D] border border-[#1F332C] text-emerald-400 shrink-0">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
