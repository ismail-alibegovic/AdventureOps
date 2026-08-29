import React from 'react';
import { BookingStatus, PaymentStatus } from '../../types';

export interface StatusBadgeProps {
  status:
    | BookingStatus
    | PaymentStatus
    | 'confirmed'
    | 'pending'
    | 'checked_in'
    | 'completed'
    | 'cancelled'
    | 'no_show'
    | 'paid'
    | 'partial'
    | 'unpaid'
    | 'refunded'
    | 'class-2'
    | 'class-3'
    | 'class-4'
    | string;
  label?: string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'confirmed':
      case 'paid':
        return {
          bg: 'bg-emerald-950/70',
          text: 'text-emerald-300',
          border: 'border-emerald-800/40',
          dot: 'bg-emerald-400',
          defaultLabel: status === 'confirmed' ? 'Confirmed' : 'Paid',
        };
      case 'requested':
      case 'pending':
        return {
          bg: 'bg-amber-950/60',
          text: 'text-amber-300',
          border: 'border-amber-800/40',
          dot: 'bg-amber-400',
          defaultLabel: status === 'requested' ? 'Requested' : 'Pending',
        };
      case 'partial':
        return {
          bg: 'bg-amber-950/60',
          text: 'text-amber-300',
          border: 'border-amber-800/40',
          dot: 'bg-amber-400',
          defaultLabel: 'Partially Paid',
        };
      case 'checked_in':
        return {
          bg: 'bg-sky-950/70',
          text: 'text-sky-300',
          border: 'border-sky-800/40',
          dot: 'bg-sky-400',
          defaultLabel: 'Checked In',
        };
      case 'completed':
        return {
          bg: 'bg-[#13211D]',
          text: 'text-slate-300',
          border: 'border-[#1F332C]',
          dot: 'bg-slate-400',
          defaultLabel: 'Completed',
        };
      case 'cancelled':
      case 'rejected':
      case 'unpaid':
      case 'refunded':
        return {
          bg: 'bg-rose-950/60',
          text: 'text-rose-300',
          border: 'border-rose-800/40',
          dot: 'bg-rose-400',
          defaultLabel:
            status === 'unpaid'
              ? 'Unpaid'
              : status === 'refunded'
              ? 'Refunded'
              : status === 'rejected'
              ? 'Rejected'
              : 'Cancelled',
        };
      case 'no_show':
        return {
          bg: 'bg-orange-950/60',
          text: 'text-orange-300',
          border: 'border-orange-800/40',
          dot: 'bg-orange-400',
          defaultLabel: 'No Show',
        };
      case 'class-2':
      case 'class-3':
        return {
          bg: 'bg-teal-950/60',
          text: 'text-teal-300',
          border: 'border-teal-800/40',
          dot: 'bg-teal-400',
          defaultLabel: 'Class II-III',
        };
      case 'class-4':
        return {
          bg: 'bg-indigo-950/60',
          text: 'text-indigo-300',
          border: 'border-indigo-800/40',
          dot: 'bg-indigo-400',
          defaultLabel: 'Class IV (Advanced)',
        };
      default:
        return {
          bg: 'bg-[#13211D]',
          text: 'text-slate-300',
          border: 'border-[#1F332C]',
          dot: 'bg-slate-400',
          defaultLabel: String(status),
        };
    }
  };

  const config = getStatusConfig();
  const displayLabel = label || config.defaultLabel;

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] px-2 py-0.5 gap-1.5'
      : 'text-xs px-2.5 py-1 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-lg border whitespace-nowrap tracking-tight font-medium ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
