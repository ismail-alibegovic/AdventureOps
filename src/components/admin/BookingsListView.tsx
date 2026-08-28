import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useTranslation } from '../../locales/i18n';
import { useToast } from '../../context/ToastContext';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import {
  Search,
  Filter,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronRight,
  Eye,
  PlusCircle,
} from 'lucide-react';

interface BookingsListViewProps {
  onSelectBooking: (bookingId: string) => void;
  onOpenManualBooking: () => void;
}

export const BookingsListView: React.FC<BookingsListViewProps> = ({
  onSelectBooking,
  onOpenManualBooking,
}) => {
  const { t } = useTranslation();
  const toast = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<string>('');

  const loadBookings = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (searchQuery) filters.search = searchQuery;
      if (statusFilter) filters.status = statusFilter;
      if (paymentFilter) filters.payment_status = paymentFilter;

      const res = await apiClient.getBookings(filters);
      setBookings(res);
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter, paymentFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadBookings();
  };

  const getStatusBadge = (s: BookingStatus) => {
    switch (s) {
      case BookingStatus.CONFIRMED:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case BookingStatus.CHECKED_IN:
        return 'bg-sky-950 text-sky-300 border-sky-800';
      case BookingStatus.REQUESTED:
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case BookingStatus.CANCELLED:
      case BookingStatus.REJECTED:
        return 'bg-rose-950 text-rose-300 border-rose-800';
      default:
        return 'bg-slate-850 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
            Manifest Rezervacija
          </span>
          <h2 className="text-2xl font-bold text-white">Sve Rezervacije ({bookings.length})</h2>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/reports/export/bookings.csv"
            download="bookings_export.csv"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
          >
            <Download className="w-4 h-4" />
            <span>Izvezi CSV</span>
          </a>

          <button
            onClick={onOpenManualBooking}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nova Rezervacija</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <form onSubmit={handleSearch} className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Pretraga po imenu, kodu (NR-2026-...), telefonu ili emailu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Svi Statusi --</option>
            <option value={BookingStatus.REQUESTED}>REQUESTED (Na čekanju)</option>
            <option value={BookingStatus.CONFIRMED}>CONFIRMED (Potvrđeno)</option>
            <option value={BookingStatus.CHECKED_IN}>CHECKED_IN (Prijavljen)</option>
            <option value={BookingStatus.COMPLETED}>COMPLETED (Završeno)</option>
            <option value={BookingStatus.CANCELLED}>CANCELLED (Otkazano)</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="">-- Sva Plaćanja --</option>
            <option value={PaymentStatus.UNPAID}>UNPAID (Neplaćeno)</option>
            <option value={PaymentStatus.PARTIAL}>PARTIAL (Djelimično)</option>
            <option value={PaymentStatus.PAID}>PAID (Plaćeno)</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="py-20 flex justify-center text-emerald-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-400 border-t-transparent" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-xs">
          Nema pronađenih rezervacija prema zadatim filterima.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-4">Šifra / Gost</th>
                  <th className="px-5 py-4">Paket & Datum Polaska</th>
                  <th className="px-5 py-4">Gosti</th>
                  <th className="px-5 py-4">Iznos & Plaćanje</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Akcija</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {bookings.map((b) => {
                  const depDate = b.departure ? new Date(b.departure.start_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '';
                  const depTime = b.departure ? new Date(b.departure.start_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <tr
                      key={b.id}
                      onClick={() => onSelectBooking(b.id)}
                      className="hover:bg-slate-850 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-emerald-400 text-sm">
                          {b.booking_code}
                        </div>
                        <div className="font-bold text-white text-sm">
                          {b.first_name} {b.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400">{b.phone}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">
                          {b.package?.name_bs || 'Rafting Neretva'}
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {depDate} u <strong className="text-emerald-400">{depTime}</strong>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-white text-sm">{b.guest_count} os.</div>
                        <div className="text-[11px] text-slate-400">
                          {b.adult_count} odr. {b.child_count > 0 ? `+ ${b.child_count} dj.` : ''}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-extrabold text-white text-sm">
                          {b.total_amount} BAM
                        </div>
                        <div className="text-[11px]">
                          <span
                            className={`font-semibold uppercase ${
                              b.payment_status === 'paid'
                                ? 'text-emerald-400'
                                : b.payment_status === 'partial'
                                ? 'text-amber-400'
                                : 'text-rose-400'
                            }`}
                          >
                            {b.payment_status}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${getStatusBadge(
                            b.booking_status
                          )}`}
                        >
                          {b.booking_status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBooking(b.id);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
                        >
                          Otvori
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
