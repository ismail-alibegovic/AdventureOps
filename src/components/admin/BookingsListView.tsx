import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { Booking, BookingStatus, PaymentStatus, Package } from '../../types';
import {
  Search,
  Download,
  Plus,
  Calendar,
  Users,
  ChevronRight,
  Filter,
  RefreshCw,
  X,
  CreditCard,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';

interface BookingsListViewProps {
  onSelectBooking: (bookingId: string) => void;
  onOpenManualBooking: () => void;
}

export const BookingsListView: React.FC<BookingsListViewProps> = ({
  onSelectBooking,
  onOpenManualBooking,
}) => {
  const toast = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');
  const [packageFilter, setPackageFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const loadPackages = async () => {
    try {
      const res = await apiClient.getPackages();
      setPackages(res);
    } catch {
      // Non-blocking
    }
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery.trim()) filters.search = searchQuery.trim();
      if (statusFilter) filters.status = statusFilter;
      if (paymentFilter) filters.payment_status = paymentFilter;
      if (packageFilter) filters.package_id = packageFilter;
      if (dateFilter) filters.date = dateFilter;

      const res = await apiClient.getBookings(filters);
      setBookings(res);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [statusFilter, paymentFilter, packageFilter, dateFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setPaymentFilter('');
    setPackageFilter('');
    setDateFilter('');
  };

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter || paymentFilter || packageFilter || dateFilter
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display">Bookings</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage reservations, guests and payment status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export/bookings.csv"
            download="bookings_export.csv"
          >
            <Button
              variant="secondary"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
          </a>

          <Button
            variant="primary"
            size="md"
            onClick={onOpenManualBooking}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Booking
          </Button>
        </div>
      </div>

      {/* Booking Toolbar */}
      <Card variant="elevated" padding="md" className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="sm:col-span-12 lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reservations by code, name, phone, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  loadBookings();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          {/* Status Filter */}
          <div className="sm:col-span-4 lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            >
              <option value="">All Statuses</option>
              <option value={BookingStatus.REQUESTED}>Requested</option>
              <option value={BookingStatus.CONFIRMED}>Confirmed</option>
              <option value={BookingStatus.CHECKED_IN}>Checked In</option>
              <option value={BookingStatus.COMPLETED}>Completed</option>
              <option value={BookingStatus.CANCELLED}>Cancelled</option>
              <option value={BookingStatus.REJECTED}>Rejected</option>
              <option value={BookingStatus.NO_SHOW}>No Show</option>
            </select>
          </div>

          {/* Payment Filter */}
          <div className="sm:col-span-4 lg:col-span-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            >
              <option value="">All Payments</option>
              <option value={PaymentStatus.UNPAID}>Unpaid</option>
              <option value={PaymentStatus.PARTIAL}>Partially Paid</option>
              <option value={PaymentStatus.PAID}>Paid</option>
              <option value={PaymentStatus.REFUNDED}>Refunded</option>
            </select>
          </div>

          {/* Package Filter */}
          <div className="sm:col-span-4 lg:col-span-2">
            <select
              value={packageFilter}
              onChange={(e) => setPackageFilter(e.target.value)}
              className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
            >
              <option value="">All Adventures</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name_en || pkg.name_bs}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="sm:col-span-8 lg:col-span-2 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-[#081210] border border-[#1F332C] focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none transition-colors"
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                title="Reset filters"
                className="p-2 rounded-xl bg-[#13211D] border border-[#1F332C] text-slate-400 hover:text-white hover:border-slate-600 transition-colors shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary telemetry */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-[#1F332C]/60">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-white font-medium">{bookings.length}</strong> reservations</span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px]">
                Filtered
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      </Card>

      {/* Content Body */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
          <span className="text-xs">Loading reservations...</span>
        </div>
      ) : bookings.length === 0 ? (
        <Card variant="elevated" padding="lg" className="text-center py-16 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#13211D] border border-[#1F332C] flex items-center justify-center mx-auto text-slate-400">
            <Filter className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">No bookings found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {hasActiveFilters
                ? 'No reservations matched your current filter criteria. Try adjusting or clearing the filters.'
                : 'There are no bookings recorded in the system yet.'}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Reset Filters
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={onOpenManualBooking} leftIcon={<Plus className="w-4 h-4" />}>
              Create First Booking
            </Button>
          )}
        </Card>
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile) */}
          <div className="hidden md:block bg-[#0E1A17] border border-[#1F332C] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#081210] border-b border-[#1F332C] text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-display">
                  <tr>
                    <th className="px-5 py-3.5">Reservation</th>
                    <th className="px-5 py-3.5">Customer</th>
                    <th className="px-5 py-3.5">Adventure</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Guests</th>
                    <th className="px-5 py-3.5">Booking Status</th>
                    <th className="px-5 py-3.5">Payment</th>
                    <th className="px-5 py-3.5">Total</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F332C]">
                  {bookings.map((b) => {
                    const code = b.reservation_code || (b as any).booking_code || 'NR-BOOKING';
                    const customerName = b.customer
                      ? `${b.customer.first_name} ${b.customer.last_name}`
                      : `${(b as any).first_name || ''} ${(b as any).last_name || ''}`.trim() || 'Guest';
                    const customerPhone = b.customer?.phone || (b as any).phone || '';
                    const customerEmail = b.customer?.email || (b as any).email || '';
                    const pkgName = b.package?.name_en || b.package?.name_bs || 'Classic Neretva Rafting';

                    const depDate = b.departure
                      ? new Date(b.departure.start_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Scheduled';
                    const depTime = b.departure
                      ? new Date(b.departure.start_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })
                      : '';

                    const source = b.source || 'website';

                    return (
                      <tr
                        key={b.id}
                        onClick={() => onSelectBooking(b.id)}
                        className="hover:bg-[#13211D] transition-colors cursor-pointer group"
                      >
                        {/* Reservation Column */}
                        <td className="px-5 py-4">
                          <div className="font-mono font-bold text-emerald-400 text-sm tracking-tight group-hover:text-emerald-300">
                            {code}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] uppercase font-medium px-1.5 py-0.5 rounded bg-[#081210] text-slate-400 border border-[#1F332C]">
                              {source}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(b.created_at).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                            </span>
                          </div>
                        </td>

                        {/* Customer Column */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm font-display truncate max-w-[180px]">
                            {customerName}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {customerEmail || customerPhone}
                          </div>
                        </td>

                        {/* Adventure Column */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-200 truncate max-w-[180px]">
                            {pkgName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {b.package?.difficulty || 'Neretva Canyon'}
                          </div>
                        </td>

                        {/* Date Column */}
                        <td className="px-5 py-4">
                          <div className="font-medium text-white">
                            {depDate}
                          </div>
                          <div className="text-[11px] text-emerald-400 font-mono">
                            {depTime ? `at ${depTime}` : 'Flexible'}
                          </div>
                        </td>

                        {/* Guests Column */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm font-display">
                            {b.guest_count} {b.guest_count === 1 ? 'guest' : 'guests'}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {b.adult_count} {b.adult_count === 1 ? 'adult' : 'adults'}
                            {b.child_count > 0 ? `, ${b.child_count} ch.` : ''}
                          </div>
                        </td>

                        {/* Booking Status Column */}
                        <td className="px-5 py-4">
                          <StatusBadge status={b.booking_status} size="sm" />
                        </td>

                        {/* Payment Column */}
                        <td className="px-5 py-4">
                          <StatusBadge status={b.payment_status} size="sm" />
                        </td>

                        {/* Total Column */}
                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm font-display">
                            {b.total_amount} BAM
                          </div>
                        </td>

                        {/* Action Column */}
                        <td className="px-5 py-4 text-right">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBooking(b.id);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View (Visible on < md screens) */}
          <div className="block md:hidden space-y-3">
            {bookings.map((b) => {
              const code = b.reservation_code || (b as any).booking_code || 'NR-BOOKING';
              const customerName = b.customer
                ? `${b.customer.first_name} ${b.customer.last_name}`
                : `${(b as any).first_name || ''} ${(b as any).last_name || ''}`.trim() || 'Guest';
              const pkgName = b.package?.name_en || b.package?.name_bs || 'Classic Neretva Rafting';

              const depDate = b.departure
                ? new Date(b.departure.start_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })
                : 'Scheduled';
              const depTime = b.departure
                ? new Date(b.departure.start_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
                : '';

              return (
                <div
                  key={b.id}
                  onClick={() => onSelectBooking(b.id)}
                  className="bg-[#0E1A17] border border-[#1F332C] hover:border-emerald-800/50 rounded-2xl p-4 space-y-3 cursor-pointer active:scale-[0.99] transition-all shadow-md"
                >
                  {/* Top Bar: Code, Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        {code}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={b.booking_status} size="sm" />
                      <StatusBadge status={b.payment_status} size="sm" />
                    </div>
                  </div>

                  {/* Customer & Adventure */}
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-white text-base font-display">
                      {customerName}
                    </h3>
                    <p className="text-xs text-slate-400 truncate">
                      {pkgName}
                    </p>
                  </div>

                  {/* Metadata Row: Date, Guests, Total */}
                  <div className="flex items-center justify-between pt-2 border-t border-[#1F332C] text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        {depDate} {depTime ? `• ${depTime}` : ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{b.guest_count} {b.guest_count === 1 ? 'guest' : 'guests'}</span>
                    </div>

                    <div className="font-bold text-white text-sm font-display">
                      {b.total_amount} BAM
                    </div>
                  </div>

                  {/* Footer tap cue */}
                  <div className="flex items-center justify-end text-[11px] text-emerald-400 font-medium pt-1">
                    <span>View Reservation</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
